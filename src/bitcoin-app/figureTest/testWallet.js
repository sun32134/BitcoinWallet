var Wallet=require('../Wallet');
var wallet = new Wallet('D:/bitcoin-app/wallet2.db')

function sendToAddress(){
    var btc=0.0001;
    var from="155eWnpFra3GjnFFGPfx2m3VuuV9Ro28fi";
    var to = "1FmtE9QFgwUqP7MoX1ycEGjEVHG9YkuGZQ";
    var numberOfUtxo = 3;

    // wallet.loadFromFile('hello world').then(()=>{
    //     wallet.discoverMsg().then(async () => {
    //         wallet.account.nextChainAddress(1);
    //         while(wallet.account.getChain(0).k < wallet.account.getChain(1).k){
    //             wallet.account.nextChainAddress(0);
    //         }
    //         const node=wallet.account.getChain(0).derive(from);
    //         const wif=node.toWIF();
    //         for(var i = 0; i < numberOfUtxo; i++){
    //             await wallet.sendToAddress(from, to, btc, wif);
    //         }
    //         // await sleep(1000);
    //     })
    // })
    wallet.loadFromFile('hello world').then(async() => {
        const node=wallet.account.getChain(0).derive(from);
        const wif=node.toWIF();
        console.log(wif)
        for(var i = 0; i < numberOfUtxo; i++){
            await wallet.sendToAddress(from, to, btc, wif);
        }
    })
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

sendToAddress();