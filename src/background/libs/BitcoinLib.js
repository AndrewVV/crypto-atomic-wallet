const bitcoin = require('bitcoinjs-lib');
import validator from 'wallet-address-validator';
import WeiConverter from '../core/helpers/WeiConverter';
import {
    BTC,
    BTCDECIMALS,
    TXSIZE,
    BTCAPIPROVIDER,
    APITOKENPROD,
    CONFIRM,
    PENDING,
    DEPOSIT,
    SEND,
    SELF,
} from '../../constants';

export default class BitcoinLibClass{
    constructor(wallet){
        this.generateAddAndPriv = wallet.generateAddressAndPrivkey;
        this.validator = wallet.validator;
        this.httpService = wallet.httpService;
        this.networks = wallet.networks.BTCNETWORK
    }

    getBalance(raw=true, address){
        return new Promise(async(resolve,reject)=>{
            try{
                if (!address) address = await this.generateAddAndPriv.generateAddress(BTC);
                this.validator.validateBtcAddress(address)
                let url = `${BTCAPIPROVIDER}addrs/${address}/balance?token=${APITOKENPROD}`;
                let result = await this.httpService.getRequest(url).then(response=>response.json());
 				this.validator.validateObject(result);
                let balance = result.balance;
                if(!raw){
	                balance = this.toDecimals(balance)
                }
                this.validator.validateNumber(balance);
                return resolve(balance);
            }catch (e) {
                return reject(e);
            }
        });
    }

    getCurrentRate(){
        return new Promise(async(resolve, reject)=>{
            try{
                let result;
                let url = "https://kuna.io/api/v2/tickers/btcusdt"
                result = await this.httpService.getRequest(url).then(response=>response.json())
                result = result.ticker.last
                if (!result){
                    result = 9000;
                }
                return resolve(result) 
            }catch(e){
                return reject(e);
            }
        })
    }

    sendTransaction(to,amount,fee){
        return new Promise(async(resolve,reject)=>{
            try{
            	let rawTx = await this.createSignRawTx(to,amount,fee);
                let url = `${BTCAPIPROVIDER}txs/push?token=${APITOKENPROD}`
                let body= JSON.stringify({"tx": rawTx});
               	let result = await this.httpService.postRequest(url, body).then(response=>response.json())
               	console.log('Транзакция отправлена')
                return resolve(result.tx.hash);
            }catch (e) {
                return reject(e)
            }
        })
    }
    
  	createSignRawTx(to, amount,fee){
    	return new Promise(async(resolve,reject)=>{
	  		if(!fee){
	  			fee=0.0001;
	  		}
            amount = parseFloat(amount);
            fee = parseFloat(fee);
            this.validator.validateBtcAddress(to);
            this.validator.validateNumber(amount);
            this.validator.validateNumber(fee);
            amount = this.fromDecimals(amount);
            fee = this.fromDecimals(fee);
            amount = Math.round(amount)
            fee = Math.round(fee)

    		let privKey = await this.generateAddAndPriv.generatePrivKey(BTC);
            this.validator.validateString(privKey);
    		let keyring = await bitcoin.ECPair.fromWIF(privKey,this.networks);
			let txb = new bitcoin.TransactionBuilder(this.networks)
			let from = await this.generateAddAndPriv.generateAddress(BTC);
            this.validator.validateBtcAddress(from);
            let utxoData = await this.getUtxos(from, amount, fee);
    		let utxos = utxoData.outputs;
    		let change = utxoData.change;
    		for(let key in utxos){
        		txb.addInput(utxos[key].txid, utxos[key].vout)
    		}
            txb.addOutput(to, amount);
            txb.addOutput(from, change);
    		let i = 0;
    		for(let key in utxos){
    		    txb.sign(i, keyring)
    		    i++;
    		}
			let txHash = txb.build().toHex()
            this.validator.validateString(txHash);
			return resolve(txHash)
		})
    }

