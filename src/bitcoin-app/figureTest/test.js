var bitcoin=require('bitcoinjs-lib');
var bip32=require('bip32');
var bip39=require('bip39');
var Account=require('../Account');
var Chain=require('../Chain');
var assert=require('assert')

// var network=bitcoin.networks.testnet;

function getAddress(node, network){
    return bitcoin.payments.p2pkh({pubkey:node.publicKey, network}).address;
}

function hexToString(hex){
    var res="";
    for(var i=0;i<hex.length;i++){
        var s=hex[i].toString(16);
        res=res+s;
    }
}

const malice = 'praise you muffin lion enable neck grocery crumble super myself license ghost'
const mbob = 'jazz helmet volcano skin wagon ranch pull rice few myself iron rule'
const seed1 = bip39.mnemonicToSeed(malice)
const seed2 = bip39.mnemonicToSeed(mbob);
// const masterA = bip32.fromSeed(seed1, network);  // BIP32 root
// const masterB = bip32.fromSeed(seed2, network); 
const masterA = bip32.fromSeed(seed1);  // BIP32 root
const masterB = bip32.fromSeed(seed2); 
// assert.equal(masterA.toBase58(),'xprv9s21ZrQH143K4DRBUU8Dp25M61mtjm9T3LsdLLFCXL2U6AiKEqs7dtCJWGFcDJ9DtHpdwwmoqLgzPrW7unpwUyL49FZvut9xUzpNB6wbEnz')
// assert.equal(masterB.toBase58(),"tprv8ZgxMBicQKsPdvpy8zsHXxZiHCMXnN5pd73wgbSMM3VQ8CYPnkgGw9A2PVGbq6BufH3voti2mPa7rU6uYhF65MfYjkArwCDvCAhGq7HEM2B")

// const externalA=masterA.derivePath("m/44'/1'/0'/0");
// const internalA=masterA.derivePath("m/44'/1'/0'/1");

const externalA=masterA.derivePath("m/44'/0'/0'");
const internalA=masterA.derivePath("m/44'/0'/1'");
// console.log(internalA.toBase58())

// const externalB=masterB.derivePath("m/44'/1'/0'/0");
// const internalB=masterB.derivePath("m/44'/1'/0'/1");

// assert.equal(externalA.toBase58(),"xprv9ydi7UVm6zfMEcfjQeiSqQsM1BNntfEypGDpduY4ZzZsJGAMMWq5gd8VxSc2FbiDdvxBSBspqH3UTvTa8HnrX8HXPFBNAHhygENiBgybPTJ");
// assert.equal(externalA.neutered().toBase58(),"xpub6Cd4Wz2ewNDeT6kCWgFTCYp5ZDDHJ7xqBV9RSHwg8L6rB4VVu49LERSyohcRHsJhVS5hN5cNM6ox6FzvUYqUNfEGwDVpSSAyRoESe4QtvJh");
// assert.equal(internalA.toBase58(),"tprv8i4VbHtFUPTXHpUK6nLSbu1xsc2m1ZAoM1GozRsPbPAmeXPgMQLU4ZC7aqBJ5vri4nLVWYBskUQrnbg7S7LZj7x6fjniazxZwcs7djcPPoA");
// assert.equal(internalA.neutered().toBase58(),"tpubDEkXjhvVcm9CBHW6zS131Jg5SdYhAtMhvJsbGwuh1eyAV1eSyoA4F3oykwdxJutFXqCL9DAKWRT2hry36zBkddftE5t1oMgE4TqJMgHvBtM");

var keyPair = bitcoin.ECPair.fromWIF("Ky5EuBtsgHtr4gkhjVXwAEQhU76Cy7aGFmV9Wujv19VnXyNrr7az");
console.log(keyPair.privateKey.toString("hex"))
// const chains=[new Chain(externalA), new Chain(internalA)];
// const alice=new Account(chains);

// const chainsB=[new Chain(externalB), new Chain(internalB)];
// const bob=new Account(chainsB);

// for(var i=0;i<20;i++){
//     console.log(getAddress(externalA.deriveHardened(i), network));
// }

// for(var i=0;i<20;i++){
//     alice.nextChainAddress(0)
// }
// console.log(alice.toJSON());
// for(var i=0;i<20;i++){
//     console.log(getAddress(internalB.derive(i), network));
// }


// const alice=bitcoin.ECPair.fromWIF(wif1);

// const {address} = bitcoin.payments.p2pkh({ pubkey: alice.publicKey, network:network });
// const address2=getAddress(node.derive(0), network);