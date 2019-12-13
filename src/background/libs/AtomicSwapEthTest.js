import abi from 'ethereumjs-abi';
import EthereumTestLib from './EthereumTestLib';
import {
    CONTRACT_ADDRESS,
    ABI,
    ETH,
    GASLIMITSC,
    ETALONOX,
} from '../../constants';
let bytes32;

export default class AtomicSwapEthTest extends EthereumTestLib{
    constructor(wallet){
        super(wallet)
        let contract = new this.web3.eth.Contract(ABI)
        contract.options.address = CONTRACT_ADDRESS;
        this.contract = contract;
    }

    async createOrderInDB(data){
        let url = "http://localhost:8600/create/order";
        data["addressToReceive"] = await this.generateAddAndPriv.generateAddress(ETH);
        data = JSON.stringify(data);
        let result = await this.httpService.postRequest(url, data).then(response=>response.json());
        return result;
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
        let txHash = await this.makeTransaction(params);
        console.log("createOrder txHash",txHash)
        return txHash;
    }

    async redeemOrder(hashedSecret, secret){
        let userAddress = await this.generateAddAndPriv.generateAddress(ETH);
        let userPrivateKey = await this.generateAddAndPriv.generatePrivKey(ETH);
        let data = this.contract.methods.redeem(hashedSecret, secret).encodeABI();
        let params = this.formatTransactionParams(userAddress,CONTRACT_ADDRESS, userPrivateKey, '0', "", GASLIMITSC, data);
        let txHash = await this.makeTransaction(params);
        console.log("redeemOrder txHash",txHash)
        return txHash;
    }

    async refund(hashedSecret){
        let userAddress = await this.generateAddAndPriv.generateAddress(ETH);
        let userPrivateKey = await this.generateAddAndPriv.generatePrivKey(ETH);
        let data = this.contract.methods.refund(hashedSecret).encodeABI();
        let params = this.formatTransactionParams(userAddress,CONTRACT_ADDRESS, userPrivateKey, '0', "", GASLIMITSC, data);
        let txHash = await this.makeTransaction(params);
        console.log("refund txHash",txHash)
        return txHash;
    }

    stringToSHA(string){
        let bytes32 = this.stringToBytes32Internal(string)
        console.log(bytes32)
        let sha256 = abi.soliditySHA256([ "bytes32" ], [bytes32]) // SHA
        sha256 = "0x"+sha256.toString("hex")
        console.log(sha256)
        return sha256;
    }

    stringToBytes32Internal(string){
        var result = this.web3.utils.fromAscii(string);
        if(result.length != ETALONOX.length){
            let length = ETALONOX.length - result.length
            bytes32 = this.addingZero(result,length)
        }
        return bytes32
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