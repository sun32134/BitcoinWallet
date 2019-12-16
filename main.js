// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const ipc =require('electron').ipcMain;
const dialog=require('electron').dialog;
const Wallet = require('./src/bitcoin-app/Wallet')
const Network = require('./src/bitcoin-app/Network')
const Constants = require('./src/bitcoin-app/Constants')
var schedule = require('node-schedule')
const MessageHandler = require('./src/bitcoin-app/message/messageHandler')
const CryptLib = require('cryptlib')
const asynWalletUtil = require('./asyncWalletUtil')
const Utils = require('./src/bitcoin-app/Utils')

var bnet = new Network();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

let walletWindow

let historyWindow

let sendWindow

let passwordWindow

let msgWindow

let createWalletByWordlistWindow

let depositBTCWindow

let checkBalanceWindow

// 存储添加进客户端的钱包文�??
// i => wallet object
var walletlist=[];

// 存储钱包接收到的消息
// i => messagehandler
var msghandlerlist = [];

// 存储需要进行更新的地址信息
// i => map(address => {balance, n_tx}
var watchAddrlist = [];

var g_sendWalletID;

var g_msg;

var closeable = 0

// 周期函数，周期性检查是否有新交易，每30秒检查一次
var rule = new schedule.RecurrenceRule();
// var times = [];
// for(var i= 0; i < 60; i = i + 30){
//   times.push(i);
// }
// rule.second = times;
rule.minute=new schedule.Range(0, 59, 2);
schedule.scheduleJob(rule, function(){
  asyncWallets();
});

ipc.on('wallet-addWalletBtnClick', () => {
  walletWindow = new BrowserWindow({ width: 400, height: 350, parent: mainWindow})
  walletWindow.webContents.on('did-finish-load',()=>{
    walletWindow.webContents.send('message','this is a message from the renderer process to the second window.')
  })
  walletWindow.on('close', () => { 
    walletWindow = null 
    mainWindow.show()
  })
  walletWindow.loadFile('./pages/wallet.html');
  // walletWindow.webContents.openDevTools();
  walletWindow.on('ready-to-show', ()=>{
    walletWindow.show()
  })
})

ipc.on('wallet-addWalletResponse', (event, message) => {
  console.log(`${message}`)
	var obj = JSON.parse(`${message}`)
  var url = obj.url;
  var password = obj.password;
  // 加载钱包，同步钱包地址，显示正在监听的地址和可以使用的地址
  var wallet=new Wallet(url);
  wallet.loadFromFile(password).then(()=>{
      wallet.discoverMsg().then(()=>{
        // 同步钱包发送地址
        var k=wallet.account.chains[1].k;
        while(wallet.account.chains[0].k < k){
          wallet.account.nextChainAddress(0);
        }
        // 同步到下一个需要监听的接受地址
        wallet.account.nextChainAddress(1);
        walletlist.push(wallet);
        var obj = {};
        obj.address = wallet.account.getChainAddress(1);
        // console.log(obj);
        mainWindow.webContents.send("wallet-addWalletPageUpdate", JSON.stringify(obj))
        var checkAddresses=wallet.account.chains[1].addresses.slice(1);
        var watchAddr = new Map();
        var handlerlist = [];

        // 初始信息
        handlerlist.push(null); // 第一个监控地址不使�??
        checkAddresses.forEach((checkAddress)=>{
          watchAddr.set(checkAddress, 
            {
              final_balance: 0, 
              n_tx: 0, 
              total_received: 0
            }
          );
          handlerlist.push(new MessageHandler());
        })
        watchAddrlist.push(watchAddr);
        msghandlerlist.push(handlerlist);

      }).catch((err) => {
        console.log("[Error]: " +err);
        dialog.showErrorBox('Error', "Network Error");
      })
  }).catch(() => {
    console.log('[Error]: caught error at add wallet response');
    dialog.showErrorBox('Error', "wrong password");
  })
})

ipc.on('wallet-deleteWalletBtnClick', (event, message) => {
  var obj = JSON.parse(`${message}`)
  var walletID = obj.walletID;
  wallet = walletlist.splice(walletID, 1);
  if(msghandlerlist[walletID] !== undefined){
    msghandlerlist.splice(walletID, 1);
  }
  if(watchAddrlist[walletID] !== undefined){
    watchAddrlist.splice(walletID, 1);
  }
  console.log(watchAddrlist);
})

ipc.on('wallet-openWalletFile',function(event, message){
  dialog.showOpenDialog({properties:['openFile']},function(files){
    if(files)
      event.sender.send('wallet-file',files);
  })
})

