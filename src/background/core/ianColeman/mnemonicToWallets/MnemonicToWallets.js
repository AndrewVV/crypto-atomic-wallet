const bitcoinjs = require("./bitcoinjs-3.3.2");
const bchaddr = require("bchaddrjs");
const ethUtil = require("ethereumjs-util");
const Mnemonic = require("./jsbip39");

var mnemonic = new Mnemonic();
var bip32RootKey = null;
var bip32ExtendedKey = null;

class MnemonicToWallets {
    constructor(wallet, network, addressCount=1) {
        this.wallet=wallet;
        this.networks=wallet.networks;
        this.networkIndex = network;
        this.initialAddressCount = addressCount;
    }
    converterMnemonicToAddress(phrase) {
        return new Promise(async(resolve, reject)=>{
            let address = this.phraseChangedForAddress(phrase);
            return resolve(address)
        });
    }
    converterMnemonicToPrivkey(phrase) {
        return new Promise(async(resolve, reject)=>{
            let privkey = this.phraseChangedForPrivkey(phrase);
            return resolve(privkey)
        });        
    }
    networkChanged(network) {
        var networkIndex = this.networkIndex;
        var network = this.networks[networkIndex];
        network.onSelect();
    }
    phraseChangedForAddress(phrase) {
        this.networkChanged()
        var phrase = phrase;
        var passphrase;
        let seed = mnemonic.toSeed(phrase, passphrase);
        bip32RootKey = bitcoinjs.bitcoin.HDNode.fromSeedHex(seed, network); 
        this.calcForDerivationPath();
        var initialAddressCount = this.initialAddressCount;
        let address = this.displayAddresses(0, initialAddressCount, this.networkIndex);
        return address
    }
    phraseChangedForPrivkey(phrase) {
        this.networkChanged()
        var phrase = phrase;
        var passphrase;
        let seed = mnemonic.toSeed(phrase, passphrase);
        bip32RootKey = bitcoinjs.bitcoin.HDNode.fromSeedHex(seed, network);        
        this.calcForDerivationPath();
        var derivationPath = this.getDerivationPath();
        bip32ExtendedKey = this.calcBip32ExtendedKey(derivationPath);        
        var initialAddressCount = this.initialAddressCount;
        let privkey = this.displayPrivkey(0, initialAddressCount, this.networkIndex);
        return privkey
    }
    calcForDerivationPath() {
        var derivationPath = this.getDerivationPath();
        bip32ExtendedKey = this.calcBip32ExtendedKey(derivationPath);
    }
    calcBip32ExtendedKey(path) {
        var extendedKey = bip32RootKey;
        var pathBits = path.split("/");
        for (var i=0; i<pathBits.length; i++) {
            var bit = pathBits[i];
            var index = parseInt(bit);
            if (isNaN(index)) {
                continue;
            }
            var hardened = bit[bit.length-1] == "'";
            var isPriv = !(extendedKey.isNeutered());
            var invalidDerivationPath = hardened && !isPriv;
            if (invalidDerivationPath) {
                extendedKey = null;
            }
            else if (hardened) {
                extendedKey = extendedKey.deriveHardened(index);
            }
            else {
                extendedKey = extendedKey.derive(index);
            }
        }
        return extendedKey
    }
    getDerivationPath() {
        if (this.networkIndex == "BCH" || this.networkIndex == "BCHTEST") {
            var derivationPath = "m/44'/145'/0'/0";
            return derivationPath;
        }            
        if (this.networkIndex == "BTC") {
            var derivationPath = "m/44'/0'/0'/0";
            return derivationPath;
        }   
        if (this.networkIndex == "BTC49") {
            var derivationPath = "m/49'/0'/0'/0";
            return derivationPath;
        }   
        if (this.networkIndex == "DASH") {
            var derivationPath = "m/44'/5'/0'/0";
            return derivationPath;
        }  
        if (this.networkIndex == "ETC") {
            var derivationPath = "m/44'/61'/0'/0";
            return derivationPath;
        }  
        if (this.networkIndex == "ETH" || this.networkIndex == "ETHTEST") {
            var derivationPath = "m/44'/60'/0'/0";
            return derivationPath;
        }  
        if (this.networkIndex == "LTC") {
            var derivationPath = "m/44'/2'/0'/0";
            return derivationPath;
        }  
        if (this.networkIndex == "BTCTEST") {
            var derivationPath = "m/44'/1'/0'/0";
            return derivationPath;
        }  
        if (this.networkIndex == "BTC49TEST") {
            var derivationPath = "m/49'/1'/0'/0";
            return derivationPath;
        }  
        if (this.networkIndex == "LTCTEST") {
            var derivationPath = "m/44'/2'/0'/0";
            return derivationPath;
        } 
        if (this.networkIndex == "DASHTEST") {
            var derivationPath = "m/44'/1'/0'/0";
            return derivationPath;
        }               
    }
    displayAddresses(start, total, networkIndex) {
        for (var i=0; i<total; i++) {
            var index = i + start;
            var isLast = i == total - 1;
            let address = this.calculateAddress(index, isLast, networkIndex);
            return address
        }
    }
    displayPrivkey(start, total, networkIndex) {
        for (var i=0; i<total; i++) {
            var index = i + start;
            var isLast = i == total - 1;
            let privkey = this.calculatePrivKey(index, isLast, networkIndex);
            return privkey
        }
    }
    calculateAddress(index, isLast, networkIndex) {
        let key = bip32ExtendedKey.derive(index);
        if (networkIndex == "BTC49" || networkIndex == "BTC49TEST"){
            var keyhash = bitcoinjs.bitcoin.crypto.hash160(key.getPublicKeyBuffer());
            var scriptsig = bitcoinjs.bitcoin.script.witnessPubKeyHash.output.encode(keyhash);
            var addressbytes = bitcoinjs.bitcoin.crypto.hash160(scriptsig);
            var scriptpubkey = bitcoinjs.bitcoin.script.scriptHash.output.encode(addressbytes);
            address = bitcoinjs.bitcoin.address.fromOutputScript(scriptpubkey, network)
            return address
        }
        var keyPair = key.keyPair;
        var address = keyPair.getAddress().toString();
        if (networkIndex == "BTC" || networkIndex == "DASH" || networkIndex == "LTC" || networkIndex == "BTCTEST" || networkIndex == "LTCTEST" || networkIndex == "DASHTEST") {
            return address
        }
        if (networkIndex == "BCH"){
            address = bchaddr.toCashAddress(address);
            address = address.substring(12)
            return address
        }
        if (networkIndex == "BCHTEST"){
            address = bchaddr.toCashAddress(address);
            address = address.substring(8)
            return address
        }
        if (networkIndex == "ETC" || networkIndex == "ETH" || networkIndex == "ETHTEST") {
            var privKeyBuffer = keyPair.d.toBuffer(32);
            var addressBuffer = ethUtil.privateToAddress(privKeyBuffer);
            var hexAddress = addressBuffer.toString('hex');
            var checksumAddress = ethUtil.toChecksumAddress(hexAddress);
            address = ethUtil.addHexPrefix(checksumAddress);
            return address
        }
    }
    calculatePrivKey(index, isLast, networkIndex) {
        let key = bip32ExtendedKey.derive(index);
        var keyPair = key.keyPair;
        let privkey = keyPair.toWIF();
        if (networkIndex == "BTC" || networkIndex == "BTC49" || networkIndex == "DASH" || networkIndex == "LTC" || networkIndex == "BTCTEST" || networkIndex == "BTC49TEST" || networkIndex == "LTCTEST" || networkIndex == "DASHTEST") {
            return privkey
        }
        if (networkIndex == "BCH" || networkIndex == "BCHTEST"){
            return privkey
        }
        if (networkIndex == "ETC" || networkIndex == "ETH"  || networkIndex == "ETHTEST") {
            var privKeyBuffer = keyPair.d.toBuffer(32);
            privkey = privKeyBuffer.toString('hex');
            return privkey;
        }
    }

}

module.exports = MnemonicToWallets;