# Progress Log

**16.01.2023**

- Started Project
  
- Created Metadata generator
  
- Generated Metadata
  

**18.01.2023**

- Set up *Puppeteer*
  
- Set up *MetaMask (Dappeteer)*
  
- FIX: *Dappeteer* version downgrade to 2.3.0 & *MetaMask* version downgrade to 10.1.1
  

**22.01.2023**

- Defined form selectors
  
- Finished auto form fill
  
- Colorised console logs
  

**23.01.2023**

- Switched to testnet to test form submission
  
- FIX: fixed *Metamask* auth
  
- Improved text typing (from slow human-like to instant)
  
- Faced problem: couldn`t mint NFT because of captcha
  
- Started looking for ways to bypass *reCaptcha* (by imitating human behaviour)
  

**24.01.2023**

- Tested some solutions - unsuccessfully
  
- Started looking for ways to bypass *reCapctha* (by automating solving it)
  

**25.01.2023**

- Found [Buster: Capctha Solver for Humans](https://github.com/dessant/buster)
  
- Created a simple new project to test the extension
  
- Installed it to my browser (to get unpacked extension, so I can use it in *Chromium* with *Puppeteer* - because *Chromium* doesn`t allow installing extensions)
  
- Implemented *Buster* extension
  

**26.01.2023**

- Added: click "solve" button with JS in *Buster* extension
  
- Added: listen for captcha passed event
  
- Tested on [google.com/recaptcha/api2/demo](https://google.com/recaptcha/api2/demo)
  

**27.01.2023**

- Started implementing captcha solver in the real project
  
- Modified ```@chainsafe/dist/index.js``` (*Metamask* loader) - added path to *Buster* extension to load it on startup
  
- Added *security flags (command-line switches)* to puppeteer startup config to fix *"same origin policy"* problem when trying to access `<iframe>` content
  
- Added **progress.txt** to keep total amount of NFT minted - to keep progress if app crashed
  

**05.02.2023**

- Implemented *pm2* to automate restarting app after crash
  
- Added events `pm2.stop("mint.js")` & `pm2.delete("all")` to handle minting complete & prevent app to stay in the infinite loop
  

**07.02.2023**

- EDIT: wrapped all actions in `try...catch` blocks to force *pm2* to restart app on *unhandledError* as well
  
- EDIT: added `try...catch`-es in the *Metamask* extension as well
  

**10.02.2023**

- EDIT: fixed *"your browser is sending automated requests"* error - now it`s handled by captcha solver as "error" and *pm2* will restart app

**15.02.2023**

- FIX: added *flags (command-line switches)* to fix memory leak (prevent *Chromium* processes to remain after app crashes or is closed)
  
- Added **restarts.txt** to monitor how effective app is & approximately how many NFTs minted by a particular date
  

**16.02.2023**

- Tried *"Microsoft Power Automate"* app to automate interacting with VPN Client to change IP (vpn server) - unsuccessfully (it has bugs and functionality limitations)
  
- Started looking for other solutions
  

**19.02.2023**

- Decided to create Python script to automate VPN Server switch
  
- Added *"watchdog"* to listen for file creation (change-ip.txt)
  
- Added *pyautogui* & *win32gui* to interact with VPN Client
  
- Defined VPN window coords & list of servers with their coords
  
- Added simple console logging
  
- Created **ip-manager.js** to generate **change-ip.txt** file & trigger **ip-manager.py** to switch VPN Server
  
- Created **current-ip.txt** to tell **ip-manager.py** which server to run next
  
- Created **restarts-counter.txt** to count app restarts & after 10 restarts - tell **ip-manager.js** to generate **change-ip.txt**
  
- Added logging current VPN Server to **restarts.txt** on every server switch (to group restarts log by VPN Server - to monitor which one works better)
  

**22.02.2023**

- EDIT: removed initial *Metamask* version warning in the console (`@chainsafe/dappeteer/dist/index.js`)
  
- Finally, apparently, all processes are 100% automated
