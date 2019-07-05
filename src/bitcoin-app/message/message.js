'use strict';
const BN=require('bn.js');
const Constants=require('./Constants')

// Message: the struct of one message
// num: the number of this message
// flag: {0,1} 
//    0: this message is not the last message
//    1: this message is the last message
// data: the encrypted message string
// len:  the length of data in the last message
var Message=function(obj){
    if(!(this instanceof Message)){
        return new Message(obj)
    }
    else if(obj){
        this.set(obj);
    }
}

Message.prototype.set=function(obj){
    this.num=obj.num;          //number
    this.flag=obj.flag;       //number
    this.data=obj.data;       //buffer
    this.len=obj.len;          //number
    return this;
}



// recover message from int256(BN)
Message.prototype.recover=function(msg){
    var msgbuf=msg.toString(2,Constants.LEN);
    var numbuf=msgbuf.slice(Constants.REMAIN_LEN, Constants.NUM_LEN+Constants.REMAIN_LEN);
    var flagbuf=msgbuf.slice(Constants.REMAIN_LEN+Constants.NUM_LEN, Constants.REMAIN_LEN+Constants.NUM_LEN+Constants.FLAG_LEN);
    
    var num=parseInt(numbuf,2);
    var flag=parseInt(flagbuf,2);
    if(flag==1){
        var data=msgbuf.slice(Constants.REMAIN_LEN + Constants.NUM_LEN + Constants.FLAG_LEN, Constants.LEN - Constants.TOTAL_LEN);
        var lenbuf=msgbuf.slice(Constants.LEN-Constants.TOTAL_LEN , Constants.LEN);
        var len=parseInt(lenbuf,2);
    }else{
        var data=msgbuf.slice(Constants.REMAIN_LEN + Constants.NUM_LEN + Constants.FLAG_LEN, Constants.LEN);
        var len=0;
    }
    
    var obj={
        num:num,
        flag:flag,
        data:data,
        len:len
    }
    this.set(obj);
}

// format this message into int256(Buffer)
Message.prototype.format=function(){
    var numbn=new BN(this.num);
    var flagbn=new BN(parseInt(this.flag));
    var databn=new BN(this.data, 2);
    
    var lenbn=new BN(parseInt(this.len));
    // this.printMsg();
    // var num=parseInt(this.num,16);
    
    var msgbn=numbn.shln(Constants.FLAG_LEN).or(flagbn); 
    // console.log(msgbn);
    if(this.flag==1){
        msgbn=msgbn.shln(Constants.DATA_LEN-Constants.TOTAL_LEN).or(databn);
        msgbn=msgbn.shln(Constants.TOTAL_LEN).or(lenbn);
    }
    else{
        // console.log(databn)
        msgbn=msgbn.shln(Constants.DATA_LEN).or(databn);
        // console.log(msgbn);
    }
    // console.log("msg:")
    // console.log(msgbn);
    return msgbn;
}

Message.prototype.isLast=function(){
    if(this.flag){
        return true;
    }else{
        return false;
    }
}

Message.prototype.getLen=function(){
    if(this.flag){
        return this.len;
    }else{
        return -1;
    }
}

Message.prototype.setNum=function(num){
    this.num=num;
}

Message.prototype.setFlag=function(flag){
    this.flag=flag;
}

Message.prototype.setData=function(data){
    this.data=data;
}

Message.prototype.printMsg=function(){
    console.log(this.num);
    console.log(this.flag);
    console.log(this.data);
    console.log(this.len);
}

module.exports = Message;