const MessageHandler=require('../messageHandler');
const BN=require('bn.js');
const util=require('../util');
var assert = require('chai').assert
var CryptLib = require('cryptlib')
var Constants = require('../../Constants')

const cryptoText = 'l4UpwBNI3CsL/7ZgLvaAMs5qYo+rRSOq4J1XOCFv6AtDsae7ZiEgv+XPELSP9yAOyL5y0UB6B8Ld5C2z6bT+AHPKLkhjnfUG1DoBW867TaD7B14dEHJdzeGMrIE2GVRjjP2YE7W//Hqzan3t4qbsUY5x65PQbLRchWFkBJsXCwUJL9Uy1DIDTdfQrRNcipfaUbBGVXnf9cqAsaL9+xqSWsvOhl+hEMovlXs5K0sGvhZ5+oMW6PfsGvgdxQglPX6vh10HWMaAZyD4qAaMjOinFLch4O9Jjh/VuOFAxUSL1bhAjvF6Srr5kXRWomBTZOqA+TjJp3YfbuivN2NRcvpNjinebYqz+VezJOV9Ydb7B5GIURDfr3lTiXXgS7k+V47+abhFh51LqTgK7tQ+x7pEPVwl8mR55346QuObl47ogPGZVT/vvghgMbsCXm43ISr4/bgIt0T2o1X9Yj0u0cJXPaspB1BFwqOy/91S1pMytXscA7yBnjwsdfEe8TIT0OnuaFcXW0E3j54BLrHxuw5C9RqoKmtthUuZHUdJF72lnTzfr6/no4WzVAWruUhnt0YXeGwEDUJAOzbdIINdtB5DsjJk7YLJBcUrRNAZfbBGwtAHLD6wHc76GHi2TmoXoC4n/iJLQbxCczDE8Ar1L2dlNHrpkv0y2f3YJKbtqBatWkdVaJVCKweHvDLr61Ok40izJfH+RaeWdu9WUm7YvozfF5O9Yt3KhdwfZoChFKfpRrWXfTPjG0uQNi7Fe8Y4ZWRuVATb6vZ3bS9R/GNHBeRKCADA0OgMt70yBx+BnUfxPiNcSKzt2BCRHs5jxpOx/1LndcV776xIjK8K1NNPPis5p9VGRUFX0q+H+xBZXvLeJDiAzuJ+eUWRS25UXhBriJj0yr6MVi9xyTyYi6DjfDuX6SiJEzlv0nX2xkh1YEmSS/Yq9DcjUhshUqnxh96yCPHagerlQXpnfFNF0KkP/AvcgsLQQbTaaBTqxoQGo8dAjgh0GO88EylbUgoC8yiaGbed0WsfQ650h7AqEyZgzaeDrpTGtuUlvf1JTFScWSgt2W0ITy+GV8io5ktVTDQhRDDBm/EEyOiosumzg1Tz2TZotkaA54hBeGYfLA6y7YgHM4+iEDJKwfoZhCIBRY+l1EK4CjSa8tpRFRVRFy3iNXOzuxj5KBffVR14W/SQNhl+aof9vnw8VRzJYcJ9Yht2rmncAJTsaPVYTjVWTUag/GXj6WA9EMnW0LWzKmKX5xLRU8dcUZ9zzvkjVPhZxKk9T6tkVxqXadQgQlraiUnThgPWzZGa9rjSNOKQOnq4E9mT1vOkcHg7vnXgnZXmYZo6hVVapNkSfF0fDOWcLa7dtOhS82WJeSGPUdxfPhRlEwTZiu7TBGaX8SQTcwXv+x7/VUjmt/6GyHfAR1iR2p7dGqMnug=='
var secret = "从区块链目前的发展情况来看，确实有可能使互联网的功能从信息传递转化为价值传递。如果真能顺利实现这个转化，它对人们的经济生活、金融生活乃至社会生活，将带来远比当下一般意义上的互联网金融更巨大的影响、改变。从区块链目前的发展情况来看，确实有可能使互联网的功能从信息传递转化为价值传递。如果真能顺利实现这个转化，它对人们的经济生活、金融生活乃至社会生活，将带来远比当下一般意义上的互联网金融更巨大的影响、改变。从区块链目前的发展情况来看，确实有可能使互联网的功能从信息传递转化为价值传递。如果真能顺利实现这个转化，它对人们的经济生活、金融生活乃至社会生活，将带来远比当下一般意义上的互联网金融更巨大的影响、改变。从区块链目前的发展情况来看，确实有可能使互联网的功能从信息传递转化为价值传递。如果真能顺利实现这个转化"

