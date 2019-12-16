var bitcoin=require('./bitcoinjs-lib/src')
var bip32=require('bip32')
var bip39=require('bip39')
var Account=require('./Account');
var Chain=require('./Chain')
var Database=require('./database');
var Network=require('./Network');
var Constants=require('./Constants');
var Message=require('./message/message')
var CryptoUtil = require('./cryptoUtil')
var Util = require('./Utils')
const bnet=new Network();

// const TestNetwork=bitcoin.networks.testnet;

function getAddress(node, network){
    return bitcoin.payments.p2pkh({pubkey:node.publicKey, network}).address;
}

var Wallet=function(dbfile){
    if(!dbfile){
        dbfile="MyWallet";
    }
    this.dbfile=dbfile;
    this.store=new Database(dbfile);
}

Wallet.prototype.saveNewWallet=function(userpassword){
    return new Promise((res,rej)=>{
        var ret = this.toJsonEn(userpassword);
        if(ret===Constants.RET_FAILED){
            rej(ret);
        }
        this.store.insert(ret).then(()=>{
            res(Constants.RET_OK);
        },function(err){
            console.log("in saveNewWallet: insert failed!");
            rej(err);
        })
    })
    
}

Wallet.prototype.blankAccount=function(json, password, network){
    // this.account=Account.fromJSON(json, network);
    this.account=Account.fromJSONEncrypt(json['account'], password, network);
}

Wallet.prototype.createWalletFromMnemonic=function(mnemonic, password){
    if(password === undefined){
        password = 'encryption key'
    }
    const seed=bip39.mnemonicToSeed(mnemonic);
    const root=bip32.fromSeed(seed, Network.current);

    const external=root.derivePath("m/44'/0'/0'/0");
    const internal=root.derivePath("m/44'/0'/0'/1");
    // const external=root.derivePath("m/44'/0'/0'");
    // const internal=root.derivePath("m/44'/0'/0'");
    var exterNode=new Chain(external);
    var interNode=new Chain(internal);
    exterNode.__initialize();
    interNode.__initialize();
    var chains=[exterNode, interNode];
    this.account=new Account(chains);
    return new Promise((res,rej)=>{
        this.saveNewWallet(password).then(()=>{
            res();
        }).catch((err)=>{
            console.log("in createWalletFromMnemonic: save New Wallet failed!");
            rej(err);
        });
    })
}

Wallet.prototype.createWalletFromSeed=function(seed){
    const root=bip32.fromSeed(seed, Network.current);
    
    const external=root.derivePath("m/44'/0'/0'/0");
    const internal=root.derivePath("m/44'/0'/0'/1");
    var chains=[new Chain(external), new Chain(internal)];
    this.account=new Account(chains);
    return new Promise((res,rej)=>{
        this.saveNewWallet().then((ret)=>{
            res(ret);
        },function(err){
            console.log("in createWalletFromMnemonic: save New Wallet failed!");
            rej(err);
        });
    })
}

Wallet.prototype.saveToFile=function(password){
    if(!this.dbfile){
        this.dbfile="MyWallet";
    }
    return new Promise((res,rej)=>{
        var obj=this.account.toJSONEncrypt(password)
        this.store.update({_id:Constants.defaultAccount},obj).then(()=>{
            res(Constants.RET_OK);
        }).catch((err)=>{
            rej(err);
        });
    })
    
}

Wallet.prototype.getKForListeningAddress= function (address) {
    return this.account.chains[1].find(address);
}

Wallet.prototype.loadFromFile=function(password){
    if(!this.dbfile){
        this.dbfile="MyWallet";
        this.store=new Database(dbfile);
    }
    if(password === undefined){
        password = 'encryption key'
    }
    return new Promise((res,rej)=>{
        this.store.find({_id:Constants.defaultAccount}).then((json)=>{
            if(!this.validateUserPassword(json[0].salt, json[0].passwordHash, password)){
                console.log('[Error]: password validation failed');
                throw new Error("password validation failed");
            }
            this.blankAccount(json[0], password, Network.current);
            res();
        }).catch((err)=>{
            console.log('[Error]: caught error at load wallet from file!');
            rej(err);
        })
    })
}

