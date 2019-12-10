const WeiConverter = require('../core/helpers/WeiConverter');
const bitcoin = require('bitcoinjs-lib');
const token = 'dfd8006109664a708db0efc9b704c107';
const BTCDECIMALS = 8;

class BitcoinLibClass{
    constructor(wallet){
        this.generateAddAndPriv = wallet.generateAddressAndPrivkey;
        this.validator = wallet.validator;
        this.httpService = wallet.httpService;
        this.networks = wallet.networks.BTC49NETWORK
    }

    getBalance(raw=true){
        return new Promise(async(resolve,reject)=>{
            try{
                let address = await this.generateAddAndPriv.generateAddress("BTC49");
                this.validator.validateBtcAddress(address)
                let url = `https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`;
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
                let url = "https://kuna.io/api/v2/tickers/btcuah"
                result = await this.httpService.getRequest(url).then(response=>response.json())
                result = result.ticker.last
                if (!result){
                    result = 9100;
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
                let url = `https://api.blockcypher.com/v1/btc/main/txs/push?token=${token}`
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

    		let privKey = await this.generateAddAndPriv.generatePrivKey("BTC49");
            this.validator.validateString(privKey);
            let keyring = await bitcoin.ECPair.fromWIF(privKey,this.networks);
            let p2wpkh = bitcoin.payments.p2wpkh({ pubkey: keyring.publicKey, network: this.networks })
            let p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh, network: this.networks })
			let txb = new bitcoin.TransactionBuilder(this.networks)
			let from = await this.generateAddAndPriv.generateAddress("BTC49");
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
    		    txb.sign({
                    prevOutScriptType: 'p2sh-p2wpkh',
                    vin: i, 
                    keyPair: keyring,
                    redeemScript: p2sh.redeem.output,
                    witnessValue: utxos[key].value
                })
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

                let balance = await this.getBalance();
                if(balance >= amount+fee){
                    let allUtxo = await this.listUnspent(address);
                	let tmpSum = 0;
                	let requiredUtxo = [];
                	for(let key in allUtxo){
                    	if(tmpSum<=amount+fee){
                    		tmpSum+=allUtxo[key].value;
                    		requiredUtxo.push({
                    	    	txid:allUtxo[key].tx_hash,
                                vout:allUtxo[key].tx_output_n,
                                value:allUtxo[key].value
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
                        alert("Insufficient balance: trying to send "+amount+" BTC + "+fee+" BTC fee when having "+balance+" BTC")
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
                let url = `https://api.blockcypher.com/v1/btc/main/addrs/${address}?unspentOnly=true`
                let data = await this.httpService.getRequest(url).then(response=>response.json())
                let unspents = data.txrefs;
                return resolve(unspents);
            }catch(e){
                return reject(e);
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
module.exports = BitcoinLibClass;