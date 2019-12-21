import abi from 'ethereumjs-abi';
import cryptoRandomString from 'crypto-random-string';
import EthereumTestLib from '../libs/EthereumTestLib.js';
import {
    CONTRACT_ADDRESS,
    ABI,
    ETH,
    GASLIMITSC,
    ETALON_OX,
    CREATED_ORDER,
    REPLIED_TO_ORDER,
    CREATED_ORDER_IN_SC,
    REDEEMED_ORDER_IN_SC,
    SEND_TX_BTC,
    WITHDRAW_TX_BTC,
} from '../../constants';

export default class AtomicSwapEthTest extends EthereumTestLib{
    constructor(wallet){
        super(wallet)
        this.wallet = wallet;
        let contract = new this.web3.eth.Contract(ABI)
        contract.options.address = CONTRACT_ADDRESS;
        this.contract = contract;
    }

    async createOrderInDB(data){
        let url = "http://localhost:8600/create/order";
        data["status"] = CREATED_ORDER;
        data["addressBuyerToReceive"] = await this.generateAddAndPriv.generateAddress(ETH);
        data = JSON.stringify(data);
        let result = await this.httpService.postRequest(url, data).then(response=>response.json());
        return result;
    }

    monitoringBuyer(id){
        let monitoring = setInterval(async() => {
            let order = await this.dbConnector.getOrderById(id);
            let status = order.status;
            console.log(status)
            if(status == REPLIED_TO_ORDER && order.txHashEth != ""){
                let txInfo = await this.web3.eth.getTransaction(order.txHashEth)
                if(txInfo.blockNumber){
                    let publicKeyBuyer = await this.wallet.atomicSwaps.btctest.privKeyToPublicKey();
                    await this.dbConnector.addPublicKeyBuyer(id, publicKeyBuyer)
                    let data = {
                        secretHash: order.hashedSecret,
                        ownerPublicKey: publicKeyBuyer,
                        recipientPublicKey: order.publicKeySeller,
                        locktime: order.refundTime
                    }
                    let scriptData = this.wallet.atomicSwaps.btctest.createScript(data);
                    let scriptAddress = scriptData.scriptAddress;
                    let txHash = await this.wallet.protocols.btctest.sendTransaction(scriptAddress, order.sellAmount)
                    console.log("Create swap txHash Btc", txHash)
                    await this.dbConnector.addTxHashBtc(id, txHash)
                    await this.dbConnector.addScriptAddress(id,scriptAddress)
                    await this.dbConnector.changeOrderStatus(id, SEND_TX_BTC)
                }
            }else if(status == WITHDRAW_TX_BTC){
                if(order.internalSecret != ""){
                    let txRedeemOrder = await this.redeemOrder(order.hashedSecret, order.internalSecret)
                    console.log("clearInterval, txRedeemOrder ETH ", txRedeemOrder)
                    clearInterval(monitoring)
                }else console.log("order.internalSecret = ", order.internalSecret)
            }
        }, 60000);
    }

    async replyToOrder(id, recipientPublicKey, buyAmount, addressBuyerToReceive, buyTicker){
        let password = cryptoRandomString({length:16});
        let secretHash = this.stringToSHA(password);
        console.log("secretHash", secretHash)
        await this.dbConnector.addHashedSecret(id, secretHash);
        let addressSellerToReceive = await this.generateAddAndPriv.generateAddress(ETH)
        await this.dbConnector.addAddressSellerToReceive(id, addressSellerToReceive)
        await this.dbConnector.changeOrderStatus(id, REPLIED_TO_ORDER)
        let ownerPublicKey = await this.wallet.atomicSwaps[buyTicker].privKeyToPublicKey();
        await this.dbConnector.addPublicKeySeller(id, ownerPublicKey)
        let locktime = await this.getTimestampPlusHour();
        await this.dbConnector.addRefundTime(id, locktime);
        let data = {
            secretHash,
            ownerPublicKey,
            recipientPublicKey,
            locktime
        }
        let scriptData = this.wallet.atomicSwaps[buyTicker].createScript(data);
        let scriptAddress = scriptData.scriptAddress;
        let txHash = await this.wallet.protocols[buyTicker].sendTransaction(scriptAddress, buyAmount)
        console.log("Swap txHash Btc", txHash)
        await this.dbConnector.addTxHashBtc(id, txHash)
        await this.dbConnector.addScriptAddress(id,scriptAddress)
        this.monitoringSeller(id, password)
        return true;
    }

