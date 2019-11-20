var bitcoin=require('../bitcoinjs-lib/src')
var Wallet=require('../Wallet')
var Database=require('../database');
var bip32=require('bip32')

var db=new Database('wallet');

// const wif="KwG2BU1ERd3ndbFUrdpR7ymLZbsd7xZpPKxsgJzUf76A4q9CkBpY"
const wif = "Ky5EuBtsgHtr4gkhjVXwAEQhU76Cy7aGFmV9Wujv19VnXyNrr7az"
const alice=bitcoin.ECPair.fromWIF(wif);
const txb=new bitcoin.TransactionBuilder()

txb.setVersion(1);
txb.addInput('61d520ccb74288c96bc1a2b20ea1c0d5a704776dd0164a396efec3ea7040349d',0);
txb.addOutput('1cMh228HTCiwS8ZsaakH8A8wze1JR5ZsP',12000);

// txb.sign(0, alice);
// var k=Buffer.from('0fec4cbfada02f758ba12dec290aba9d6e2290303a3c3f886cd8e4c036e39172','hex');
var k=Buffer.from('0bd95196210672cff1f0000000000000000000000000000000000000000002b8','hex');
// var k=Buffer.from('077f0c62114eec5bf9533a575794fe76848ba48bc6ff0c67096ca1670953ef80','hex');
console.log(k);
txb.sign1(0, alice, k);
const txHex=txb.build().toHex();
// console.log(txHex);
const tx=bitcoin.Transaction.fromHex(txHex);
console.log(tx)
// console.log(alice.privateKey.toString('hex'));
tx.ins.forEach(function(input, i){
    console.log(input.script.toString('hex'));
    const p2pkh=bitcoin.payments.p2pkh({pubkey:alice.publicKey,input:input.script})
    console.log(p2pkh.signature);
    const ss=bitcoin.script.signature.decode(p2pkh.signature);
    const hash=tx.hashForSignature(i,p2pkh.output,ss.hashType);
    console.log(alice.verify(hash, ss.signature));
    var resK = alice.getK(hash, ss.signature);
    console.log(resK.toBuffer());
})


//const malice = 'praise you muffin lion enable neck grocery crumble super myself license ghost'

//var wallet=new Wallet('wallet');
// wallet.createWalletFromMnemonic(malice).then(()=>{
//     console.log("create new wallet finish");
// },function(err){
//     throw err;
// });
// wallet.loadFromFile().then(()=>{
//     //wallet.nextMsgAddress();
//     console.log(wallet.account.toJSON());
//     // wallet.saveToFile().then(()=>{
//     //     console.log("update success");
//     // }).catch((err)=>{
//     //     throw err;
//     // })
// }).catch((err)=>{
//     throw err;
// })