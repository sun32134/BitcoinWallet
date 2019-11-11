var Constants=require('../Constants');
var Network=require('../Network');
var Wallet = require('../Wallet')
var bitcoin = require('bitcoinjs-lib');


const bnet=new Network();

const msgArray=['007f7fa767299d2babca7f3b772926bb4229e8ae2ab062a8dab3b2bb85ff863c',
            '011b96e799c254fbe03f53dfd3a4a0151fd45da114a7e03f53b393f8581bd3c8',
            '02120251ed8a62c9c749deea0789e4120246004b304cf38ee3f01fb30f4a452b',
            '0339e73b08fd94e2a8f6c5316ff0c5b835bf94eba4eec76847ecf6d4e751f6d3',
            '0459800c8e8c3c6ba8fb69da721c0f9bc9f278d3a8fb69dff862e032f1333b2c',
            '053f71af517d4d382d380208b1843d39253829da113a4a0151fd4647461e359b',
            '0668bbd0b24eed08bee2a99a6002ca72a7b06004a078bf2ec58abfceed08cc5f',
            '077f0c62114eec5bf9533a575794fe76848ba48bc6ff0c67096ca1670953ef80',                
            '087ea867a926a8f02f3a2dfca749402a3fa8c8e8c3c6a700341bff8628c6b590',
            '09659dd45953801e735c91e5d89809dda122fbd4cebfc313b3a00315ca14f457',
            '0a0aaed091f8ef4169c5bfe18b13ca540cde8b234ed086002cbc11826ed0917a',
            '0bd95196210672cff1f0000000000000000000000000000000000000000002b8']

// bnet.getUnspentOutputs('n2qGdjfjmFyvAXqbErrtXpfypXhtbNWruM').then((res)=>{
//     console.log(res);
// })

// bnet.discoverMsg(['n2qGdjfjmFyvAXqbErrtXpfypXhtbNWruM']).then((res)=>{
//     console.log(res);
// })

function testGetUnSpent(){
    var address="n2qGdjfjmFyvAXqbErrtXpfypXhtbNWruM";
    bnet.getUnspentOutputs(address).then((utxos)=>{
        console.log(utxos);
    })
}

function checkUTXOS(){
    var fee = 1000;
    var address="mfXyKec434Db9UT2uxnzhmQLPian6H32xu";
    bnet.getUnspentOutputs(address).then((utxos)=>{
        console.log(utxos);
        console.log(bnet.checkUtxos(msgArray, fee, utxos, Constants.BTC))
    })
}

function getFee(){
    bnet.getFee().then((fee)=>{
        console.log(fee);
    });
}

function discoverMsg(){
    var addresses = ['1PfiTvYdRRJm5sHCTqicD8TMjNZqA45Ri2', '1At6T9VkuqiE43saz3aveRm1mDz673gceR'];
    bnet.discoverMsg(addresses).then((value) =>{
        console.log(value)
    })
}

function getUtxos(){
    bnet.getUnspentOutputs('1BYUfuwdLRt2V1tV8EGhNj7WTc31E3Dw5q').then((value) =>{
        console.log(value);
    })
}

function checkUtxos(){
    bnet.getUnspentOutputs('1CqzggZ1dwMgPW4iKHggwbLEh7pEV2rEu5').then((utxos) => {
        var ret = bnet.checkUtxosUp(26, 16, utxos);
        console.log(ret);
    })
}

function getAddressTxs(){
    bnet.getAddressTxs("1GCBamxaJqGnUdfVSvVdTRCptqtkNUfuYp", 26).then((value)=>{
        console.log(value)
    }).catch((err) => {
        console.log(err);
    })
}

function getRawTx(){
    bnet.getRawTx('ef8123b0b79c461bb1aa61b4ae4013e331ce77a34f8f277ac78eee96432432fa').then((value) => {
       console.log(value);
    })
}

// testGetUnSpent();
// checkUTXOS();
// getUtxos();
// getFee()
// discoverMsg();
checkUtxos();
// getAddressTxs()
// getRawTx();
