const ipcRenderer=require('electron').ipcRenderer;

var sendBar = document.getElementById('sendBar');

// TODO: 根据main中发来消息更新bar
ipcRenderer.on('sendTxUpdate', (event, message)=>{
    sendBar.setAttribute('style', "width: " + message + ";");
})