var obj = {
    fileData: util.stringToHex(cryptoText)
}
        
var receiveMessage = [ '00361a2ab83ba1272499a1b9a6179bad33a63b30a0a6b99ab8acb795b92929a7',
'015c4d128c5613d0d19d8d905d111cd8594dd69a5159dd8ad614115314d40e5e',
'022829ef2986af260aa846c847098c86a8664f46cc4a8568290a09698d6d0d4d',
'03666554731446f4257383637546144374231346445484a647a65474d7249453',
'04123ab29353528192ca29bab9797a438bd30b719ba1a38b139aaac9abc1b1aa',
'0541458931498da15d19ad0929cd610ddd552930e555e4c511251151919945c9',
'06249cc6d2e0ccc2aac4848eacb0dccc72c6e282e6c2987256f0e2a6aee6ec9e',
'07686c2b68454d6f766c5873354b30734776685a352b6f4d5736506673477667',
'08323c28b3b6282c1b3b341898242ba6b0a0ad3ca21a38a0b0a6b527b4b72326',
'0918da0d13ce529a9a0bd59d53d1905e1554d30c589a105a9d918d94dc9c8d5a',
'0a6b0a4aededa84a8b49ee28256a8d494e066b2ccc4ead2ec9c649ca4c6ece09',
'0b66a696e656259717a2b56657a4a4f563959646237423547495552446672336',
'0c62a34ac2c33a99bb595ab1a1b95b0b13423341a98a638aa33a59bba2895bc1',
'0d5dc1154159ddb0e1b548d4d4ccd0d945d53d89b0d0ddbd9d411d695950bdd9',
'0e6cced0ce9ac4e686b0da686692a6e4685ec4ce92e860a864de62b072b2d460',
'0f7530634a58506173704231424677714f792f39315331704d79745873634137',
'103ca137353bb9b23322b29c2a24aa1827b73ab0a331ac2b982299b51a9a2126',
'111c921e1d5dcd50ce549c5bd2db5d1d1a155d5692155912918dcc9b1b951e99',
'124e46c5edcde68aef4ac82aee4eaaad0dce860b2b0ca8eee8a88aa94829ef4c',
'1326449494e6474423544736a4a6b37594c4a42635572524e415a66624247777',
'14220a426221b3ba4319b9b23a434992a36b7ac37a19a3717b4a52628b13c21b',
'150de91114e105c8c530c991b13921c9c1add8c1e4c998cd65292d89d1c50985',
'1668aed6c8acc294ac8696eeca90ec8898e46c629ed66860d2f494cc9056a4c2',
'17655764753957556d3759766f7a6646354f395974334b686477665a6f436846',
'1825b33829392bac332a283523983aa8a7349ba3329c2c9a2d2ba93aab20aa31',
'190d9d968cd894ce548bd1d39210995492d0d051104c13d9d35d0dcc1e509e0a',
'1a684dcaaccf0a0d29cc6a696f4e8648486a490e66ad4f0e09ef05e6298dcc8c',
'1b35637373678496a4b384b314e4e5050697335703956475255465830712b482',
'1c5bc212d2c3b2632a52234a0bd3aa515b2aaaba929991aaaac34213934a5351',
'1d41e5c8d93559a4e5e1e551e565a4d911a99911d560d94da52915e9b1d8c1b9',
'1e3064f0d6d062b28adaa6a65eb2e27288c6d4aad0e6d0aae2dcf0d0726cf286',
'1f5048616765726c5158706e66464e46304b6b502f41766367734c5151625461',
'2030a12a38bc37a8a3b79c3220b533b41823a79c1c22bcb6312ab3b7a19c3cb4',
'215851d899590c15dcd9944d8d4c1a0dd05c515e5699de9859511c9c1511dd1d',
'222aad8eccc6294a88ca6c6aea6cee864ae6092a8f2568eac70d2de6ad6e8aca',
'234445168524444426d2f4545794f696f73756d7a6731547a32545a6f746b614',
'2409a9a342132a3acb326209b3c9bacb3a4269a15b4a2a22525bbb337ad3421a',
'2525094964adb0c5152cd10da94d84e1d1c1491949594919e4cda539613de9d5',
'2670d46a9684ccccaca46268ae5ea6a29cd0d856c2decc72ecdcee70aca4f494',
'2759634a3959687432726d6e63414a547361505659546a5657545561672f4758',
'28351b2ba09ca2a6b72b98262bbd25b6a5ac1abc26292a9c3231aaad1cbd3d3b',
'291ada95941a169e12dace550d9d1ad59e1c5618591459d45b1c985a555b951a',
'2a0cea0aef4b48ec272e4d4a69c9e96a29edce2688a72daa862ec9ed6c690ce6',
'2b7766e58676e5a586d595a6f3668565661704e6b5366463066444f57634c613',
'2c3b23a27b4299c192ba532a9a3a82ab23c332834293622bbaa2d34ba9baa212',
'2d1d8560e14d45518ddd61d8ade0dcbd5955a9b5d0bcd91de521990548c5a548',
'2ee4e06ec88ee29adceace7a7a00000000000000000000000000000000000b30' ]

