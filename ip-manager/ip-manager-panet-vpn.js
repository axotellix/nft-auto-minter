const fs = require('fs')

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
            "France - Free",
            "Germany - Free",
            "Netherlands - Free",
            "USA - Free",
            "United Kingdom - Free"
        ]
        const ip_current = +fs.readFileSync(__dirname + `/current-ip.txt`, 'utf-8')
        const ip_next = ip_current === 4 ? 0 : ip_current + 1
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