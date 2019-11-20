var Wallet=require('../Wallet');
var wallet = new Wallet('D:/wallet/wallet.db')
var MessageHandler = require('../message/messageHandler')
var BN = require('bn.js')

function sendToAddress(){
    var btc=0.0001;
    var from="155eWnpFra3GjnFFGPfx2m3VuuV9Ro28fi";
    var to = "1CqzggZ1dwMgPW4iKHggwbLEh7pEV2rEu5";
    var numberOfUtxo = 1;

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
        // for(var i = 0; i < numberOfUtxo; i++){
        //     await wallet.sendToAddress(from, to, btc, wif);
        // }
        // await sleep(1000);
    })
}

sendToAddress()

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const msgArray=[ '00361a2ab83ba1272499a1b9a6179bad33a63b30a0a6b99ab8acb795b92929a7',
'015c4d128c5613d0d19d8d905d111cd8594dd69a5159dd8ad614115314d40e5e',
'022829ef2986af260aa846c847098c86a8664f46cc4a8568290a09698d6d0d4d',
'03666554731446f4257383637546144374231346445484a647a65474d7249453',
'04123ab29353528192ca29bab9797a438bd30b719ba1a38b139aaac9abc1b1aa',
'0541458931498da15d19ad0929cd610ddd552930e555e4c511251151919945c9',
'06249cc6d2e0ccc2aac4848eacb0dccc72c6e282e6c2987256f0e2a6aee6ec9e',
'07686c2b68454d6f766c5873354b30734776685a352b6f4d5736506673477667',
'08323c28b3b6282c1b3b341898242ba6b0a0ad3ca21a38a0b0a6b527b4b72326',
'0918da0d13ce529a9a0bd59d53d1905e1554d30c589a105a9d918d94dc9c8d5a',
'0a6b0a4aededa84a8b49ee28256a8d494e066b2ccc4ead2ec9c649ca4c6ece09',
'0b66a696e656259717a2b56657a4a4f563959646237423547495552446672336',
'0c62a34ac2c33a99bb595ab1a1b95b0b13423341a98a638aa33a59bba2895bc1',
'0d5dc1154159ddb0e1b548d4d4ccd0d945d53d89b0d0ddbd9d411d695950bdd9',
'0e6cced0ce9ac4e686b0da686692a6e4685ec4ce92e860a864de62b072b2d460',
'0f7530634a58506173704231424677714f792f39315331704d79745873634137',
'103ca137353bb9b23322b29c2a24aa1827b73ab0a331ac2b982299b51a9a2126',
'111c921e1d5dcd50ce549c5bd2db5d1d1a155d5692155912918dcc9b1b951e99',
'124e46c5edcde68aef4ac82aee4eaaad0dce860b2b0ca8eee8a88aa94829ef4c',
'1326449494e6474423544736a4a6b37594c4a42635572524e415a66624247777',
'14220a426221b3ba4319b9b23a434992a36b7ac37a19a3717b4a52628b13c21b',
'150de91114e105c8c530c991b13921c9c1add8c1e4c998cd65292d89d1c50985',
'1668aed6c8acc294ac8696eeca90ec8898e46c629ed66860d2f494cc9056a4c2',
'17655764753957556d3759766f7a6646354f395974334b686477665a6f436846',
'1825b33829392bac332a283523983aa8a7349ba3329c2c9a2d2ba93aab20aa31',
'190d9d968cd894ce548bd1d39210995492d0d051104c13d9d35d0dcc1e509e0a',
'1a684dcaaccf0a0d29cc6a696f4e8648486a490e66ad4f0e09ef05e6298dcc8c',
'1b35637373678496a4b384b314e4e5050697335703956475255465830712b482',
'1c5bc212d2c3b2632a52234a0bd3aa515b2aaaba929991aaaac34213934a5351',
'1d41e5c8d93559a4e5e1e551e565a4d911a99911d560d94da52915e9b1d8c1b9',
'1e3064f0d6d062b28adaa6a65eb2e27288c6d4aad0e6d0aae2dcf0d0726cf286',
'1f5048616765726c5158706e66464e46304b6b502f41766367734c5151625461',
'2030a12a38bc37a8a3b79c3220b533b41823a79c1c22bcb6312ab3b7a19c3cb4',
'215851d899590c15dcd9944d8d4c1a0dd05c515e5699de9859511c9c1511dd1d',
'222aad8eccc6294a88ca6c6aea6cee864ae6092a8f2568eac70d2de6ad6e8aca',
'234445168524444426d2f4545794f696f73756d7a6731547a32545a6f746b614',
'2409a9a342132a3acb326209b3c9bacb3a4269a15b4a2a22525bbb337ad3421a',
'2525094964adb0c5152cd10da94d84e1d1c1491949594919e4cda539613de9d5',
'2670d46a9684ccccaca46268ae5ea6a29cd0d856c2decc72ecdcee70aca4f494',
'2759634a3959687432726d6e63414a547361505659546a5657545561672f4758',
'28351b2ba09ca2a6b72b98262bbd25b6a5ac1abc26292a9c3231aaad1cbd3d3b',
'291ada95941a169e12dace550d9d1ad59e1c5618591459d45b1c985a555b951a',
'2a0cea0aef4b48ec272e4d4a69c9e96a29edce2688a72daa862ec9ed6c690ce6',
'2b7766e58676e5a586d595a6f3668565661704e6b5366463066444f57634c613',
'2c3b23a27b4299c192ba532a9a3a82ab23c332834293622bbaa2d34ba9baa212',
'2d1d8560e14d45518ddd61d8ade0dcbd5955a9b5d0bcd91de521990548c5a548',
'2ee4e06ec88ee29adceace7a7a00000000000000000000000000000000000b30' ]


