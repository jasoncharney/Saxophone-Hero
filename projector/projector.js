let socket = io('/projector');

socket.on('audienceURL', function (msg){
    new QRCode(document.getElementById("qrcode"), msg);
});