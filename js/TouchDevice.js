/**
 * Created by Dylan on 13/10/2015.
 */

//JOYSTICK
Joystick = function(x, y, radius, strokeColor) {
    this.x = x;
    this.y = y;

    this.stickX = 0;
    this.stickY = 0;

    this.radius = radius;
    this.strokeColor = strokeColor;

    this.fingerIdentifier = -1;
};

Joystick.prototype.setBase = function(x, y) {
    this.x = x;
    this.y = y;

    this.stickX = x;
    this.stickY = y;
};

Joystick.prototype.setFinger = function(fingerIdentifier) {
    this.fingerIdentifier = fingerIdentifier;
};

Joystick.prototype.setStickPosition = function(x, y) {
    this.stickX = x;
    this.stickY = y;
};

var isTouchDevice = 'ontouchstart' in document.documentElement;
var fullTouchMode = false;

var touchCanvas = {element: null, context: null};
var mainJoystick = null;

if(isTouchDevice)
    startTouchMode();

function startTouchMode() {
    touchCanvas.element = document.getElementById('touchCanvas');
    touchCanvas.context = touchCanvas.element.getContext('2d');

    resetTouchCanvas();

    mainJoystick = new Joystick(0, 0, 50, '#FFFFFF');

    setInterval(drawOnTouchCanvas, 50);
}

function resetTouchCanvas() {
    touchCanvas.element.width = window.innerWidth;
    touchCanvas.element.height = window.innerHeight - touchCanvas.element.offsetTop - 10;

    touchCanvas.context.width = touchCanvas.element.width;
    touchCanvas.context.height = touchCanvas.element.height;
}

function drawOnTouchCanvas() {
    var context = touchCanvas.context;

    context.clearRect(0, 0, touchCanvas.element.width, touchCanvas.element.height);

    context.beginPath();
    context.rect(10, 10, 50, 50);
    context.fillStyle = 'yellow';
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = 'black';
    context.stroke();

    if(mainJoystick.fingerIdentifier >= 0) {
        context.beginPath();
        context.arc(mainJoystick.x, mainJoystick.y, mainJoystick.radius, 0, 2 * Math.PI, false);
        context.lineWidth = 5;
        context.strokeStyle = mainJoystick.strokeColor;
        context.stroke();

        //context.arc(mainJoystick.x, mainJoystick.y, (mainJoystick.radius / 2) - 10, 0, 2 * Math.PI, false);
        //context.stroke();

        context.arc(mainJoystick.stickX, mainJoystick.stickY, mainJoystick.radius, 0, 2 * Math.PI, false);
        context.fillStyle = mainJoystick.strokeColor;
        context.fill();
        context.strokeStyle = mainJoystick.strokeColor;
        context.stroke();
    }
}

function setFullScreen() {
    if (!document.fullscreenElement &&    // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    }
}

window.addEventListener('touchstart', function(e) {
    setFullScreen();

    e.preventDefault();

    console.log('touchstart');
    console.log(e.changedTouches[0]);

    var mouseX = e.changedTouches[0].clientX - touchCanvas.element.offsetLeft;
    var mouseY = e.changedTouches[0].clientY - touchCanvas.element.offsetTop;

    console.log(mouseX);
    console.log(mouseX < (touchCanvas.element.width / 2));

    if(mouseX < (touchCanvas.element.width / 2) && mainJoystick.fingerIdentifier < 0) {
        console.log('good place');

        mainJoystick.setBase(mouseX, mouseY);
        mainJoystick.setFinger(e.changedTouches[0].identifier);
    }
}, false);

window.addEventListener('touchmove', function(e) {
    e.preventDefault();

    console.log('touchmove');

    if(mainJoystick.fingerIdentifier >= 0) {
        var mouseX = e.targetTouches[findRowByIdentifier(e.targetTouches, mainJoystick.fingerIdentifier)].clientX - touchCanvas.element.offsetLeft;
        var mouseY = e.targetTouches[findRowByIdentifier(e.targetTouches, mainJoystick.fingerIdentifier)].clientY - touchCanvas.element.offsetTop;

        var distance = parseInt(Math.sqrt(Math.pow((mouseY - mainJoystick.y), 2) + Math.pow((mouseX - mainJoystick.x), 2)));

        console.log(distance);

        if(distance < (mainJoystick.radius * 2))
            mainJoystick.setStickPosition(mouseX, mouseY);
    }
}, false);

window.addEventListener('touchend', function(e) {
    e.preventDefault();

    console.log('touchend');

    if(mainJoystick.fingerIdentifier == e.changedTouches[0].identifier)
        mainJoystick.setFinger(-1);
}, false);

function findRowByIdentifier(touches, identifier) {
    var row = -1;

    for(var i = 0; i < touches.length; i++) {
        if(touches[i].identifier == identifier)
            row = i;
    }

    return row;
}