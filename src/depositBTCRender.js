const ipcRenderer=require('electron').ipcRenderer;
const Wallet = require('./bitcoin-app/Wallet')

var toAddressText = document.getElementById('toAddress')
var numOfUTXOText = document.getElementById('numOfUTXO')
var passwordText = document.getElementById('password')
var depositBtn = document.getElementById('depositCoin')
depositBtn.addEventListener('click', () => {
    var walletUrl = walletUrlBtn.value.trim();
    var toAddress = toAddressText.value.trim();
    var numOfUtxo = numOfUTXOText.value.trim();
    var password = passwordText.value.trim();
    var err = sendToAddress(walletUrl, password, toAddress, numOfUtxo)
    if(err != null){
        console.log(err);
    }
})

var walletUrlBtn = document.getElementById('walletUrl')
walletUrlBtn.addEventListener('click', () => {
    ipcRenderer.send('wallet-openWalletFile');
})

ipcRenderer.on('wallet-file', function(event, filepath){
    walletUrlBtn.value=filepath
})

// TODO: send to address test
function sendToAddress(walletUrl, password, to, numOfUtxo){
    var wallet = new Wallet(walletUrl);
    wallet.loadFromFile(password).then(async() => {
        const from = wallet.account.getChain(0).get(0);
        const node=wallet.account.getChain(0).derive(from);
        const wif=node.toWIF();
        for(var i = 0; i < numOfUtxo; i++){
            await wallet.sendToAddress(from, to, 0.0001, wif).catch(() => {
                // send error to main render
                var error = {
                    err:"[Error]: deposit coin error"
                }
                ipcRenderer.send(error)
                return;
            })
            await sleep(1000);
        }
    })
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}