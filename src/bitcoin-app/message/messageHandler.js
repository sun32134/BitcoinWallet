'use strict';
const Message=require('./message');
const Util=require('./util')
const Constants=require('./Constants')

var MessageHandler=function(obj){
    if(!(this instanceof MessageHandler)){
        return new MessageHandler(obj)
    }
    else if(obj){
        this.set(obj);
    }
}

MessageHandler.prototype.set=function(obj){
    this.fileData=obj.fileData;
    this.fileArray=obj.fileArray;
    this.messageArray=obj.messageArray;
    this.recoverMap=obj.recoverMap;
    return this;
}

// calculate how much messages we need
MessageHandler.prototype.calNum=function(data){
    var len=data.length;
    return Math.ceil(len/Constants.DATA_LEN);
}

// pad the secret message
MessageHandler.prototype.padding=function(OrginData){
    var result=new String();
    var data=Util.hexToBinary(OrginData).result;
    var len=data.length;
    var mod=len % Constants.DATA_LEN;
    // console.log(mod)
    if(mod==Constants.DATA_LEN-Constants.TOTAL_LEN){
        var count=Constants.DATA_LEN;
        var pad=Buffer.alloc(count,Constants.PADDING);
        result=data.concat(pad.toString());
    }
    else if(mod>Constants.DATA_LEN-Constants.TOTAL_LEN){
        var count=2*Constants.DATA_LEN-mod-Constants.TOTAL_LEN;
        var pad=Buffer.alloc(count,Constants.PADDING);
        result=data.concat(pad.toString());
    }
    else if(mod<Constants.DATA_LEN-Constants.TOTAL_LEN){
        var count=Constants.DATA_LEN-Constants.TOTAL_LEN-mod;
        // console.log("count:"+count);
        var pad=Buffer.alloc(count,Constants.PADDING);
        // console.log('data.length:'+data.length)
        // console.log('pad.length:'+pad.length)
        result=data.concat(pad.toString());
    }
    // console.log('result:'+result.length)
    // console.log('OrginData:'+OrginData.length)
    return result;
}

// unpad message
MessageHandler.prototype.removePadding=function(OrginData, len){
    var afterRemove=OrginData.substring(0,len);
    var hexRemove=Util.binaryToHex(afterRemove).result;
    // console.log(hexRemove)
    var result=Util.hexToString(hexRemove);
    return result;
}

// split one long message to message array in which contains the secret data.
MessageHandler.prototype.splitToArray=function(){
    this.fileArray=new Array();
    var data=this.padding(this.fileData);
    // console.log(data);
    var totalNum=this.calNum(data);
    for(var i=0;i<totalNum;i++){
        var temp=data.substring(i*Constants.DATA_LEN,(i+1)*Constants.DATA_LEN);
        // console.log(Util.binaryToHex(temp).result)
        this.fileArray.push(temp);
    }
    // this.printArray(this.fileArray);
}



// split the padded secret file array into formated message array
MessageHandler.prototype.fileArrayToMsgArray=function(){
    this.messageArray=new Array();
    for(var i=0;i<this.fileArray.length;i++){
        var s=this.fileArray[i];
        if(i==this.fileArray.length-1){
            var obj={
                num:i,
                flag:1,
                data:s,
                len:this.fileData.length
            }
        }else{
            var obj={
                num:i,
                flag:0,
                data:s,
                len:0
            }
        }
        var message=new Message(obj);
        // format the message string to BN
        var msgBN=message.format();
        this.messageArray.push(msgBN.toString('hex', 64));
    }
    // this.printArray(this.messageArray);
}

// recover data for various messages
MessageHandler.prototype.recoverData=function(){
    if(!this.checkCollectedMessage()){
        console.log('message not all collected yet, try it later!');
        return false;
    }

    // sort recoverMap by key
    // var len=this.recoverMap.get('len');
    var num=this.recoverMap.get('num');
    var sortedMap=new Map();
    for(var i=0;i<=num;i++){
        sortedMap.set(i,this.recoverMap.get(i));
    }

    this.fileData=new String();
    for(let item of sortedMap.entries()){
        this.fileData+=item[1].toString();
    }
    this.fileData=this.removePadding(this.fileData, this.recoverMap.get('len') * 4);
    // console.log(this.fileData);
}

// receive messages from blockchain
MessageHandler.prototype.receiveMessage=function(msgData){
    // recover message form BN
    var message=new Message();
    message.recover(msgData);
    // console.log(message.printMsg())
    if(!this.recoverMap){
        this.recoverMap=new Map();
    }
    if(message.flag===1){
        this.recoverMap.set('num',message.num);
        this.recoverMap.set('len',message.len);
        this.recoverMap.set(message.num,message.data);
    }else{
        this.recoverMap.set(message.num,message.data);
    }
    // this.printMap(this.recoverMap);
}

// check if all messages are collected
MessageHandler.prototype.checkCollectedMessage=function(){
    if(this.recoverMap === undefined){
        this.recoverMap = new Map();
        return false;
    }
    if(this.recoverMap.has('num')){
        var num=this.recoverMap.get('num');
        // console.log(num);
        if(this.recoverMap.size===num+3){
            return true;
        }
    }
    return false;
}

MessageHandler.prototype.printMessage=function(){
    console.log(this.fileData);
}

MessageHandler.prototype.printArray=function(array){
    for(var i=0;i<array.length;i++){
        console.log(array[i].toString(16));
        // console.log(array[i].length);
    }
}

MessageHandler.prototype.printMap=function(map){
    for(let item of map.entries()){
        console.log(item[0]+":"+item[1]);
    }
}

module.exports=MessageHandler;