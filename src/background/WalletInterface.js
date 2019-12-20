import EthereumLib from './libs/EthereumLib';
import EthereumTestLib from './libs/EthereumTestLib';
import BitcoinLib from './libs/BitcoinLib';
import BitcoinTestLib from './libs/BitcoinTestLib';
import BitcoinLibBip49 from './libs/BitcoinLibBip49';
import BitcoinTestLibBip49 from './libs/BitcoinTestLibBip49';
// import BitcoinCashLib from './libs/BitcoinCashLib';
// import BitcoinCashTestLib from './libs/BitcoinCashTestLib.js';
import LitecoinLib from './libs/LitecoinLib';
import LitecoinTestLib from './libs/LitecoinTestLib';
import DashLib from './libs/DashLib';
import DashTestLib from './libs/DashTestLib';
import AtomicSwapBtcTest from './swaps/AtomicSwapBtcTest.js';
import AtomicSwapEth from './swaps/AtomicSwapEth';
import AtomicSwapEthTest from './swaps/AtomicSwapEthTest';
import AtomicSwapLtcTest from './swaps/AtomicSwapLtcTest';
import Validator from './core/utilites/Validator.js';
import Mnemonic from "./core/ianColeman/mnemonicToWallets/jsbip39";
import Randomizer from "./core/ianColeman/SafeRandom.js";
import GenerateAddressAndPrivkey from './core/ianColeman/mnemonicToWallets/GenerateAddressAndPrivkey.js';
import Networks from './core/ianColeman/networks.js';
import HttpService from './core/services/HttpService.js';
import ExchangeRates from './core/services/ExchangeRates.js';
import DbConnector from './core/services/DbConnector.js';
import CryptoJS from 'crypto-js';
import moment from 'moment';

export default class WalletInterface { 
    constructor(){
        this.networks = Networks;
        this.validator = new Validator();
        this.httpService = new HttpService();
        this.exchangeRates = new ExchangeRates();
        this.generateAddressAndPrivkey = new GenerateAddressAndPrivkey(this)
        this.dbConnector = new DbConnector(this)
        this.protocols = {};
        this.atomicSwaps = {};
        if(process.env.ENVIRONMENT_BG === "production"){
            this.protocols.btc = new BitcoinLib(this);
            this.protocols.btc49 = new BitcoinLibBip49(this);
            this.protocols.bch = new BitcoinCashLib(this);
            this.protocols.eth = new EthereumLib(this);
            this.protocols.ltc = new LitecoinLib(this);
            this.protocols.dash = new DashLib(this);
            this.atomicSwaps.eth = new AtomicSwapEth(this);
        }else if(process.env.ENVIRONMENT_BG === "development"){
            this.protocols.btctest = new BitcoinTestLib(this);
            this.protocols.btc49test = new BitcoinTestLibBip49(this);
            // this.protocols.bchtest = new BitcoinCashTestLib(this);        
            this.protocols.ethtest = new EthereumTestLib(this);
            this.protocols.ltctest = new LitecoinTestLib(this);
            this.protocols.dashtest = new DashTestLib(this);
            this.atomicSwaps.btctest = new AtomicSwapBtcTest(this)
            this.atomicSwaps.ethtest = new AtomicSwapEthTest(this);
            this.atomicSwaps.ltctest = new AtomicSwapLtcTest(this)
        }
        this.mnemonic = new Mnemonic();
        this.randomizer = new Randomizer(0, 255);
        console.log(`Atomic wallet is working in ${process.env.ENVIRONMENT_BG}`);
    }

    createOrder(data){
        return new Promise(async(resolve, reject)=>{
            try{
                let result = await this.atomicSwaps[data.buyTicker].createOrderInDB(data);
                this.atomicSwaps[data.buyTicker].monitoringBuyer(result.id)
                return resolve(result);
            }catch (e) {
                return reject(e);
            }
        });
    }

    async replyToOrder(idOrder){
        try{
            let order = await this.dbConnector.getOrderById(idOrder.id);
            let result = await this.atomicSwaps[order.sellTicker].replyToOrder(
                idOrder.id,
                order.publicKeyBuyer,
                order.buyAmount,
                order.addressBuyerToReceive,
                order.buyTicker
            )
            return result;
        }catch(e){
            console.log(e)
        }
    }

    generateRandomPhrase() {
        return new Promise(async(resolve, reject)=>{
            let data = await this.randomizer.resultRandomizer();
            const words = this.mnemonic.toMnemonic(data);
            return resolve(words);
        });
    }

    encryptMnemonic(mnemonic, password) {
        return new Promise(async(resolve, reject)=>{
            try{
                let ciphertext = CryptoJS.AES.encrypt(mnemonic, password)
                ciphertext = ciphertext.toString()
                return resolve(ciphertext)
            }catch(e){
                return reject(e)
            }
        });
    }

    decryptMnemonic(ciphertext, password) {
        return new Promise(async(resolve, reject)=>{
            try{
                let bytes = CryptoJS.AES.decrypt(ciphertext, password);
                try{
                    let plaintext = bytes.toString(CryptoJS.enc.Utf8);
                    return resolve(plaintext);
                }catch(e){
                    return resolve(null)
                }            
            }catch(e){
                return reject(e);
            }
        });
    }

    getTxHistory(){
        return new Promise(async(resolve,reject)=>{
            try{
                let result = await this.protocol.getTxHistory();
                result = this.frontInterlayer(result);
                return resolve(result);
            }catch (e) {
                return reject(e);
            }
        });
    }

    frontInterlayer(array){
        let history = [];
        let data = [];
        for(let txKey in array){
            let tx = array[txKey];
            let newTimeStamp = moment(tx.timeStamp*1000).format('DD/MM/YYYY');
            if(history.length > 0){
                let lastTimeStamp = history[history.length - 1].timeStamp;
                if(newTimeStamp == lastTimeStamp){
                    data = history[history.length - 1].data;
                    data.push(tx)
                }else{
                    data = [];
                    data.push(tx)
                    let Data = {
                        timeStamp: newTimeStamp,
                        data: data
    
                    }
                    history.push(Data)
                }
            }else{
                data.push(tx)
                let Data = {
                    timeStamp: newTimeStamp,
                    data: data

                }
                history.push(Data)
            }

        }
        console.log(history)
        return history;
    }

    setBalance(account){
        return new Promise(async(resolve,reject)=>{
            try{
                let balance = await this.getBalance(false, account)
                return resolve(balance);
            }catch (e) {
                return reject(e);
            }
        });
    }

    getBalance(raw=true, account){
        return new Promise(async(resolve,reject)=>{
            try{
                let balance = await this.protocol.getBalance(raw, account);
                return resolve(balance);
            }catch (e) {
                return reject(e);
            }
        })
    }

    getCurrentRate(){
        return new Promise(async(resolve,reject)=>{
            try{
                let currentRate = await this.protocol.getCurrentRate();
                return resolve(currentRate);
            }catch (e) {
                return reject(e);
            }
        })
    }

    sendTransaction(to,value,gasPrice){
        return new Promise(async(resolve,reject)=>{
            try{
                let txHash = await this.protocol.sendTransaction(to,value,gasPrice)
                return resolve(txHash);
            }catch (e) {
                return reject(e);
            }
        })
    }

    changeProtocol(ticker){
        let chosenProtocol = this.protocols[ticker.toLowerCase()];
        this.setProtocol(chosenProtocol);
    }

    setProtocol(protocol){
        this.protocol = protocol;
    }

    validateAddress(address){
        return this.protocol.validateAddress(address.address);
    }

    async getFee(){
        let result = await this.protocol.getFee()
        return result;
    }

}