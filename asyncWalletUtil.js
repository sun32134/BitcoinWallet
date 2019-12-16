var Network = require('./src/bitcoin-app/Network')

var bnet = new Network();
  
  function getWatchAddresses(addressBalanceMap){
    var addresses = []
    addressBalanceMap.forEach((value, address) => {
      addresses.push(address);
    })
    return addresses;
  }
  
  function getThisMonentBanalce(watchAddresses){
    return new Promise((res, rej) => {
       bnet.getBalanceBatch(watchAddresses).then((balanceInfo) => {
        res(balanceInfo);
       }).catch((err) => {
         rej(err);
       })
    })
    
  }
  
  function checkUpdatedBalance(balanceInfo, old_balanceInfo){
    return balanceInfo.final_balance > old_balanceInfo.final_balance
  }

  async function getUpdatedTransactionsUp(address, previousNumOfTransaction){
    return new Promise((res, rej) => {
      bnet.getVaildTx(address, previousNumOfTransaction).then((txsList) => {
            res(txsList);
        }).catch((err) => {
          rej(err);
      })
    })
  }

  function getTxInputs(rawInputs){
    var resInputs = []
    rawInputs.forEach((rawInput) => {
      var script = Buffer.from(rawInput.script, 'hex')
      var input = rawInput
      input.script = script
      resInputs.push(input)
    })
    return resInputs
  }

  module.exports = {
    getWatchAddresses: getWatchAddresses,
    getThisMonentBanalce: getThisMonentBanalce,
    checkUpdatedBalance: checkUpdatedBalance,
    getUpdatedTransactionsUp: getUpdatedTransactionsUp,
    getTxInputs:getTxInputs,
  }