"use strict";

let	api = require("edc-ws-js").Apis,
	{TransactionBuilder, PrivateKey} = require('edc-js');

const delay = t => new Promise(resolve => setTimeout(resolve, t));

class BlockchainController {
	
	constructor(url, user = '', password = '') {
		this.instance = null;
		this.dbAPI = null;
		this.secureAPI = null;
		this.historyAPI = null;
		this.connected = false;
		this.waitInit = false;
		this.socketUrl = url;
		this.blockchainUser = user;
		this.blockchainPassword = password;
		this.initSocket();
	}
	
	initializedSocketCb(fn) {
		if(this.connected) return fn();
		setTimeout(() => this.initializedSocketCb(fn), 100);
	}

	initSocket() {
		if (this.connected) {
			return Promise.resolve();
		}
		this.waitInit = true;
		let connectURL = this.socketUrl;
		console.log('Connecting to:', connectURL);
		this.instance = api.instance(connectURL, true, this.blockchainUser, this.blockchainPassword);
		return this.instance.init_promise
		.then((res) => {
			console.log("Connected to:", connectURL);
			this.dbAPI = this.instance.db_api();
			this.secureAPI = this.instance.secure_api() || this.dbAPI;
			this.historyAPI = this.instance.history_api();
			return delay(1000)
			.then(() => {
				this.waitInit = false;
				this.connected = true;
			})
		})
		.catch((err) => {
			// another attempt
			console.log('Error connecting to', connectURL, '. Will do another attempt in 1 sec.')
			return delay(1000)
			.then(() => this.initSocket());
		});
	}

	exec(method, params, cb) {
		let api;
		switch (method) {
			case 'get_objects':
			case 'get_account_blind_transfers2':
			case 'get_account_cheques':
				api = 'secureAPI';
			break;
			case 'get_account_history':
			case 'get_account_operation_history2':
			case 'get_account_operation_history4':
				api = 'historyAPI';
			break;
			default:
				api = 'dbAPI';
		}
		if (this.waitInit) {
			return delay(1000)
			.then(() => this.exec(method, params, cb));
		}
		
		if (!this.connected || !this[api]) {
			return this.initSocket()
			.then(() => this.exec(method, params, cb));
		}
		return this[api].exec(method, params)
		.then(result => {
			if (cb)
				return cb(null, result);
			else
				return result;
		})
		.catch(err => {
			if (/not open/.test(err)) {
				this.connected = false
				this.dbAPI = null;
				this.secureAPI = null;
				this.historyAPI = null;
				return delay(10000)
				.then(() => this.exec(method, params, cb));
			} else {
				console.log('EDC Blockchain API call error:', err);
				console.log(api, method, JSON.stringify(params));
				if (cb)
					return cb(err);
				else
					throw err;
			}
		})
	}
	
	compileTransaction(name, operationData, cb) {
		let call = this.compileTransactionUsingKey(name, operationData, config.keys.priv);
		if (cb) {
			call.then(result => {
				console.log('broadcasted');
				cb(null, result);
			})
			.catch(err => {
				console.log(err)
				cb(err)})
		} else
			return call;		
	}

	compileTransactionUsingKey(name, operationData, privateKey) {
		let tr = new TransactionBuilder();
		try {
			let transfer_op = null;
			transfer_op = tr.get_type_operation(name, operationData);
			tr.add_operation(transfer_op);
			let pk = PrivateKey.fromWif(privateKey);
			tr.add_signer(pk, pk.toPublicKey().toPublicKeyString());
			return tr.broadcast(() => console.log('sent'));
		} catch(e) {
			throw e;
		}
	}
}

module.exports = BlockchainController;