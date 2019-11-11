const ipcRenderer=require('electron').ipcRenderer;

var createWalletByWordlistBtn = document.getElementById('createWalletByWordlistBtn');
createWalletByWordlistBtn.addEventListener('click', () => {
    ipcRenderer.send('service-createWalletByWordlist');
})

// TODO: deposit btc
var depositCoinsBtn = document.getElementById('depositCoinsBtn');
depositCoinsBtn.addEventListener('click', () => {
    ipcRenderer.send('service-depositCoins')
})

// TODO: check balance
var checkBalanceBtn = document.getElementById('checkBalanceBtn')
checkBalanceBtn.addEventListener('click', ()=>{
    ipcRenderer.send('service-checkBalance')
})
