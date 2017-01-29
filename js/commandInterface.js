/**
 * Created by Dylan on 10/10/2015.
 */

var isReady = false;

var JOYSTICK_MODE = {
    NONE: 0,
    JOYSTICK: 1,
    GYROSCOPE: 2,
    USB_CONTROLLER: 3
};

var currentJoystickMode = JOYSTICK_MODE.NONE;

var infoDroneList, compressText = false, ultraCompressText = false;
var temperatureText, humidityText, calibrateText, textButtonCalibrateSensors, buttonStartSession;
var attitudeCommand, attitudeSensors, heading, variometer, airspeed, altimeter, turn_coordinator, throttle;

var throttleInterface = 0;

window.onload = function() {
    loadSocketServer();

    infoDroneList = document.getElementById('infoDroneList');

    attitudeCommand = $.flightIndicator('#attitudeCommand', 'attitude');
    attitudeSensors = $.flightIndicator('#attitudeSensors', 'attitude');
    heading = $.flightIndicator('#heading', 'heading');
    variometer = $.flightIndicator('#variometer', 'variometer');
    airspeed = $.flightIndicator('#airspeed', 'airspeed');
    altimeter = $.flightIndicator('#altimeter', 'altimeter');
    turn_coordinator = $.flightIndicator('#turn_coordinator', 'turn_coordinator');
    throttle = $.flightIndicator('#throttle', 'throttle');

    var statusConnectionText = document.getElementById('statusConnectionText');
    var controlModeText = document.getElementById('controlModeText');
    var batteryText = document.getElementById('batteryText');
    temperatureText = document.getElementById('temperatureText');
    humidityText = document.getElementById('humidityText');
    calibrateText = document.getElementById('calibrateText');

    var USBControllerOptions = document.getElementById('USBControllerOptions');
    var buttonDegreesMode = document.getElementById('buttonDegreesMode');
    var buttonCalibrateSensors = document.getElementById('buttonCalibrateSensors');
    textButtonCalibrateSensors = document.getElementById('textButtonCalibrateSensors');
    buttonStartSession = document.getElementById('buttonStartSession');

    resizeElements();

    isReady = true;

    setInterval(function() {
        // Airspeed update
        airspeed.setAirSpeed(DRONE_PROPERTIES.hSpeed);

        // Attitude update
        if(currentJoystickMode == JOYSTICK_MODE.USB_CONTROLLER) {
            attitudeCommand.setRoll(-USB_CONTROLLER.xAxis);
            attitudeCommand.setPitch(USB_CONTROLLER.yAxis);
        }

        attitudeSensors.setRoll(DRONE_PROPERTIES.roll);
        attitudeSensors.setPitch(DRONE_PROPERTIES.pitch);

        // Altimeter update
        altimeter.setAltitude(DRONE_PROPERTIES.altitude);
        altimeter.setPressure(DRONE_PROPERTIES.pressure);

        // TC update
        if(currentJoystickMode == JOYSTICK_MODE.USB_CONTROLLER)
            turn_coordinator.setTurn(USB_CONTROLLER.xAxis);

        turn_coordinator.setRoll(40);

        // Heading update
        heading.setHeading(DRONE_PROPERTIES.degrees);
        heading.setNewHeading(DRONE_CONTROLS.degrees - DRONE_PROPERTIES.degrees);

        // Vario update
        variometer.setVario(DRONE_PROPERTIES.vSpeed);

        throttle.setAirSpeed(throttleInterface);

        statusConnectionText.innerHTML = ((!compressText) ? 'Status : ' : '') + ((isConnected) ? (!ultraCompressText ? 'Connected' : '<span class="glyphicon glyphicon-ok"></span>') : (!ultraCompressText ? 'Disconnected' : '<span class="glyphicon glyphicon-remove"></span>'));
        controlModeText.innerHTML = ((!compressText) ? 'Control mode : ' : '') + ((DRONE_PROPERTIES.controlMode == 1) ? 'Automatic' : 'Manual') + ' - ' + gControlMode();
        batteryText.innerHTML = ((!compressText) ? 'Battery : ' : '') + DRONE_PROPERTIES.battery + '%';
        temperatureText.innerHTML = ((!compressText) ? 'Temperature : ' : '') + DRONE_PROPERTIES.temperature + 'C';
        humidityText.innerHTML = ((!compressText) ? 'Humidity : ' : '') + DRONE_PROPERTIES.humidity + '%';

        if(USB_CONTROLLER.buttons[1].active && USB_CONTROLLER.buttons[1].ft) {
            USB_CONTROLLER.use = !USB_CONTROLLER.use;
            USB_CONTROLLER.buttons[1].ft = false;
        }

        if(USB_CONTROLLER.buttons[2].active && USB_CONTROLLER.buttons[2].ft && isPlayingSession) {
            DRONE_PROPERTIES.controlMode = (DRONE_PROPERTIES.controlMode == 0) ? 1 : 0;
            sendCommandSocket('M ' + DRONE_PROPERTIES.controlMode);

            USB_CONTROLLER.buttons[2].ft = false;
        }

        if(USB_CONTROLLER.buttons[3].active && USB_CONTROLLER.buttons[3].ft) {
            USB_CONTROLLER.degreesMode = !USB_CONTROLLER.degreesMode;
            USB_CONTROLLER.buttons[3].ft = false;
        }

        if(USB_CONTROLLER.degreesMode) {
            if(USB_CONTROLLER.buttons[6].active && USB_CONTROLLER.buttons[6].ft) {
                DRONE_CONTROLS.degrees = (DRONE_CONTROLS.degrees > 0) ? (DRONE_CONTROLS.degrees - 1) : 359;
                USB_CONTROLLER.buttons[6].ft = false;
            }

            if(USB_CONTROLLER.buttons[7].active && USB_CONTROLLER.buttons[7].ft) {
                DRONE_CONTROLS.degrees = (DRONE_CONTROLS.degrees < 359) ? (DRONE_CONTROLS.degrees + 1) : 0;
                USB_CONTROLLER.buttons[7].ft = false;
            }
        }
        else {
            if(USB_CONTROLLER.buttons[6].active && USB_CONTROLLER.buttons[6].ft) {
                DRONE_CONTROLS.currentCalibrateMotor = (DRONE_CONTROLS.currentCalibrateMotor < 1) ? 3 : (DRONE_CONTROLS.currentCalibrateMotor - 1);
                USB_CONTROLLER.buttons[6].ft = false;
            }

            if(USB_CONTROLLER.buttons[7].active && USB_CONTROLLER.buttons[7].ft) {
                DRONE_CONTROLS.currentCalibrateMotor = (DRONE_CONTROLS.currentCalibrateMotor > 2) ? 0 : (DRONE_CONTROLS.currentCalibrateMotor + 1);
                USB_CONTROLLER.buttons[7].ft = false;
            }

            if(USB_CONTROLLER.buttons[5].active && USB_CONTROLLER.buttons[5].ft) {
                DRONE_CONTROLS.calibrate[DRONE_CONTROLS.currentCalibrateMotor] = (DRONE_CONTROLS.calibrate[DRONE_CONTROLS.currentCalibrateMotor] < 1) ? 0 : (DRONE_CONTROLS.calibrate[DRONE_CONTROLS.currentCalibrateMotor] - 1);
                USB_CONTROLLER.buttons[5].ft = false;

                sendCommandSocket('B ' + DRONE_CONTROLS.calibrate[0] + '|' + DRONE_CONTROLS.calibrate[1] + '|' + DRONE_CONTROLS.calibrate[2] + '|' + DRONE_CONTROLS.calibrate[3]);
            }

            if(USB_CONTROLLER.buttons[4].active && USB_CONTROLLER.buttons[4].ft) {
                DRONE_CONTROLS.calibrate[DRONE_CONTROLS.currentCalibrateMotor] = (DRONE_CONTROLS.calibrate[DRONE_CONTROLS.currentCalibrateMotor] > 49) ? 50 : (DRONE_CONTROLS.calibrate[DRONE_CONTROLS.currentCalibrateMotor] + 1);
                USB_CONTROLLER.buttons[4].ft = false;

                sendCommandSocket('B ' + DRONE_CONTROLS.calibrate[0] + '|' + DRONE_CONTROLS.calibrate[1] + '|' + DRONE_CONTROLS.calibrate[2] + '|' + DRONE_CONTROLS.calibrate[3]);
            }
        }

        buttonDegreesMode.setAttribute('class', (USB_CONTROLLER.degreesMode) ? 'active' : '');
        calibrateText.innerHTML = DRONE_CONTROLS.currentCalibrateMotor + ' ' + DRONE_CONTROLS.calibrate[0] + '|' + DRONE_CONTROLS.calibrate[1] + '|' + DRONE_CONTROLS.calibrate[2] + '|' + DRONE_CONTROLS.calibrate[3];

        startSession(false);

        if(isPlayingSession) {
            buttonStartSession.classList.remove('btn-success');
            buttonStartSession.classList.add('btn-danger');

            buttonStartSession.innerHTML = !ultraCompressText ? 'Stop session' : '<span class="glyphicon glyphicon-stop"></span>';
        }
        else {
            buttonStartSession.classList.remove('btn-danger');
            buttonStartSession.classList.add('btn-success');

            buttonStartSession.innerHTML = !ultraCompressText ? 'Start Session' : '<span class="glyphicon glyphicon-play"></span>';
        }

        USBControllerOptions.style.display = (currentJoystickMode == JOYSTICK_MODE.USB_CONTROLLER) ? '' : 'none';

    }, 50);

    setInterval(function() {
        if(USB_CONTROLLER.throttle < throttleInterface)
            throttleInterface -= 0.5;

        if(USB_CONTROLLER.throttle > throttleInterface)
            throttleInterface += 0.5;
    }, 1);

    buttonStartSession.onclick = function() {
        startSession(true);
    };

    buttonCalibrateSensors.onclick = function() {
        if(isPlayingSession)
            sendCommandSocket('A Y');
    };

    function startSession(button) {
        if(isConnected) {
            buttonStartSession.disabled = false;

            if((USB_CONTROLLER.buttons[0].active && USB_CONTROLLER.buttons[0].ft) || button) {
                isPlayingSession = (DRONE_CONTROLS.throttle == 0 && !isPlayingSession);

                if(isPlayingSession) {
                    sendCommand('P 0|0|0|0');
                    sendCommandSocket('L N');
                }
                else {
                    sendCommandSocket('L Y');
                }

                USB_CONTROLLER.buttons[0].ft = false;
            }
        }
        else {
            buttonStartSession.disabled = true;
            isPlayingSession = false;
        }
    }

    function gControlMode() {
        switch (currentJoystickMode) {
            case JOYSTICK_MODE.USB_CONTROLLER:
                return !compressText ? 'USB controller' : 'USB';
                break;
            case JOYSTICK_MODE.JOYSTICK:
                return !compressText ? 'Joystick' : 'Joy';
                break;
            case JOYSTICK_MODE.GYROSCOPE:
                return !compressText ? 'Gyroscope' : 'Gyr';
                break;
            default :
                return !compressText ? 'None' : 'No';
        }
    }
};

