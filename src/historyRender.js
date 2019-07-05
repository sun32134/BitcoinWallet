const ipcRenderer=require('electron').ipcRenderer;

var g_index = -1;

// TODO: 收到新完成的地址
ipcRenderer.on('wallet-newFinishedMsg', function(event, message){
    var obj = JSON.parse(`${message}`);
    var newMsgIndex = obj.walletID;
    if(g_index === newMsgIndex){
        // 收到提示
        updateMsgBtn(obj.i);
    }
})

ipcRenderer.on('wallet-history', function(event, message){
    var obj = JSON.parse(`${message}`);
    g_index = obj.walletID;
    for(var i = 1; i < obj.addresses.length; i++){
        insertNewRow(obj.addresses[i], obj.flags[i]);
    }
})

// 收到新的需要更新的历史消息
ipcRenderer.on('wallet-newHistoryEntry', function (event, message) {
    var obj = JSON.parse(message);
    if(g_index === obj.walletID){
        insertNewRow(obj.address, obj.status);
    }
})

// 添加新的使用过地址的记录
function insertNewRow(address, status){
    var tableRef=document.getElementById('historyTable').getElementsByTagName('tbody')[0];
    var newRow=tableRef.insertRow(tableRef.rows.length);

    var indexCell = newRow.insertCell(0);
    var index=document.createTextNode(tableRef.rows.length);
    indexCell.appendChild(index);
    
    var addressCell=newRow.insertCell(1);
    var addressT=document.createTextNode(address);
    addressCell.appendChild(addressT);

    var statusCell = newRow.insertCell(2);
    if(status){
        var statsA = document.createElement('a');
        statsA.className = 'btn blue icn-only';
        var statsIcon = document.createElement('i');
        statsIcon.className = 'icon-envelope';
        statsA.appendChild(statsIcon);
        statusCell.appendChild(statsA);
        statsA.addEventListener('click', ()=>{
            var rowIndex = statsA.parentNode.parentNode.rowIndex;
            var obj = {};
            obj.walletID = g_index;
            obj.msgIndex = rowIndex;
            ipcRenderer.send('msg-getPassword', JSON.stringify(obj))
        })
    }
    else{
        var statusT = document.createTextNode('checking...');
        statusCell.appendChild(statusT);
    }
}

// 添加更新按钮
function updateMsgBtn(rowIndex){
    var tableRef=document.getElementById('historyTable').getElementsByTagName('tbody')[0];
    var row=tableRef.rows[rowIndex - 1];
    var newMsgA = document.createElement('a');
    newMsgA.className = 'btn blue icn-only'
    var newMsgIcon = document.createElement('i');
    newMsgIcon.className = 'icon-envelope';
    newMsgA.appendChild(newMsgIcon);
    row.deleteCell(2);
    var newCell = row.insertCell(2);
    newCell.appendChild(newMsgA);
    newMsgA.addEventListener('click', ()=>{
        var obj = {}
        obj.walletID = g_index;
        obj.msgIndex = rowIndex
        ipcRenderer.send('msg-getPassword', JSON.stringify(obj))
    })
}