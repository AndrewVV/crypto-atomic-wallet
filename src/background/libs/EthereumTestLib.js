import Web3 from 'web3';
import EthereumTx  from 'ethereumjs-tx';
import validator from 'ethereum-address';
import NonceService from '../core/services/NonceService';
import WeiConverter from '../core/helpers/WeiConverter';
import {
    ETH,
    GASLIMIT,
    GWEIDECIMAL,
    ETHTESTAPIPROVIDER,
    APIETHERSCANKEY,
    INFURATESTNET,
    RATEUAHUSD,
    CONFIRM,
    DEPOSIT,
    SEND,
    SELF,
} from '../../constants';

export default class EthereumTestLibClass{
    constructor(wallet){
        this.generateAddAndPriv = wallet.generateAddressAndPrivkey;
        this.web3 = new Web3(new Web3.providers.HttpProvider(INFURATESTNET));
        this.validator = wallet.validator;
        this.nonceService = new NonceService(this.web3,this.validator);
        this.httpService = wallet.httpService;
        this.dbConnector = wallet.dbConnector;
    }

    getBalance(raw=true, address){
        return new Promise(async(resolve,reject)=>{
            try{
                if (!address) address = await this.generateAddAndPriv.generateAddress(ETH);
                let balance = await this.web3.eth.getBalance(address);
                if(!raw){
                    balance = this.toDecimals(balance);
                }
                return resolve(balance);
            }catch (e) {
                return reject(e);
            }
        });
    }

    sendTransaction(to,value,gasPrice){
        return new Promise(async(resolve,reject)=>{
            try{
                let userAddress = await this.generateAddAndPriv.generateAddress(ETH);
                let userPrivateKey = await this.generateAddAndPriv.generatePrivKey(ETH);
                // if(userAddress===to){
                //     throw new Error('To and From Addresses are the same');
                // }
                var data = this.formatTransactionParams(userAddress,to,userPrivateKey,value,gasPrice);
                return resolve(await this.makeTransaction(data));
            }catch (e) {
                return reject(e)
            }
        })
    }

    getCurrentRate(){
        return new Promise(async(resolve, reject)=>{
            try{
                let result;
                // BINANCE API
                // let url = 'https://www.binance.com/api/v3/ticker/price';
                // result = await this.httpService.getRequest(url).then(response=>response.json());
                // result = Number(result[12].price);
                let url = "https://kuna.io/api/v2/tickers/ethuah"
                result = await this.httpService.getRequest(url).then(response=>response.json())
                result = result.ticker.last;
                result = (result/RATEUAHUSD).toFixed(2);
                if (!result){
                    result = 180;
                }
                return resolve(result) 
            }catch(e){
                return reject(e);
            }
        })
    }

    getTxHistory(){
    	return new Promise(async(resolve,reject)=>{
    	    try{
                let address = await this.generateAddAndPriv.generateAddress(ETH);
                address = address.toLowerCase()
                let result = [];
                let url = `${ETHTESTAPIPROVIDER}?module=account&action=txlist&address=${address}&sort=desc&apikey=${APIETHERSCANKEY}`
                let allTx = await this.httpService.getRequest(url).then(response=>response.json());
                if(allTx.message == "OK"){
                    allTx = allTx.result;
                    for(let txKey in allTx){
                        let tx = allTx[txKey];
                        if(tx.value != 0){
                            let timeStamp = tx.timeStamp;
                            let hash = tx.hash;
                            let amount = tx.value;
                            amount = this.toDecimals(amount)
                            let txFee = tx.gasUsed*tx.gasPrice;
                            txFee = this.toDecimals(txFee);
                            let from = tx.from;
                            let to = tx.to;
                            let action;
                            if(to != from){
                                if(address == to){
                                    action = DEPOSIT;
                                }else if(address == from){
                                    action = SEND;
                                }
                            }else{
                                action = SELF;
                                if (result.length > 0) if(hash==result[result.length-1].copy) continue; 
                            }
                            let price = 180; // TODO there should be a request to API Binance 
                            let moneyQuantity = (amount*price).toFixed(2); 
                            let id = result.length+1;
                            let txData = this.formatFrontTxData(timeStamp, id, action, status=CONFIRM, amount, moneyQuantity, hash, from, to, txFee);
                            result.push(txData)
                            if(result.length > 9) break;
                        }
                    }
                }
				return resolve(result)
    	    }catch(e){
    	        return reject(e);
    	    }
		})
	}

