var bip32=require('bip32')
var CryptLib=require('cryptlib')
var Constants = require('./Constants')

var Chain = require('./Chain')

function Account (chains) {
  this.chains = chains
}

Account.fromJSON = function (json, network, addressFunction) {
  var chains = json.map(function (j) {
    var node = bip32.fromBase58(j.node, network)

    var chain = new Chain(node, j.k, addressFunction)
    chain.map = j.map

    // derive from k map
    chain.addresses = Object.keys(chain.map).sort(function (a, b) {
      return chain.map[a] - chain.map[b]
    })

    return chain
  })

  return new Account(chains)
}

// 从加密格式恢复账户
Account.fromJSONEncrypt = function (json, password, network, addressFunction) {
  var chains = json.map(function (j) {
    var iv = Constants.iv;
    var key = CryptLib.getHashSha256(password, 32);
    var plaintext = CryptLib.decrypt(j.node, key, iv);
    var node = bip32.fromBase58(plaintext, network)

    var chain = new Chain(node, j.k, addressFunction)
    chain.map = j.map

    // derive from k map
    chain.addresses = Object.keys(chain.map).sort(function (a, b) {
      return chain.map[a] - chain.map[b]
    })

    return chain
  })

  return new Account(chains)
}

Account.prototype.clone = function () {
  return new Account(this.chains.map(function (chain) {
    return chain.clone()
  }))
}

Account.prototype.containsAddress = function (address) {
  return this.chains.some(function (chain) {
    return chain.find(address) !== undefined
  })
}

// optional parents argument for private key escalation
Account.prototype.derive = function (address, parents) {
  var derived

  this.chains.some(function (chain, i) {
    derived = chain.derive(address, parents && parents[i])
    return derived
  })

  return derived
}


Account.prototype.getAllAddresses = function () {
  return [].concat.apply([], this.chains.map(function (chain) {
    return chain.getAll()
  }))
}

Account.prototype.getChain = function (i) { return this.chains[i] }
Account.prototype.getChains = function () { return this.chains }
Account.prototype.getChainAddress = function (i) { return this.chains[i].get() }
Account.prototype.getNetwork = function () { return this.chains[0].getParent().keyPair.network }

Account.prototype.isChainAddress = function (i, address) {
  return this.chains[i].find(address) !== undefined
}

Account.prototype.nextChainAddress = function (i) {
  return this.chains[i].next()
}

Account.prototype.toJSON = function () {
  return this.chains.map(function (chain) {
    return {
      k: chain.k,
      map: chain.map,
      node: chain.getParent().toBase58(),
    }
  })
}

// TODO: 账户转储成加密格式
Account.prototype.toJSONEncrypt = function (password) {
  return this.chains.map(function (chain) {
    var iv = Constants.iv;
    var key = CryptLib.getHashSha256(password, 32);
    var cipherText = CryptLib.encrypt(chain.getParent().toBase58(), key, iv);
    return {
      k: chain.k,
      map: chain.map,
      node: cipherText,
    }
  })
}

module.exports = Account