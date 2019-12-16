var MessageHandler=require('./message/messageHandler.js')
const fs=require('fs');
const Constants = require('./Constants')

function loopFunction(arr,i,callback) {
    callback(arr[i]).then((value)=>{
        console.log('next loop');
        i++;
        if(i<arr.length){
            loopFunction(arr,i,callback);
        }
    })
}

function loopPromise(arr,callback){
    var results=[];
    var i=0;
    return new Promise((res,rej)=>{
        arr.forEach(function(item,index){
            callback(item).then((value)=>{
                results.push(value);
                i++;
                if(i===arr.length){
                    res(results);
                }
            }).catch((err)=>{
                console.log('someting wrong,loop:'+err);
                rej(err);
            })
        })
    })
}

function stringToHex(s) {
    var result = '';
    for (var i=0; i<s.length; i++) {
        var b = s.charCodeAt(i);
        if(0<=b && b<16){
            result+= '000'+b.toString(16)
        }
        if(16<=b && b<255){
            result+= '00'+b.toString(16)
        }
        if(255<=b && b<4095){
            result+= '0'+b.toString(16)
        }
        if(4095<=b && b<65535){
            result+= b.toString(16)
        }
    }
    return result;
};

function decodeMessage(url){
    return new Promise((res,rej)=>{
        fs.readFile(url,function(err,data){
            if(err){
                throw err;
            }
            var obj={
                fileData:stringToHex(data.toString())
            }
            var messageHandler=new MessageHandler(obj);
            messageHandler.splitToArray();
            messageHandler.fileArrayToMsgArray();
            // for(var i=0;i<messageHandler.messageArray.length;i++){
            //     messageHandler.receiveMessage(messageHandler.messageArray[i])
            // }
            // messageHandler.recoverData();
            res(messageHandler.messageArray);
        });
    })
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateNumberofUTXOWeNeed(current, output, feePerByte){
    var btc = 10000;
    var number = 0;
    while(current < output){
        current += btc;
        output += feePerByte * 180;
        number ++;
    }
    return number;
}

function sortUtxos(utxos){
    for(var i = 0; i < utxos.length; i++){
        for(var j = i+1; j < utxos.length; j++){
            if(utxos[i].value < utxos[j].value){
                var temp = utxos[i];
                utxos[i] = utxos[j];
                utxos[j] = temp;
            }
        }
    }
    return utxos;
}

module.exports={
    loopPromise,
    loopFunction,
    decodeMessage,
    sleep,
    calculateNumberofUTXOWeNeed,
    sortUtxos,
}