    getUtxos(address,amount,fee){
        return new Promise(async(resolve,reject)=>{
            try{
	            this.validator.validateBtcAddress(address);
	            this.validator.validateNumber(amount);
	            this.validator.validateNumber(fee);

                let balance = await this.getBalance(true, address);
                if(balance >= amount+fee){
                    let allUtxo = await this.listUnspent(address);
                	let tmpSum = 0;
                	let requiredUtxo = [];
                	for(let key in allUtxo){
                    	if(tmpSum<=amount+fee){
                    		tmpSum+=allUtxo[key].value;
                    		requiredUtxo.push({
                    	    	txid:allUtxo[key].tx_hash,
                    	    	vout:allUtxo[key].tx_output_n
                    		})
                    	}else{
                    		break;
	                    }
	                }
	                let change = tmpSum - amount - fee;
	                this.validator.validateNumber(change);
	                return resolve({
	                	"change":change,
	                    "outputs":requiredUtxo
	                });
	                }else{
                        amount = this.toDecimals(amount)
                        fee = this.toDecimals(fee)
                        balance = this.toDecimals(balance)
                        console.log("Insufficient balance: trying to send "+amount+" BTC + "+fee+" BTC fee when having "+balance+" BTC")
	                }
            }catch(e){
                return reject(e);
            }
        });
    }

    listUnspent(address){
        return new Promise(async(resolve,reject)=>{
            try{
   	            this.validator.validateBtcAddress(address);
                let url = `${BTCAPIPROVIDER}addrs/${address}?unspentOnly=true`
                let data = await this.httpService.getRequest(url).then(response=>response.json())
                let unspents = data.txrefs;
                return resolve(unspents);
            }catch(e){
                return reject(e);
            }
        })
    }

    getTxHistory(){
    	return new Promise(async(resolve,reject)=>{
    	    try{
                let address = await this.generateAddAndPriv.generateAddress(BTC);
                let result = [];
                let url = `${BTCAPIPROVIDER}addrs/${address}/full?token=${APITOKENPROD}`;
                let allTx = await this.httpService.getRequest(url).then(response=>response.json());
                if(allTx && allTx.txs.length > 0){
                    allTx = allTx.txs;
                    for(let txKey in allTx){
                        let tx = allTx[txKey];
                            let timeStamp = tx.confirmed;
                            let status;
                            if(timeStamp){
                                status = CONFIRM;
                            }else{
                                status = PENDING;
                                timeStamp = new Date()
                            }
                            timeStamp = new Date(timeStamp)
                            timeStamp = timeStamp.getTime()/1000; 
                            let hash = tx.hash;
                            let amount = tx.outputs[0].value;
                            amount = this.toDecimals(amount)
                            let txFee = tx.fees;
                            txFee = this.toDecimals(txFee);
                            let from = tx.inputs[0].addresses[0];
                            let to = tx.outputs[0].addresses[0];
                            let action;
                            if(to != from){
                                if(address == to){
                                    action = DEPOSIT;
                                }else if(address == from){
                                    action = SEND;
                                }
                            }else{
                                action = SELF;
                            }
                            let price = 9500; // TODO there should be a request to API Binance 
                            let moneyQuantity = (amount*price).toFixed(2); 
                            let id = result.length+1;
                            let txData = this.formatFrontTxData(timeStamp, id, action, status, amount, moneyQuantity, hash, from, to, txFee);
                            result.push(txData)
                    }
                }else result = [];
				console.log(result)
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
            explorer: `https://live.blockcypher.com/btc/tx/${hash}`,
            fromAddress: from,
            toAddress: to,
            txFee, 
		};
		return txData;
    }
    
    validateAddress(address){
        return validator.validate(address, BTC);
    }

    getFee(){
        return new Promise(async(resolve,reject)=>{
            try{
                let url = `https://api.blockcypher.com/v1/btc/main?token=${APITOKENPROD}`;
                let result = await this.httpService.getRequest(url).then(response=>response.json())
                result = {
                    SLOW: TXSIZE*this.toDecimals(result.low_fee_per_kb),
                    AVARAGE: TXSIZE*this.toDecimals(result.medium_fee_per_kb),
                    FAST: TXSIZE*this.toDecimals(result.high_fee_per_kb),
                }
                return resolve(result);
            }catch(e){
                return reject(e)
            }
        })
    }

    toDecimals(amount){
        return WeiConverter.formatToDecimals(amount,BTCDECIMALS);
    }
    fromDecimals(amount){
        return WeiConverter.formatFromDecimals(amount,BTCDECIMALS);
    }
}