Wallet.prototype.sendMsgSecret=function(msgArray, fee, from, changeAddr){
    return new Promise((res,rej)=>{
        if(!this.account){
            rej('init account first');
        }
        const i=this.account.getChain(1).find(changeAddr);
        if(i === undefined){
            console.log('[Error]: cannot find change address in the wallet!!!, check please');
            rej('cannot find change address')
        }
        if(this.account.getChain(0).k < i){
            while(this.account.getChain(0).k < i){
                this.account.nextChainAddress(0);                    
            }
        }
        const to=this.account.getChain(0).addresses[i];         // 下一个秘密消息发送地址

        const node=this.account.getChain(0).derive(from);
        const wif=node.toWIF();
        var txids=[];
        this.loopSignAndBroadTx(msgArray, 0, from, to ,changeAddr, fee, wif, txids).then(()=>{
            res(txids);
        }).catch((err)=>{
            rej(err);
        })
    })
}

// TODO: Test this
Wallet.prototype.loopSignAndBroadTx=function(msgArray, i, from, to, changeAddr, fee, wif, txids){
    return new Promise((res,rej)=>{
        var inputLen = msgArray.length - i > 5? 5: msgArray.length - i; 
        this.buildTransactionUp(from, to, changeAddr, fee, inputLen).then((txb)=>{
            var tx=this.signTransaction(txb, wif, msgArray, i);
            var k=tx.k;
            var txHash=tx.txHash;
            console.log("txhash: " + txHash)
            this.broadTransaction(txHash).then(async (txid)=>{
                console.log(txid);
                txids.push(txid);
                if(k===msgArray.length){
                    // res();
                    res(txid)
                }
                else{
                    await Util.sleep(3000);
                    this.loopSignAndBroadTx(msgArray, k, from, to, changeAddr, fee, wif, txids).then(()=>{
                        res();
                    }).catch((err)=>{
                        console.log('[Error]: caught error at loop Sign and broad transaction for' + k);
                        rej(err);
                    }) 
                }
            }).catch((err)=>{
                console.log('[Error]: caught error at boardcast transaction');
                rej(err);
            })
        }).catch((err)=>{
            console.log('[Error]: caught error at build transaction, not enough money');
            rej(err);
        })
    })
}

// Update version for build transaction
Wallet.prototype.buildTransactionUp = function(from, to, changeAddr, feePerByte, numOfSign){
    return new Promise((res,rej)=>{
        if(!this.account){
            rej("init account first");
        }
        bnet.getUnspentOutputs(from).then((utxos)=>{
            const txb = new bitcoin.TransactionBuilder(Network.current);
            var current = 0;
            var fee = 2 * 34 * feePerByte + 10;
            const change = Math.round(Constants.changeFee * Constants.Satoshis)
            if(utxos.length < numOfSign){
                rej('not enough utxos in address:' + from);
            }
            var count = 0;
            for(const utx of utxos){
                txb.addInput(utx.tx_hash_big_endian,utx.tx_output_n);
                current += utx.value;
                fee += feePerByte * 148;
                count += 1;
                if(count == numOfSign && current >= (change + fee)) break;
            }
            if(current < (change + fee)){
                rej('not enough money in address:'+from);
            }
            console.log("tx fee: " + fee)
            const moreOutput=current- (fee + change);
            if(moreOutput > 0){
                txb.addOutput(to, moreOutput);
            }
            txb.addOutput(changeAddr, change);
            res(txb);
        });
    })
}

