// const { contextBridge, ipcRenderer } = require('electron');

// contextBridge.exposeInMainWorld('electron', {
//     playSound: (sound) => {
//         console.log(`Requesting sound: ${sound}`);
//         ipcRenderer.send('play-sound', sound);
//     },
//     sendMessage: (message) => {
//         console.log(`Sending message: ${message}`);
//         ipcRenderer.send('test-message', message);
//     }
// });