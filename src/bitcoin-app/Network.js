var bitcoin=require('bitcoinjs-lib');
var fly=require('flyio');

var IP_ADDR='https://blockchain.info';
// var Test_IP_ADDR = 'https://api.blockcypher.com/v1/btc/test3'
fly.config.baseURL=IP_ADDR;

const DEFAULT_FEEPERBYTE = 32

var Constants = require('./Constants')
var Util = require('./Utils');

var Network=function(){
}

// TODO: change fee per byte to lowest
Network.prototype.getFee = function() {
    return new Promise((res,rej)=>{
        fly.get('https://bitcoinfees.earn.com/api/v1/fees/recommended').then((value) => {
            // {"fastestFee":20,"halfHourFee":16,"hourFee":2}
            // res(value.data.fastestFee);
            res(value.data.hourFee);
        }).catch(() => {
            console.log('[Error]: caught error ar get fee per byte, using default fee instead');
            res(DEFAULT_FEEPERBYTE);
        })
    })
}

// 检查addresses是否有balance
Network.prototype.discoverMsg=function(addresses){
    var ret = {};
    var addrMap = new Map();
    addresses.forEach((addr, index) => {
        addrMap.set(addr, index);
    }); 
    return new Promise((res,rej)=>{
        this.getBalanceBatch(addresses).then((results) => {
            var i = 21;
            for(var [key, value] of results){
                if(value.final_balance === 0 && addrMap.get(key) < i){
                    // console.log(key);
                    ret.flag = false;
                    i = addrMap.get(key);
                }
            }
            if(ret.flag === undefined){
                ret.flag = true;
            }
            else{
                ret.num = i;
            }
            res(ret);
        }).catch((err) => {
            console.log('[Error]: caught error at discoverMsg');
            rej(err);
        })
    })
}

// TODO: 广播交易
Network.prototype.broadcast=function(rawtx){
    return new Promise((res,rej)=>{
        // fly.post("https://api.blockcypher.com/v1/btc/main/txs/push",{
        //     tx:rawtx
        // }).then((value)=>{
        //     console.log(value.data.tx.hash);
        //     res(value.data);
        // }).catch((err)=>{
        //     console.log('[Error]: caught error at broadcast transaction');
        //     rej(err);
        // });
        res("ok");
    })
}

Network.prototype.getUnspentOutputs=function(address){
    var utxos=new Array();
    return new Promise((res)=>{
        fly.get("/unspent?active="+address).then((value)=>{
            utxos=value.data.unspent_outputs;
            // UTXO余额排序
            var sortedUtxos = Util.sortUtxos(utxos);
            res(sortedUtxos);
        }).catch(()=>{
            console.log('[Info]: found 0 utxo for address:' + address);
            res(utxos);
        })
    })    
}

// 函数已过期
Network.prototype.checkUtxos = function(length, feePerByte, utxos) {
    var i =0;
    // while(i < length){
    //     var current = 0;
    //     var flag = false;
    //     var fee = 2 * 34 * feePerByte + 10;
    //     const change = Math.round(Constants.changeFee * Constants.Satoshis)
    //     var count = 0;
    //     var left = length - i > 5? 5: length-i;
    //     utxos.some((utx) => {
    //         current += utx.value;
    //         i++;
    //         count ++;
    //         fee += feePerByte * 148
    //         if(count == left && current >= (change + fee)){
    //             flag = true;
    //             return true;
    //         } 
    //     })
    //     if(flag === false){
    //         // 计算还需要多少UTXO才能发完
    //         i = i - utxos.length;
    //         return (length-i) + 1
    //     }
    //     else{
    //         utxos = utxos.slice(count, utxos.length);
    //     }
    // }
    return true;
    
}

// 查找对应地址新交易
Network.prototype.getAddressTxs = function (toAddress, old_n_tx) {
    return new Promise((res, rej) => {
        fly.get('/rawaddr/'+toAddress).then((value) => {
            var ret = value.data;
            var txs = ret.txs;
            var txhashlist = [];
            var newTxCount = ret.n_tx - old_n_tx;
            if(newTxCount <= 0){
                console.log('[Error]: newTxCount < 0, did not find new transaction!');
                rej(err);
            }
            txs.some((tx, index) => {
                if(index >= newTxCount){
                    return true;
                }
                tx.out.some((output) => {
                    if(output.addr === toAddress){
                        txhashlist.push(tx.hash);
                        return true;
                    }
                })
            });
            var _this = this;
            Util.loopPromise(txhashlist, function(txhash){
                return new Promise((res, rej) => {
                    _this.getRawTx(txhash).then((rawtx) => {
                        res(rawtx);
                    }).catch((err) => {
                        console.log('[Error]: caught error at get raw transaction');
                        rej(err);
                    })
                })
            }).then((rawtxs) => {
                res(rawtxs);
            }).catch((err) => {
                console.log('[Error]: caught error at get raw transaction for txhash');
                rej(err);
            })
        }).catch((err) => {
            console.log('[Error]: caught error at get address transaction!');
            rej(err);
        })
    })
}

Network.prototype.getRawTx = function (txid) {
    return new Promise((res, rej) => {
        fly.get('/rawtx/'+txid+'?format=hex').then((value) => {
            res(value.data);
        }).catch((err) => {
            console.log('[Error]: caught error at get raw transaction for ' + txid);
            rej(err);
        })
    })
}

// Bitcoincyper has request limit
Network.prototype.getBalance = function(address){
    return new Promise((res,rej)=>{
        fly.get("/balance?active=" + address).then((value) => {
            var data = value.data;
            res(data);
        }).catch((err) => {
            console.log('[Error]: caught error at get balance for address ' + address);
            rej(err);
        })
    })
}

Network.prototype.getBalanceBatch = function(addresses){
    var results = new Map();
    return new Promise((res, rej) => {
        fly.get("/balance?active=" + addresses.join('|')).then((value) => {
            var data = value.data;
            for(var addr in data){
                results.set(addr, data[addr]);
            }
            res(results);
        }).catch((err) => {
            console.log('[Error]: caught error at get balance for address: ' + addresses.toString())
            rej(err);
        })  
    })
}

// TODO: check network status
Network.prototype.heartbeat = function(){

}

Network.current=bitcoin.networks.bitcoin;
// Network.current = bitcoin.networks.testnet;

module.exports=Network