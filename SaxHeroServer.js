//Saxophone Hero Server - 2024//

//import modules
var fs = require('fs');
var express = require('express');
var osc = require('node-osc');
var socket = require('socket.io');

//initialize connection settings
var connectSettings = JSON.parse(fs.readFileSync('connectSettings.json'));

//set up server/ports
var app = express();
app.use(express.static('public'));

var server = app.listen(connectSettings.expressPort);
var io = socket(server);
var client = io.of('/client');

var oscServer = new osc.Server(connectSettings.maxSendPort, connectSettings.hostIP);
var oscClient = new osc.Client(connectSettings.hostIP, connectSettings.maxListenPort);

var numUsers = 0;

//more variables here

//run at startup:
console.clear();
console.log('Sax Hero Server Running:' + '\n' + connectSettings.hostIP + ':' + connectSettings.expressPort);