Wallet.prototype.buildTransaction=function(btc, from, to, changeAddr, feePerByte){
    var satoshis = Math.round(btc * Constants.Satoshis);
    return new Promise((res,rej)=>{
        // if(!this.account){
        //     rej("init account first");
        // }
        // bnet.getUnspentOutputs(from).then((utxos)=>{
        //     const txb = new bitcoin.TransactionBuilder(Network.current);
        //     var current = 0;
        //     var fee = 2 * 34 * feePerByte + 10;
        //     const change = Math.round(Constants.changeFee * Constants.Satoshis)
        //     for(const utx of utxos){
        //         txb.addInput(utx.tx_hash_big_endian,utx.tx_output_n);
        //         current += utx.value;
        //         fee += feePerByte * 148
        //         if(current >= (satoshis + change + fee)) break;
        //     }
        //     if(current < (satoshis + change + fee)){
        //         rej('not enough money in address:'+from);
        //     }
        //     const moreOutput=current- (satoshis + fee + change);
        //     if(moreOutput > 0){
        //         satoshis = satoshis + moreOutput;
        //     }
        //     txb.addOutput(to, satoshis);
        //     txb.addOutput(changeAddr, change);
        //     res(txb);
        // });
        res("function outdated")
    })
   
}

Wallet.prototype.signTransaction=function(txb, wif, msgArray, k){
    // const key=bitcoin.ECPair.fromWIF(wif, bitcoin.networks.testnet);
    const key=bitcoin.ECPair.fromWIF(wif, Network.current);
    txb.__tx.ins.forEach((input, vin)=>{
        if(msgArray !== undefined && k < msgArray.length){
            // console.log(msgArray[k])
            var buf_k = Buffer.from(msgArray[k++], 'hex');
            txb.sign1(vin, key, buf_k);
        }
        else{
            txb.sign(vin, key);
        }
    })
    var ret={
        txHash:txb.build().toHex(),
        k:k
    }
    return ret;
}

Wallet.prototype.broadTransaction=function(rawTx){
    return new Promise((res,rej)=>{
        bnet.broadcast(rawTx).then((txid)=>{
            // console.log(txid);
            res(txid);
        }).catch((err) => {
            console.log("broadcast failed" + JSON.stringify(err));
            rej(err);
        });
    })
}

Wallet.prototype.discoverMsg=function(){
    var interAddrs= [];
    for(var i=0;i<20;i++){
        interAddrs.push(this.account.nextChainAddress(1));
    }
    return new Promise((res, rej)=>{
        bnet.discoverMsg(interAddrs).then(async (obj)=>{
            if(obj.flag){
                // FIXME: this may need to be tested
                await this.discoverMsg()
                Util.sleep(1000)
                res()
            }else{
                for(var i=0;i<20-obj.num;i++){
                   this.account.chains[1].pop();
                }
                // console.log(this.account.toJSON());
                res();
            }
        }).catch((err)=>{
            rej(err);
        })
    }) 
}

Wallet.prototype.getK=function(from, txHex){
    if(!this.account){
        console.log('init account first');
    }
    const tx=bitcoin.Transaction.fromHex(txHex);
    var kArray=[];
    var node=this.account.chains[0].derive(from);
    var wif=node.toWIF();
    var key=bitcoin.ECPair.fromWIF(wif, Network.current);
    tx.ins.some(function(input, i){
        const p2pkh=bitcoin.payments.p2pkh({pubkey:key.publicKey,input:input.script})
        const ss=bitcoin.script.signature.decode(p2pkh.signature);
        const hash=tx.hashForSignature(i,p2pkh.output,ss.hashType);
        // console.log(key.verify(hash, ss.signature));
        var resK = key.getK(hash, ss.signature);
        // console.log(resK.toBuffer().toString('hex'))
        var msg = new Message();
        msg.recover(resK);
        if(msg.isLast()){
            kArray.push(resK);
            return true;
        }
        else{
            kArray.push(resK);
        } 
    })
    return kArray;  
}