    monitoringSeller(id, pw){
        let monitoring = setInterval(async() => {
            let order = await this.dbConnector.getOrderById(id);
            let status = order.status;
            console.log(status)
            if(status == CREATED_ORDER_IN_SC){
                let txInfo = await this.web3.eth.getTransaction(order.txHashEth)
                if(txInfo.blockNumber){
                    await this.dbConnector.changeOrderStatus(id, REDEEMED_ORDER_IN_SC)
                    let bytes32 = this.stringToBytes32Internal(pw);
                    console.log("bytes32 = ", bytes32)
                    let txRedeemOrder = await this.redeemOrder(order.hashedSecret, bytes32)
                    console.log("clearInterval, txRedeemOrder ETH ", txRedeemOrder)
                    clearInterval(monitoring)
                }
            }
        }, 60000);
    }

    async getTimestamp(){
        let timestamp = await this.contract.methods.getTimestamp().call();
        return timestamp;
    }

    async getTimestampPlusHour(){
        let timestamp = await this.contract.methods.getTimestampPlusHour().call();
        return timestamp;
    }

    async getBalanceSwap(hashedSecret){
        let balanceSwap = await this.contract.methods.getBalanceSwap(hashedSecret).call();
        return balanceSwap;
    }

    async getSecretSwap(hashedSecret){
        let secretSwap = await this.contract.methods.getSecretSwap(hashedSecret).call();
        return secretSwap;
    }

    async stringToBytes32(password){
        let bytes32 = await this.contract.methods.stringToBytes32(password).call();
        return bytes32;
    }

    async bytes32ToSHA256(secret){
        let hashedSecret = await this.contract.methods.bytes32ToSHA256(secret).call();
        console.log(hashedSecret)
        return hashedSecret;
    }

    async createOrder(amount, hashedSecret, refundTime, participant){
        let userAddress = await this.generateAddAndPriv.generateAddress(ETH);
        let userPrivateKey = await this.generateAddAndPriv.generatePrivKey(ETH);
        let data = this.contract.methods.initiate(hashedSecret, refundTime, participant).encodeABI();
        let params = this.formatTransactionParams(userAddress,CONTRACT_ADDRESS, userPrivateKey, amount, "", GASLIMITSC, data);
        let raw = await this.makeTransaction(params);
        let txHash = await this.sendSignedTransaction(raw);
        return txHash;
    }

    async redeemOrder(hashedSecret, secret){
        let userAddress = await this.generateAddAndPriv.generateAddress(ETH);
        let userPrivateKey = await this.generateAddAndPriv.generatePrivKey(ETH);
        let data = this.contract.methods.redeem(hashedSecret, secret).encodeABI();
        let params = this.formatTransactionParams(userAddress,CONTRACT_ADDRESS, userPrivateKey, '0', "", GASLIMITSC, data);
        let raw = await this.makeTransaction(params);
        let txHash = await this.sendSignedTransaction(raw);
        return txHash;
    }

    async refund(hashedSecret){
        let userAddress = await this.generateAddAndPriv.generateAddress(ETH);
        let userPrivateKey = await this.generateAddAndPriv.generatePrivKey(ETH);
        let data = this.contract.methods.refund(hashedSecret).encodeABI();
        let params = this.formatTransactionParams(userAddress,CONTRACT_ADDRESS, userPrivateKey, '0', "", GASLIMITSC, data);
        let raw = await this.makeTransaction(params);
        let txHash = await this.sendSignedTransaction(raw);
        return txHash;
    }

    stringToSHA(string){
        let bytes32 = this.stringToBytes32Internal(string)
        console.log(bytes32)
        let sha256 = abi.soliditySHA256([ "bytes32" ], [bytes32])
        sha256 = "0x"+sha256.toString("hex")
        console.log(sha256)
        return sha256;
    }

    stringToBytes32Internal(string){
        var result = this.web3.utils.fromAscii(string);
        if(result.length != ETALON_OX.length){
            let length = ETALON_OX.length - result.length
            result = this.addingZero(result,length)
        }
        return result
    }

    addingZero(string, length){
        for (let   i = 0;  i < length; i++) {
            string = string+"0"
        }
        return string
    }

    bytes32ToSHA(bytes32){
        let sha256 = abi.soliditySHA256([ "bytes32" ], [bytes32])
        sha256 = "0x"+sha256.toString("hex")
        return sha256;
    }

    stringTo2SHA(string){
        let bytes32 = this.stringToBytes32Internal(string)
        let sha256 = abi.soliditySHA256([ "bytes32" ], [abi.soliditySHA256([ "bytes32" ], [bytes32])]) // 2SHA
        sha256 = "0x"+sha256.toString("hex")
        return sha256;
    }

}