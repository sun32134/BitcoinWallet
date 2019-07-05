var Wallet = require('../Wallet');
var MockData = require('./MockData')
var Constants = require('../Constants')
var Network = require('../Network')
var Utils = require('../Utils')
var util = require('../message/util')
var CryptLib=require('cryptlib')
var MessageHandler = require('../message/messageHandler')

var wallet = new Wallet('D:/bitcoin-app/wallet3.db')
var AES_key = 'my secret'
var iv = Constants.iv;
 var key=CryptLib.getHashSha256(AES_key, 32);
var bnet=new Network();

function sendMsg(){
    return new Promise((res, rej) => {
       const listenAddr=wallet.account.getChainAddress(1);
        const i=wallet.account.getChain(1).find(listenAddr);
        const fromAddr = wallet.account.chains[0].addresses[i - 1];
    
        var data = MockData.mockMessage();
        var cypherText=CryptLib.encrypt(data, key, iv);
        if(cypherText.length >= 1024){
            res('消息长度不符合')
        }
        else{
            var json={
                fileData:util.stringToHex(cypherText)
            }
            var messageHandler = new MessageHandler(json)
            messageHandler.splitToArray();
            messageHandler.fileArrayToMsgArray();
            var length = messageHandler.fileArray.length
            console.log(length)
            console.log(fromAddr)
            bnet.getFee().then(async (fee) => {
                var utxos = await bnet.getUnspentOutputs(fromAddr, length);
                var ret = bnet.checkUtxos(length, fee, utxos, Constants.BTC);
                if(ret === true){
                    var rawTxs = await wallet.sendMsgSecret(messageHandler.messageArray, fee, fromAddr, listenAddr)
                    res(rawTxs);
                }
                else{
                    res(ret)
                }
            })
        } 
    })
}

function sendMsgRandomly(){
    loadPrivateChainWallet().then(async () => {
        for(var i = 0; i < 30; i++){
            var response = await sendMsg()
            var messageHandler = new MessageHandler();
            response.forEach((rawHex) => {
                var kArray = wallet.getK("1Kc4fJFFNpEJpV93vEFqxdjrXqzJSKnwxE", rawHex);
                kArray.forEach((k) =>　{
                    messageHandler.receiveMessage(k);
                })
                if(messageHandler.checkCollectedMessage()){
                    messageHandler.recoverData();
                    original = CryptLib.decrypt(messageHandler.fileData, key, iv);
                    console.log(original);
                }
            })
            await Utils.sleep(5000);
        }     
    })
}

function loadPrivateChainWallet(){
    return new Promise((res, rej) => {
        wallet.loadFromFile('hello world').then(() => {
            wallet.discoverMsg().then(() => {
                wallet.account.nextChainAddress(1);
                while(wallet.account.getChain(0).k < wallet.account.getChain(1).k){
                    wallet.account.nextChainAddress(0);
                }
                res()
            })
        })
    })  
}

sendMsgRandomly()