window.onresize = function() {
    console.log('resize window');

    if(isReady)
        resizeElements();
    
    if(isTouchDevice)
        resetTouchCanvas();
};

function resizeElements() {
    var maxWidthElement = (window.innerWidth / 4) - 10;
    var maxHeightElement = (window.innerHeight / 2) - 50;

    compressText = (window.innerWidth < 1155);

    if(window.innerWidth < 730) {
        ultraCompressText = true;

        temperatureText.style.display = 'none';
        humidityText.style.display = 'none';

        textButtonCalibrateSensors.innerHTML = 'CS';
    }
    else {
        ultraCompressText = false;

        temperatureText.style.display = '';
        humidityText.style.display = '';

        textButtonCalibrateSensors.innerHTML = 'Calibrate sensors';
    }

    if(maxWidthElement > maxHeightElement) {
        attitudeCommand.resize(maxHeightElement);
        attitudeSensors.resize(maxHeightElement);
        heading.resize(maxHeightElement);
        variometer.resize(maxHeightElement);
        airspeed.resize(maxHeightElement);
        altimeter.resize(maxHeightElement);
        turn_coordinator.resize(maxHeightElement);
        throttle.resize(maxHeightElement);
    }
    else {
        attitudeCommand.resize(maxWidthElement);
        attitudeSensors.resize(maxWidthElement);
        heading.resize(maxWidthElement);
        variometer.resize(maxWidthElement);
        airspeed.resize(maxWidthElement);
        altimeter.resize(maxWidthElement);
        turn_coordinator.resize(maxWidthElement);
        throttle.resize(maxWidthElement);
    }
}

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}