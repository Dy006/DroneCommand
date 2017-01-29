/**
 * Created by Dylan on 06/10/2015.
 */

var socket = null;

var IP_ADDRESS = location.href.match(new RegExp("\/\/([^\/]*)\/"))[1];
IP_ADDRESS = (IP_ADDRESS.split('.')[0] != '192') ? '192.168.95.18' : IP_ADDRESS;

var PORT = '8081';

var isConnected = false;
var timeActualizeCommand = 125;

var lastCommand = 'P 0|0|0|0';

var infoDrone = '';

var isLog = false;

var DRONE_PROPERTIES = {
    pitch: 0,
    roll: 0,
    degrees: 0,
    vSpeed: 0,
    hSpeed: 0,
    battery: 0,
    pressure: 0,
    altitude: 0,
    temperature: 0,
    humidity: 0,
    controlMode: 0
};

var DRONE_CONTROLS = {
    xAxis:0,
    yAxis: 0,
    degrees: 0,
    throttle: 0,
    currentCalibrateMotor: 0,
    calibrate: [0, 0, 0, 0]
};

var isPlayingSession = false;

function loadSocketServer() {
    socket = io('http://' + IP_ADDRESS + ':' + PORT);

    socket.on('connect', function() {
        console.log('connected from server');

        isConnected = true;
    });

    socket.on('disconnect', function() {
        console.log('disconnected from server');

        isConnected = false;
    });

    socket.on('news', function (data) {
        if(data != '') {
            infoDrone = data.split(' ')[2].split('|');

            console.log(infoDrone);

            DRONE_PROPERTIES.pitch = infoDrone[4];
            DRONE_PROPERTIES.roll = infoDrone[5];
            DRONE_PROPERTIES.degrees = infoDrone[8];
            DRONE_PROPERTIES.pressure = infoDrone[10];
            DRONE_PROPERTIES.temperature = infoDrone[11];
            DRONE_PROPERTIES.humidity = infoDrone[12];

            if(isLog)
                document.getElementById('logs').innerHTML += data + '</br>';
        }
    });

    setInterval(function() {
        if(isConnected && isPlayingSession)
            sendCommandSocket('P ' + DRONE_CONTROLS.throttle + '|' + DRONE_CONTROLS.degrees + '|' + DRONE_CONTROLS.xAxis + '|' + DRONE_CONTROLS.yAxis);
        else
            sendCommandSocket('L Y');

        //console.log(DRONE_CONTROLS);
    }, timeActualizeCommand);
}

function sendCommand(command) {
    lastCommand = command;

    sendCommandSocket(command);
}

function sendCommandSocket(command) {
    if(isConnected)
        socket.emit('command', command);
}

function Pinger_ping(extServer) {

    var ImageObject = new Image();
    ImageObject.src = "http://"+extServer+"/drone.jpg";
    if(ImageObject.height>0){
        alert("Ping worked!");
    } else {
        alert("Ping failed :(");
    }
}