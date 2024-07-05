const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const initialInterval = 100;
const speedIncreaseStep = 10;
const totalCells = (canvas.width / gridSize) * (canvas.height / gridSize);
let snake = [{ x: 9 * gridSize, y: 9 * gridSize }];
let direction = 'RIGHT';
let nextDirection = direction;
let food = generateFood();
let foodEaten = 0;
let interval = initialInterval;
let game;

document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    const keyPressed = event.keyCode;
    if (keyPressed === 37 && direction !== 'RIGHT') nextDirection = 'LEFT';
    if (keyPressed === 38 && direction !== 'DOWN') nextDirection = 'UP';
    if (keyPressed === 39 && direction !== 'LEFT') nextDirection = 'RIGHT';
    if (keyPressed === 40 && direction !== 'UP') nextDirection = 'DOWN';
}

function startGame() {
    game = setInterval(draw, interval);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i === 0) ? 'green' : 'lightgreen';
        ctx.fillRect(snake[i].x, snake[i].y, gridSize, gridSize);
        ctx.strokeStyle = 'darkgreen';
        ctx.strokeRect(snake[i].x, snake[i].y, gridSize, gridSize);
    }

    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, gridSize, gridSize);

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    direction = nextDirection;

    if (direction === 'LEFT') snakeX -= gridSize;
    if (direction === 'UP') snakeY -= gridSize;
    if (direction === 'RIGHT') snakeX += gridSize;
    if (direction === 'DOWN') snakeY += gridSize;

    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision({ x: snakeX, y: snakeY }, snake)) {
        clearInterval(game);
        alert('Game over!');
        return;
    }

    if (snakeX === food.x && snakeY === food.y) {
        food = generateFood();
        foodEaten++;
        if (foodEaten % 10 === 0) {
            clearInterval(game);
            interval = Math.max(20, interval - speedIncreaseStep);
            game = setInterval(draw, interval);
        }
    } else {
        snake.pop();
    }

    const newHead = { x: snakeX, y: snakeY };

    snake.unshift(newHead);

    if (snake.length === totalCells) {
        clearInterval(game);
        alert('You won! Congratulations!');
    }
}

function collision(head, array) {
    for (let i = 1; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) {
            return true;
        }
    }
    return false;
}

function generateFood() {
    let newFood;
    while (true) {
        newFood = {
            x: Math.floor(Math.random() * canvas.width / gridSize) * gridSize,
            y: Math.floor(Math.random() * canvas.height / gridSize) * gridSize
        };
        if (!collision(newFood, snake)) {
            return newFood;
        }
    }
}

startGame();