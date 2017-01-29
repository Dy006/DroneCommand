/**
 * Created by Dylan on 21/12/2015.
 */

var USBControllers = {};
var defaultController = 0;


var CONTROLLER = function(gamepad) {
    this.gamepad = gamepad;
    this.axisControl = [];
    this.buttonsControl = [];
};

CONTROLLER.prototype.isConnected = function() {

};

console.log('ok');

window.addEventListener("gamepadconnected", function(e) {
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length);

    console.log('add joystick');

    USBControllers[e.gamepad.index] = new CONTROLLER(e.gamepad);
});

window.addEventListener("gamepaddisconnected", function(e) {
    console.log("Gamepad disconnected from index %d: %s",
        e.gamepad.index, e.gamepad.id);

    console.log('delete joystick');

    delete USBControllers[e.gamepad.index];
});

setInterval(function() {

}, 10);