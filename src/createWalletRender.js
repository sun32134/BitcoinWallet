var ipcRender = require('electron').ipcRenderer
var remote = require('electron').remote
var bip39 = require('bip39')

var g_wordlist = null
var g_password = null;
var g_repeatPassword = null;
var save_location = null;

var win = remote.getCurrentWindow();

var createWalletSave = document.getElementById('create-wallet-save');
createWalletSave.addEventListener('click', () => {
    getInputFromPage();
    if(checkInputValidation() == true){
        var obj = {
            wordlist: g_wordlist,
            password: g_password,
            save_location: save_location,
        }
        console.log(obj);
        ipcRender.send('service-createWalletByWordlistInfo', JSON.stringify(obj));
        win.close();
    }else{
        var err = {};
        err.err = 'Please complete input'
        ipcRender.send('error', JSON.stringify(err));
    }
})

var saveLocationBtn = document.getElementById('location');
saveLocationBtn.addEventListener('click', () => {
    ipcRender.send('service-selectWalletSavePosition');
})

var generateBtn = document.getElementById('generate');

generateBtn.addEventListener('click', () => {
    var mnemonic = bip39.generateMnemonic();
    var wordlistInput = document.getElementById('wordlist');
    wordlistInput.setAttribute('value', mnemonic);
})

ipcRender.on('service-getWalletSavePosition', (event, message) => {
    var obj = JSON.parse(message);
    save_location = obj.path;
    saveLocationBtn.setAttribute('value', save_location)
})

function getInputFromPage(){
    getWordlistFromPage();
    getPasswordFromPage();
    getRepeatPasswordFromPage();
    getSaveLocation();
}

function getWordlistFromPage(){
    var wordlistInput = document.getElementById('wordlist');
    g_wordlist = wordlistInput.getAttribute('value');
    if(g_wordlist == null){
        g_wordlist = wordlistInput.value;
    }
}

function getPasswordFromPage(){
    var passwordInput = document.getElementById('password');
    g_password = passwordInput.value;
}

function getRepeatPasswordFromPage(){
    var repeatPasswordInput = document.getElementById('repeatPassword');
    g_repeatPassword = repeatPasswordInput.value;
}

function getSaveLocation(){
    save_location = saveLocationBtn.getAttribute('value');
}

function checkInputValidation(){
    if(!checkPasswordValidation()){
        console.log('password validation failed');
        return false
    }
    if(!checkWordlistValidation()){
        console.log('wordlist validation failed');
        return false
    }
    if(!checkSaveLocation()){
        console.log('save location validation failed');
        return false
    }
    return true;
}

function checkWordlistValidation(){
    if(g_wordlist == null){
        return false;
    }
    if(bip39.validateMnemonic(g_wordlist)){
       return true; 
    }
    else{
        var err = {};
        err.err = 'Mnemonic not vaild'
        ipcRender.send('error', JSON.stringify(err));
    }
}

function checkPasswordValidation(){
    if(g_password == null || g_repeatPassword == null){
        return false;
    }
    if(g_password == g_repeatPassword){
        return true;
    }
    else{
        var err = {};
        err.err = 'Password not match'
        ipcRender.send('error', JSON.stringify(err));
    }
}

function checkSaveLocation(){
    if(save_location == null){
        return false;
    }
    if(save_location.endsWith('.db')){
        return true;
    }
    else{
        var err = {};
        err.err = 'wallet file should ends with .db';
        ipcRender.send('error', JSON.stringify(err));
    }
}