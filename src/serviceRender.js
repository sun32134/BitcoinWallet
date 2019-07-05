const ipcRenderer=require('electron').ipcRenderer;

var createWalletByWordlistBtn = document.getElementById('createWalletByWordlistBtn');
createWalletByWordlistBtn.addEventListener('click', () => {
    ipcRenderer.send('service-createWalletByWordlist');
})

var depositCoinsBtn = document.getElementById('depositCoinsBtn');
depositCoinsBtn.addEventListener('click', () => {
    ipcRenderer.send('service-depositCoinsBtn');
})

