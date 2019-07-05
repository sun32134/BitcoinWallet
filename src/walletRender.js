// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var ipcRenderer=require("electron").ipcRenderer;

// 加载先前加载的钱包信息
ipcRenderer.send('wallet-getPreviousWalletsInfo');

ipcRenderer.on('wallet-previousWalletsInfo', (event, message) => {
  var obj = JSON.parse(message);
  insertNewRow(obj);
})

ipcRenderer.on('wallet-addWalletPageUpdate',function(event, message){
  var obj = JSON.parse(`${message}`)
  insertNewRow(obj);
});

ipcRenderer.on('wallet-getNewMsg', (event, message) => {
  // 更新页面监听地址
  var obj = JSON.parse(`${message}`)
  updateAddress(obj.walletID, obj.address);
})

function insertNewRow(obj){
  var tableRef=document.getElementById('walletTable').getElementsByTagName('tbody')[0];
  var newRow=tableRef.insertRow(tableRef.rows.length);

  var indexCell=newRow.insertCell(0);
  var index=document.createTextNode(tableRef.rows.length);
  indexCell.appendChild(index);

  var addressCell=newRow.insertCell(1);
  // console.log(typeof wallet.account.chains[1].addresses)
  var addressT=document.createTextNode(`0x${obj.address}`);
  addressCell.setAttribute('id', 'address-text-node' + newRow.rowIndex);
  addressCell.appendChild(addressT);

  var operaCell=newRow.insertCell(2);
  var del=document.createElement("button");
  del.className='btn red'
  del.textContent='delete'
  del.addEventListener('click',()=>{
    var row=del.parentNode.parentNode;
    var rowIndex = row.rowIndex;
    // 通知主函数删除钱包列表相应钱包，以及接受消息函数
    var obj = {};
    obj.walletID = rowIndex - 1
    ipcRenderer.send('wallet-deleteWalletBtnClick', JSON.stringify(obj));
    row.parentNode.removeChild(row);
    for(var i= rowIndex - 1; i < tableRef.rows.length; i++){
      console.log('[Info]: in change id')
      var indexCell=tableRef.rows[i].cells[0];
      var addressCell = tableRef.rows[i].cells[1];
      indexCell.innerText = i + 1
      addressCell.setAttribute('id', 'address-text-node' + (i + 1));
    }
  })
  var send=document.createElement("button");
  send.className='btn blue'
  send.textContent='send'
  send.addEventListener('click',()=>{
    var row = send.parentNode.parentNode;
    var rowIndex = row.rowIndex;
    var obj = {}
    obj.walletID = rowIndex - 1;
    // TODO: 通知主函数进行发送消息
    ipcRenderer.send('msg-sendMsgBtnClick', JSON.stringify(obj))    
  })
  operaCell.appendChild(send);
  operaCell.appendChild(del);

  var history = newRow.insertCell(3);
  var historyBtn = document.createElement('button');
  historyBtn.className = 'btn green';
  historyBtn.textContent = 'history';
  historyBtn.addEventListener('click', function(){
    var rowIndex = historyBtn.parentNode.parentNode.rowIndex;
    // TODO: 显示钱包历史信息
    var obj ={
      walletID: rowIndex - 1
    }
    ipcRenderer.send('wallet-getHistory', JSON.stringify(obj));
  })
  history.appendChild(historyBtn);
}

function updateAddress(walletID, address){
  var addressCell = document.getElementById('address-text-node'+(walletID+1));
  if(addressCell === undefined){
    console.log('undefined');
  }
  else{
    while (addressCell.firstChild) {
      addressCell.removeChild(addressCell.firstChild);
    }
    var addressText = document.createTextNode(`0x${address}`);
    addressCell.appendChild(addressText);
  }
}

var addWalletBtn = document.getElementById('add-wallet');
addWalletBtn.addEventListener('click', () => {
  ipcRenderer.send('wallet-addWalletBtnClick');
})