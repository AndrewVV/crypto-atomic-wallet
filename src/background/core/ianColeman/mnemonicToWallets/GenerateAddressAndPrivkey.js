'use strict'
const MnemonicToWallets = require('./MnemonicToWallets');

class GenerateAddressAndPrivkey{
    constructor(wallet){
        this.wallet = wallet;
        this.phrase;
    }
    generateAddress(ticker){
        return new Promise(async(resolve,reject)=>{
            let mnemonicToWallet = new MnemonicToWallets(this.wallet,ticker,1);
            if(!this.phrase) this.phrase = ""; // TODO for test
            return resolve(await mnemonicToWallet.converterMnemonicToAddress(this.phrase));
        })
    }

    generatePrivKey(ticker){
        return new Promise(async(resolve,reject)=>{
            let mnemonicToWallet = new MnemonicToWallets(this.wallet,ticker,1);
            return resolve(await mnemonicToWallet.converterMnemonicToPrivkey(this.phrase));
        })
    }
}

module.exports = GenerateAddressAndPrivkey;