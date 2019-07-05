var bip39 = require('bip39');
var bip32 = require('bip32');
var bitcoin = require('bitcoinjs-lib')
var Network = require('../Network')
var Constants = require('../Constants')
var Util = require('../Utils')
var fs = require('fs')

var bnet = new Network();

function getAddress(node, network){
    return bitcoin.payments.p2pkh({pubkey:node.publicKey, network}).address;
}

/**
 * to address info
 * Map: Address => value
 */

/**
 * from address info
 * Map: Address => wif
 */

var fromAddresses = new Map();
var toAddresses = new Map();

//设置接受地址，可以设置多个接受地址
toAddresses.set('1NYTfdbmWmkYoaUayDBWjB4thdKcGEyac5', 0.002);

const seedCode = "fill seed code";
const seed = bip39.mnemonicToSeed(seedCode);
const master = bip32.fromSeed(seed);
const Node=master.derivePath("m/0'/0");

async function checkBalance(total){
    estimateFee = 0.0001 * Constants.Satoshis;
    var current = 0;
    for(var i = 0; i < 1500; i = i + 50){
        var tempAddresses = [];
        for(var j = 0; j < 50; j++){
            var node = Node.derive(i + j);
            var address = getAddress(node, bitcoin.networks.bitcoin);
            tempAddresses.push(address);
            fromAddresses.set(address, node.toWIF());
        }
        var balanceResult = await bnet.getBalanceBatch2(tempAddresses);
        for(var [key, value] of balanceResult){
            if(value > 0 && current < total + estimateFee){
                current += value;
            }
            else{
                fromAddresses.delete(key);
            }
        }
        console.log(current);
        if(current >= total + estimateFee){
            break;
        }
        await Util.sleep(1000);
    }
    console.log(fromAddresses);
    if(current >= total){
        return true;
    }
    else{
        return false;
    }
}

async function getAddressesWithCoin() {
    var current = 0;
    for(var i = 0; i < 1500; i = i + 50){
        var tempAddresses = [];
        for(var j = 0; j < 50; j++){
            var node = Node.derive(i + j);
            var address = getAddress(node, bitcoin.networks.bitcoin);
            tempAddresses.push(address);
            fromAddresses.set(address, {
                wif: node.toWIF(),
                balance: 0
            });
        }
        var balanceResult = await bnet.getBalanceBatch2(tempAddresses);
        for(var [key, value] of balanceResult){
            if(value > 0){
                current += value;
                var json = fromAddresses.get(key);
                json.balance = value;
            }
            else{
                fromAddresses.delete(key);
            }
        }
        // console.log(current);
        console.log('checking...');
        await Util.sleep(1000);
    }
    console.log(fromAddresses);
    console.log(current);
}

async function getAddressesBalance(addresses) {
    // var total = 0;
    // addresses.forEach((address, index) => {
    //     console.log(index)
    //     await Util.sleep(10000);
    //     // bnet.getBalance(address).then((balance)=>{
    //     //     for(var addr in balance){
    //     //         if(balance[addr].final_balance > 0){
    //     //             // total += balance[addr].final_balance
    //     //             console.log(address+":"+balance[addr].final_balance);
    //     //         }
    //     //         // console.log(address+":"+balance[addr].final_balance);
    //     //     } 
    //     // })
    // })
    // console.log(addresses.length)
    for(var i = 0; i < addresses.length; i++ ){
        // console.log(i)
        await Util.sleep(1000);
        var address = addresses[i];
        bnet.getBalance(address).then((balance)=>{
            for(var addr in balance){
                if(balance[addr].final_balance > 0){
                    // total += balance[addr].final_balance
                    console.log(address+":"+balance[addr].final_balance);
                    fs.appendFileSync('result',address+":"+balance[addr].final_balance+"\r\n");
                }
                // console.log(address+":"+balance[addr].final_balance);
            } 
        })
    }
}

async function buildTransaction(feePerByte, satoshis, changeAddr){
    if(fromAddresses.size === 0){
        console.log('no from address');
        return [false, null];
    }
    if(toAddresses.size === 0){
        console.log('no to address');
        return [false, null];
    }

    var current = 0;
    var fee = toAddresses.size * 34 * feePerByte + 10;
    var change = 0;
    const txb = new bitcoin.TransactionBuilder(bitcoin.networks.bitcoin);
    var wifArray = [];
    for(var [formAddr, wif] of fromAddresses){
        utxos = await bnet.getUnspentOutputs(formAddr)
        for(const utx of utxos){
            wifArray.push(wif);
            txb.addInput(utx.tx_hash_big_endian,utx.tx_output_n);
            current += utx.value;
            fee += feePerByte * 180
            if(current >= (satoshis + fee)) break;
        }
        if(current >= (satoshis + fee)) break;
        await Util.sleep(1000)
    }
    if(current < (satoshis + fee)){
        console.log('insufficient money');
        return [false, null];
    }
    else if(current > (satoshis + fee)){
        change = current - (satoshis + fee);
    }
    
    for(var [toAddress, value] of toAddresses){
        txb.addOutput(toAddress, Math.ceil(value * Constants.Satoshis));
    }

    if(change !== 0){
        txb.addOutput(changeAddr, change);
    }

    return [txb, wifArray];
}

