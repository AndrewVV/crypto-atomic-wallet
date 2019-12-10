let Web3 = require('web3');
let EthereumTx  = require('ethereumjs-tx');
const NonceService = require('../core/services/NonceService');
const BigNumberHelper = require('../core/helpers/BigNumberHelper');
const EthAddressHelper = require('../core/helpers/EthAddressHelper');
const WeiConverter = require('../core/helpers/WeiConverter');
const EthereumLib = require('./EthereumLib');

class Erc20Lib extends EthereumLib{
	constructor(wallet){
        super(wallet);
        this.eth = wallet.protocols['eth'];
        this.generateAddAndPriv = wallet.generateAddressAndPrivkey;
        this.web3 = this.eth.web3;
        this.logger = wallet.logger;
        this.validator = wallet.validator;
        this.nonceService = this.eth.nonceService;
		let contract = this.web3.eth.Contract([ { "constant": false, "inputs": [ { "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "approve", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_spender", "type": "address" }, { "name": "_subtractedValue", "type": "uint256" } ], "name": "decreaseApproval", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_spender", "type": "address" }, { "name": "_addedValue", "type": "uint256" } ], "name": "increaseApproval", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "pause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "unpause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [], "name": "Pause", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Unpause", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "previousOwner", "type": "address" }, { "indexed": true, "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" } ], "name": "allowance", "outputs": [ { "name": "remaining", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "name": "balance", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [ { "name": "", "type": "uint8" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "founder", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "paused", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" } ]);
        let contractAddress = '0x8ada297b5d76311dc6eced550780982ecc85ca61';
        contract.options.address = contractAddress;
		this.contract = contract;
		// this.web3.eth.getBlockNumber((err,data)=>{
 	// 		console.log(`Number Block in Blockchain now is ${data}`);
		// });
	}
	
	sendTransaction(to,value,gasPrice){
        return new Promise(async(resolve,reject)=>{	
        	try{
                let userAddress = await this.generateAddAndPriv.generateAddress("ETH");
                let userPrivateKey = await this.generateAddAndPriv.generatePrivKey("ETH");
                value = this.web3.utils.numberToHex(this.fromDecimals(value));

                if(userAddress===to){
                    throw new Error('To and From Addresses are the same');
                }

                let params=this.eth.formatTransactionParams(
                    userAddress,
                    this.contract.address,
                    userPrivateKey,
                    '0',
                    gasPrice,
                    100000,
                    this.contract.methods.transfer(to, value).encodeABI()
                    );
                let txHash = await this.eth.makeTransaction(params);
                return resolve(txHash);	
			}catch (e) {
                return reject(e);
            }
		});
	}

    getBalance(raw=true) {
        return new Promise(async(resolve,reject)=>{
            try{
                let address = await this.generateAddAndPriv.generateAddress("ETH");
                let balance = await this.contract.methods.balanceOf(address).call();
                balance = BigNumberHelper.toFixedBigValue(balance);
                balance = parseInt(balance);
                if(!raw){
                    balance = this.toDecimals(balance);
                }
                return resolve(balance);
            }catch (e) {
                return reject(e);
            }
        });
    }

    toDecimals(amount){
        return WeiConverter.formatToDecimals(amount);
    }
    fromDecimals(amount){
        return WeiConverter.formatFromDecimals(amount);
    }    
}

module.exports = Erc20Lib;