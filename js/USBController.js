/**
 * Created by Dylan on 10/10/2015.
 */

var haveEvents = 'GamepadEvent' in window;
var controllers = {};

/*
var rAF = window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.requestAnimationFrame;
    */

var USB_CONTROLLER = {
    isConnected: false,
    use: false,
    degreesMode: true,
    index: 0,
    xAxis: 0,
    yAxis: 0,
    throttle: 0,
    buttons: [
        {active: false, ft: false, gamepad: 0},
        {active: false, ft: false, gamepad: 1},
        {active: false, ft: false, gamepad: 2},
        {active: false, ft: false, gamepad: 3},
        {active: false, ft: false, gamepad: 4},
        {active: false, ft: false, gamepad: 5},
        {active: false, ft: false, gamepad: 6},
        {active: false, ft: false, gamepad: 7}
    ]
};


function connecthandler(e) {
    controllers[e.gamepad.index] = e.gamepad;

    USB_CONTROLLER.index = e.gamepad.index;
    USB_CONTROLLER.isConnected = true;

    //addgamepad(e.gamepad);
}

/*
function addgamepad(gamepad) {
    controllers[gamepad.index] = gamepad; var d = document.createElement("div");
    d.setAttribute("id", "controller" + gamepad.index);
    var t = document.createElement("h1");
    t.appendChild(document.createTextNode("gamepad: " + gamepad.id));
    d.appendChild(t);
    var b = document.createElement("div");
    b.className = "buttons";
    for (var i=0; i<gamepad.buttons.length; i++) {
        var e = document.createElement("span");
        e.className = "button";
        //e.id = "b" + i;
        e.innerHTML = i;
        b.appendChild(e);
    }
    d.appendChild(b);
    var a = document.createElement("div");
    a.className = "axes";
    for (var i=0; i<gamepad.axes.length; i++) {
        var e = document.createElement("progress");
        e.className = "axis";
        //e.id = "a" + i;
        e.setAttribute("max", "2");
        e.setAttribute("value", "1");
        e.innerHTML = i;
        a.appendChild(e);
    }
    d.appendChild(a);
    document.getElementById("start").style.display = "none";
    document.body.appendChild(d);
    rAF(updateStatus);
}
*/

function disconnecthandler(e) {
    delete controllers[e.gamepad.index];

    USB_CONTROLLER.isConnected = false;

    currentJoystickMode = JOYSTICK_MODE.NONE;

    //removegamepad(e.gamepad);
}

/*
function removegamepad(gamepad) {
    var d = document.getElementById("controller" + gamepad.index);
    document.body.removeChild(d);
    delete controllers[gamepad.index];
}
*/

/*
function updateStatus() {
    if (!haveEvents) {
        scangamepads();
    }
    for (j in controllers) {
        var controller = controllers[j];
        var d = document.getElementById("controller" + j);
        var buttons = d.getElementsByClassName("button");
        for (var i=0; i<controller.buttons.length; i++) {
            var b = buttons[i];
            var val = controller.buttons[i];
            var pressed = val == 1.0;
            if (typeof(val) == "object") {
                pressed = val.pressed;
                val = val.value;
            }
            var pct = Math.round(val * 100) + "%"
            b.style.backgroundSize = pct + " " + pct;
            if (pressed) {
                b.className = "button pressed";
            } else {
                b.className = "button";
            }
        }

        var axes = d.getElementsByClassName("axis");
        for (var i=0; i<controller.axes.length; i++) {
            var a = axes[i];
            a.innerHTML = i + ": " + controller.axes[i].toFixed(4);
            a.setAttribute("value", controller.axes[i] + 1);
        }
    }
    rAF(updateStatus);
}
*/

function scangamepads() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
    for (var i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            if (!(gamepads[i].index in controllers)) {
                controllers[gamepads[i].index] = gamepads[i];
            } else {
                controllers[gamepads[i].index] = gamepads[i];
            }
        }
    }
}

window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);

if (!haveEvents) {
    setInterval(scangamepads, 500);
}

setInterval(function() {
    if(USB_CONTROLLER.isConnected) {
        //console.log(controllers[USB_CONTROLLER.index].axes[0] * 45);

        currentJoystickMode = (USB_CONTROLLER.use) ? JOYSTICK_MODE.USB_CONTROLLER : JOYSTICK_MODE.NONE;

        if(USB_CONTROLLER.use) {
            USB_CONTROLLER.xAxis = Math.ceil(controllers[USB_CONTROLLER.index].axes[0] * 45);
            USB_CONTROLLER.xAxis = (USB_CONTROLLER.xAxis >= -1 && USB_CONTROLLER.xAxis <= 1) ? 0 : USB_CONTROLLER.xAxis;

            USB_CONTROLLER.yAxis = Math.ceil(controllers[USB_CONTROLLER.index].axes[1] * 45);
            USB_CONTROLLER.yAxis = (USB_CONTROLLER.yAxis >= -1 && USB_CONTROLLER.yAxis <= 1) ? 0 : USB_CONTROLLER.yAxis;

            USB_CONTROLLER.throttle = Math.floor(map_range(controllers[USB_CONTROLLER.index].axes[2], 1, -1, 0, 100));
            USB_CONTROLLER.throttle = (USB_CONTROLLER.throttle > 5) ? USB_CONTROLLER.throttle : 0;

            //console.log(controllers[USB_CONTROLLER.index].axes[2], USB_CONTROLLER.throttle);

            DRONE_CONTROLS.xAxis = USB_CONTROLLER.xAxis;
            DRONE_CONTROLS.yAxis = USB_CONTROLLER.yAxis;
            DRONE_CONTROLS.throttle = USB_CONTROLLER.throttle;
        }

        for(var i = 0; i < USB_CONTROLLER.buttons.length; i++) {
            if(USB_CONTROLLER.buttons[i].gamepad <= controllers[0].buttons.length) {
                if(controllers[0].buttons[USB_CONTROLLER.buttons[i].gamepad].pressed && !USB_CONTROLLER.buttons[i].active) {
                    console.log(USB_CONTROLLER.buttons[i].gamepad);

                    USB_CONTROLLER.buttons[i].active = true;
                    USB_CONTROLLER.buttons[i].ft = true;
                }
                else {
                    USB_CONTROLLER.buttons[i].active = false;
                    USB_CONTROLLER.buttons[i].ft = false;
                }
            }
        }
    }
}, 100);