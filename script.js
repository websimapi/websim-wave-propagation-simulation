import SimplexNoise from 'simplex-noise';

const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const waveTypeRadios = document.querySelectorAll('input[name="waveType"]');

let waveType = 'wifi';
let isRunning = false;
let time = 0;

// Wave origin
let waveOriginX;
let waveOriginY;

// Wave properties
const waveProperties = {
    wifi: { speed: 150, wavelength: 50, amplitude: 1 },
    sound: { speed: 50, wavelength: 20, amplitude: 1 },
    am: { speed: 100, wavelength: 80, amplitude: 1 },
    fm: { speed: 120, wavelength: 60, amplitude: 1 },
};

// Obstacles (walls) - simple rectangles
const obstacles = [
    { x: 100, y: 100, width: 5, height: 200 },
    { x: 300, y: 100, width: 200, height: 5 },
    { x: 300, y: 300, width: 200, height: 5 },
    { x: 500, y: 100, width: 5, height: 200 },
];

// Function to draw obstacles
function drawObstacles() {
    ctx.fillStyle = 'black';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// Function to initialize the simulation
function initializeSimulation() {
    // Reset time
    time = 0;
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawObstacles(); // Draw the obstacles

    // Get selected wave type
    waveTypeRadios.forEach(radio => {
        if (radio.checked) {
            waveType = radio.value;
        }
    });
}

function setWaveOrigin(x, y) {
    waveOriginX = x;
    waveOriginY = y;
}

// Function to check for obstacle collision
function obstacleCollision(x, y, radius) {
    for (const obstacle of obstacles) {
        if (x + radius > obstacle.x && x - radius < obstacle.x + obstacle.width &&
            y + radius > obstacle.y && y - radius < obstacle.y + obstacle.height) {
            return true;
        }
    }
    return false;
}

// Function to draw the wave with reflection and dissipation
function drawWave() {
    const { speed, wavelength, amplitude } = waveProperties[waveType];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawObstacles();

    const maxRadius = Math.min(canvas.width, canvas.height) / 2;

    for (let radius = 1; radius < maxRadius; radius += 2) {
        let angleOffset = (time * speed + radius) / wavelength;
        let x = waveOriginX + radius * Math.cos(angleOffset);
        let y = waveOriginY + radius * Math.sin(angleOffset);

        let originalX = x;
        let originalY = y;

        let collisionDetected = false;

        // Raycasting for collision detection
        for (let i = 0; i < obstacles.length; i++) {
            const obstacle = obstacles[i];

            // Simplified AABB collision check
            if (x > obstacle.x && x < obstacle.x + obstacle.width && y > obstacle.y && y < obstacle.y + obstacle.height) {
                collisionDetected = true;
                break;
            }

            // Basic reflection logic
            if (collisionDetected) {
                let normalX = 0;
                let normalY = 0;

                // Determine the normal vector based on the obstacle's orientation
                if (x < obstacle.x) normalX = 1; // Left side
                else if (x > obstacle.x + obstacle.width) normalX = -1; // Right side
                else if (y < obstacle.y) normalY = 1; // Top side
                else if (y > obstacle.y + obstacle.height) normalY = -1; // Bottom side

                // Calculate the angle of incidence
                let incidenceAngle = Math.atan2(y - waveOriginY, x - waveOriginX);

                // Calculate the angle of reflection
                let normalAngle = Math.atan2(normalY, normalX);
                let reflectionAngle = 2 * normalAngle - incidenceAngle;

                // Calculate the reflected x and y
                x = waveOriginX + radius * Math.cos(reflectionAngle);
                y = waveOriginY + radius * Math.sin(reflectionAngle);

                break; // Stop checking for other obstacle collision after the first is found
            }
        }

        ctx.beginPath();
        ctx.arc(waveOriginX, waveOriginY, radius, 0, 2 * Math.PI);

        // Modify alpha based on the distance from the origin and wave properties
        let alpha = Math.max(0, amplitude * (1 - radius / maxRadius)); // Fade out with distance

        // Use a different color for each wave type
        switch (waveType) {
            case 'wifi': ctx.strokeStyle = `rgba(0, 0, 255, ${alpha})`; break; // Blue
            case 'sound': ctx.strokeStyle = `rgba(0, 255, 0, ${alpha})`; break; // Green
            case 'am': ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`; break; // Red
            case 'fm': ctx.strokeStyle = `rgba(255, 0, 255, ${alpha})`; break; // Magenta
        }

        ctx.stroke();
    }
}

// Animation loop
function animate() {
    if (!isRunning) return;
    drawWave();
    time += 0.5;
    requestAnimationFrame(animate);
}

// Event listeners
startBtn.addEventListener('click', () => {
    isRunning = !isRunning;
    startBtn.textContent = isRunning ? 'Stop Simulation' : 'Start Simulation';
    initializeSimulation();
    if (isRunning) {
        animate();
    }
});

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setWaveOrigin(x, y);
    drawWave(); // Redraw the wave immediately to show the new origin
});

// Initialize on load
initializeSimulation();
setWaveOrigin(canvas.width / 2, canvas.height / 2);