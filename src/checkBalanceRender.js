var Network=require('./bitcoin-app/Network')
var Contants = require('./bitcoin-app/Constants')

var bnet = new Network()

var addressText = document.getElementById('address')
var balanceText = document.getElementById('balance')

var checkBtn = document.getElementById('checkBalance')
checkBtn.addEventListener('click', () => {
    address = addressText.value.trim()
    //test address: 3HqH1qGAqNWPpbrvyGjnRxNEjcUKD4e6ea 
    bnet.getBalance(address).then((data) => {
        // console.log(data[address].final_balance)
        balanceText.value = data[address].final_balance / Contants.Satoshis
    })
})

