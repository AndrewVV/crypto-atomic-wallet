import coinjs from './bchjs/coin.js';
import validator from 'wallet-address-validator';
import WeiConverter from '../core/helpers/WeiConverter';
import {
    BCH,
    BTCDECIMALS,
    BCHAPIPROVIDER,
    CONFIRM,
    PENDING,
    DEPOSIT,
    SEND,
    SELF,
    RATEUAHUSD,
} from '../../constants';

export default class BitcoinCashLibClass{
    constructor(wallet){
        this.generateAddAndPriv = wallet.generateAddressAndPrivkey;
        this.validator = wallet.validator;
        this.httpService = wallet.httpService;
        this.network = wallet.networks.BCHNETWORK
    }

    getBalance(raw=true){
        return new Promise(async(resolve,reject)=>{
            try{
                let address = await this.generateAddAndPriv.generateAddress(BCH);
                this.validator.validateBtcAddress(address)
                let url = `${BCHAPIPROVIDER}address/details/${address}`
                let result = await this.httpService.getRequest(url).then(response=>response.json());
                this.validator.validateObject(result);
                let balance = result.balance;
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
                let url = "https://kuna.io/api/v2/tickers/bchuah"
                result = await this.httpService.getRequest(url).then(response=>response.json())
                result = (result.ticker.last)/RATEUAHUSD
                if (!result){
                    result = 275;
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
                let url = `${BCHAPIPROVIDER}rawtransactions/sendRawTransaction/${rawTx}`
                let result = await this.httpService.getRequest(url).then(response=>response.json());
               	console.log('Транзакция отправлена')
                return resolve(result);
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
	  		to = await this.converterAddressToOld(to)
            amount = parseFloat(amount);
            fee = parseFloat(fee);
            this.validator.validateBtcAddress(to);
            this.validator.validateNumber(amount);
            this.validator.validateNumber(fee);

            amount = this.fromDecimals(amount);
            fee = this.fromDecimals(fee);
            amount = Math.round(amount)
            fee = Math.round(fee)

			let from = await this.generateAddAndPriv.generateAddress(BCH);
			from = await this.converterAddressToOld(from)
            this.validator.validateBtcAddress(from);

			let utxoData = await this.getUtxos(from, amount, fee);
    		let utxos = utxoData.outputs;
    		let change = utxoData.change;
        
			let tx = window.coinjs.transaction();
            let txouts = window.coinjs.Txouts();

    		for(let key in utxos){
        		tx.addinput(utxos[key].txid, utxos[key].vout, utxos[key].scriptPubKey)
        		txouts.addtxout(utxos[key].scriptPubKey, utxos[key].satoshis);
    		}

			tx.addoutput2(to, amount);
			tx.addoutput2(from, change);

			let txRawHash = tx.serialize()
			let txOutsHash = txouts.serialize()

    		let privKey = await this.generateAddAndPriv.generatePrivKey(BCH);
            this.validator.validateString(privKey);

			let signedTX = await this.signRawYx(privKey, txRawHash, txOutsHash)
			return resolve(signedTX)
		})
    }

    signRawYx(privKey, txRawHash, txOutsHash){
    	return new Promise(async(resolve,reject)=>{
    		let tx = window.coinjs.transaction();
    		let t = tx.deserialize(txRawHash);
            let txouts = window.coinjs.Txouts();
            txouts.deserialize(txOutsHash)
            let sighashType = '1'
            let signedTX = t.sign(privKey, sighashType, txouts.data);
    		return resolve(signedTX)
        })	
    }

    getUtxos(address,amount,fee){
        return new Promise(async(resolve,reject)=>{
            try{
	            this.validator.validateBtcAddress(address);
	            this.validator.validateNumber(amount);
	            this.validator.validateNumber(fee);

                let balance = await this.getBalance();
                balance = parseFloat(balance);
               	balance = this.fromDecimals(balance);
               	amount = parseFloat(amount);
               	amount = Math.round(amount)
               	fee = parseFloat(fee);
                if(balance >= amount+fee){
                    let allUtxo = await this.listUnspent(address);
                    let scriptPubKey = allUtxo.scriptPubKey
                    allUtxo = allUtxo.utxos;
                	let tmpSum = 0;
                	let requiredUtxo = [];
                	for(let key in allUtxo){
                    	if(tmpSum<amount+fee){
                            tmpSum+=parseFloat(allUtxo[key].satoshis);
                    		requiredUtxo.push({
                    	    	txid:allUtxo[key].txid,
                                vout:allUtxo[key].vout,
                                scriptPubKey:scriptPubKey,
                    	    	satoshis:allUtxo[key].satoshis
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
	            	alert("Insufficient balance: trying to send "+amount+" BCH + "+fee+" BCH fee when having "+balance+" BCH")
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
   	            let url = `${BCHAPIPROVIDER}address/utxo/${address}`
                let data = await this.httpService.getRequest(url).then(response=>response.json())
                let unspents = data;
                return resolve(unspents);
            }catch(e){
                return reject(e);
            }
        })
    }

    getTxHistory(){
        return new Promise(async(resolve,reject)=>{
            try{
                let address = await this.generateAddAndPriv.generateAddress(BCH);
                let result = [];
                let url = `${BCHAPIPROVIDER}address/transactions/${address}`
                let allTx = await this.httpService.getRequest(url).then(response=>response.json());
                if(allTx && allTx.txs.length > 0){
                    address = allTx.legacyAddress
                    allTx = allTx.txs;
                    for(let txKey in allTx){
                        let tx = allTx[txKey];
                            let timeStamp = tx.blocktime;
                            let status;
                            if(timeStamp){
                                status = CONFIRM;
                            }else{
                                status = PENDING;
                                timeStamp = new Date();
                                timeStamp = timeStamp.getTime()/1000; 
                            }
                            let hash = tx.txid;
                            let amount = Number(tx.vout[0].value);
                            let txFee = tx.fees;
                            let from = tx.vin[0].addr;
                            let to;
                            if(tx.vout[0].scriptPubKey.addresses){
                                to = tx.vout[0].scriptPubKey.addresses[0];
                            } else continue;
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
                            if(action == undefined) continue;
                            let rate = 285; // TODO there should be a request to API Binance 
                            let moneyQuantity = (amount*rate).toFixed(2); 
                            let id = result.length+1;
                            let txData = this.formatFrontTxData(timeStamp, id, action, status, amount, moneyQuantity, hash, from, to, txFee);
                            result.push(txData)
                    }
                }else result = [];
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
            explorer: 'https://explorer.bitcoin.com/bch/tx/'+hash,
            fromAddress: from,
            toAddress: to,
            txFee, 
		};
		return txData;
	}

    converterAddressToOld(address){
    	return new Promise(async(resolve,reject)=>{
            try{
                this.validator.validateBtcAddress(address)
                let url = `${BCHAPIPROVIDER}address/details/${address}`
                let result = await this.httpService.getRequest(url).then(response=>response.json());
                this.validator.validateObject(result);
                let legacyAddress = result.legacyAddress;
                return resolve(legacyAddress);            	
            }catch(e){
                return reject(e);
            }
        })    	
    }

    async validateAddress(address){
        address = await this.converterAddressToOld(address)
        if(address){
            return validator.validate(address, BCH);
        }else return false
    }

    getFee(){
        return new Promise(async(resolve,reject)=>{
            try{
                let url = `${BCHAPIPROVIDER}control/getNetworkInfo`;
                let result = await this.httpService.getRequest(url).then(response=>response.json())
                result = {
                    SLOW: result.relayfee*0.5,
                    AVARAGE: result.relayfee,
                    FAST: result.relayfee*2,
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