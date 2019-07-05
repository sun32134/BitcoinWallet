var util=require('../util') 
const Message=require('../message');
var fs = require('fs')
const BN=require('bn.js')
var assert = require('chai').assert
var CryptLib=require('cryptlib')


describe('测试消息类', function () {
    it('测试组装交易', function () {
        var dataHex = '123456787654321';
        var embedJson = {
            num:12,
            flag:1,
            data:util.stringToHex(dataHex),
            len:20
        }
        var message = new Message(embedJson);
        var msgBn = message.format();
        // console.log(msgBn.toString('hex'))
    })

    it('测试恢复消息', function () {
        var msg = "c800000000000000000000000000000000000000000000000009c718e370014";
        var message = new Message();
        var bn=new BN(msg,16);
        message.recover(bn);
    })
})