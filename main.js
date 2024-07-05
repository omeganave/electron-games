const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('src/minesweeper.html');

    const menu = Menu.buildFromTemplate([
        {
            label: 'Games',
            submenu: [
                {
                    label: 'Minesweeper',
                    click: () => {
                        win.loadFile('src/minesweeper.html');
                    },
                },
                {
                    label: 'Snake',
                    click: () => {
                        win.loadFile('src/snake.html');
                    },
                },
                {
                    label: 'Tetris',
                    click: () => {
                        win.loadFile('src/tetris.html');
                    },
                }
            ],
        },
    ]);

    Menu.setApplicationMenu(menu);

}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});