const ipcRenderer=require('electron').ipcRenderer;
var Network=require('./bitcoin-app/Network');
const Wallet = require('./src/bitcoin-app/Wallet')

var bnet = new Network()
var wallet = new Wallet()

var fromWIFText = document.getElementById('fromWIF')
var toAddressText = document.getElementById('toAddress')
var numOfUTXOText = document.getElementById('numOfUTXO')

var depositBtn = document.getElementById('depositCoin')
depositBtn.addEventListener('click', () => {
    var fromWIF = fromWIFText.value.trim();
    var toAddress = toAddressText.value.trim();
    var numOfUtxo = numOfUTXOText.value.trim();

    console.log(fromWIF)
    console.log(toAddress)
    console.log(numOfUtxo)


})
