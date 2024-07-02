socket = io('/client');

socket.on('beat', function (msg) {
    console.log(msg);
});