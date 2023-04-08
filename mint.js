// [ IMPORTS ]
const puppeteer = require('puppeteer')
const dappeteer = require('@chainsafe/dappeteer')
const fs = require('fs')
const solveCaptcha = require('./solve-captcha')
const ip_manager = require('./ip-manager/ip-manager')
const pm2 = require('pm2')


// [ PRESETS ]
 // pages
const auth = 'https://opensea.io/asset/create'
const src = ( src ) => `https://opensea.io/collection/${src}/assets/create`
 // page form selectors
const form = {
    img: 'input[type="file"]',
    name: 'input#name',
    description: 'textarea#description',
    select_collection: 'input#collection',
    select_collection_opt: 'div#tippy-422 ul',  
    add_prop: 'div.AssetFormTraitSection--side button',
    add_prop_field_name : 'td.AssetPropertiesForm--column:nth-child(1) input',
    add_prop_field_value: 'td.AssetPropertiesForm--column:nth-child(2) input',
    props: {
        name: 'input[placeholder="Character"]',
        value: 'input[placeholder="Male"]'
    }
}
 // metamask config
const config = {
    METAMASK_MNEMONIC_PHRASE: process.env.METAMASK_MNEMONIC_PHRASE,
    METAMASK_PASSWORD: process.env.METAMASK_PASSWORD,
    METAMASK_UID: process.env.METAMASK_UID,
    METAMASK_PK: process.env.METAMASK_PK
}


// [ FUNCTIONS ]
 //@ format > number (1 -> 0001)
const formatNum = ( n ) => {
    if ( n.toString().length == 1 ) {
        n = "000" + n
    } else if ( n.toString().length == 2 ) {
        n = "00" + n
    } else if ( n.toString().length == 3 ) {
        n = "0" + n
    } else {
        n = "" + n
    }
    return n
}

 //@ get > metadata from template 
const getMeta = ( id ) => {
    const metadata = JSON.parse( fs.readFileSync(`./metadata/${id}.json`, 'utf-8') )
    return metadata
}

 //@ connect > MetaMask wallet
const connectWallet = async ( page, metamask ) => {

    console.log("Connecting to Metamask...")

    // click > MetaMask wallet connect btn
    try {
        //try: click > connect
        const metaMaskButton = await page.$x('//button[.//span[contains(text(),"MetaMask")]]')
        await metaMaskButton[0].click()
    } catch ( e ) {
        //err: page doesn`t load
        console.log("\x1b[38;2;240;130;95m%s\x1b[0m", "(err) couldn`t load MetaMask page")
        console.log("reloading page ...")
        console.log(" ")
        try {
            //try: refresh > page | click > connect
            //: for some reason the page doesn`t load, refresh helps
            await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })
            const metaMaskButton = await page.$x('//button[.//span[contains(text(),"MetaMask")]]')
            await metaMaskButton[0].click()
        } catch ( e ) {
            console.log("\x1b[38;2;240;70;70m%s\x1b[0m", "(err) couldn`t connect wallet")
            console.log("restarting ...")
            console.log(" ")
            console.log(" ")
        }
    }
    await page.waitForTimeout(2000)
    try {
        await metamask.approve()
    } catch ( e ) {
        console.log("\x1b[38;2;240;70;70m%s\x1b[0m", "(err) MetaMask auth failed")
        console.log("restarting ...")
        console.log(" ")
        console.log(" ")
    }

    console.log("\x1b[38;2;95;195;100m%s\x1b[0m", "Wallet connected")
}