function testWalletBuild(){
    var from="1CqzggZ1dwMgPW4iKHggwbLEh7pEV2rEu5";
    var to = "155eWnpFra3GjnFFGPfx2m3VuuV9Ro28fi";
    var changeAddr = "1JPwWKCaWgj1j8rX2CgeTF14cBJwbcdPEn"

    wallet.loadFromFile('encryption key').then(()=>{
        wallet.discoverMsg().then(async () => {
            wallet.account.nextChainAddress(1);
            while(wallet.account.getChain(0).k < wallet.account.getChain(1).k){
                wallet.account.nextChainAddress(0);
            }
            const node=wallet.account.getChain(0).derive(from);
            const wif=node.toWIF();
            console.log(wif);
            wallet.sendMsgSecret(msgArray, from, to, changeAddr, 10, wif).then(txhash =>{
                console.log(txhash);
            })
        })
        
    })
}

function testWalletRecover(){
    var txhash = ["02000000053818c0ea7a435774531bf14ebb1b9c2c711f6e9a3712d41670818e8da7089be9000000006b483045022100de32ec76d7fd4e3c9275ad87a0af6728631e94b66d7ef8d8e3c886ab86bcefb102201ea119775e7a0a8484ea452cec688ab7277dfb0b50d91a38c7e809b3978100dc012103620d8fd4783f85b183780a75a5aae85f32739c04abcd0b37da38e706afb0619cffffffff1037e9d45022519ad8368308059036580c3215bf3a8f7ed4b7101c6681826533000000006a47304402201dd9ecb5a494392583184a3655c049b4c48f2ccc434d2596c95eeea5548fb3280220172bdc95173bac8ba3f203fb1d823fcee77c9c45a3ba063847ec963c4e1567a3012103620d8fd4783f85b183780a75a5aae85f32739c04abcd0b37da38e706afb0619cffffffff8714917232983e377629217172e83df01a996c3744978c845017aaf615c5f4c2000000006a473044022061c1533def51396ce1bcd4342b3568fa998f2fcf46497be4888fb41dc6bc3f4f02205a5988b104354d449bf9189267608caf2f5be0386b1115d59e8ba96175a1cbe6012103620d8fd4783f85b183780a75a5aae85f32739c04abcd0b37da38e706afb0619cffffffffd59abde2e686b15db3bc30a8d5865d55b09138ce875efe727038ec6c4d7a3dcc000000006b483045022100973a72dcc7de8bec284a03ba4fc4c83abb8e4c7795f1223659801e4a5dd6ef82022059b8ac315f192a76cc942c6edb4a92b1c8b4e88c87e1945ed8eb4ba7dcb42156012103620d8fd4783f85b183780a75a5aae85f32739c04abcd0b37da38e706afb0619cffffffff2069b680405634fe3a2b340be64e521a7e9f9595e8919f0b93671aae5e79fc36000000006b483045022100c33533f3f4ab902ec239623166ba164fbbfcb18ca8b4dac5dfb4b337d088334902202125360b64b1f967ae582bc222f5b268e870771280b90b8ad3f13986bed2d82e012103620d8fd4783f85b183780a75a5aae85f32739c04abcd0b37da38e706afb0619cffffffff02d4870000000000001976a9142caf2b69e070010b733d1d9bb7902763913a048388ace8030000000000001976a914e951fe3aea95959b6bec90bba7cad84ba07ec58f88ac00000000",
"02000000053818c0ea7a435774531bf14ebb1b9c2c711f6e9a3712d41670818e8da7089be9000000006b483045022100ea7e5dea05ec619977a66b860e1226afd4b6584755fbde8e30fd2fac400fe5f002201d689a0a0cab757f2fafe5a318c8bc3c6e22150ed642001a49d20f7e20c5828c012103620d8fd4783f85b183780a75a5aae85f32739c04abcd0b37da38e706afb0619cffffffff1037e9d45022519ad8368308059036580c3215bf3a8f7ed4b7101c6681826533000000006b48304502210094f4ba5f7bbf3c7d55410b941cb3d5df459ecd067b4ed1e2338adabae7a9a4af0220460b52f88684865117392d87271e986930ff7f668aa360e627345329c13c2e1d012103620d8fd4783f85b183780a75a5aae85f32739c04abcd0b37da38e706afb0619cffffffff8714917232983e377629217172e83df01a996c3744978c845017aaf615c5f4c2000000006b483045022100d5bd745efb16dd1629092f464666dc99a41c6dd225ad16be7cbe5c52f631bc6d022044ccfe19e2bc590423a7dadea8885d4f99aef3ad9d1adddf196f8d07e8ac5f3f012103620d8fd4783f85b183780a75a5aae85f32739c04abcd0b37da38e706afb0619cffffffffd59abde2e686b15db3bc30a8d5865d55b09138ce875efe727038ec6c4d7a3dcc000000006b483045022100d8c9c1a31dd041856a1f6828b559dc33de3dafb07a4fd0940b12137b5a4b81ff022060068e68bc243c31932e5bc9ec0e36f050846b8c55ea3c597842f8914b9bedfd012103620d8fd4783f85b183780a75a5aae85f32739c04abcd0b37da38e706afb0619cffffffff2069b680405634fe3a2b340be64e521a7e9f9595e8919f0b93671aae5e79fc36000000006a473044022061560c8794e499380ce785d60a4fe042eac3d46ef719a04831aac59c282cfe0c02206f35f8d3a1d641b85bae4597b5eea6de93dcfd58d58aa521df504abe0eb9cda2012103620d8fd4783f85b183780a75a5aae85f32739c04abcd0b37da38e706afb0619cffffffff02d4870000000000001976a9142caf2b69e070010b733d1d9bb7902763913a048388ace8030000000000001976a914e951fe3aea95959b6bec90bba7cad84ba07ec58f88ac00000000",
"02000000053818c0ea7a435774531bf14ebb1b9c2c711f6e9a3712d41670818e8da7089be9000000006a473044022027ac7d5da923c51a8190aaeeab64590b98852cf977475193a511ec7d0e00ab3c022047f602ee16452470d11ddec720bb3b357f98bc8f6e8734083179004493c51724012103620d8fd4783f85b183780a75a5aae85f32739c04abcd0b37da38e706afb0619cffffffff1037e9d45022519ad8368308059036580c3215bf3a8f7ed4b7101c6681826533000000006a47304402206f432b402e44b17bd2418f373b1fdd5078330e75eeee453be3ab02913acaadf702201501703038cda90b94bb9e1243baf54f57e2b90a06caa98272a3a635b902bd32012103620d8fd4783f85b183780a75a5aae85f32739c04abcd0b37da38e706afb0619cffffffff8714917232983e377629217172e83df01a996c3744978c845017aaf615c5f4c2000000006a47304402207cf466a130a5d9ec0434c05be90a226e741ce099a2ae0523d25ea75fe5e13ff2022017ad10411c74c959a4f46f9df45caa69182aa44db41546c2e9e7d3a5d4f7a332012103620d8fd4783f85b183780a75a5aae85f32739c04abcd0b37da38e706afb0619cffffffffd59abde2e686b15db3bc30a8d5865d55b09138ce875efe727038ec6c4d7a3dcc000000006a473044022074272f28ea318bf27c5513ee2df7ad504054e0e03e0acaf0bf2449f106d8153f02200f4b42fc7a0887c24ce76810af2554782b38f0e229bfc9b184a2f99a0e61f73c012103620d8fd4783f85b183780a75a5aae85f32739c04abcd0b37da38e706afb0619cffffffff2069b680405634fe3a2b340be64e521a7e9f9595e8919f0b93671aae5e79fc36000000006a47304402203104248da778a32dac4064d6586c4646549a8522b2a5d4bd66a08cf5fc55153202207dd36979dca02e80786e7da3c22fd5a6d6ae3b25abc287f3496995ff9e7bb033012103620d8fd4783f85b183780a75a5aae85f32739c04abcd0b37da38e706afb0619cffffffff02d4870000000000001976a9142caf2b69e070010b733d1d9bb7902763913a048388ace8030000000000001976a914e951fe3aea95959b6bec90bba7cad84ba07ec58f88ac00000000",
"02000000033818c0ea7a435774531bf14ebb1b9c2c711f6e9a3712d41670818e8da7089be9000000006a4730440220099e39a7d17b013e355e7ff088aed92a98b6d2791ae340adcebe0050b436411e02200fa17ad0435383d3cc6eca9459de7e21d8faed32c2b79fb8a5955554db28ed81012103620d8fd4783f85b183780a75a5aae85f32739c04abcd0b37da38e706afb0619cffffffff1037e9d45022519ad8368308059036580c3215bf3a8f7ed4b7101c6681826533000000006a473044022030dc8e2fb3c1f039f9a99d52bb671e1d3184dcc6b46d9258f91b45447cf0e38502207a3c761cc760716240a1afd7ec5e20e9c6718674ccc111e4ee639c1e81b17c65012103620d8fd4783f85b183780a75a5aae85f32739c04abcd0b37da38e706afb0619cffffffff8714917232983e377629217172e83df01a996c3744978c845017aaf615c5f4c2000000006b483045022100dae836c7681addfb5cbe5d3f362fac5dae7f8d51d61acb5688edbcfa6d3a786202203fe160f32248c047cba175b94a7e866580e534d37834c0bbc4fd44a6732fa3ca012103620d8fd4783f85b183780a75a5aae85f32739c04abcd0b37da38e706afb0619cffffffff02484f0000000000001976a9142caf2b69e070010b733d1d9bb7902763913a048388ace8030000000000001976a914e951fe3aea95959b6bec90bba7cad84ba07ec58f88ac00000000"]
        wallet.loadFromFile('encryption key').then(()=>{
        wallet.discoverMsg().then(async () => {
            wallet.account.nextChainAddress(1);
            while(wallet.account.getChain(0).k < wallet.account.getChain(1).k){
                wallet.account.nextChainAddress(0);
            }
            // var from="1CqzggZ1dwMgPW4iKHggwbLEh7pEV2rEu5";
            var from = "15vQEhQzD4SEdCLe9g1XJE99Vne1nrdxoo"
            var messageHandler = new MessageHandler();
        
        
            txhash.forEach(hash => {
                var kArray = wallet.getK(from, hash);
                console.log(kArray)
                kArray.forEach(k=>{
                    messageHandler.receiveMessage(new BN(k, 16))
                })
            })
            messageHandler.recoverData();
            messageHandler.printMessage();     
        })
        
    })
}

// testWalletBuild()
// testWalletRecover();
