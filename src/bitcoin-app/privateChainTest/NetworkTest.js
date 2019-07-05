var assert = require('chai').assert
var Network = require('../Network');
var Utils = require('../Utils')

var standBalanceBathResponse = new Map();
standBalanceBathResponse.set('155eWnpFra3GjnFFGPfx2m3VuuV9Ro28fi', { final_balance: 229524, n_tx: 7, total_received: 300000 });
standBalanceBathResponse.set('17NVX4nMYRTZ65fL8uFGHaVSqkLC3NctmH', { final_balance: 0, n_tx: 0, total_received: 0 });
standBalanceBathResponse.set('13zCfQAzC7C44oHUJmL6VdAFtgj6ZbTE5m', { final_balance: 0, n_tx: 0, total_received: 0 });
standBalanceBathResponse.set('1A2LjmXz6b8NZMMvzouFxceW8aUYxzveCo', { final_balance: 0, n_tx: 0, total_received: 0 });

var utxos = [
    {
        value: 1000,
    }, 
    {
        value: 10000,
    },
    {
        value: 12000
    }
]

var utxos2 = [ { tx_hash: '63ae7132aa1fda611f2bb7f3f4aab7ff20ddef1a88fb19a2f1175147881516e7',
tx_hash_big_endian: 'e7161588475117f1a219fb881aefdd20ffb7aaf4f3b72b1f61da1faa3271ae63',
tx_index: 418647578,
tx_output_n: 1,
script: '76a914d6ade9b0f9b20978ecbdc23e2d086d1151324f9e88ac',
value: 10000,
value_hex: '2710',
confirmations: 224 },
{ tx_hash: '63ae7132aa1fda611f2bb7f3f4aab7ff20ddef1a88fb19a2f1175147881516e7',
tx_hash_big_endian: 'e7161588475117f1a219fb881aefdd20ffb7aaf4f3b72b1f61da1faa3271ae63',
tx_index: 418647578,
tx_output_n: 1,
script: '76a914d6ade9b0f9b20978ecbdc23e2d086d1151324f9e88ac',
value: 10000,
value_hex: '2710',
confirmations: 224 },
{ tx_hash: 'c1983558a45c0f024a0f146ccf6555c8bc97c30ec9bb7998ed9643e5b5ec4d1a',
tx_hash_big_endian: '1a4decb5e54396ed9879bbc90ec397bcc85565cf6c140f4a020f5ca4583598c1',
tx_index: 418640607,
tx_output_n: 0,
script: '76a914d6ade9b0f9b20978ecbdc23e2d086d1151324f9e88ac',
value: 4438,
value_hex: '1156',
confirmations: 225 },
{ tx_hash: 'a7aa1f58e00cface126120cb374531ffc2637da28c45b0c5b31c94b07353bcca',
tx_hash_big_endian: 'cabc5373b0941cb3c5b0458ca27d63c2ff314537cb206112cefa0ce0581faaa7',
tx_index: 418640578,
tx_output_n: 0,
script: '76a914d6ade9b0f9b20978ecbdc23e2d086d1151324f9e88ac',
value: 4438,
value_hex: '1156',
confirmations: 225 } ]

var bnet = new Network();
describe('网络测试', function () {

    it('测试对UTXO降序排列', function () {
        var sortedUtxos = Utils.sortUtxos(utxos);
        var standUtxos = [ { value: 12000 }, { value: 10000 }, { value: 1000 } ];
        assert.deepEqual(sortedUtxos, standUtxos);
    })

    it('获取地址余额', async function () {
        var address = "155eWnpFra3GjnFFGPfx2m3VuuV9Ro28fi";
        var response = await bnet.getBalance(address);
        // console.log(response)
    })  
    
    it('获取地址UTXO', async function () {
        var address = "1La7wjGo4rD2NdCJjPs4kf6YRuSEWoUdXF";
        var response = await bnet.getUnspentOutputs(address);
        // console.log(response);
    })

    it('获取多个地址余额', async function () {
        var addresses = [
            '155eWnpFra3GjnFFGPfx2m3VuuV9Ro28fi',
            '13zCfQAzC7C44oHUJmL6VdAFtgj6ZbTE5m',
            '1A2LjmXz6b8NZMMvzouFxceW8aUYxzveCo',
            '17NVX4nMYRTZ65fL8uFGHaVSqkLC3NctmH',
        ]
        var response = await bnet.getBalanceBatch(addresses).catch((err) => {
            console.log(err);
        })
    })

    it('计算是否可以发送交易, 可以', async function () {
        var fee = 32;
        var sortedUtxos = Utils.sortUtxos(utxos)
        var response = bnet.checkUtxos(2, fee, sortedUtxos, 0.00001)
        assert.isTrue(response);
    })

    it('计算是否可以发送交易, 不可以', async function () {
        var fee = 32;
        var sortedUtxos = Utils.sortUtxos(utxos2)
        var response = bnet.checkUtxos(3, fee, sortedUtxos, 0.00001)
        assert.equal(response, 2)
    })


    it('获取地址新交易', function () {
        bnet.getAddressTxs("155eWnpFra3GjnFFGPfx2m3VuuV9Ro28fi", 3).then((rawtxs) => {
            
        })
    })
})
