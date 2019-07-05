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
         console.log('[Error]: caught error at check watch address balance');
         rej(err);
       })
    })
    
  }
  
  function checkUpdatedBalance(balanceInfo, old_balanceInfo){
    if(balanceInfo.final_balance > old_balanceInfo.final_balance){
      return true;
    }
    else{
      return false;
    }
  }

  
  function getUpdatedRawTransactions(address, previousNumOfTransaction){
      return new Promise((res, rej) => {
          bnet.getAddressTxs(address, previousNumOfTransaction).then((rawTransactions) => {
                res(rawTransactions);
            }).catch((err) => {
              console.log('[Error]: find error at get address new Transaction for ' + address);
              rej(err);
            })
      })
    
  }

  module.exports = {
    getWatchAddresses: getWatchAddresses,
    getThisMonentBanalce: getThisMonentBanalce,
    checkUpdatedBalance: checkUpdatedBalance,
    getUpdatedRawTransactions: getUpdatedRawTransactions
  }