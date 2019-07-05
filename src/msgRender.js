const ipcRenderer=require('electron').ipcRenderer;

var msg=document.getElementById('message');

ipcRenderer.on('message',(event,message)=>{
    msg.innerHTML=message;
});