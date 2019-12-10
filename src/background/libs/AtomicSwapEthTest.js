import EthereumTestLib from './EthereumTestLib'
import {
    CONTRACT_ADDRESS,
    ABI,
    ETH,
    GASLIMITSC,
} from '../../constants';

export default class AtomicSwapEthTest extends EthereumTestLib{
    constructor(wallet){
        super(wallet)
        let contract = new this.web3.eth.Contract(ABI)
        contract.options.address = CONTRACT_ADDRESS;
        this.contract = contract;
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

}