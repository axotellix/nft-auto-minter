// [ DESCRIPTION ]
 // - app: FreeVPN

// [ IMPORTS ]
const fs = require('fs')

// [ MAIN ]
const ip_manager = ( action = null ) => {

    if ( action === "stop" ) {
        fs.writeFileSync(__dirname + `/change-ip.txt`, "stop")
        return
    }

    const restarts = +fs.readFileSync(__dirname + `/restarts-counter.txt`, 'utf-8')
    if ( restarts === 10 ) {
        // CHANGE IP
        //  - change "current IP" index to "next" (current-ip.txt)
        //  - get next IP (by index)
        //  - create > change-ip.txt | write > new IP to it
        //  - exit process (with delay - ?)
        const ip_list = [
            "Findland #1",
            "Poland #1",
            "Germany #2",
            "Germany #1",
            "France #2",
            "Netherlands #1 (P2P)",
            "France #1",
            "France #4 (P2P)",
            "France #3"
        ]
        const ip_current = +fs.readFileSync(__dirname + `/current-ip.txt`, 'utf-8')
        let ip_next = ip_current === (ip_list.length - 1) ? 0 : ip_current + 1
        if ( ip_next == 1 || ip_next == 2 ) ip_next = 3 // skip > Germany
        console.log("current IP: ", ip_list[ip_current])
        fs.writeFileSync(__dirname + `/../restarts.txt`, "\n\nIP: " + ip_list[ip_next] + "\n\n", { flag: "a" })
        fs.writeFileSync(__dirname + `/current-ip.txt`, ip_next.toString())
        fs.writeFileSync(__dirname + `/restarts-counter.txt`, "0")
        console.log("\x1b[38;2;240;130;95m%s\x1b[0m", "changing IP ...")
        console.log(" ")
        setTimeout(() => {
            fs.writeFileSync(__dirname + `/change-ip.txt`, ip_list[ip_next])
            process.exit(0)
        }, 10000)
    } else {
        fs.writeFileSync(__dirname + `/restarts-counter.txt`, `${ restarts + 1 }`)
    }

}

module.exports = ip_manager