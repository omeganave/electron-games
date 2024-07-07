// import { Howl } from 'howler';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let invulnerable = false;
let invulnerableStartTime = 0;
const INVULNERABLE_DURATION = 2000;

const offScreenCanvas = document.createElement('canvas');
const offScreenCtx = offScreenCanvas.getContext('2d');
offScreenCanvas.width = WIDTH;
offScreenCanvas.height = HEIGHT;

// const fireSound = new Howl({ src: ['./sounds/shoot.wav'] });
// const explosionSound = new Howl({ src: ['./sounds/explode.wav'] });
// const crashSound = new Howl({ src: ['./sounds/crash.wav'] });

class Asteroid {
    constructor(x, y, radius, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.angle = Math.random() * Math.PI * 2;
        this.velocity = { x: Math.sin(this.angle) * this.speed, y: -Math.cos(this.angle) * this.speed };
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        if (this.x < 0) this.x = WIDTH;
        if (this.x > WIDTH) this.x = 0;
        if (this.y < 0) this.y = HEIGHT;
        if (this.y > HEIGHT) this.y = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'white';
        ctx.stroke();
    }
}

class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.velocity = { x: Math.sin(angle) * 5, y: -Math.cos(angle) * 5 };
        this.radius = 2;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        if (this.x < 0 || this.x > WIDTH || this.y < 0 || this.y > HEIGHT) {
            return false;
        }

        return true;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
    }
}

class Spaceship {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.velocity = { x: 0, y: 0 };
        this.lastRotateTime = 0;
        this.lastAccelerateTime = 0;
        this.lastFireTime = 0;
        this.lastBrakeTime = 0;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        if (!invulnerable || Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(5, 10);
            ctx.lineTo(-5, 10);
            ctx.closePath();
            ctx.strokeStyle = 'white';
            ctx.stroke();
        }

        ctx.restore();
        // ctx.beginPath();
        // ctx.moveTo(0, -10);
        // ctx.lineTo(5, 10);
        // ctx.lineTo(-5, 10);
        // ctx.closePath();
        // ctx.strokeStyle = 'white';
        // ctx.stroke();
        // ctx.restore();
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        if (this.x < 0) this.x = WIDTH;
        if (this.x > WIDTH) this.x = 0;
        if (this.y < 0) this.y = HEIGHT;
        if (this.y > HEIGHT) this.y = 0;
    }

    rotate(direction, time) {
        if (time - this.lastRotateTime > 30) {
            this.angle += direction === 'left' ? -0.1 : 0.1;
            this.lastRotateTime = time;
        }
    }

    accelerate(time) {
        if (time - this.lastAccelerateTime > 90) {
            this.velocity.x += Math.sin(this.angle) * 0.1;
            this.velocity.y -= Math.cos(this.angle) * 0.1;
            this.lastAccelerateTime = time;
        }
    }

    brake(time) {
        if (time - this.lastBrakeTime > 90) {
            this.velocity.x *= 0.9;
            this.velocity.y *= 0.9;
            this.lastBrakeTime = time;
        }
    }

    fire(time) {
        if (time - this.lastFireTime > 300) {
            bullets.push(new Bullet(this.x, this.y, this.angle));
            // fireSound.play();
            // window.electron.playSound('fire');
            this.lastFireTime = time;
        }
    }
}

const spaceship = new Spaceship(WIDTH / 2, HEIGHT / 2);
const keys = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, Space: false, ArrowDown: false };
const bullets = [];
const asteroids = [];
const numAsteroids = 5;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let lives = 3;
let paused = false;

function drawLives() {
    // ctx.font = '20px Arial';
    // ctx.fillStyle = 'white';
    // ctx.fillText('Lives: ' + lives, WIDTH - 100, 30);
    ctx.save();
    ctx.translate(WIDTH - 100, 30);
    for (let i = 0; i < lives; i++) {
        ctx.save();
        ctx.translate(i * 30, 0);
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(5, 10);
        ctx.lineTo(-5, 10);
        ctx.closePath();
        ctx.strokeStyle = 'white';
        ctx.stroke();
        ctx.restore();
    }
    ctx.restore();
}

function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 10, 30);
}

function drawHighScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('High Score: ' + highScore, WIDTH / 2 - 60, 30);
}

function initAsteroids() {
    for (let i = 0; i < numAsteroids; i++) {
        spawnAsteroid();
    }
}

