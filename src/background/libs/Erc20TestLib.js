import BigNumberHelper from '../core/helpers/BigNumberHelper';
import EthereumTestLib from '../libs/EthereumTestLib.js';
import {
    ETH,
    ERC20_ABI,
    DEFAULT_ERC20_ADDRESS,
    DEFAULT_VALUE,
    GASLIMIT_ERC20,
} from '../../constants';

export default class Erc20TestLib extends EthereumTestLib{
	constructor(wallet){
        super(wallet);
		this.contract = new this.web3.eth.Contract(ERC20_ABI)
	}
	
	sendTransaction(to, value, gasPrice, smartContractAddress=DEFAULT_ERC20_ADDRESS){
        return new Promise(async(resolve,reject)=>{	
        	try{
                let userAddress = await this.generateAddAndPriv.generateAddress(ETH);
                let userPrivateKey = await this.generateAddAndPriv.generatePrivKey(ETH);
                value = this.fromDecimals(value)
                value = BigNumberHelper.toFixedBigValue(value)
                value = this.web3.utils.numberToHex(value);
                let data = this.formatTransactionParams(
                    userAddress,
                    smartContractAddress,
                    userPrivateKey,
                    DEFAULT_VALUE,
                    gasPrice,
                    GASLIMIT_ERC20,
                    this.contract.methods.transfer(to, value).encodeABI()
                );
                let raw = await this.makeTransaction(data);
                let txHash = await this.sendSignedTransaction(raw);
                return resolve(txHash);	
			}catch (e) {
                return reject(e);
            }
		});
	}

    getBalance(raw=true, smartContractAddress=DEFAULT_ERC20_ADDRESS) {
        return new Promise(async(resolve,reject)=>{
            try{
                let address = await this.generateAddAndPriv.generateAddress(ETH);
                this.contract.options.address = smartContractAddress;
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
}