ipc.on('wallet-getHistory', (event, message) => {
  var obj = JSON.parse(`${message}`)
  var walletID = obj.walletID;
  var wallet = walletlist[walletID];
  var flags = new Array();
  var addresses =new Array();
  var msgList = new Array();
  if(msghandlerlist[walletID] === undefined){
    console.log('[Error]: msgHandler not init successfully!')
    return;
  }
  msghandlerlist[walletID].forEach((handler, i)=>{
    if(handler !== null && handler.checkCollectedMessage()){
      addresses[i] = wallet.account.chains[1].addresses[i];
      flags[i]= true;
      handler.recoverData();
      msgList[i] = handler.fileData;
    }
    else{
      addresses[i] = wallet.account.chains[1].addresses[i];
      flags[i] = false;
    }
  })
  obj["flags"] = flags;
  obj["addresses"] = addresses;
  obj['msgList'] = msgList;

  historyWindow=new BrowserWindow({width:800, height:500, parent: mainWindow});
  historyWindow.on('close', () => { 
    historyWindow = null;
    mainWindow.show()
  })
  historyWindow.loadFile('./pages/history.html');
  // historyWindow.webContents.openDevTools();
  historyWindow.webContents.on('did-finish-load', function(){
    historyWindow.webContents.send('wallet-history', JSON.stringify(obj));
  })
  historyWindow.once('ready-to-show', ()=>{
    historyWindow.show()
  })
})

ipc.on('wallet-getPreviousWalletsInfo', () => {
  if(walletlist.length !== 0){
    walletlist.forEach((wallet) => {
      var obj = {};
      obj.address = wallet.account.getChainAddress(1);
      if(mainWindow !== null){
        mainWindow.webContents.send('wallet-previousWalletsInfo', JSON.stringify(obj));
      }
    })
  }
})

ipc.on('msg-getPassword', (event, message) => {
  var obj = JSON.parse(`${message}`)
  var walletID = obj.walletID;
  var msgIndex = obj.msgIndex;

  console.log(walletID);
  console.log(msgIndex);
  var handler = msghandlerlist[walletID][msgIndex];
  if(handler !== null && handler.checkCollectedMessage()){
    handler.recoverData();
    g_msg = handler.fileData;
  }
  else{
    console.log('[Error]: can not show message yet!')
    return;
  }
  passwordWindow=new BrowserWindow({width:400, height:500, parent: historyWindow});
  passwordWindow.on('close', () => { 
    passwordWindow = null 
    historyWindow.show()
  })
  passwordWindow.loadFile('./pages/password.html');
  // passwordWindow.webContents.openDevTools();
  passwordWindow.webContents.on('did-finish-load', ()=>{
    var obj = {};
    obj.msg = g_msg;
    passwordWindow.webContents.send('get-password', JSON.stringify(obj)); 
  })
  passwordWindow.once('ready-to-show', ()=>{
    passwordWindow.show()
  })  
})

ipc.on('msg-showMsg', function(event, message) {
  if(g_msg === undefined){
    console.log('[Error]: msg id not defined! please check');
    return;
  }
  var obj = JSON.parse(`${message}`)
  var iv = Constants.iv;
  var key=CryptLib.getHashSha256(obj.AES_Key, 32);
  var original;
  try {
    original = CryptLib.decrypt(g_msg, key, iv);
  } catch (error) {
    dialog.showErrorBox("Message Decryption", "Wrong Password, Fail Decryption");
    return; 
  }
  msgWindow=new BrowserWindow({width:1000, height:500, parent:historyWindow});
  msgWindow.on('close', () => { 
    msgWindow = null 
    historyWindow.show()
  })
  msgWindow.loadFile('./pages/msg.html');
  // msgWindow.webContents.openDevTools();
  msgWindow.webContents.on('did-finish-load', ()=>{
    msgWindow.webContents.send('message', original);
  })
  msgWindow.once('ready-to-show', ()=>{
    msgWindow.show()   
  })
})

ipc.on('msg-openMsgFile',function(event){
  dialog.showOpenDialog({properties:['openFile']},function(files){
    if(files)
      event.sender.send('msg-url',files);
  })
})