// 测试获取K的优化方法
Wallet.prototype.getKUp = function(from, version, inputs, outputs){
    if(!this.account){
        console.log('init account first');
    }
    var kArray=[];
    var node=this.account.chains[0].derive(from);
    var wif=node.toWIF();
    var key=bitcoin.ECPair.fromWIF(wif, Network.current);
    var txb = this.buildTxFromInputOutput(version, inputs, outputs)
    inputs.some((input, i) => {
        const p2pkh=bitcoin.payments.p2pkh({pubkey:key.publicKey,input:input.script})
        const ss=bitcoin.script.signature.decode(p2pkh.signature);
        const hash=txb.__tx.hashForSignature(i,p2pkh.output,ss.hashType);
        // console.log(key.verify(hash, ss.signature));
        var resK = key.getK(hash, ss.signature);
        // // console.log(resK.toBuffer().toString('hex'))
        var msg = new Message();
        msg.recover(resK);
        if(msg.isLast()){
            kArray.push(resK);
            return true;
        }
        else{
            kArray.push(resK);
        } 
    })
    return kArray;  
}

Wallet.prototype.buildTxFromInputOutput = function(version, inputs, outputs){
    var txb = new bitcoin.TransactionBuilder()
    txb.setVersion(version)
    inputs.forEach(input => {
        txb.addInput(input.prev_hash, input.output_index)
    })

    outputs.forEach(output => {
        txb.addOutput(output.addresses[0], output.value)
    })
    return txb
}

Wallet.prototype.sendToAddress = function (from, to, btc, wif){
    return new Promise((res, rej) => {
        bnet.getFee().then((feePerByte) => {
            this.buildSendToAddressTx(from, to, btc, feePerByte).then((txb) => {
                var ret = this.signTransaction(txb, wif, undefined, 0);
                this.broadTransaction(ret.txHash).then((response) => {
                    res(response.tx.hash)
                }).catch((err)=>{
                    console.log('[Error]: caught error at send btc to address');
                    rej(err);
                })
            })
        })
    })
    
}

Wallet.prototype.buildSendToAddressTx = function(from, to, btc, feePerByte){
    var satoshis = Math.round(btc * Constants.Satoshis);
    return new Promise((res,rej)=>{
        bnet.getUnspentOutputs(from).then((utxos)=>{
            const txb = new bitcoin.TransactionBuilder(Network.current);
            var current = 0;
            var fee = 2 * 34 * feePerByte + 10;
            for(const utx of utxos){
                txb.addInput(utx.tx_hash_big_endian,utx.tx_output_n);
                current += utx.value;
                fee += feePerByte * 134
                if(current >= (satoshis + fee)) break;
            }
            
            var change = current - (satoshis + fee);
            if(change > 0){
                txb.addOutput(from, change);
            }
            else if(change < 0){
                console.log('[Error]: not enough money in address' + from);
                rej('[Error]: not enough money in address' + from);
            }
            txb.addOutput(to, satoshis);
            res(txb);
        })
    })
}

Wallet.prototype.toJson=function(){
    if(!this.account){
        console.log("[ERROR]: in toJson: no account");
        return Constants.RET_FAILED;
    }
    var obj={
        _id:Constants.defaultAccount,
        account:this.account.toJSON()
    }
    return obj;
}

// 生成钱包文件，首次使用时使用
Wallet.prototype.toJsonEn=function(password){
    if(!this.account){
        console.log("[ERROR]: in toJson: no account");
        return Constants.RET_FAILED;
    }
    this.encrypt(password);
    var obj={
        _id:Constants.defaultAccount,
        account:this.account.toJSONEncrypt(password),
        salt: this.salt,
        passwordHash: this.passwordHash
    }
    return obj;
}

// 验证用户密钥
Wallet.prototype.validateUserPassword = function (salt, passwordHash, userpassword) {
    var ret = CryptoUtil.sha512(userpassword, salt);
    if(ret.passwordHash === passwordHash){
        return true;
    }
    else{
        return false;
    }
}

// 获取加密参数
Wallet.prototype.encrypt = function(userpassword){
    var passwordData = CryptoUtil.saltHashPassword(userpassword);
    this.salt = passwordData.salt;
    this.passwordHash = passwordData.passwordHash;
}

module.exports=Wallet;