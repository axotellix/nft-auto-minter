## How it Works?

**mint.js**

- main app file
  
- imports all dependencies
  
- sets up Metamask extension
  
- sets up Puppeteer (Dappeteer)
  
- writes logs
  
- mints NFTs
  
<br/><br/>
**metadata.js**

- generates metadata for each NFT (contains data to fill form fields, e.g. title, description)
  
<br/><br/>
**solve-captcha.js**

- bypasses reCaptcha using "Buster captcha solver for humans" extension
- check extension: [Buster by Dessant](https://github.com/dessant/buster)
  
<br/><br/>
**ip-manager.js**

- used to change IP by switching VPN Server after every 10 app restarts
  
- defines next VPN Server
  
- generates "change-ip.txt" file to initialise VPN Server switch
  
<br/><br/>
**ip-manager.py**

- watches "ip-manager" folder & listens for the "change-ip.txt" file to be created
  
- when "change-ip.txt" file created - runs VPN Server switch
  
- interacts with VPN client (like auto clicker)
  
<br/><br/>
**change-ip.txt**

- triggers ip-manager.py script
  
<br/><br/>
**restarts-counter.txt**

- keeps number of app restarts
  
- if app restarts 10 times - IP is changed & the counter is reset
  
<br/><br/>
**current-ip.txt**

- contains currently used VPN Server
  
<br/><br/>
**restarts.txt**

- all restart logs: current VPN Server, full date & number of NFTs that have been minted by that date
  
<br/><br/>
**progress.txt**

- logs total number of NFTs minted
  
- keeps current progress - so if app crashes we won`t have to start from scratch
  
<br/><br/>
**mint-log.txt**

- everything that is being output to console when app is running
