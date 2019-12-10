const {ChainStore, PrivateKey, key, FetchChain, TransactionHelper, Aes, TransactionBuilder} = require("edc-js");
const WeiConverter = require('../core/helpers/WeiConverter');
const dictionary = require("./edc/dictionary_en")
let nameAccount;
let privKey;
import {
	EDC,
	ECRO,
	EDC_ID,
	ECRO_ID,
	ACCOUNT_CREATED,
	ACCOUNT_EXIST,
	MANY_ATTEMPTS,
	EDCTEST_NODE,
	EDCTEST_REGISTER_URL,
	DEPOSIT,
	SEND,
	SELF,
	CONFIRM,
} from "../../constants";

export default class EdcTestLib {
	constructor(wallet, blockchain){
		// this.generateAddAndPriv = wallet.generateAddressAndPrivkey;
		this.httpService = wallet.httpService;
		if(blockchain) this.blockchainProvider = new blockchain(EDCTEST_NODE);
	}

	brainKeyToNameAccount(brainKey){
		return new Promise(async(resolve,reject)=>{
			try{
				let accountId;
				let normalizу = key.normalize_brainKey(brainKey)
				for(let i=0;i<20;i++){
					let brainPrivKey = key.get_brainPrivateKey(normalizу, i)
					let pubKey = brainPrivKey.toPublicKey().toString();
					let privKeyInternal = brainPrivKey.toWif();
					accountId = await this.getKeyReferences(pubKey);
					if(accountId !== undefined){
						privKey = privKeyInternal;
						break;
					}
				}
				if(accountId !== undefined){
					nameAccount = await this.getAccountNameById(accountId)
				}else{
					console.log("Bad brainkey!")
				}
				return resolve(nameAccount)
			}catch(e){
    	        return reject(e);
    	    }
		})
	}

	getKeyReferences(publicKey){
		return new Promise(async(resolve,reject)=>{
    	    try{
				let method =  "get_key_references";
				let params = [[publicKey]]
				let result = await this.blockchainProvider.exec(method,params)
				return resolve(result[0][0])
			}catch(e){
				return reject(e);
			}
		})
	}

	getCurrentRate(asset = EDC_ID){
        return new Promise(async(resolve, reject)=>{
            try{
				let result;
                if(asset == EDC_ID){
					result = 0.01;
                }else if(asset == ECRO_ID){
					result = 1;
				}
                return resolve(result)
            }catch(e){
                return reject(e);
            }
        })
    }

    createAccount(nameAccount){
        return new Promise(async(resolve,reject)=>{
            try{
				let phrase = key.suggest_brain_key(dictionary);
				let data = await this.seedToKey(phrase);
				let pubKey = data.pubKey;
				let body = JSON.stringify({
					"account": {
						"name": nameAccount,
						"owner_key":pubKey,
						"active_key":pubKey,
						"memo_key":pubKey,
						"refcode":null,
						"referrer":""
					},
					"click":null
				})
				let result = await this.httpService.postRequest(EDCTEST_REGISTER_URL, body)
				result = await result.json();
				if(result.name){
					result = ACCOUNT_CREATED
				}else if(result.message == "Account exist"){
					result = ACCOUNT_EXIST
				}else if(Object.entries(result).length === 0){
					result = MANY_ATTEMPTS
				}
				let resultData = {
					result,
					phrase
				}
                return resolve(resultData);
            }catch (e) {
                return reject(e);
            }
        })
	}

