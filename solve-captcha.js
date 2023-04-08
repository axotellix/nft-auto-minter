const solveCaptcha = async ( browser, page ) => {


    //1. get > captcha frame object (checkbox)
    await page.waitForTimeout(1000)
    let captcha_frame_check = null
    let captcha_check = null
    try {
        captcha_frame_check = await page.waitForSelector('.g-recaptcha iframe')
        captcha_check = await captcha_frame_check.contentFrame()
    } catch ( e ) {
        console.log("\x1b[38;2;240;70;70m%s\x1b[0m", "(err) couldn`t access captcha frame")
        console.log("restarting ...\n\n")
    }
    
    //2. click > checkbox (not a robot)
    console.log('starting captcha verification ...')
    try {
        //TODO: remember & describe what this crutch is for (smth didn`t load in 
        //       some cases and captcha test wasn`t available) 
        await page.waitForSelector('.g-recaptcha')
        await page.waitForTimeout(1500)
    } catch ( e ) {
        console.log("\x1b[38;2;240;70;70m%s\x1b[0m", "(err) couldn`t access reCAPTCHA test")
        console.log("restarting ...\n\n")
    }
    try {
        const checkbox = await captcha_check.$x('//span[contains(@id, "recaptcha-anchor")]')
        await checkbox[0].click()
    } catch ( e ) {
        console.log("\x1b[38;2;240;70;70m%s\x1b[0m", "(err) couldn`t access reCAPTCHA test")
        console.log("restarting ...")
        console.log(" ")
        console.log(" ")
        await browser.close()
        process.exit(1)
    }
    

    //3. click > solve reCaptcha (Buster ext)
    await page.waitForTimeout(1000)
    try {
        const captcha_frame_puzzle = await page.$x('//iframe[@title!="reCAPTCHA"]')
    } catch ( e ) {
        console.log("\x1b[38;2;240;70;70m%s\x1b[0m", "(err) couldn`t load captcha puzzle")
        console.log("restarting ...\n\n")
    }
    console.log('solving recaptcha ...')

     //3.1. get > Buster "solve" btn coords (serialised)
    const pos_solve_ser = await page.evaluate(async () => {
        return await new Promise((resolve) => { 
            try {
                let frame = document.querySelector('iframe:not([title="reCAPTCHA"]):not([style="display: none;"])').getBoundingClientRect()
                let btn = document.querySelector('iframe:not([title="reCAPTCHA"]):not([style="display: none;"])').contentWindow.document.querySelector('.help-button-holder').getBoundingClientRect()
                resolve(JSON.stringify({ frame, btn }))
            } catch ( e ) {
                console.log("\x1b[38;2;240;70;70m%s\x1b[0m", "(err) couldn`t find solve captcha button")
                console.log("restarting ...\n\n")
                resolve(JSON.stringify({}))
            } 
        })
    })
     //3.2. calc > button`s middle & click
    const pos_solve = JSON.parse(pos_solve_ser)
    if ( Object.keys(pos_solve).length === 0 ) process.exit(1)
    const solve_X_coord = pos_solve.frame.x + pos_solve.btn.x + pos_solve.btn.width / 2
    const solve_Y_coord = pos_solve.frame.y + pos_solve.btn.y + pos_solve.btn.height / 2
    await page.mouse.click(solve_X_coord, solve_Y_coord)
    await page.waitForTimeout(1000)


    //4. check > reCaptcha status (passed / failed)
    console.log('completing verification ...')
    const captcha_solved = await page.evaluate(async () => {
        return await new Promise(resolve => {

            // get > captcha iframes
            const captcha_frame_check  = document.querySelector('.g-recaptcha iframe').contentWindow.document
            const captcha_frame_puzzle = document.querySelector('iframe:not([title="reCAPTCHA"]):not([style="display: none;"])').contentWindow.document

            // check > verification status msg inside iframe (checkbox)
            const observer = new MutationObserver(function() {
                let state = captcha_frame_check.querySelector('#recaptcha-accessible-status').textContent
                if ( state === "You are verified" ) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            })

            // check > if puzzle cannot be requested ("browser sending automated requests")
            const observer_err = new MutationObserver(function() {
                let state = captcha_frame_puzzle.querySelector('.rc-doscaptcha-header-text')?.textContent
                if ( state === "Try again later" ) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            })

            // listen > for captcha window changes (open / closed)
            let frame_container = document.querySelector('iframe:not([title="reCAPTCHA"]):not([style="display: none;"])').parentElement.parentElement
            observer.observe(frame_container, { attributes : true, attributeFilter : ['style'] })
            observer_err.observe(frame_container, { attributes : true, attributeFilter : ['style'] })

        })
    })


    //5. send > reCaptcha status (passed / failed)
    return await new Promise(resolve => {
        if ( captcha_solved ) resolve( true )
        if ( !captcha_solved ) resolve( false )
    })
    
}

module.exports = solveCaptcha