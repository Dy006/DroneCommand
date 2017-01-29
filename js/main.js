/**
 * Created by Dylan on 03/10/2015.
 */

var joystickCanvas;
var joystickContext;

var joystick1, joystick2;
var throttleStick;

var isTouchable = false;

var absolute, degrees, pitch, roll;

var xAxis, yAxis, throttle;

var controlMode = 0;
var battery = 0;
var vSpeed = 0;
var hSpeed = 0;

var temperature = 0;
var humidity = 0;
var pressure = 0;

var JOYSTICK_MODE = {
    NONE: 0,
    JOYSTICK: 1,
    GYROSCOPE: 2,
    USB_CONTROLLER: 3
};

var isAccelerometer = false;
var joystickMode = JOYSTICK_MODE.NONE;

window.onload = function() {
    console.log('good');

    /*
    var socket = io('192.168.95.12:5005');
    socket.on('news', function (data) {
        console.log(data);
        socket.emit('C A Y');
    });

    console.log('ok');
    */

    initJoystickCanvas();
};

function initJoystickCanvas() {
    joystickCanvas = document.getElementById('joystickCanvas');

    resetCanvas();

    joystickContext = joystickCanvas.getContext('2d');

    if(isTouchable) {
        /*
         joystickCanvas.ontouchstart = mouseDown;
         window.ontouchend = mouseUp;
         joystickCanvas.ontouchmove = mouseMove;
         */

        joystickCanvas.addEventListener( 'touchstart', mouseDown, false );
        joystickCanvas.addEventListener( 'touchmove', mouseMove, false );
        window.addEventListener( 'touchend', mouseUp, false );

        window.onorientationchange = resetCanvas;
    }
    else {
        joystickCanvas.onmousedown = mouseDown;
        window.onmouseup = mouseUp;
        joystickCanvas.onmousemove = mouseMove;
    }

    window.addEventListener("deviceorientation", handleOrientation, true);
    window.onresize = resetCanvas;

    joystick1 = new Joystick(150, 0.2, '#66FFFF', '#DBDCFF');
    joystick2 = new Joystick(150, 0.2, '#87779D', '#22211F');

    throttleStick = new Throttle((joystickCanvas.width - 75), 100, 25, (joystickCanvas.height - 220), '#87779D');

    setInterval(drawJoystick, 10);
    setInterval(sendCommandMotors, 150);
}

function resetCanvas() {
    joystickCanvas.width = window.innerWidth;
    joystickCanvas.height = window.innerHeight;

    window.scrollTo(0, 0);
}

function Joystick(size, sizeStick, fill, stroke) {
    this.xBase = 0;
    this.yBase = 0;
    this.x = this.xBase;
    this.y = this.yBase;
    this.size = size;
    this.sizeStick = sizeStick;

    this.fill = fill;
    this.stroke = stroke;

    this.mouseDown = false;
    this.fingerIdentifier = -1;
}

Joystick.prototype.setNewBase = function(x, y) {
    this.xBase = x;
    this.yBase = y;
    this.x = this.xBase - ((this.sizeStick * this.size) / 2);
    this.y = this.yBase - ((this.sizeStick * this.size) / 2);
};

function Throttle(x, y, w, h, fill) {
    /*
    this.value = -1;
    this.xBase = -1;
    this.yBase = -1;
    */
    this.value = y + h;
    this.xBase = x;
    this.yBase = y;
    this.w = w;
    this.h = h;
    this.fill = fill;

    this.mouseDown = false;
    this.fingerIdentifier = -1;
}

function sendCommandMotors() {
    if(pitch > 45)
        yAxis = 45;
    else if(pitch < -45)
        yAxis = -45;
    else
        yAxis = pitch;

    if(roll > 45)
        xAxis = 45;
    else if(roll < -45)
        xAxis = -45;
    else
        xAxis = roll;

    /*
    var gap = joystick2.y - joystick2.yBase;

    if(gap < 0)
        throttle = parseInt(50 + ((-gap / (joystick2.size / 2) * 50)));
    else if(gap > 0)
        throttle = parseInt(50 - ((gap / (joystick2.size / 2) * 50)));
    else if(gap == 0)
        throttle = 50;
        */

    throttle = 100 - parseInt(((throttleStick.value - throttleStick.yBase + 25) / throttleStick.h) * 100);
}