describe('测试组装类', function () {

    it('测试加密中文消息', function () {
        var iv = Constants.iv;
        var AES_key = 'my secret';
        var key=CryptLib.getHashSha256(AES_key, 32);
        assert.equal(CryptLib.encrypt(secret, key, iv), cryptoText);
    })

    it('测试解密中文消息', function () {
        var iv = Constants.iv;
        var AES_key = 'my secret';
        var key=CryptLib.getHashSha256(AES_key, 32);
        var original = CryptLib.decrypt(cryptoText, key, iv);
        assert.equal(original, secret);
    })

    it('测试填充', function () {
        var messageHandler = new MessageHandler(obj);
        var pad=messageHandler.padding(messageHandler.fileData);
        var recoverMessage=messageHandler.removePadding(pad, messageHandler.fileData.length*4);
        assert.equal(recoverMessage, cryptoText, "填充错误")
    })

    it('测试分割消息', function () {
        var messageHandler = new MessageHandler(obj);
        messageHandler.splitToArray();
        messageHandler.fileArrayToMsgArray();
        assert.deepEqual(messageHandler.messageArray, receiveMessage, "分割消息失败")
    })

    it('测试接受消息', function () {
        var receiveMsg = '001a1b15a115b09929b7a22abcbaa7a627b5a8a2b599a318aca22615b52a99a8';
        var messageHandler = new MessageHandler();
        messageHandler.receiveMessage(new BN(receiveMsg, 16));
    })

    it('测试恢复消息', function () {
        var messageHandler = new MessageHandler();
        receiveMessage.forEach((msg) => {
            messageHandler.receiveMessage(new BN(msg, 16));
        })
        messageHandler.recoverData()
        assert.equal(cryptoText, messageHandler.fileData, "恢复消息失败");
    })

    it('检查是否完成接受消息，未接受消息', function () {
        var receiveMessage = [
            '1e3064f0d6d062b28adaa6a65eb2e27288c6d4aad0e6d0aae2dcf0d0726cf286',
            '1f5048616765726c5158706e66464e46304b6b502f41766367734c5151625461',
            '2030a12a38bc37a8a3b79c3220b533b41823a79c1c22bcb6312ab3b7a19c3cb4',
            '215851d899590c15dcd9944d8d4c1a0dd05c515e5699de9859511c9c1511dd1d',
            '222aad8eccc6294a88ca6c6aea6cee864ae6092a8f2568eac70d2de6ad6e8aca',
            '234445168524444426d2f4545794f696f73756d7a6731547a32545a6f746b614',
            '2409a9a342132a3acb326209b3c9bacb3a4269a15b4a2a22525bbb337ad3421a',
        ]
        var messageHandler = new MessageHandler();
        receiveMessage.forEach((msg) => {
            messageHandler.receiveMessage(new BN(msg, 16));
        })
        var check = messageHandler.checkCollectedMessage();
        assert.isFalse(check, "检查接受消息失败");
    })

    it('检查是否完成接受消息，消息接收完成', function () {
        var messageHandler = new MessageHandler();
        receiveMessage.forEach((msg) => {
            messageHandler.receiveMessage(new BN(msg, 16));
        })
        var check = messageHandler.checkCollectedMessage();
        assert.isTrue(check, "检查接受消息失败");
    })
})