	formatFrontTxData(timeStamp, id, action, status, amount, moneyQuantity, hash, from, to, txFee){
		let txData = {
            timeStamp,
            id,
            action,
            status,
            cryptoAmount: amount,
            moneyQuantity,
            copy: hash,
            explorer: 'https://ropsten.etherscan.io/tx/'+hash,
            fromAddress: from,
            toAddress: to,
            txFee, 
		};
		return txData;
	}

    createAddress(){
        return new Promise(async(resolve,reject)=>{
            try{
                let result = await this.web3.eth.accounts.create('');
                return resolve(result.address)
            }catch (e) {
                return reject(e);
            }

        })
    }

    formatTransactionParams(_from,_to,_privkey,_value='0',_gasPrice, _gasLimit=GASLIMIT,_data=''){
        if(!_gasPrice){
            _gasPrice="1";
        }else{
            _gasPrice = this.fromDecimals(_gasPrice/21 , 6)
        }
        this.validator.validateEthAddress(_from,'_From Address');
        this.validator.validateEthAddress(_to,'_To Address');
        this.validator.validateString(_privkey,'Private Key',true);
        try{
            this.validator.validateString(_value,'Value');            
        }catch(e){
            _value = _value.toString();
            this.validator.validateString(_value,'Value');
        }
        try{
            this.validator.validateString(_gasLimit,'Gas Limit');            
        }catch(e){
            _gasLimit = _gasLimit.toString();
            this.validator.validateString(_gasLimit,'Gas Limit');            
        }
        try{
            this.validator.validateString(_gasPrice,'Gas Price');
        }catch(e){
            _gasPrice = _gasPrice.toString();
            this.validator.validateString(_gasPrice,'Gas Price');
        }
        return {
            from:_from,
            to:_to,
            privateKey:_privkey,
            gasLimit:parseInt(_gasLimit),
            gasPrice:this.web3.utils.numberToHex(this.web3.utils.toWei(_gasPrice, 'gwei')),
            data:_data,
            value:this.web3.utils.numberToHex(this.web3.utils.toWei(_value))
        }
    }

    makeTransaction(params){
        return new Promise(async (resolve,reject)=>
        {
            try{
                let privKeyBuffer = new Buffer.from(params.privateKey,'hex');
                let nonce = await this.nonceService.getNextNonce(params.from);
                let txParams = {
                    nonce: nonce,
                    gasPrice: params.gasPrice,
                    gasLimit: params.gasLimit,
                    to: params.to,
                    value: params.value,
                    data: params.data,
                };
                let tx = new EthereumTx(txParams);
                tx.sign(privKeyBuffer);
                let raw = '0x' + tx.serialize().toString('hex');
                let result = await this.sendTransactionWithHash(raw);
                return resolve(result);
            }catch(e){
                return reject(e);
            }
        });
    }

    sendTransactionWithHash(raw_tx){
        return new Promise(async (resolve,reject)=>{
            await this.web3.eth.sendSignedTransaction(raw_tx).on('transactionHash', (hash)=>{
                return resolve(hash);
            }).on('error',(data)=>{
                return reject(data);
            });
        })
    }

    validateAddress(address){
        return validator.isAddress(address);
    }

    getFee(){
        return new Promise(async(resolve,reject)=>{
            try{
                let url = `https://ethgasstation.info/json/ethgasAPI.json`;
                let result = await this.httpService.getRequest(url).then(response=>response.json());
                let slow = this.toDecimals(Math.floor(result.safeLow/10)*GASLIMIT , GWEIDECIMAL);
                let medium = this.toDecimals(Math.floor(result.average/10)*GASLIMIT , GWEIDECIMAL);
                let fast = this.toDecimals(Math.floor(result.fast/10)*GASLIMIT , GWEIDECIMAL);
                result = {
                    SLOW: slow,
                    AVARAGE: medium,
                    FAST: fast,
                }
                return resolve(result);
            }catch(e){
                return reject(e)
            }
        })
    }
    
    toDecimals(amount, decimals){
        return WeiConverter.formatToDecimals(amount, decimals);
    }

    fromDecimals(amount, decimals){
        return WeiConverter.formatFromDecimals(amount, decimals);
    }    
}