ipc.on('msg-sendMsgBtnClick', function(event, message){
  var obj = JSON.parse(`${message}`)
  var walletID = obj.walletID
  g_sendWalletID = walletID
  var wallet = walletlist[g_sendWalletID];
  const listenAddr=wallet.account.getChainAddress(1);
  const i=wallet.account.getChain(1).find(listenAddr);
  if(wallet.account.getChain(0).k < i){
    while(wallet.account.getChain(0).k < i){
      wallet.account.nextChainAddress(0);                    
    }
  }
  console.log(wallet.account.toJSON());
  const fromAddr = wallet.account.chains[0].addresses[i - 1];

  sendWindow=new BrowserWindow({width:600, height:500, parent: mainWindow});
  sendWindow.on('close', () => { 
    sendWindow = null
    mainWindow.show()
  })
  sendWindow.loadFile('./pages/send.html');
  sendWindow.webContents.on('did-finish-load', ()=>{
    var obj = {
      fromAddr: fromAddr,
      listenAddr : listenAddr
    }
    sendWindow.webContents.send('msg-sendDetails', JSON.stringify(obj))
  })
  // sendWindow.webContents.openDevTools();
  sendWindow.on('ready-to-show', ()=>{
    sendWindow.show()
  })
})

ipc.on('msg-startSendMsg', (event, message) => {
  // console.log(`${message}`)
  var obj = JSON.parse(`${message}`)
  wallet=walletlist[g_sendWalletID];
  var i = wallet.getKForListeningAddress(obj.changeAddr);
  updateMessageHandler(g_sendWalletID, i);
  updateWalletWatchingAddress(g_sendWalletID);
  if(sendWindow!=undefined && sendWindow!=null){
    sendWindow.close()
  }
  sendMessage(obj);
})

ipc.on('service-createWalletByWordlist', () => {
  createWalletByWordlistWindow = new BrowserWindow({width:400, height:500, parent: mainWindow});
  createWalletByWordlistWindow.on('close', () => { 
    createWalletByWordlistWindow = null 
    mainWindow.show()
  })
  createWalletByWordlistWindow.loadFile('./pages/createWalletByWordlist.html');
  // createWalletByWordlistWindow.webContents.openDevTools();
  createWalletByWordlistWindow.on('ready-to-show', ()=>{
    createWalletByWordlistWindow.show()
  })
})

ipc.on('service-createWalletByWordlistInfo', (event, message) => {
  var obj = JSON.parse(message);
  var wallet = new Wallet(obj.save_location);
  wallet.createWalletFromMnemonic(obj.wordlist, obj.password).then(() => {
    dialog.showMessageBox({type:'info', message: "create wallet success!"})
  })
})

ipc.on('service-selectWalletSavePosition', () => {
  const path = dialog.showSaveDialog();
  var obj = {
    path: path,
  }
  if(createWalletByWordlistWindow != null){
    createWalletByWordlistWindow.send('service-getWalletSavePosition', JSON.stringify(obj));
  }
})

// TODO: deposit coins
ipc.on('service-depositCoins', () => {
  depositBTCWindow = new BrowserWindow({width:400, height:500, parent: mainWindow});
  depositBTCWindow.loadFile('./pages/depositBTC.html');
  depositBTCWindow.on('close', () => { 
    depositBTCWindow = null 
    mainWindow.show()
  })
  // depositBTCWindow.webContents.openDevTools();
  depositBTCWindow.on('ready-to-show', ()=>{
    depositBTCWindow.show()
  })
})

// check balance
ipc.on('service-checkBalance', () => {
  checkBalanceWindow = new BrowserWindow({width:400, height:500, parent: mainWindow});
  // checkBalanceWindow.webContents.openDevTools();
  checkBalanceWindow.on('close', () => { 
    checkBalanceWindow = null 
    mainWindow.show()
  })
  checkBalanceWindow.loadFile('./pages/checkBalance.html');
  checkBalanceWindow.on('ready-to-show', ()=>{
    checkBalanceWindow.show()
  })
})

ipc.on('error', (event, message) => {
  var err = JSON.parse(`${message}`);
  console.log(err);
  dialog.showErrorBox('Error', err.err);
})

ipc.on('info', (event, message) => {
  var obj = JSON.parse(`${message}`);
  dialog.showMessageBox({type:'info', message: obj.msg})
})