function spawnAsteroid(x = Math.random() * WIDTH, y = Math.random() * HEIGHT, radius = 20 + Math.random() * 30, speed = 0.5 + Math.random()) {
    const safeDistance = 50;

    while (Math.sqrt((x - spaceship.x) ** 2 + (y - spaceship.y) ** 2) < safeDistance) {
        x = Math.random() * WIDTH;
        y = Math.random() * HEIGHT;
    }

    asteroids.push(new Asteroid(x, y, radius, speed));
}

function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = asteroids.length - 1; j >= 0; j--) {
            const dx = bullets[i].x - asteroids[j].x;
            const dy = bullets[i].y - asteroids[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < asteroids[j].radius) {
                bullets.splice(i, 1);
                const destroyedAsteroid = asteroids.splice(j, 1)[0];
                // explosionSound.play();
                // window.electron.playSound('explosion');
                score += 10;
                if (destroyedAsteroid.radius > 40) {
                    const newRadius = destroyedAsteroid.radius / 2;
                    const newSpeed = destroyedAsteroid.speed * 1.5;
                    spawnAsteroid(destroyedAsteroid.x, destroyedAsteroid.y, newRadius, newSpeed);
                    spawnAsteroid(destroyedAsteroid.x, destroyedAsteroid.y, newRadius, newSpeed);
                } else if (asteroids.length < numAsteroids) {
                    spawnAsteroid();
                }
                break;
            }
        }
    }
    if (!invulnerable)  {
        for (let i = asteroids.length - 1; i >= 0; i--) {
            const dx = spaceship.x - asteroids[i].x;
            const dy = spaceship.y - asteroids[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < asteroids[i].radius) {
                // crashSound.play();
                // window.electron.playSound('crash');
                lives -= 1;
                if (lives > 0) {
                    resetSpaceship();
                    invulnerable = true;
                    invulnerableStartTime = Date.now();
                } else {
                    alert('Game over!');
                    resetGame();
                }
                break;
            }
        }
    }
}

function resetSpaceship() {
    spaceship.x = WIDTH / 2;
    spaceship.y = HEIGHT / 2;
    spaceship.angle = 0;
    spaceship.velocity.x = 0;
    spaceship.velocity.y = 0;
    spaceship.lastRotateTime = 0;
    spaceship.lastAccelerateTime = 0;
    spaceship.lastFireTime = 0;
    spaceship.lastBrakeTime = 0;
}

function clearCanvas() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function handleKeys(time) {
    if (keys.ArrowLeft) {
        spaceship.rotate('left', time);
    }

    if (keys.ArrowRight) {
        spaceship.rotate('right', time);
    }

    if (keys.ArrowUp) {
        spaceship.accelerate(time);
    }

    if (keys.Space) {
        spaceship.fire(time);
    }

    if (keys.ArrowDown) {
        spaceship.brake(time);
    }
}

function gameLoop(time) {
    clearCanvas();
    if (!paused) {
        // clearCanvas();
        handleKeys(time);
        spaceship.update();
        spaceship.draw();

        for (let i = bullets.length - 1; i >= 0; i--) {
            if (!bullets[i].update()) {
                bullets.splice(i, 1);
            } else {
                bullets[i].draw();
            }
        }

        asteroids.forEach(asteroid => {
            asteroid.update();
            asteroid.draw();
        });

        checkCollisions();
        drawLives();
        drawScore();
        drawHighScore();

        if (invulnerable && Date.now() - invulnerableStartTime > INVULNERABLE_DURATION) {
            invulnerable = false;
        }

        // requestAnimationFrame(gameLoop);
    } else {
        ctx.drawImage(offScreenCanvas, 0, 0);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.font = '40px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText('Paused', WIDTH / 2 - 60, HEIGHT / 2);
    }

    requestAnimationFrame(gameLoop);
}

function resetGame() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }

    resetSpaceship();
    // board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    
    bullets.length = 0;
    asteroids.length = 0;

    keys.ArrowLeft = false;
    keys.ArrowRight = false;
    keys.ArrowUp = false;
    keys.Space = false;
    keys.ArrowDown = false;

    score = 0;
    lives = 3;

    initAsteroids();
}

document.addEventListener('keydown', event => {
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight' || event.code === 'ArrowUp' || event.code === 'ArrowDown' || event.code === 'Space') {
        keys[event.code] = true;
    }
    if (event.code === 'KeyP') {
        paused = !paused;
        if (paused) {
            captureFrame();
        }
    }
});

document.addEventListener('keyup', event => {
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight' || event.code === 'ArrowUp' || event.code === 'ArrowDown' || event.code === 'Space') {
        keys[event.code] = false;
    }
});

function captureFrame() {
    offScreenCtx.drawImage(canvas, 0, 0);
}

initAsteroids();
gameLoop(0);