let paused = false;
let damping = true;
let dragging = false;
let timeSinceRelease = 0;
let mousePos = {
    x: 0,
    y: 0
};
let granularity = 4;
let speed = 100;
let points = [];

function initialize() {
    for (i = 0; i < window.innerWidth / granularity; i++) {
        points[i] = { x: granularity * i, y: 0, dx: 0, dy: 0 };
    }
}

function drawPoints(ctx) {
    for (i = 0; i < points.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(points[i].x, canvas.height / 2 - points[i].y);
        ctx.lineTo(points[i + 1].x, canvas.height / 2 - points[i + 1].y);
        ctx.closePath();
        ctx.stroke();
    }
}

function drawMenu(ctx) {
    ctx.font = "20px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("use up and down arrows to control simulation speed", 500, 60);
    ctx.fillText("simulation speed: " + speed, 500, 80);
    ctx.fillText("hit space to pause", 500, 120);
    if (dragging) {
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

function renderString(ctx) {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMenu(ctx);
    ctx.strokeStyle = "red";

    if (dragging) {
        for (i = 0; i < points.length; i++) {
            points[i].dy = 0;
            points[i].ay = 0;

            if (i < mousePos.x / granularity) {
                //left side
                const distanceY =
                    ((mousePos.y - canvas.height / 2) / mousePos.x) *
                        (i * granularity) +
                    canvas.height / 2;
                points[i].y = canvas.height / 2 - distanceY;
            } else {
                //right side
                const distanceY =
                    -(
                        (mousePos.y - canvas.height / 2) /
                        (canvas.width - mousePos.x)
                    ) *
                        (i * granularity - canvas.width) +
                    canvas.height / 2;
                points[i].y = canvas.height / 2 - distanceY;
            }
        }
    } else {
        for (k = 0; k < speed; k++) {
            for (i = 1; i < points.length - 1; i++) {
                points[i].ay =
                    (points[i + 1].y - points[i].y) / granularity -
                    (points[i].y - points[i - 1].y) / granularity;
                if (damping) {
                    points[i].dy =
                        (points[i].dy + points[i].ay) *
                        Math.exp(-0.0000001 * timeSinceRelease);
                } else {
                    points[i].dy = points[i].dy + points[i].ay;
                }
            }
            for (i = 1; i < points.length - 1; i++) {
                points[i].y = points[i].y + points[i].dy;
            }
            timeSinceRelease += 1;
        }
    }
    drawPoints(ctx);
}

function render() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    if (paused) {
        ctx.clearRect(700, 110, 45, 15);
        ctx.fillText("PAUSED", 700, 120);
    } else {
        renderString(ctx);
        requestAnimationFrame(render);
    }
}

window.addEventListener("mousedown", function(e) {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
    dragging = true;
});

window.addEventListener("mousemove", function(e) {
    if (dragging) {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;
    }
});

window.addEventListener("mouseup", function() {
    dragging = false;
    timeSinceRelease = 0;
});

window.addEventListener("keydown", function(event) {
    // p - pause
    if (event.keyCode == 32) {
        const wasPaused = paused;
        paused = !paused;
        if (wasPaused) {
            render();
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
    console.log("Started");
    initialize();
    render();
}

window.addEventListener("load", start);
