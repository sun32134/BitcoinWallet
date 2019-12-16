const ipcRenderer=require('electron').ipcRenderer;
const Wallet = require('./bitcoin-app/Wallet')
const Utils = require('./bitcoin-app/Utils')
const Constant = require('./bitcoin-app/Constants')

var toAddressText = document.getElementById('toAddress')
var numOfUTXOText = document.getElementById('numOfUTXO')
var passwordText = document.getElementById('password')
var depositBtn = document.getElementById('depositCoin')
var BTCPerTxText = document.getElementById('BTCPerTx')
depositBtn.addEventListener('click', async() => {
    var walletUrl = walletUrlBtn.value.trim();
    var toAddress = toAddressText.value.trim();
    var numOfUtxo = numOfUTXOText.value.trim();
    var password = passwordText.value.trim();
    var BTCPerTx = BTCPerTxText.value.trim();
    var err = await sendToAddress(walletUrl, password, toAddress, numOfUtxo, BTCPerTx)
    if(err != null){
        console.log(err);
    }
    else{
        var obj = {
            msg: "Deposit Success!"
        }
        ipcRenderer.send('info', JSON.stringify(obj))
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
async function sendToAddress(walletUrl, password, to, numOfUtxo, BTCPerTx){
    var wallet = new Wallet(walletUrl);
    await wallet.loadFromFile(password)
    const from = wallet.account.getChain(0).get(0);
    const node=wallet.account.getChain(0).derive(from);
    const wif=node.toWIF();
    for(var i = 0; i < numOfUtxo; i++){
        await wallet.sendToAddress(from, to, BTCPerTx, wif).catch((error) =>{
            var err = {
                err: error
            }
            ipcRenderer.send('error', JSON.stringify(err))
            return error
        })
        await Utils.sleep(Constant.WAITING_TIME);
    }
    return
}