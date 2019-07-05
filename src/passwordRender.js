const ipcRenderer=require('electron').ipcRenderer;
const remote=require('electron').remote;

ipcRenderer.on('get-password', function (event, message) {
    cyherText = JSON.parse(`${message}`).msg;
})

var win=remote.getCurrentWindow();

const sendMsgBtn=document.getElementById('get-message');
sendMsgBtn.addEventListener('click',()=>{
    const password=document.getElementById('password').value;
    const AES_Key=document.getElementById('AES_Key').value;
    
    var obj = {};
    obj.password = password;
    obj.AES_Key = AES_Key;
    ipcRenderer.send('msg-showMsg', JSON.stringify(obj));
    win.close();
})