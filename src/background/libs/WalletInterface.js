// import EdcLib from './EdcLib.js';
// import EcroLib from './EcroLib.js';
// import EdcTestLib from './EdcTestLib.js';
// import EcroTestLib from './EcroTestLib.js';
import EthereumLib from './EthereumLib';
import EthereumTestLib from './EthereumTestLib';
import BitcoinLib from './BitcoinLib';
import BitcoinTestLib from './BitcoinTestLib';
import BitcoinLibBip49 from './BitcoinLibBip49';
import BitcoinTestLibBip49 from './BitcoinTestLibBip49';
import BitcoinCashLib from './BitcoinCashLib';
import BitcoinCashTestLib from './BitcoinCashTestLib.js';
import LitecoinLib from './LitecoinLib';
import LitecoinTestLib from './LitecoinTestLib';
import DashLib from './DashLib';
import DashTestLib from './DashTestLib';
import AtomicSwapEth from './AtomicSwapEth';
import AtomicSwapEthTest from './AtomicSwapEthTest';
import Validator from '../core/utilites/Validator';
import Logger from '../core/utilites/Logger';
import Mnemonic from "../core/ianColeman/mnemonicToWallets/jsbip39";
import Randomizer from "../core/ianColeman/SafeRandom.js";
import GenerateAddressAndPrivkey from '../core/ianColeman/mnemonicToWallets/GenerateAddressAndPrivkey.js';
import Networks from '../core/ianColeman/networks.js';
import HttpService from '../core/services/HttpService.js';
import ExchangeRates from '../core/services/ExchangeRates.js';
// import blockchain from "./edc/blockchain";
import CryptoJS from 'crypto-js';
import moment from 'moment';
import cryptoRandomString from 'crypto-random-string';

export default class WalletInterface { 
    constructor(){
        this.networks = Networks;
        this.logger = new Logger();
        this.validator = new Validator();
        this.httpService = new HttpService();
        this.exchangeRates = new ExchangeRates();
        this.generateAddressAndPrivkey = new GenerateAddressAndPrivkey(this)
        this.protocols = {};
        this.atomicSwaps = {};
        if(process.env.ENVIRONMENT_BG === "production"){
            // this.protocols.edc = new EdcLib(this, blockchain)
            // this.protocols.ecro = new EcroLib(this)
            this.protocols.btc = new BitcoinLib(this);
            this.protocols.btc49 = new BitcoinLibBip49(this);
            this.protocols.bch = new BitcoinCashLib(this);
            this.protocols.eth = new EthereumLib(this);
            this.protocols.ltc = new LitecoinLib(this);
            this.protocols.dash = new DashLib(this);
            this.atomicSwaps.eth = new AtomicSwapEth(this);
        }else if(process.env.ENVIRONMENT_BG === "development"){
            // this.protocols.edctest = new EdcTestLib(this, blockchain)
            // this.protocols.ecrotest = new EcroTestLib(this)
            this.protocols.btctest = new BitcoinTestLib(this);
            this.protocols.btc49test = new BitcoinTestLibBip49(this);
            this.protocols.bchtest = new BitcoinCashTestLib(this);        
            this.protocols.ethtest = new EthereumTestLib(this);
            this.protocols.ltctest = new LitecoinTestLib(this);
            this.protocols.dashtest = new DashTestLib(this);
            this.atomicSwaps.ethtest = new AtomicSwapEthTest(this);
        }
        this.mnemonic = new Mnemonic();
        this.randomizer = new Randomizer(0, 255);
        console.log(`Atomic wallet is working in ${process.env.ENVIRONMENT_BG}`);
    }

    createOrder(data){
        return new Promise(async(resolve, reject)=>{
            try{
                let password = cryptoRandomString({length:16});
                console.log("password in WI",password)
                let hashedSecret = this.protocols.ethtest.stringToSHA(password);
                data["hashedSecret"] = hashedSecret;
                data["status"] = "CREATED";
                this.monitoringAtCreating(hashedSecret)
                if(data.buyTicker === "btctest"){
                    let result = await this.protocols.btctest.createOrder(data);
                    return resolve(result);
                }else if(data.buyTicker === "ethtest"){
                    let result = await this.protocols.ethtest.createOrder(data);
                    return resolve(result);
                }
                else alert("createOrder in WI WRONG")
            }catch (e) {
                return reject(e);
            }
        });
    }

