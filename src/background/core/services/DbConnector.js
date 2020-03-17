const provider = 'http://51.38.158.241:8600/'

export default class DbConnector {
    constructor(wallet){
        this.httpService = wallet.httpService;
    }
    async getOrders(){
        let url = `${provider}all-orders`;
        let result = await this.httpService.getRequest(url).then(response=>response.json());
        return result;
    }

    async addHashedSecret(id, hashedSecret){
        let url = `${provider}order/${id}/hashedSecret/${hashedSecret}`;
        let result = await this.httpService.putRequest(url).then(response=>response.json());
        return result;
    }

    async addScriptAddress(id, scriptAddress){
        let url = `${provider}order/${id}/scriptAddress/${scriptAddress}`;
        let result = await this.httpService.putRequest(url).then(response=>response.json());
        return result;
    }

    async getOrderById(id){
        let url = `${provider}order/id/${id}`;
        let result = await this.httpService.getRequest(url).then(response=>response.json());
        return result;
    }

    async addAddressSellerToReceive(id, addressSellerToReceive){
        let url = `${provider}order/${id}/addressSellerToReceive/${addressSellerToReceive}`;
        let result = await this.httpService.putRequest(url).then(response=>response.json());
        return result;
    }

    async changeOrderStatus(id, status){
        let url = `${provider}order/${id}/status/${status}`;
        let result = await this.httpService.putRequest(url).then(response=>response.json());
        return result;
    }

    async addPublicKeyBuyer(id, ownerPublicKey){
        let url = `${provider}order/${id}/publicKeyBuyer/${ownerPublicKey}`;
        let result = await this.httpService.putRequest(url).then(response=>response.json());
        return result;
    }

    async addPublicKeySeller(id, ownerPublicKey){
        let url = `${provider}order/${id}/publicKeySeller/${ownerPublicKey}`;
        let result = await this.httpService.putRequest(url).then(response=>response.json());
        return result;
    }

    async addRefundTime(id, locktime){
        let url = `${provider}order/${id}/refundTime/${locktime}`;
        let result = await this.httpService.putRequest(url).then(response=>response.json());
        return result;
    }

    async addTxHashBtc(id, txHash){
        let url = `${provider}order/${id}/txHashBtc/${txHash}`;
        let result = await this.httpService.putRequest(url).then(response=>response.json());
        return result;
    }

    async addTxHashEth(id, txHash){
        let url = `${provider}order/${id}/txHashEth/${txHash}`;
        let result = await this.httpService.putRequest(url).then(response=>response.json());
        return result;
    }

    async addInternalSecret(id, secret){
        let url = `${provider}order/${id}/secret/${secret}`;
        let result = await this.httpService.putRequest(url).then(response=>response.json());
        return result;
    }
}