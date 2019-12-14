const bitcoin = require('bitcoinjs-lib');
const bitcoinjs = require("../core/ianColeman/mnemonicToWallets/bitcoinjs-3.3.2");
const net = bitcoin.networks.testnet;

import BitcoinTestLib from "./BitcoinTestLib";
import {
    BTCTEST,
    BTCTESTAPIPROVIDER,
    APITOKENDEV,
    ETALONOX
} from '../../constants';

export default class AtomicSwapBtcTest extends BitcoinTestLib{

    async createOrderInDB(data){
        try{
            let url = "http://localhost:8600/create/order";
            data["addressToReceive"] = await this.generateAddAndPriv.generateAddress(BTCTEST);
            data["publicKeyBuyer"] = await this.privKeyToPublicKey();
            data = JSON.stringify(data);
            let result = await this.httpService.postRequest(url, data).then(response=>response.json());
            return result;
        }catch (e){
            console.log(e)   
        }
    }

    monitoringBuyer(id){
        let monitoring = setInterval(async() => {
            let order = await this.dbConnector.getOrderById(id);
            let status = order[0].status;
            console.log(status)
            if(status == "INPROCESS" && order[0].txHashBtc != ""){
                let url = `${BTCTESTAPIPROVIDER}txs/${order[0].txHashBtc}?token=${APITOKENDEV}`;
                let result = await this.httpService.getRequest(url).then(response=>response.json());
                let confirmations = result.confirmations
                if(confirmations > 0) {
                    let createTxHash = await this.generateAddAndPriv.wallet.atomicSwaps.ethtest.createOrder(
                        order[0].sellAmount,
                        order[0].hashedSecret,
                        order[0].refundTime,
                        order[0].addressSellerToReceive
                    )
                    await this.dbConnector.addTxHashEth(id, createTxHash)
                    await this.dbConnector.changeOrderStatus(id, "ORDERCREATEDINSC")
                }else console.log("confirmations = 0")
            }else if(status == "REDEEMORDERSC"){
                let secret = await this.generateAddAndPriv.wallet.atomicSwaps.ethtest.getSecretSwap(order[0].hashedSecret)
                if(!(secret == ETALONOX)){
                    let recipientPublicKey = await this.privKeyToPublicKey()
                    const scriptValues = {
                        secretHash: order[0].hashedSecret.slice(2),
                        ownerPublicKey: order[0].publicKeySeller,
                        recipientPublicKey, 
                        locktime: order[0].refundTime
                    }
                    let amount = order[0].buyAmount;
                    let txHash = await this.withdrawRawTransaction({scriptValues, secret, amount})
                    await this.dbConnector.changeOrderStatus(id, "WITHDRAWTXBTC")
                    console.log("clearInterval, txHash", txHash)
                    clearInterval(monitoring)
                }
            }
        }, 60000);
    }

    createScript(data) {
        let {secretHash, ownerPublicKey, recipientPublicKey, locktime} = data
        if(secretHash.charAt(0)+secretHash.charAt(1) == "0x") secretHash = secretHash.slice(2);
        const script = bitcoin.script.compile([
            bitcoin.opcodes.OP_SHA256,
            Buffer.from(secretHash, 'hex'),
            bitcoin.opcodes.OP_EQUALVERIFY,
            Buffer.from(recipientPublicKey, 'hex'),
            bitcoin.opcodes.OP_EQUAL,
            bitcoin.opcodes.OP_IF,
            Buffer.from(recipientPublicKey, 'hex'),
            bitcoin.opcodes.OP_CHECKSIG,
            bitcoin.opcodes.OP_ELSE,
            bitcoin.script.number.encode(locktime),
            bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
            bitcoin.opcodes.OP_DROP,
            Buffer.from(ownerPublicKey, 'hex'),
            bitcoin.opcodes.OP_CHECKSIG,
            bitcoin.opcodes.OP_ENDIF,
        ])
        let scriptAddress = bitcoin.payments.p2sh({
            redeem: { output: script, network: net },
            network: net
        })
        scriptAddress = scriptAddress.address
        console.log("scriptAddress in createScript:",scriptAddress)
        return {
            scriptAddress,
            script,
        }
    }

    async withdrawRawTransaction(data, isRefund) {
        let { scriptValues, secret , amount } = data
        amount = parseFloat(amount);
        amount = this.fromDecimals(amount);
        amount = Math.round(amount);
        if(secret.charAt(0)+secret.charAt(1) == "0x") secret = secret.slice(2);
        const { script, scriptAddress } = this.createScript(scriptValues)
      
        const tx  = new bitcoinjs.bitcoin.TransactionBuilder(net) 
        const feeValue = 1000; // TODO how to get this value
        amount = amount - feeValue;
        let utxoData = await this.getUtxos(scriptAddress, amount, feeValue);
        let utxos = utxoData.outputs;
        console.log("utxos", utxos)
        let txid = utxos[0].txid;
        let vout = utxos[0].vout;
        const totalUnspent = amount;
        
        // if (BigNumber(totalUnspent).isLessThan(feeValue)) {
        //     throw new Error(`Total less than fee: ${totalUnspent} < ${feeValue}`)
        // }
        // if (isRefund) {
        //     tx.setLockTime(scriptValues.lockTime)
        // }
        tx.addInput(txid, vout, 0xfffffffe)
        let recipientAddress = await this.generateAddAndPriv.generateAddress(BTCTEST);
        tx.addOutput(recipientAddress, totalUnspent)

        let txRaw = tx.buildIncomplete()
        txRaw = await this.signTransaction({script,secret,txRaw})
        txRaw = txRaw.toHex()
        let txHash = await this.sendRawTransaction(txRaw)
        return txHash;
    };

    async signTransaction(data, inputIndex = 0) {
        const { script, txRaw, secret } = data
        const hashType = bitcoin.Transaction.SIGHASH_ALL
        const signatureHash = txRaw.hashForSignature(inputIndex, script, hashType)
        let recipientPrivateKey = await this.generateAddAndPriv.generatePrivKey(BTCTEST);
        let keyring = bitcoinjs.bitcoin.ECPair.fromWIF(recipientPrivateKey,net);
        let signature = keyring.sign(signatureHash)
        signature = signature.toScriptSignature(hashType)
        const scriptSig = bitcoinjs.bitcoin.script.scriptHash.input.encode(
            [
                signature,
                keyring.getPublicKeyBuffer(),
                Buffer.from(secret.replace(/^0x/, ''), 'hex'),
            ],
            script,
        )
    
        txRaw.setInputScript(inputIndex, scriptSig)
        return txRaw;
      }

    async privKeyToPublicKey(){
        let privKey = await this.generateAddAndPriv.generatePrivKey(BTCTEST);
        let keyPair = bitcoin.ECPair.fromWIF(privKey,this.networks)
        var publicKey = keyPair.publicKey.toString('hex')
        return publicKey;
    }

}