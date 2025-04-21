import SimplexNoise from 'simplex-noise';

const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const waveTypeRadios = document.querySelectorAll('input[name="waveType"]');

let waveType = 'wifi';
let isRunning = false;
let time = 0;

// Wave properties
const waveProperties = {
    wifi: { speed: 150, wavelength: 50 },
    sound: { speed: 50, wavelength: 20 },
    am: { speed: 100, wavelength: 80 },
    fm: { speed: 120, wavelength: 60 },
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

// Function to draw the wave
function drawWave() {
    const { speed, wavelength } = waveProperties[waveType];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear previous frame (only the wave area)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawObstacles();

    const maxRadius = Math.min(canvas.width, canvas.height) / 2;


    for (let radius = 0; radius < maxRadius; radius += 2) {
        const angleOffset = (time * speed + radius) / wavelength;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);

        // Modify alpha based on the distance from the origin and wave properties
        let alpha = Math.max(0, 1 - radius / maxRadius); // Fade out with distance

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

// Initialize on load
initializeSimulation();

