let boardSize = 10;
let mineCount = 10;
let board = [];
let mines = [];
let revealedSafeCells = 0;
let flaggedCells = 0;
let totalSafeCells = boardSize * boardSize - mineCount;
let gameOver = false;

function createBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';

    const containerSize = 300;
    const cellSize = containerSize / boardSize;
    const fontSize = cellSize * 0.6

    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, ${cellSize}px)`;
    boardElement.style.gridTemplateRows = `repeat(${boardSize}, ${cellSize}px)`;

    board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));

    mines = [];
    while (mines.length < mineCount) {
        const row = Math.floor(Math.random() * boardSize);
        const col = Math.floor(Math.random() * boardSize);
        if (!board[row][col]) {
            board[row][col] = 'mine';
            mines.push({ row, col });
        }
    }

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.fontSize = `${fontSize}px`;
            cell.style.lineHeight = `${cellSize}px`;
            cell.addEventListener('click', onCellClick);
            cell.addEventListener('contextmenu', onCellRightClick);
            boardElement.appendChild(cell);
        }
    }
    flaggedCells = 0;
    const flagCount = document.getElementById('flag-count-value');
    flagCount.textContent = flaggedCells;
}

function countAdjacentMines(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const r = row + i;
            const c = col + j;
            if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
                if (board[r][c] === 'mine') {
                    count++;
                }
            }
        }
    }
    return count;
}

function revealSafeCells(row, col) {
    const stack = [{ row, col }];
    const visited = new Set();

    while (stack.length > 0) {
        const { row, col } = stack.pop();
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);

        if (!cell || cell.classList.contains('safe')) continue;

        const mineCount = countAdjacentMines(row, col);
        cell.classList.add('safe');
        cell.textContent = mineCount > 0 ? mineCount : '';
        switch (mineCount) {
            case 1:
                cell.style.color = 'blue';
                break;
            case 2:
                cell.style.color = 'green';
                break;
            case 3:
                cell.style.color = 'red';
                break;
            case 4:
                cell.style.color = 'darkblue'
                break;
            case 5:
                cell.style.color = 'darkred';
                break;
            case 6:
                cell.style.color = 'teal';
                break;
            case 7:
                cell.style.color = 'black';
                break;
            case 8:
                cell.style.color = 'gray';
                break;
        }
        revealedSafeCells++;

        if (mineCount === 0) {
            for (let r = -1; r <= 1; r++) {
                for (let c = -1; c <= 1; c++) {
                    const newRow = row + r;
                    const newCol = col + c;
                    if (
                        newRow >= 0 && newRow < boardSize &&
                        newCol >= 0 && newCol < boardSize &&
                        !visited.has(`${newRow},${newCol}`)
                    ) {
                        stack.push({ row: newRow, col: newCol });
                        visited.add(`${newRow},${newCol}`);
                    }
                }
            }
        }
    }
}

function onCellClick(event) {

    if (gameOver) return;

    const cell = event.target;
    const row = parseInt(cell.dataset.row, 10);
    const col = parseInt(cell.dataset.col, 10);
    const flagCount = document.getElementById('flag-count-value');

    if (cell.classList.contains('flagged')) {
        cell.classList.remove('flagged');
        cell.textContent = '';
        flaggedCells--;
        flagCount.textContent = flaggedCells;
        return;
    }
    if (board[row][col] === 'mine') {
        cell.classList.add('mine');
        alert('Game over!');
        revealMines();
        gameOver = true;
    } else {
        revealSafeCells(row, col);

        if (revealedSafeCells === totalSafeCells) {
            alert('Congratulations, you win!');
            gameOver = true;
        }
    }
}

function onCellRightClick(event) {

    if (gameOver) return;

    event.preventDefault();
    const cell = event.target;
    const row = parseInt(cell.dataset.row, 10);
    const col = parseInt(cell.dataset.col, 10);

    const flagCount = document.getElementById('flag-count-value');

    if (cell.classList.contains('safe')) return;

    if (cell.classList.contains('flagged')) {
        cell.classList.remove('flagged');
        cell.textContent = '';
        flaggedCells--;
        flagCount.textContent = flaggedCells;

    } else {
        cell.classList.add('flagged');
        cell.textContent = '🚩';
        flaggedCells++;
        flagCount.textContent = flaggedCells;
    }
}

function revealMines() {
    mines.forEach(({ row, col }) => {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('mine');
    });
}

function updateSettings() {
    boardSize = parseInt(document.getElementById('boardSize').value, 10);
    mineCount = parseInt(document.getElementById('mineCount').value, 10);
    totalSafeCells = boardSize * boardSize - mineCount;
}

function resetGame() {
    revealedSafeCells = 0;
    gameOver = false;
    updateSettings();
    createBoard();
}

document.getElementById('resetButton').addEventListener('click', resetGame);

createBoard();