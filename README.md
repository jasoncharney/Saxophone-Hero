# Saxophone Hero
 code for Sky Macklay's piece for "Saxophone Hero," commissioned by Project Fusion

## Setup diagram
[image here]

## Requirements

### Computer & Software
The game is run via a dedicated computer. Max software runs the game and handles audio processing. A Node server handles the interactive scores for players, audience game, and projector HUD output.
- Networking capabilities (WiFi or Ethernet) required. Not tested on Windows; works on macOS Ventura+.
- [Node.js](https://nodejs.org/en). This runs the server application on the host computer.
- [Max](https://cycling74.com/downloads). No license is required to open the software.
- Wireless network - recommend using a separate wireless router not connected to the Internet. It must be publicly accessible.

### Audio
- Audio interface with 4 microphone inputs and at least 3 audio outputs.
- Four microphones, one for each saxophonist
- Headphone amplifiers/wireless receivers with at least 4 channels of output for click track, and headphones
- Stereo output to PA system.

### Mobile Devices
- Saxophonists must have a laptop or tablet updated to the latest software version, running Safari or Google Chrome. The score is served dynamically to each player over the network.
- Audience members can connect via WiFi network on Android or iOS mobile devices. They should be instructed to turn off mobile data (if connected to a WiFI network without internet) and to turn their phone sideways for bets results. Any mobile browser should work as long as it supports WebAudio and the latest version of HTML5; only Chrome and Safari have been tested on iOS and Android.

# Setup

## Installation 
- Download the whole 'Saxophone-Hero' folder linked in this repository as a zip file and open it. You can put this folder anywhere on your computer, but leave the file structure and all files in place within this folder.
  
## Configuring the network settings
- Set up router/connect to desired wireless network. If you're connected to the wireless router over Ethernet, turn off WiFi on your computer.
- Determine your IP:
  - Open Terminal and type `ipconfig`. The IP address after "en0" is the one you want to reference.
  [image reference]
- There are *two* `connectSettings.json` files you might need to change the address. One in the root directory and one in `/SaxophoneHero-Max/data/` folder. The first line, `"hostip"`, is where you enter the IP address in quotation marks. Then save the files in place.
Example:
```
{
	"hostIP": "192.168.80.158",
	"expressPort": 3000,
	"maxSendPort": 3339,
	"maxListenPort": 3338,
	"saxPlayerPort": 4994,
	"projectorPort": 4997
}
```

## Setting up the game
- The Max patch is located in a folder called "SaxophoneHero-Max." Open the file called "SaxophoneHero-Max.maxproj" in Max.
- Turn on Audio/make sure that you are using the correct audio interface in the Audio Status window. Click audio comes out on channel 3 of your interface.
- The project can be set up in guided steps. Click the "Next" button to advance steps. After advancing to step 1, you can boot the server.
- To boot the server, open Terminal and use the `cd` command to navigate to the Saxophone Hero folder. You can type `cd` and then drag the folder onto the Terminal window, and it will automatically fill in the location. Press Enter.
- Now, type `node SaxHeroServer.js` and press Enter. The screen should clear and show the three addresses: audience game, [saxophone] Player, and projector page. The server status indicator in Max should show "Running!" indicating that it has connected to the server.
- Saxophone players should connect to the network and set their tablet in orientation mode. They should navigate in Chrome or Safari to `[hostip]:4994` (no "http://") before. They can choose their instrument from the dropdown menu. Once all players are connected, their indicator buttons will turn green.
- Follow the rest of the steps indicated in the steps.