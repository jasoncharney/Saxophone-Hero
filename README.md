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

## Instructions for technician running the software.
- 