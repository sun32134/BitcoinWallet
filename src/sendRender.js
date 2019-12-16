const remote=require('electron').remote;
const ipcRenderer=require('electron').ipcRenderer;
const fs = require('fs');
var CryptLib=require('cryptlib')
var Network=require('./bitcoin-app/Network');
var MessageHandler=require('./bitcoin-app/message/messageHandler');
var util = require('./bitcoin-app/message/util')
var Constants = require('./bitcoin-app/Constants');

var bnet=new Network();

// var win=remote.getCurrentWindow();

var g_utxos = null

// TODO: 添加最低发送金额
const sendMsgBtn=document.getElementById('send-message');
sendMsgBtn.addEventListener('click',()=>{
    const msgpath=document.getElementById('msgpath').value;
    const AES_key=document.getElementById('AES_Key').value;
    const fromAddr=document.getElementById('fromAddr').value;
    const listenAddr=document.getElementById('listenAddr').value;
    // 处理消息
    var data=fs.readFileSync(msgpath,'utf8');
    console.log(data);
    var iv = Constants.iv;
    var key=CryptLib.getHashSha256(AES_key, 32);
    var cypherText=CryptLib.encrypt(data, key, iv);
    if(cypherText.length >= 1024){
        console.log('Message too long');
        // 显示错误信息
        var err = {};
        err.err = 'Message too long'
        ipcRenderer.send('error', JSON.stringify(err));
    }
    else{
        var json={
            fileData:util.stringToHex(cypherText)
        }
        var obj = {
            json: json,
            fromAddr: fromAddr,
            changeAddr: listenAddr,
            iv:iv,
            key:key,
        }
        var messageHandler = new MessageHandler(json)
        messageHandler.splitToArray();
        var length = messageHandler.fileArray.length
        bnet.getFee().then((fee)=>{
            if(g_utxos == null){
                g_utxos = []
                console.log('[Error]: get utxos failed');
            }
            var ret = bnet.checkUtxos(length, fee, g_utxos);
            if(ret === true){
                obj.fee = fee
                ipcRenderer.send('msg-startSendMsg', JSON.stringify(obj));
                // win.close();
            }
            else{
                var err = {};
                err.err = 'Please make at least ' + ret +' payments to ' + fromAddr + ', 0.0001 btc per payment'
                ipcRenderer.send('error', JSON.stringify(err));
            }
        })   
    }
})

const msgPathBtn=document.getElementById('msgpath');
msgPathBtn.addEventListener('click',function(){
    ipcRenderer.send('msg-openMsgFile');
})

ipcRenderer.on('msg-url',function(event, filepath){
    msgPathBtn.value=filepath;
})

ipcRenderer.on('msg-sendDetails', function (event, message) {
    var obj = JSON.parse(`${message}`);
    console.log(obj);
    var fromAddr = obj.fromAddr;
    var listenAddr = obj.listenAddr;
    var fromTextNode = document.getElementById('fromAddr');
    var listenAddrTextNode = document.getElementById('listenAddr');

    fromTextNode.setAttribute('value', fromAddr)
    listenAddrTextNode.setAttribute('value', listenAddr)

    bnet.getUnspentOutputs(fromAddr).then((utxos)=>{
        var utxosTextNode = document.getElementById('utxos');
        utxosTextNode.setAttribute('value', utxos.length);
        g_utxos = utxos
        sendMsgBtn.disabled = false;
    })
})