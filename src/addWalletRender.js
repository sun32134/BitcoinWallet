const remote=require('electron').remote;
const ipcRenderer=require('electron').ipcRenderer;

var win=remote.getCurrentWindow();

const addWalletBtn=document.getElementById('add-wallet-save');

addWalletBtn.addEventListener('click',()=>{
    const url=document.getElementById('wallet-url').value;
    const password=document.getElementById('wallet-password').value;
    var obj = {};
    obj.url = url;
    obj.password = password;
    console.log("url: " + url);
    console.log("password: " + password);
    ipcRenderer.send('wallet-addWalletResponse', JSON.stringify(obj));
    win.close();
})

const fileManagerBtn=document.getElementById('wallet-url');
fileManagerBtn.addEventListener('click',()=>{
    ipcRenderer.send('wallet-openWalletFile')
})

ipcRenderer.on('wallet-file',function(event, filepath){
    // fileManagerBtn.innerText=filepath;
    fileManagerBtn.value=filepath;
})