function handleOrientation(event) {
    if(event.absolute != null) {
        isAccelerometer = true;

        absolute = event.absolute;
        degrees = parseInt(event.alpha);

        if(window.innerWidth > window.innerHeight) {
            roll = parseInt(event.beta);
            pitch = -parseInt(event.gamma);
        }
        else {
            pitch = parseInt(event.beta);
            roll = parseInt(event.gamma);
        }
    }
    else {
        isAccelerometer = false;
    }
}

function drawJoystick() {
    joystickContext.fillStyle = '#FFFFFF';
    joystickContext.fillRect(0, 0, joystickCanvas.width, joystickCanvas.height);

    if(window.innerWidth > window.innerHeight) {
        //UP BAR
        joystickContext.fillStyle = '#AAAAAA';
        joystickContext.fillRect(0, 0, joystickCanvas.width, 35);
        joystickContext.strokeStyle = '#2D2C2A';
        joystickContext.lineWidth = 2;
        joystickContext.strokeRect(0, 0, joystickCanvas.width, 35);

        joystickContext.fillStyle = '#FFE0C7';
        joystickContext.fillRect(((joystickCanvas.width / 2) - 125), 0, 250, 150);
        joystickContext.strokeStyle = '#2D2C2A';
        joystickContext.lineWidth = 2;
        joystickContext.strokeRect(((joystickCanvas.width / 2) - 125), 0, 250, 150);

        var widthPerElementUp = ((joystickCanvas.width / 2) - 145) / 2;
        var textUp = '';

        textUp = 'Acc : ' + (isAccelerometer ? 'True' : 'False');
        joystickContext.font = '15px Georgia';
        joystickContext.fillStyle = '#000000';
        joystickContext.fillText(textUp, ((joystickCanvas.width / 2) - 145 - joystickContext.measureText(textUp).width), 20);

        var textJoystickMode = '';

        switch (joystickMode) {
            case JOYSTICK_MODE.JOYSTICK:
                textJoystickMode = 'Joystick';
                break;
            case JOYSTICK_MODE.GYROSCOPE:
                textJoystickMode = 'Gyr';
                break;
            case JOYSTICK_MODE.USB_CONTROLLER:
                textJoystickMode = 'USB';
                break;
            default:
                textJoystickMode = 'None';
        }

        textUp = 'MODE : ' + textJoystickMode;
        joystickContext.font = '15px Georgia';
        joystickContext.fillStyle = '#000000';
        joystickContext.fillText(textUp, ((joystickCanvas.width / 2) - 145 - joystickContext.measureText(textUp).width - widthPerElementUp), 20);

        //DOWN BAR
        joystickContext.fillStyle = '#AAAAAA';
        joystickContext.fillRect(0, (joystickCanvas.height - 35), joystickCanvas.width, 35);
        joystickContext.strokeStyle = '#2D2C2A';
        joystickContext.lineWidth = 2;
        joystickContext.strokeRect(0, (joystickCanvas.height - 35), joystickCanvas.width, 35);

        if(joystickMode != JOYSTICK_MODE.NONE) {
            joystickContext.fillStyle = '#9BB7A7';
            joystickContext.fillRect(((joystickCanvas.width / 2) - 30), (joystickCanvas.height - 40), 60, 40);
            joystickContext.strokeStyle = '#006666';
            joystickContext.lineWidth = 3;
            joystickContext.strokeRect(((joystickCanvas.width / 2) - 30), (joystickCanvas.height - 40), 60, 40);

            joystickContext.font = '12px Georgia';
            joystickContext.fillStyle = '#22211F';
            joystickContext.fillText('READY', ((joystickCanvas.width / 2) - (joystickContext.measureText('READY').width / 2)), (joystickCanvas.height - 17));
        }
        else {
            joystickContext.fillStyle = '#FA8072';
            joystickContext.fillRect(((joystickCanvas.width / 2) - 30), (joystickCanvas.height - 40), 60, 40);
            joystickContext.strokeStyle = '#800000';
            joystickContext.lineWidth = 3;
            joystickContext.strokeRect(((joystickCanvas.width / 2) - 30), (joystickCanvas.height - 40), 60, 40);

            joystickContext.font = '10px Georgia';
            joystickContext.fillStyle = '#22211F';
            joystickContext.fillText('NOT READY', ((joystickCanvas.width / 2) - (joystickContext.measureText('NOT READY').width / 2)), (joystickCanvas.height - 17));
        }

        var countElements = 3;
        var widthPerElement = ((joystickCanvas.width / 2) - 50) / countElements;
        var text = '';

        text = throttle + '%';
        joystickContext.font = '15px Georgia';
        joystickContext.fillStyle = '#000000';
        joystickContext.fillText(text, ((joystickCanvas.width / 2) - 50 - joystickContext.measureText(text).width), (joystickCanvas.height - 12));

        text = 'Y : ' + yAxis + ' ';
        joystickContext.font = '15px Georgia';
        joystickContext.fillStyle = '#000000';
        joystickContext.fillText(text, ((joystickCanvas.width / 2) - 50 - joystickContext.measureText(text).width - widthPerElement), (joystickCanvas.height - 12));

        text = 'X : ' + xAxis + ' ';
        joystickContext.font = '15px Georgia';
        joystickContext.fillStyle = '#000000';
        joystickContext.fillText(text, ((joystickCanvas.width / 2) - 50 - joystickContext.measureText(text).width - (2 * widthPerElement)), (joystickCanvas.height - 12));

        text = temperature + ' C';
        joystickContext.font = '15px Georgia';
        joystickContext.fillStyle = '#000000';
        joystickContext.fillText(text, ((joystickCanvas.width / 2) + 50), (joystickCanvas.height - 12));

        text = humidity + '%';
        joystickContext.font = '15px Georgia';
        joystickContext.fillStyle = '#000000';
        joystickContext.fillText(text, ((joystickCanvas.width / 2) + 50 + widthPerElement), (joystickCanvas.height - 12));

        text = pressure + 'Pa';
        joystickContext.font = '15px Georgia';
        joystickContext.fillStyle = '#000000';
        joystickContext.fillText(text, ((joystickCanvas.width / 2) + 50 + (2 * widthPerElement)), (joystickCanvas.height - 12));
    }

    if(isAccelerometer) {
        joystickContext.font = '15px Georgia';
        joystickContext.fillStyle = '#000000';
        //joystickContext.fillText(absolute, 10, 10);
        joystickContext.fillText('Degrees : ' + degrees, 10, 50);
        joystickContext.fillText('Pitch : ' + pitch, 10, 70);
        joystickContext.fillText('Roll : ' + roll, 10, 90);
    }

    /*
    joystickContext.fillText('Orientation : ' + ((window.innerWidth > window.innerHeight) ? 'PAYSAGE' : 'PORTRAIT'), 10, 70);
    joystickContext.fillText('Accelerometer : ' + ((isAccelerometer) ? 'True' : 'False'), 10, 90);

    var textJoystickMode = '';

    switch (joystickMode) {
        case JOYSTICK_MODE.JOYSTICK:
            textJoystickMode = 'Joystick';
            break;
        case JOYSTICK_MODE.GYROSCOPE:
            textJoystickMode = 'Gyroscope';
            break;
        case JOYSTICK_MODE.USB_CONTROLLER:
            textJoystickMode = 'USB controller';
            break;
        default:
            textJoystickMode = 'None';
    }

    joystickContext.fillText('Joystick mode : ' + textJoystickMode, 10, 110);

    joystickContext.fillText('xAxis : ' + xAxis, 150, 10);
    joystickContext.fillText('yAxis : ' + yAxis, 150, 30);
    joystickContext.fillText('Throttle : ' + throttle, 150, 50);
    */

    if(joystick1.mouseDown) {
        joystickContext.font = "15px Georgia";
        joystickContext.fillStyle = '#000000';
        joystickContext.fillText('Axis', (joystick1.xBase - (joystickContext.measureText('Axis').width / 2)), joystick1.yBase);

        joystickContext.beginPath();
        joystickContext.arc(joystick1.xBase, joystick1.yBase, (joystick1.size / 2), 0, 2 * Math.PI, false);
        joystickContext.lineWidth = 5;
        joystickContext.strokeStyle = joystick1.stroke;
        joystickContext.stroke();

        joystickContext.beginPath();
        joystickContext.arc(joystick1.xBase, joystick1.yBase, (joystick1.size / 2) - 10, 0, 2 * Math.PI, false);
        joystickContext.lineWidth = 5;
        joystickContext.strokeStyle = joystick1.stroke;
        joystickContext.stroke();

        joystickContext.beginPath();
        joystickContext.arc(joystick1.x, joystick1.y, (joystick1.sizeStick * joystick1.size), 0, 2 * Math.PI, false);
        joystickContext.fillStyle = joystick1.fill;
        joystickContext.fill();
        joystickContext.lineWidth = 5;
        joystickContext.strokeStyle = joystick1.stroke;
        joystickContext.stroke();

        /*
        joystickContext.fillStyle = '#000000';
        joystickContext.fillText('X : ' + joystick1.x + ', Y : ' + joystick1.y, joystick1.x + 30, joystick1.y - 30);
        */
    }

    if(joystick2.mouseDown) {
        joystickContext.font = "15px Georgia";
        joystickContext.fillStyle = '#000000';
        joystickContext.fillText('Throttle', (joystick2.xBase - (joystickContext.measureText('Throttle').width / 2)), joystick2.yBase);

        joystickContext.beginPath();
        joystickContext.arc(joystick2.xBase, joystick2.yBase, (joystick2.size / 2), 0, 2 * Math.PI, false);
        joystickContext.lineWidth = 5;
        joystickContext.strokeStyle = joystick2.stroke;
        joystickContext.stroke();

        joystickContext.beginPath();
        joystickContext.arc(joystick2.xBase, joystick2.yBase, (joystick2.size / 2) - 10, 0, 2 * Math.PI, false);
        joystickContext.lineWidth = 5;
        joystickContext.strokeStyle = joystick2.stroke;
        joystickContext.stroke();

        joystickContext.beginPath();
        joystickContext.arc(joystick2.x, joystick2.y, (joystick2.sizeStick * joystick2.size), 0, 2 * Math.PI, false);
        joystickContext.fillStyle = joystick2.fill;
        joystickContext.fill();
        joystickContext.lineWidth = 5;
        joystickContext.strokeStyle = joystick2.stroke;
        joystickContext.stroke();
    }

    /*
    if(throttleStick.mouseDown) {
        joystickContext.fillStyle = '#FA8072';
        joystickContext.fillRect(throttleStick.xBase, throttleStick.yBase, throttleStick.w, throttleStick.h);
        joystickContext.fillStyle = '#22211F';
        joystickContext.fillRect((throttleStick.xBase - 5), throttleStick.value, (throttleStick.w + 10), 50);
    }
    */

    throttleStick.x = (((3 * joystickCanvas.width) / 4) - (throttleStick.w / 2));
    throttleStick.h = (joystickCanvas.height - 220);

    joystickContext.fillStyle = '#FA8072';
    joystickContext.fillRect(throttleStick.xBase, throttleStick.yBase, throttleStick.w, throttleStick.h);
    joystickContext.fillStyle = '#22211F';
    joystickContext.fillRect((throttleStick.xBase - 15), throttleStick.value, (throttleStick.w + 30), 50);

    if(joystick1.mouseDown && throttleStick.mouseDown) {
        joystickMode = JOYSTICK_MODE.JOYSTICK;
    }
    else if(throttleStick.mouseDown && isAccelerometer) {
        joystickMode = JOYSTICK_MODE.GYROSCOPE;
    }
    else {
        joystickMode = JOYSTICK_MODE.NONE;
    }
}