    monitoringAtCreating(hashedSecret){
        let monitoring = setInterval(async() => {
            let url = `http://localhost:8600/order/${hashedSecret}`;
            let result = await this.httpService.getRequest(url).then(response=>response.json());
            let status = result[0].status;
            console.log(status)
            if(status == "INPROCESS"){
                // проверка конферма транзакции
                status = "ORDERCREATEDINSC";
                url = `http://localhost:8600/order/${result[0]._id}/status/${status}`;
                await this.httpService.putRequest(url).then(response=>response.json());
                let refundTime = await this.atomicSwaps.ethtest.getTimestampPlusHour();
                let createTxHash = await this.atomicSwaps.ethtest.createOrder(
                    result[0].sellAmount,
                    hashedSecret,
                    refundTime,
                    result[0].addressSellerToReceive
                )
                url = `http://localhost:8600/order/${result[0]._id}/tx-hash-eth/${createTxHash}`;
                await this.httpService.putRequest(url).then(response=>response.json());
                console.log("clearInterval")
                clearInterval(monitoring)
            }
        }, 5000);
    }

    async replyToOrder(data){
        try{
            let addressSellerToReceive = await this.generateAddressAndPrivkey.generateAddress("ETH")
            console.log(addressSellerToReceive, "addressSellerToReceive")
            let url = `http://localhost:8600/order/${data.idOrder}/addressSellerToReceive/${addressSellerToReceive}`;
            await this.httpService.putRequest(url).then(response=>response.json());
            let status = "INPROCESS"
            url = `http://localhost:8600/order/${data.idOrder}/status/${status}`;
            let result = await this.httpService.putRequest(url).then(response=>response.json());
            // создание биткоин скрипта
            // отправка продавцом buyAmount на адрес биткоин скрипта
            // сохранение хеша в БД
            // сохранение скрипт адреса в БД
            console.log("result in replyToOrder", result)
            this.monitoringAtReplying(data.idOrder)
            return result;
        }catch(e){
            console.log(e)
        }
    }

    monitoringAtReplying(id){
        let monitoring = setInterval(async() => {
            let url = `http://localhost:8600/order/id/${id}`;
            let result = await this.httpService.getRequest(url).then(response=>response.json());
            let status = result[0].status;
            console.log(status)
            if(status == "ORDERCREATEDINSC"){
                let txInfo = await this.protocols.ethtest.web3.eth.getTransaction(result[0].txHashEth)
                if(txInfo.blockNumber){
                    console.log(txInfo.blockNumber)
                    let publicKey = result[0].publicKey
                    console.log(publicKey)
                    console.log("clearInterval")
                    clearInterval(monitoring)
                    // создание биткоин скрипта
                    // отправка продавцом buyAmount на адрес биткоин скрипта
                }
            }
        }, 5000);
    }

    async getOrders(){
        let url = `http://localhost:8600/all-orders`;
        let result = await this.httpService.getRequest(url).then(response=>response.json());
        return result;
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
                    return resolve('Wrong password')
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

    sendTransaction(to,value,gasPrice,memo,from){
        return new Promise(async(resolve,reject)=>{
            try{
                let txHash = await this.protocol.sendTransaction(to,value,gasPrice,memo,from)
                return resolve(txHash);
            }catch (e) {
                return reject(e);
            }
        })
    }

    createAccount(nameAccount){
        return new Promise(async(resolve,reject)=>{
            try{
                let result = await this.protocol.createAccount(nameAccount)
                return resolve(result);
            }catch (e) {
                return reject(e);
            }
        })
    }

    seedToKey(seed){
        return new Promise(async(resolve,reject)=>{
            try{
                if(this.protocols.edc){
                    let result = await this.protocols.edc.seedToKey(seed);
                    return resolve(result);
                }else if(this.protocols.edctest){
                    let result = await this.protocols.edctest.seedToKey(seed);
                    return resolve(result);
                }
            }catch (e) {
                return reject(e);
            }
        })
    }

    brainKeyToNameAccount(brainKey){
        return new Promise(async(resolve,reject)=>{
            try{
                if(this.protocols.edc){
                    let result = await this.protocols.edc.brainKeyToNameAccount(brainKey);
                    return resolve(result);
                }else if(this.protocols.edctest){
                    let result = await this.protocols.edctest.brainKeyToNameAccount(brainKey);
                    return resolve(result);
                }
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
        console.log(result);
        return result;
    }

}