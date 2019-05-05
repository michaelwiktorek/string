const dampingConstant = -0.0000001;
let paused = false;
let damping = true;
let draggingMouse = false;
let timeSinceRelease = 0;
let mousePos = {
    x: 0,
    y: 0
};
let speed = 150;
/* --- weird stuff here --- */
const numPoints = 700;
const stringLength = 800;
/* --- end weird stuff --- */
const thumbSize = 0;
let pixelsPerStringUnit = 1;
let pixelsPerPoint = 1;
const distanceBetweenPoints = stringLength / (numPoints - 1);
// data stored in string space units
const points = [];

// TODO resize handler, needs to iterate over points or something

function stringSpaceToPixelSpace({ x, y }) {
    const pixelsPerStringUnit = window.innerWidth / stringLength;
    return {
        x: x * pixelsPerStringUnit,
        y: window.innerHeight / 2 - y * pixelsPerStringUnit
    };
}

function pixelSpaceToStringSpace({ x, y }) {
    const stringUnitsPerPixel = stringLength / window.innerWidth;
    return {
        x: x * stringUnitsPerPixel,
        y: (window.innerHeight / 2 - y) * stringUnitsPerPixel
    };
}

function initialize() {
    for (i = 0; i < numPoints; i++) {
        points[i] = { x: distanceBetweenPoints * i, y: 0, dy: 0 };
    }

    console.log(
        window.innerWidth,
        stringLength,
        window.innerWidth / (stringLength - 1)
    );
}

function drawPoints(ctx) {
    const start = stringSpaceToPixelSpace({
        x: points[0].x,
        y: points[0].y
    });

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    for (i = 1; i < points.length; i++) {
        const { x, y } = stringSpaceToPixelSpace({
            x: points[i].x,
            y: points[i].y
        });
        ctx.lineTo(x, y);
    }
    ctx.stroke();
}

function drawMenu(ctx) {
    ctx.fillText("use up and down arrows to control simulation speed", 500, 60);
    ctx.fillText("simulation speed: " + speed, 500, 80);
    ctx.fillText("hit space to pause", 500, 120);
    if (draggingMouse) {
        ctx.fillText(
            "your mouse position is " + mousePos.x + " " + mousePos.y,
            500,
            100
        );
    } else {
        ctx.fillText("click and drag anywhere on screen", 500, 100);
    }
    if (damping) {
        ctx.fillText('Damping is on.  Hit "d" to turn it off.', 500, 140);
    } else {
        ctx.fillText('Damping is off.  Hit "d" to turn it on.', 500, 140);
    }
}

function dragString() {
    const { x, y } = pixelSpaceToStringSpace({ x: mousePos.x, y: mousePos.y });
    for (i = 1; i < points.length; i++) {
        points[i].dy = 0;
        const current = points[i];

        if (current.x < x - thumbSize / 2) {
            //left side
            const slope = y / x;
            points[i].y = slope * current.x;
        } else if (current.x > x + thumbSize / 2) {
            //right side
            const slope = y / (stringLength - x);
            const value = slope * (stringLength - current.x);
            points[i].y = value;
            if (i === points.length - 1) {
                points[i].y = 0;
            }
        } else {
            points[i].y = y;
        }
    }
}

function dampingMultiplier(t) {
    return damping ? Math.exp(dampingConstant * t) : 1;
}

function iterateVibration() {
    for (k = 0; k < speed; k++) {
        for (i = 1; i < points.length - 1; i++) {
            const next = points[i + 1];
            const prev = points[i - 1];
            const current = points[i];
            const yAcceleration =
                (next.y - current.y) / distanceBetweenPoints -
                (current.y - prev.y) / distanceBetweenPoints;
            points[i].dy =
                (current.dy + yAcceleration) *
                dampingMultiplier(timeSinceRelease);
        }
        for (i = 1; i < points.length - 1; i++) {
            points[i].y = points[i].y + points[i].dy;
        }
        timeSinceRelease += 1;
    }
}

function physics() {
    if (draggingMouse) {
        dragString();
    } else {
        iterateVibration();
    }
}

function render(ctx) {
    drawMenu(ctx);
    drawPoints(ctx);
}

function tickAndRequestNextTick() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    ctx.font = "20px Arial";
    ctx.fillStyle = "red";
    ctx.strokeStyle = "red";

    if (paused) {
        ctx.fillText("PAUSED", 700, 120);
        render(ctx);
    } else {
        physics();
        render(ctx);
        requestAnimationFrame(tickAndRequestNextTick);
    }
}

window.addEventListener("mousedown", function(e) {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
    draggingMouse = true;
});

window.addEventListener("mousemove", function(e) {
    if (draggingMouse) {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;
    }
});

window.addEventListener("mouseup", function() {
    draggingMouse = false;
    timeSinceRelease = 0;
});

window.addEventListener("keydown", function(event) {
    // p - pause
    if (event.keyCode == 32) {
        const wasPaused = paused;
        paused = !paused;
        if (wasPaused) {
            tickAndRequestNextTick();
        }
    }
    // up arrow - speedup
    if (event.keyCode == 38) {
        if (speed < 150 && speed >= 10) {
            speed += 10; //speed up
        } else if (speed < 10) {
            speed += 1;
        }
        // down arrow - slow down
    } else if (event.keyCode == 40) {
        if (speed > 10) {
            speed -= 10; //down
        } else if (speed > 1) {
            speed -= 1;
        }
    }
    // d - damping
    if (event.keyCode == 68) {
        damping = !damping;
    }
});

function start() {
    initialize();
    tickAndRequestNextTick();
}

window.addEventListener("load", start);