	getTxHistory(asset = EDC_ID){
    	return new Promise(async(resolve,reject)=>{
    	    try{
				if(nameAccount === undefined) return [];
				let account = await this.getAccountIdByName(nameAccount)
				let result = [];
				let opId = "1.11.0";
				let method = "get_account_operation_history2";
				let params = [account, opId, 10, opId, "0"];
				let transactionsData = await this.blockchainProvider.exec(method,params)
				if(transactionsData && transactionsData.length > 0){
					for(let index in transactionsData){
                	    let tx = transactionsData[index];
						let txOp = tx.op[1];
						let assets = txOp.amount;
						let amount = 0;
						let txFee = 0;
                	    if(assets.asset_id == asset && asset == EDC_ID){
							amount = this.toDecimals(assets.amount);
							txFee = txOp.fee.amount;
						}else if(assets.asset_id == asset && asset == ECRO_ID){
							amount = this.toDecimals(assets.amount, 4);
							txFee = txOp.fee.amount;
                	    }else{
                	        continue;
						}
						let hash = tx.block_num;
						let timeStamp = tx.block_time;
						timeStamp = new Date(timeStamp)
						timeStamp = timeStamp.getTime()/1000;
                	    let from = txOp.from;
                	    let to = txOp.to;
						let action;
                	    if(to != from){
                	        if(account == to){
                	            action = DEPOSIT;
                	        }else if(account == from){
                	            action = SEND;
                	        }
                	    }else{
                	        action = SELF;
                	    }
						if(action == undefined) continue;
						let message;
                	    let nonce;
                	    let fromPublicKey;
						let toPublicKey;
                	    if(txOp.memo){
                	        message = txOp.memo.message;
                	        nonce = txOp.memo.nonce;
                	        fromPublicKey = txOp.memo.from;
                	        toPublicKey = txOp.memo.to;
                	    }
                	    if(message && message!==''){
                	        if(account===to && privKey){
								message = Aes.decrypt_with_checksum(PrivateKey.fromWif(privKey),fromPublicKey,nonce,message).toString("utf-8");
                	        }else if(account===from && privKey){
								message = Aes.decrypt_with_checksum(PrivateKey.fromWif(privKey),toPublicKey,nonce,message).toString("utf-8");
							}
						}
						let price = 0.01; // TODO there should be a request to API Binance
						if(asset == ECRO_ID) price = 1;
                	    let moneyQuantity = (amount*price).toFixed(2);
						let id = result.length+1;
						from = await this.getAccountNameById(from);
						to = await this.getAccountNameById(to);
						let txData = this.formatFrontTxData(timeStamp, id, action, amount, moneyQuantity, hash, from, to, txFee, message);
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

	formatFrontTxData(timeStamp, id, action, amount, moneyQuantity, hash, from, to, txFee, memo){
		let txData = {
            timeStamp,
            id,
            action,
            status: CONFIRM,
            cryptoAmount: amount,
            moneyQuantity,
            copy: `https://testnet-explorer.blockchain.mn/block/${hash}`,
            explorer: `https://testnet-explorer.blockchain.mn/block/${hash}`,
            fromAddress: from,
            toAddress: to,
			txFee,
			memo,
		};
		return txData;
	}

	seedToKey(seed){
		return new Promise(async(resolve,reject)=>{
			try{
				let normalizу = key.normalize_brainKey(seed)
				let brainPrivKey = key.get_brainPrivateKey(normalizу)
				let pubKey = brainPrivKey.toPublicKey().toString();
				let privKeyInternal = brainPrivKey.toWif();
				let data = {
					pubKey,
					privKeyInternal
				}
				privKey = privKeyInternal;
				return resolve(data)
			}catch(e){
    	        return reject(e);
    	    }
		})
	}

    getBalance(raw=true, account, asset=EDC_ID){
    	return new Promise(async(resolve,reject)=>{
    	    try{
				if(account === undefined) return null;
				let result = await ChainStore.getAccountAsync(account)
				result = result.toJS().balances[asset]
				let balance = await ChainStore.getObjectAsync(result).then(responce => {
				 	return responce;
				})
				balance = balance.get("balance");
				if(!raw && asset==EDC_ID){
                    balance = this.toDecimals(balance,3);
                }else if(!raw && asset==ECRO_ID){
					balance = this.toDecimals(balance,4);
				}
				return resolve(balance)
    	    }catch(e){
    	        return reject(e);
    	    }
		})
	}

    sendTransaction(toAccount, amount, fee, memo, fromAccount){
		return new Promise(async(resolve,reject)=>{
			try{
				if(!fee){
					fee = 1
				}
				amount = this.fromDecimals(amount,3).toString()
				let result;
				if(toAccount != fromAccount){
					result = await this.makeTransaction(toAccount, amount, fee, memo, fromAccount)
				}else{
					result = "From and to - the same accounts";
				}
				return resolve(result)
			}catch(e){
    	        return reject(e);
    	    }
		})
	}

	makeTransaction(toAccount, amount, fee, memo, fromAccount, asset=EDC_ID){
		return new Promise(async(resolve,reject)=>{
			try{
				let pKey = PrivateKey.fromWif(privKey);
				ChainStore.init().then(() => {
					let memoSender = fromAccount;
					let sendAmount;
					if(asset == EDC_ID){
						sendAmount = {
							amount,
							asset: EDC
						}
					}else if(asset == ECRO_ID){
						sendAmount = {
							amount,
							asset: ECRO
						}
					}
					Promise.all([
						FetchChain("getAccount", fromAccount),
						FetchChain("getAccount", toAccount),
						FetchChain("getAccount", memoSender),
						FetchChain("getAsset", sendAmount.asset),
						FetchChain("getAsset", sendAmount.asset)
					]).then((res)=> {
						let [fromAccount, toAccount, memoSender, sendAsset, feeAsset] = res;
						let memoFromKey = memoSender.getIn(["options","memo_key"]);
						let memoToKey = toAccount.getIn(["options","memo_key"]);
						let nonce = TransactionHelper.unique_nonce_uint64();
						let memo_object = {
							from: memoFromKey,
							to: memoToKey,
							nonce,
							message: Aes.encrypt_with_checksum(
								pKey,
								memoToKey,
								nonce,
								memo
							)
						}
						let tr = new TransactionBuilder()
						tr.add_type_operation( "transfer", {
							fee: {
								amount: fee,
								asset_id: feeAsset.get("id")
							},
							from: fromAccount.get("id"),
								to: toAccount.get("id"),
								amount: { amount: sendAmount.amount, asset_id: sendAsset.get("id") },
								memo: memo_object
							} )
						tr.set_required_fees().then(() => {
							tr.add_signer(pKey, pKey.toPublicKey().toPublicKeyString());
							tr.serialize();
							tr.broadcast();
							console.log("Транзакция отправлена");
						})
            		});
    			});
				return resolve("Транзакция отправлена")
			}catch(e){
    	        return reject(e);
    	    }
		})
	}

	getAccountInfo(account){
		return new Promise(async(resolve,reject)=>{
    	    try{
				let result = await ChainStore.getAccountAsync(account)
				if(result){
					result = result.toJS()
					return resolve(result)
				}else return resolve(false)
			}catch(e){
				return reject(e);
			}
		})
	}

	getAccountNameById(accountId){
        return new Promise(async(resolve,reject)=>{
            try{
                let method = "get_full_accounts";
                let params = [[accountId],true]
                let name = await this.blockchainProvider.exec(method,params)
                return resolve(name[0][1].account.name)
            }catch(e){
                return reject(e);
            }
        })
	}
	
    getAccountIdByName(accountName){
        return new Promise(async(resolve,reject)=>{
            try{
                let result = await this.getAccountInfo(accountName);
                return resolve(result['id']);
            }catch (e) {
                return reject(e);
            }
        })
	}

	async validateAddress(account){
		account = await this.getAccountInfo(account);
		if(account) {
			return true
		}else return false
    }

	toDecimals(amount, decimals=3){
        return WeiConverter.formatToDecimals(amount, decimals);
    }
    fromDecimals(amount, decimals=3){
        return WeiConverter.formatFromDecimals(amount, decimals);
    }

}
