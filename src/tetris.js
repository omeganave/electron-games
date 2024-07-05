const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const EMPTY_COLOR = 'white';
const COLORS = [
    '#fff',
    '#00f',
    '#f90',
    '#09f',
    '#ff0',
    '#0f0',
    '#f0f',
    '#f00'
];
const DROP_INTERVAL = 500;
const SHAPES = [
    [],
    [
        [1, 1, 1, 1]
    ],
    [
        [2, 0, 0],
        [2, 2, 2]
    ],
    [
        [0, 0, 3],
        [3, 3, 3]
    ],
    [
        [4, 4],
        [4, 4]
    ],
    [
        [0, 5, 5],
        [5, 5, 0]
    ],
    [
        [0, 6, 0],
        [6, 6, 6]
    ],
    [
        [7, 7, 0],
        [0, 7, 7]
    ]
];

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentShape = getRandomShape();
let currentX = 0;
let currentY = 0;

function drawBoard() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            drawBlock(col, row, board[row][col]);
        }
    }
}

function drawBlock(x, y, colorIndex) {
    ctx.fillStyle = COLORS[colorIndex];
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function getRandomShape() {
    const shapeIndex = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
    return SHAPES[shapeIndex];
}

function drawShape() {
    for (let row = 0; row < currentShape.length; row++) {
        for (let col = 0; col < currentShape[row].length; col++) {
            if (currentShape[row][col]) {
                drawBlock(currentX + col, currentY + row, currentShape[row][col]);
            }
        }
    }
}

function moveDown() {
    currentY++;
    if (!isValidMove()) {
        currentY--;
        placeShape();
        clearFullRows();
        currentShape = getRandomShape();
        currentX = 0;
        currentY = 0;
        if (!isValidMove()) {
            alert('Game over!');
            resetGame();
        }
    }
}

function isValidMove() {
    for (let row = 0; row < currentShape.length; row++) {
        for (let col = 0; col < currentShape[row].length; col++) {
            if (currentShape[row][col]) {
                let newX = currentX + col;
                let newY = currentY + row;
                if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >=0 && board[newY][newX])) {
                    return false;
                }
            }
        }
    }
    return true;
}

function placeShape() {
    for (let row = 0; row < currentShape.length; row++) {
        for (let col = 0; col < currentShape[row].length; col++) {
            if (currentShape[row][col]) {
                board[currentY + row][currentX + col] = currentShape[row][col];
            }
        }
    }
}

function clearFullRows() {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every((cell) => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(0));
        }
    }
}

function resetGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    currentShape = getRandomShape();
    currentX = 0;
    currentY = 0;
}

function rotateShape() {
    const rotatedShape = currentShape[0].map((_, colIndex) => currentShape.map(row => row[colIndex]).reverse());
    const originalShape = currentShape;
    currentShape = rotatedShape;
    if (!isValidMove()) {
        currentShape = originalShape;
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawShape();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        currentX--;
        if (!isValidMove()) {
            currentX++;
        }
    } else if (event.key === 'ArrowRight') {
        currentX++;
        if (!isValidMove()) {
            currentX--;
        }
    } else if (event.key === 'ArrowDown') {
        moveDown();
    } else if (event.key === 'ArrowUp') {
        rotateShape();
    }
});

function startGame() {
    gameLoop();
    setInterval(moveDown, DROP_INTERVAL);
}

startGame();