function mouseDown(e) {
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

    e.preventDefault();

    var xMouse, yMouse;

    if(isTouchable) {
        console.log('mouseDown' + e.targetTouches.length);
        console.log('identifier : ' + e.changedTouches[0].identifier);

        xMouse = e.changedTouches[0].clientX - joystickCanvas.offsetLeft;
        yMouse = e.changedTouches[0].clientY - joystickCanvas.offsetTop;
    }
    else {
        xMouse = e.clientX - joystickCanvas.offsetLeft;
        yMouse = e.clientY - joystickCanvas.offsetTop;
    }

    if(yMouse > 70 && xMouse < (joystickCanvas.width / 2)) {
        if(joystick1.fingerIdentifier < 0 && joystick2.fingerIdentifier != e.changedTouches[0].identifier) {
            joystick1.setNewBase(xMouse, yMouse);
            joystick1.mouseDown = true;
            joystick1.fingerIdentifier = e.changedTouches[0].identifier;
        }

        /*
        if(joystick2.fingerIdentifier < 0 && joystick1.fingerIdentifier != e.changedTouches[0].identifier) {
            joystick2.setNewBase(xMouse, yMouse);
            joystick2.mouseDown = true;
            joystick2.fingerIdentifier = e.changedTouches[0].identifier;
        }
        */
    }

    if(yMouse > 70 && xMouse > (joystickCanvas.width / 2) && joystick1.fingerIdentifier != e.changedTouches[0].identifier && joystick2.fingerIdentifier != e.changedTouches[0].identifier) {
        //throttleStick.xBase = (xMouse - (throttleStick.w / 2));
        //throttleStick.yBase = (yMouse - throttleStick.h);

        //throttleStick.value = (throttleStick.yBase + throttleStick.h - 25);

        throttleStick.mouseDown = true;
        throttleStick.fingerIdentifier = e.changedTouches[0].identifier;
    }
}