function signTransaction(txb, wifArray){
    txb.__tx.ins.forEach((input, vin)=>{
        console.log(input);
        const wif = wifArray[vin];
        const key=bitcoin.ECPair.fromWIF(wif, bitcoin.networks.bitcoin);
        txb.sign(vin, key)
    })
    return txb.build().toHex();
}

function broadTransaction(txHash){
    bnet.broadcast(txHash).then((txid) => {
        console.log(txid);
    });
}

async function sendTransaction(){
    var total = 0;
    // 获取接受地址总共的支出
    for(var [key, value] of toAddresses){
        total += value * Constants.Satoshis;
    }
    console.log(Math.ceil(total));
    total = Math.ceil(total);
    // 检查发送的钱包是否有足够btc
    var enoughBalance = await checkBalance(total);
    if(!enoughBalance){
        console.log('insufficient money!');
        return false;
    }
    // 获取feePerByte
    feePerByte = await bnet.getFee();
    // change address
    changeAddr = '12ZfKX2UWJ1Kd75Ptp3sh9ZyStZv4S4ry9';
    // 构建交易， 返回txb和与input对应的wif以进行签名
    const [txb, wifArray] = await buildTransaction(feePerByte, total, changeAddr);
    if(txb === false){
        return false;
    }
    // 对交易前面
    const txHash = signTransaction(txb, wifArray);
    console.log(txHash);
    // broadTransaction(txHash);
}

// var addresses = [
//     '17mp79XCrNjZsQTZfKMwZzkRGwh9AT19oD',
// '15s1pvibY5MJFXhNLTJ6ZcNRoqCQ88jRdT',
// '1CxJC1DgeFmGVXJZHJQiWsPzLMtu3oujf8',
// '12139T8vN33pSEnjPeLjG6DaTCF7F7nEu5',
// '12139T8vN33pSEnjPeLjG6DaTCF7F7nEu5',
// '15s1pvibY5MJFXhNLTJ6ZcNRoqCQ88jRdT',
// '16GNfKaTjgpLT6NjJ6Qvf1k4HbFCRsMA42',
// '15s1pvibY5MJFXhNLTJ6ZcNRoqCQ88jRdT',
// '15s1pvibY5MJFXhNLTJ6ZcNRoqCQ88jRdT',
// '1CxJC1DgeFmGVXJZHJQiWsPzLMtu3oujf8',
// '16GNfKaTjgpLT6NjJ6Qvf1k4HbFCRsMA42',
// '1CxJC1DgeFmGVXJZHJQiWsPzLMtu3oujf8',
// '1CxJC1DgeFmGVXJZHJQiWsPzLMtu3oujf8',
// '1L9uCcmQLYWrGEavc5zEHZ1vLpV1PqdCzr',
// '15s1pvibY5MJFXhNLTJ6ZcNRoqCQ88jRdT',
// '17mp79XCrNjZsQTZfKMwZzkRGwh9AT19oD',
// '15s1pvibY5MJFXhNLTJ6ZcNRoqCQ88jRdT',
// '17mp79XCrNjZsQTZfKMwZzkRGwh9AT19oD',
// '15s1pvibY5MJFXhNLTJ6ZcNRoqCQ88jRdT',
// '1CeYxHWXhPvNV63Q4fudB5wvQ2GSy1b6Rt',
// '1HkkZ1yPLWLtU2BGyY8t5qJnwwpxdgiL4X',
// '17mp79XCrNjZsQTZfKMwZzkRGwh9AT19oD',
// '17mp79XCrNjZsQTZfKMwZzkRGwh9AT19oD',
// '18gD6JzKRk51u2SrnwbnHERy58Q84aUE27',
// '18gD6JzKRk51u2SrnwbnHERy58Q84aUE27',
// '1L9uCcmQLYWrGEavc5zEHZ1vLpV1PqdCzr',
// '14SJXV5mv1Dq3SaQ4n7qVwAvJJdYhjxnwS',
// '16e43tH6J1UWv8MFFaAK9q9rwzcgFmLcCi',
// '1MhVKrJXJMWV8tEb1KzX4nnwtRs3K1yqbs',
// '15s1pvibY5MJFXhNLTJ6ZcNRoqCQ88jRdT',
// '1C9NuwzxTjjCWHKfuKjcmZXBsBSMa7zpXT'
// ];
var addresses = [];

// getAddressesBalance(addresses) // 获取地址数组中地址余额
// getAddressesWithCoin();  // 查找addresses全局变量中的地址的余额，wif，多对多交易中未使用该函数
// sendTransaction()        // 发送多对多交易

async function checkBalance(){
    fs.readFile('addresses', {flag: 'r+', encoding: 'utf8'}, function (err, data) {
        if(err) {
            console.error(err);
            return;
        }
        addresses = data.split('\r\n');
        // console.log(addresses);
        getAddressesBalance(addresses);
    })
}

checkBalance();
