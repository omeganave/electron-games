const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { Howl, Howler } = require('howler');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: true,
            enableRemoteModule: false,
        }
    });

    win.loadFile('src/breakout.html');

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
                },
                {
                    label: 'Asteroids',
                    click: () => {
                        win.loadFile('src/asteroids.html');
                    },
                },
                {
                    label: 'Breakout',
                    click: () => {
                        win.loadFile('src/breakout.html');
                    },
                },
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

const fireSound = new Howl({ src: [path.join(__dirname, 'shoot.wav')] });
const explosionSound = new Howl({ src: [path.join(__dirname, 'explode.wav')] });
const crashSound = new Howl({ src: [path.join(__dirname, 'crash.wav')] });

ipcMain.on('play-sound', (event, sound) => {
    console.log(`Playing sound: ${sound}`);
    if (sound === 'fire') {
        fireSound.play();
    } else if (sound === 'explosion') {
        explosionSound.play();
    } else if (sound === 'crash') {
        crashSound.play();
    }
});

// ipcMain.on('test-message', (event, message) => {
//     console.log(`Received message: ${message}`);
// });