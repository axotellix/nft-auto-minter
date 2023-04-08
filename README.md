## How it Works?

**mint.js**

- main app file
  
- imports all dependencies
  
- sets up Metamask extension
  
- sets up Puppeteer (Dappeteer)
  
- writes logs
  
- mints NFTs
  

**metadata.js**

- generates metadata for each NFT (contains data to fill form fields, e.g. title, description)
  

**solve-captcha.js**

- bypasses reCaptcha using "Buster captcha solver for humans" extension
  

**ip-manager.js**

- used to change IP by switching VPN Server after every 10 app restarts
  
- defines next VPN Server
  
- generates "change-ip.txt" file to initialise VPN Server switch
  

**ip-manager.py**

- watches "ip-manager" folder & listens for the "change-ip.txt" file to be created
  
- when "change-ip.txt" file created - runs VPN Server switch
  
- interacts with VPN client (like auto clicker)
  

**change-ip.txt**

- triggers ip-manager.py script
  

**restarts-counter.txt**

- keeps number of app restarts
  
- if app restarts 10 times - IP is changed & the counter is reset
  

**current-ip.txt**

- contains currently used VPN Server
  

**restarts.txt**

- all restart logs: current VPN Server, full date & number of NFTs that have been minted by that date
  

**progress.txt**

- logs total number of NFTs minted
  
- keeps current progress - so if app crashes we won`t have to start from scratch
  

**mint-log.txt**

- everything that is being output to console when app is running
