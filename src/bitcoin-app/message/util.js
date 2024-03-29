// function hexToString(h) {
//     var a = [];
//     var i = 0;
//     var s=h.toString();
//     if (s.length % 4) {
//         a.push(String.fromCharCode(parseInt(s.substring(0, 4), 16)));
//         i = 4;
//     }
//     for (; i<s.length; i+=4) {
//         a.push(String.fromCharCode(parseInt(s.substring(i, i+4), 16)));
//     }
//     return a.join('');
// };
 
// function stringToHex(s) {
//     var result = '';
//     for (var i=0; i<s.length; i++) {
//         var b = s.charCodeAt(i);
//         if(0<=b && b<16){
//             result+= '000'+b.toString(16)
//         }
//         if(16<=b && b<255){
//             result+= '00'+b.toString(16)
//         }
//         if(255<=b && b<4095){
//             result+= '0'+b.toString(16)
//         }
//         if(4095<=b && b<65535){
//             result+= b.toString(16)
//         }
//     }
//     return result;
// };

function binaryToHex(s) {
    var i, k, part, accum, ret = '';
    for (i = s.length-1; i >= 3; i -= 4) {
        // extract out in substrings of 4 and convert to hex
        part = s.substr(i+1-4, 4);
        accum = 0;
        for (k = 0; k < 4; k += 1) {
            if (part[k] !== '0' && part[k] !== '1') {
                // invalid character
                return { valid: false };
            }
            // compute the length 4 substring
            accum = accum * 2 + parseInt(part[k], 10);
        }
        if (accum >= 10) {
            // 'A' to 'F'
            ret = String.fromCharCode(accum - 10 + 'A'.charCodeAt(0)) + ret;
        } else {
            // '0' to '9'
            ret = String(accum) + ret;
        }
    }
    // remaining characters, i = 0, 1, or 2
    if (i >= 0) {
        accum = 0;
        // convert from front
        for (k = 0; k <= i; k += 1) {
            if (s[k] !== '0' && s[k] !== '1') {
                return { valid: false };
            }
            accum = accum * 2 + parseInt(s[k], 10);
        }
        // 3 bits, value cannot exceed 2^3 - 1 = 7, just convert
        ret = String(accum) + ret;
    }
    return { valid: true, result: ret };
}

function hexToBinary(s) {
    var i, k, part, ret = '';
    // lookup table for easier conversion. '0' characters are padded for '1' to '7'
    var lookupTable = {
        '0': '0000', '1': '0001', '2': '0010', '3': '0011', '4': '0100',
        '5': '0101', '6': '0110', '7': '0111', '8': '1000', '9': '1001',
        'a': '1010', 'b': '1011', 'c': '1100', 'd': '1101',
        'e': '1110', 'f': '1111',
        'A': '1010', 'B': '1011', 'C': '1100', 'D': '1101',
        'E': '1110', 'F': '1111'
    };
    for (i = 0; i < s.length; i += 1) {
        if (lookupTable.hasOwnProperty(s[i])) {
            ret += lookupTable[s[i]];
        } else {
            console.log(s[i]);
            return { valid: false };
        }
    }
    return { valid: true, result: ret };
}

function hexToString(h){
    var a = [];
    var i = 0;
    var s=h.toString();
    if (s.length % 2) {
        a.push(String.fromCharCode(parseInt(s.substring(0, 2), 16)));
        i = 2;
    }
    for (; i<s.length; i+=2) {
        a.push(String.fromCharCode(parseInt(s.substring(i, i+2), 16)));
    }
    return a.join('');

}

function stringToHex(str){
    var val="";
　　for(var i = 0; i < str.length; i++){
        val += str.charCodeAt(i).toString(16);
    }
　　return val;
}

exports.hexToString=hexToString;
exports.stringToHex=stringToHex;
exports.binaryToHex=binaryToHex;
exports.hexToBinary=hexToBinary;