// [ MAIN ]
const mint = async () => {

// === [ setting up ] ===============================

    // show > startup statistics data
    console.log("Running app ...")
    const r = +fs.readFileSync("./ip-manager/restarts-counter.txt")
    console.table([{ "NFTs minted": +last_minted, "Restarts": r }])
    console.log(" ")

    // launch > browser
     //NOTE: Buster extension is loaded in @chainsafe/dist/index.js (see "EDIT" comment)
    const browser = await dappeteer.launch(puppeteer, { headless: false, metamaskVersion: '10.24.1', slowMo: 10, args: ['--no-sandbox', '--disable-setuid-sandbox','--disable-site-isolation-trials', '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process', '--single-process', '--no-zygote'] })
    
    // close > browser (for the rest of cases where this err is not handled)
    browser.on('disconnected', async () => {
        await browser.close()
        if (browser.process() != null) browser.process().kill('SIGINT')
    })

    // setup > MetaMask
    console.log("Setting up MetaMask ...")
    let metamask = null
    try {
        metamask = await dappeteer.setupMetamask(browser, {
            seed: config.METAMASK_MNEMONIC_PHRASE,
            password: config.METAMASK_PASSWORD,
        })
    } catch ( e ) {
        console.log("\x1b[38;2;240;70;70m%s\x1b[0m", "(err) couldn`t set up MetaMask")
        console.log("restarting ...")
        console.log(" ")
        console.log(" ")
        await browser.close()
        process.exit(1)
    }
    try {
        await metamask.importPK(config.METAMASK_PK)
    } catch ( e ) {
        console.log("\x1b[38;2;240;70;70m%s\x1b[0m", "(err) couldn`t import Private Key")
        console.log("restarting ...")
        console.log(" ")
        console.log(" ")
        await browser.close()
        process.exit(1)
    }
    
    // goto > mint page
    console.log("Launching OpenSea ...")
    const page = await browser.newPage()
    try {
        await page.goto(auth)
    } catch ( e ) {
        console.log("\x1b[38;2;240;70;70m%s\x1b[0m", "(err) couldn`t access Opensea.io")
        console.log("restarting ...")
        console.log(" ")
        console.log(" ")
        await browser.close()
        process.exit(1)
    }
    await page.bringToFront()

    // close > first empty tab
    const tabs = await browser.pages()
    await tabs[0].close()

    // connect > MetaMask wallet to OpenSea
    console.log("Connecting wallet ...")
    await connectWallet(page, metamask)
    await page.waitForTimeout(2000)

    //NOTE: The first request will need to be signed explicitly
    //TODO: add hidden file with init sign status (signed / not yet signed)
    //       check before logging msg (if already signed - don`t show)
    console.log("Please, sign initial request by yourself ...")
    try {
        await metamask.sign()
    } catch ( e ) {
        console.log("\x1b[38;2;240;70;70m%s\x1b[0m", "(err) sign wasn`t confirmed")
        console.log("restarting ...")
        console.log(" ")
        console.log(" ")
        await browser.close()
        process.exit(1)
    }
    await page.bringToFront()
    await page.waitForTimeout(2000)
    

// === [ fill form ] ===============================

    const start = +fs.readFileSync(`./progress.txt`, 'utf-8')
    let total = 3000
    for ( let i = start + 1; i <= total; i++ ) {

        // 0. get > metadata
        const meta = getMeta(i)

        // 0. goto > create page
        try {
            await page.goto( src(meta.collection) )
        } catch ( e ) {
            console.log("\x1b[38;2;240;70;70m%s\x1b[0m", "(err) couldn`t access create page")
            console.log("restarting ...")
            console.log(" ")
            console.log(" ")
            await browser.close()
            process.exit(1)
        }
        await page.bringToFront()

        // 1. upload > img
        try {
            await page.waitForSelector(form.img)
        } catch ( e ) {
            console.log("\x1b[38;2;240;130;95%s\x1b[0m", "(err) couldn`t load Opensea page")
            console.log("reloading page ...")
            console.log(" ")
            try {
                await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })
                await page.waitForSelector(form.img)
            } catch ( e ) {
                console.log("\x1b[38;2;240;70;70m%s\x1b[0m", "(err) cannot open Opensea page")
                console.log("restarting ...")
                console.log(" ")
                console.log(" ")
                await browser.close()
                process.exit(1)
            }
        }
        const input = await page.$(form.img)
        const n = formatNum(i)
        await input.uploadFile("./generated/" + n + ".png")

        // 2. fill > name
        await page.type(form.name, meta.name) 

        // 3. fill > description
        await page.$eval('#description', (el, value) => el.value = value, meta.description);
        await page.focus('#description')
        await page.keyboard.type(' ')
        await page.waitForTimeout(1000)

        // 4. add > props
        try {
            const add_btn = await page.$x(`//div[contains(@class, 'AssetFormTraitSection--item') and .//span[contains(text(),"Properties")]]/.//button`)
            await add_btn[0].click()  
        } catch ( e ) {
            console.log("\x1b[38;2;240;70;70m%s\x1b[0m", "(err) couldn`t access properties modal")
            console.log("restarting ...")
            console.log(" ")
            console.log(" ")
            await browser.close()
            process.exit(1)
        }
        await page.type(form.props.name, 'topic') 
        await page.type(form.props.value, meta.props.topic) 
        try {
            const save_btn = await page.$x(`//button[contains(text(), 'Save')]`)
            await save_btn[0].click()
        } catch ( e ) {
            console.log("\x1b[38;2;240;70;70m%s\x1b[0m", "(err) couldn`t save props")
            console.log("restarting ...")
            console.log(" ")
            console.log(" ")
            await browser.close()
            process.exit(1)
        }

        // 5. mint > NFT
        try {
            const mint_btn = await page.$x(`//button[contains(text(), 'Create')]`)
            await mint_btn[0].click()
        } catch ( e ) {
            console.log("\x1b[38;2;240;70;70m%s\x1b[0m", "(err) couldn`t access save button")
            console.log("restarting ...")
            console.log(" ")
            console.log(" ")
            await browser.close()
            process.exit(1)
        }
        console.log("Minting ...")

        // 6. bypass > captcha
        console.log("Bypassing reCAPTCHA ...")
        const captcha_solved = await solveCaptcha( browser, page )
        if ( captcha_solved ) {
            console.log("\x1b[38;2;95;195;100m%s\x1b[0m", 'verification complete!')
            fs.writeFileSync('./progress.txt', "" + i)
            try {
                await page.waitForNavigation()
            } catch ( e ) {
                console.log("\x1b[38;2;240;70;70m%s\x1b[0m", "(err) couldn`t load next page")
                console.log("restarting ...")
                console.log(" ")
                console.log(" ")
                await browser.close()
                process.exit(1)
            }
            try {
                await page.waitForSelector("header h4")
            } catch ( e ) {
                console.log("\x1b[38;2;240;70;70m%s\x1b[0m", "(err) couldn`t load next page")
                console.log("restarting ...")
                console.log(" ")
                console.log(" ")
                await browser.close()
                process.exit(1)
            }
            await page.waitForTimeout(1000)
            console.log("\x1b[38;2;95;195;100m%s\x1b[0m", `${meta.name}: successfully minted!`)
            console.log(' ')
        } else {
            console.log("\x1b[38;2;240;70;70m%s\x1b[0m", '(err) captcha not passed!')
            console.log('restarting ...')
            console.log(' ')
            await browser.close()
            process.exit(0)
            break
        }

    }


// === [ close browser ] ===============================

     // kill > process (when mint complete)
    const minted = +fs.readFileSync(`./progress.txt`, 'utf-8')
    if ( minted == total ) {
        console.log(' ')
        console.log("\x1b[38;2;95;195;100m%s\x1b[0m", 'MINTING COMPLETE!')
        await browser.close()
        ip_manager("stop")
        pm2.stop("mint.js")
        pm2.delete("all")
    }
    await page.waitForTimeout(1000)
    await browser.close()

}


// run > IP manager (change IP after every 10 restarts)
ip_manager()

// log > restart time  
const last_minted = fs.readFileSync(`./progress.txt`, 'utf-8')
const restart_log = `(${last_minted}) ` + new Date() + "\n"
fs.writeFileSync(`./restarts.txt`, restart_log, { flag: "a" })

// mint > NFT
mint()