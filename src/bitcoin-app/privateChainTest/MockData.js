var fs =require('fs')

function GetRandomNum(Min,Max)
{   
    var Range = Max - Min;   
    var Rand = Math.random();   
    return(Min + Math.round(Rand * Range));   
} 

function mockMessage(){
    var filePath = 'D:/message/msg' + GetRandomNum(1, 10) + '.txt';
    var data = fs.readFileSync(filePath);
    return data;
}

module.exports = {
    mockMessage,
    GetRandomNum
}