function sendMessage(obj){
  var messageHandler=new MessageHandler(obj.json);
  messageHandler.splitToArray();
  messageHandler.fileArrayToMsgArray();
  messageArray=messageHandler.messageArray;
  console.log("length: "+messageHandler.messageArray.length);
  
  // 发送信息显示提示
  closeable++;
  if(closeable == 1){
    mainWindow.setClosable(false);
    mainWindow.webContents.send('wallet-showAllertBox')
  }
  wallet.sendMsgSecret(messageArray, obj.fee, obj.fromAddr, obj.changeAddr).then(()=>{
    // 提示用户发送交易完成
    dialog.showMessageBox({type:'info', message: "Send Message Finished"})
    // 发送信息关闭提示
    closeable--;
    if(closeable == 0){
        mainWindow.setClosable(true);
        mainWindow.webContents.send('wallet-deleteAllertBox')
    }
    
  }).catch((err)=>{
    dialog.showErrorBox("Error", err);
    closeable = true
  });
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1000, height: 850})
  // mainWindow.webContents.openDevTools();
  // and load the index.html of the app.
  mainWindow.loadFile('./pages/index.html')
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// 新消息提�??

/**
 * 同步在钱包列表中的钱�??
 */
function asyncWallets(){
  if(checkingWatchingAddressNumberIsZero()){
    console.log('[Info]: watchAddr is empty!');
    return;
  }
  watchAddrlist.forEach(async(addressBalanceMap, walletIndex) => {
    var watchAddresses = asynWalletUtil.getWatchAddresses(addressBalanceMap);
    var balanceInfoMap = await asynWalletUtil.getThisMonentBanalce(watchAddresses);
    for (var item of balanceInfoMap.entries()) {
      var address = item[0]
      var balanceInfo = item[1]
      var old_balanceInfo = addressBalanceMap.get(address);
      if(asynWalletUtil.checkUpdatedBalance(balanceInfo, old_balanceInfo)){
        try{
          await asyncTransaction(walletIndex, old_balanceInfo, address);
          updateBalanceInfo(balanceInfo, address, addressBalanceMap);
        }catch(err){
          console.log(err.message)
        }
      }
      await Utils.sleep(Constants.SMALL_WAITING_TIME)
    }
  })
}

async function asyncTransaction(walletIndex, old_balanceInfo, address){
  var wallet = walletlist[walletIndex];
  var i = wallet.getKForListeningAddress(address)
  if(i == undefined){
    throw new Error("address "+ address + "not found in wallet");
  }
  if(i == (wallet.account.getChain(1).k)){
    updateMessageHandler(walletIndex, i);
    updateWalletWatchingAddress(walletIndex);
  }
  var newTransactions = await asynWalletUtil.getUpdatedTransactionsUp(address, old_balanceInfo.n_tx);
  receiveMessage(walletIndex, newTransactions, i);
}

function checkingWatchingAddressNumberIsZero(){
  return watchAddrlist.length === 0
}

function updateBalanceInfo(balanceInfo, address, addressBalanceMap){
  addressBalanceMap.set(address, balanceInfo);
}

function updateWalletWatchingAddress(walletIndex){
  var wallet = walletlist[walletIndex]
  var address = wallet.account.nextChainAddress(1);
  watchAddrlist[walletIndex].set(address, {
    final_balance: 0, 
    n_tx: 0, 
    total_received: 0
  })
  /**
   * 更新wallet地址
   */
  mainWindow.send('wallet-getNewMsg', JSON.stringify({
    walletID: walletIndex,
    address: address
  }))

  // 添加新的histoty地址
  if(historyWindow != undefined && historyWindow != null){
    historyWindow.send('wallet-newHistoryEntry', JSON.stringify({
      walletID: walletIndex,
      status: false
    }));
  }
}

function updateMessageHandler(walletIndex, i){
  var handlerlist = msghandlerlist[walletIndex];
  if(handlerlist !== null){
    handlerlist[ i + 1 ] = new MessageHandler();
  }
}

function receiveMessage(walletIndex, txsList, i){
  var handlerlist = msghandlerlist[walletIndex];
  var handler = handlerlist[i];
  var wallet = walletlist[walletIndex];
  var from = wallet.account.chains[0].addresses[ i - 1 ];
  // console.log('[Info]: receive message')
  txsList.forEach((tx) => {
    var version = tx.ver
    var inputs = asynWalletUtil.getTxInputs(tx.inputs)
    var kArray = wallet.getKUp(from, version, inputs, tx.outputs);
    // console.log('[Info]: get k');
    kArray.forEach((k) => {
        handler.receiveMessage(k);
    })
  }) 
  if(handler.checkCollectedMessage()){
    newFinishedMsg(walletIndex, i, from);
  }
}

function newFinishedMsg(walletID, i, address){
  if(historyWindow != null && historyWindow != undefined){
    var obj = {};
    obj.walletID = walletID;
    obj.i = i;
    historyWindow.webContents.send("wallet-newFinishedMsg", JSON.stringify(obj));
  }
  console.log('new finish address: ' + address)
  watchAddrlist[walletID].delete(address);
}