function mouseUp(e) {
    console.log('mouseUp');
    console.log('identifier : ' + e.changedTouches[0].identifier);

    if(e.changedTouches[0].identifier == joystick1.fingerIdentifier) {
        joystick1.mouseDown = false;
        joystick1.fingerIdentifier = -1;
    }

    if(e.changedTouches[0].identifier == joystick2.fingerIdentifier) {
        joystick2.mouseDown = false;
        joystick2.fingerIdentifier = -1;
    }

    if(e.changedTouches[0].identifier == throttleStick.fingerIdentifier) {
        throttleStick.mouseDown = false;
        throttleStick.fingerIdentifier = -1;
    }
}

function mouseMove(e) {
    e.preventDefault();

    if(joystick1.mouseDown) {
        var xMouse, yMouse;

        if(isTouchable) {
            xMouse = e.targetTouches[findRowByIdentifier(e.targetTouches, joystick1.fingerIdentifier)].clientX - joystickCanvas.offsetLeft;
            yMouse = e.targetTouches[findRowByIdentifier(e.targetTouches, joystick1.fingerIdentifier)].clientY - joystickCanvas.offsetTop;
        }
        else {
            xMouse = e.clientX - joystickCanvas.offsetLeft;
            yMouse = e.clientY - joystickCanvas.offsetTop;
        }

        joystick1.x = (xMouse < (joystick1.xBase + (joystick1.size / 2)) && xMouse > (joystick1.xBase - (joystick1.size / 2))) ? xMouse : joystick1.x;
        joystick1.y = (yMouse < (joystick1.yBase + (joystick1.size / 2)) && yMouse > (joystick1.yBase - (joystick1.size / 2))) ? yMouse : joystick1.y;
    }

    if(joystick2.mouseDown) {
        var xMouse, yMouse;

        if(isTouchable) {
            //console.log('mouseMove' + e.targetTouches[findRowByIdentifier(e.targetTouches, joystick2.fingerIdentifier)].pageX);

            xMouse = e.targetTouches[findRowByIdentifier(e.targetTouches, joystick2.fingerIdentifier)].clientX - joystickCanvas.offsetLeft;
            yMouse = e.targetTouches[findRowByIdentifier(e.targetTouches, joystick2.fingerIdentifier)].clientY - joystickCanvas.offsetTop;
        }
        else {
            xMouse = e.clientX - joystickCanvas.offsetLeft;
            yMouse = e.clientY - joystickCanvas.offsetTop;
        }

        joystick2.x = (xMouse < (joystick2.xBase + (joystick2.size / 2)) && xMouse > (joystick2.xBase - (joystick2.size / 2))) ? xMouse : joystick2.x;
        joystick2.y = (yMouse < (joystick2.yBase + (joystick2.size / 2)) && yMouse > (joystick2.yBase - (joystick2.size / 2))) ? yMouse : joystick2.y;
    }

    if(throttleStick.mouseDown) {
        var xMouse, yMouse;

        if(isTouchable) {
            yMouse = e.targetTouches[findRowByIdentifier(e.targetTouches, throttleStick.fingerIdentifier)].clientY - joystickCanvas.offsetTop;
        }
        else {
            yMouse = e.clientY - joystickCanvas.offsetTop;
        }

        throttleStick.value = (yMouse >= (throttleStick.yBase - 25) && yMouse < (throttleStick.yBase + throttleStick.h - 25)) ? yMouse : throttleStick.value;
    }
}

function findRowByIdentifier(touches, identifier) {
    var row = -1;

    for(var i = 0; i < touches.length; i++) {
        if(touches[i].identifier == identifier)
            row = i;
    }

    return row;
}