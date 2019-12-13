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
import AtomicSwapBtcTest from './AtomicSwapBtcTest';
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
import CryptoJS from 'crypto-js';
import moment from 'moment';
import cryptoRandomString from 'crypto-random-string';
import {
    BTCTESTAPIPROVIDER,
    APITOKENDEV,
    ETALONOX,
} from '../../constants';

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
            this.protocols.bchtest = new BitcoinCashTestLib(this);        
            this.protocols.ethtest = new EthereumTestLib(this);
            this.protocols.ltctest = new LitecoinTestLib(this);
            this.protocols.dashtest = new DashTestLib(this);
            this.atomicSwaps.btctest = new AtomicSwapBtcTest(this)
            this.atomicSwaps.ethtest = new AtomicSwapEthTest(this);
        }
        this.mnemonic = new Mnemonic();
        this.randomizer = new Randomizer(0, 255);
        console.log(`Atomic wallet is working in ${process.env.ENVIRONMENT_BG}`);
        this.password;
    }

    createOrder(data){
        return new Promise(async(resolve, reject)=>{
            try{
                data["status"] = "CREATED";
                if(data.buyTicker === "btctest"){
                    let result = await this.atomicSwaps.btctest.createOrderInDB(data);
                    this.monitoringBuyer(result.id)
                    return resolve(result);
                }else if(data.buyTicker === "ethtest"){
                    let result = await this.atomicSwaps.ethtest.createOrderInDB(data);
                    this.monitoringBuyer(result.id)
                    return resolve(result);
                }
                else alert("createOrder in WI WRONG")
            }catch (e) {
                return reject(e);
            }
        });
    }

    monitoringBuyer(id){
        let monitoring = setInterval(async() => {
            let order = await this.getOrderById(id);
            let status = order[0].status;
            console.log(status)
            if(status == "INPROCESS" && order[0].txHashBtc != ""){
                let url = `${BTCTESTAPIPROVIDER}txs/${order[0].txHashBtc}?token=${APITOKENDEV}`;
                let result = await this.httpService.getRequest(url).then(response=>response.json());
                let confirmations = result.confirmations
                if(confirmations > 0) {
                    let createTxHash = await this.atomicSwaps.ethtest.createOrder(
                        order[0].sellAmount,
                        order[0].hashedSecret,
                        order[0].refundTime,
                        order[0].addressSellerToReceive
                    )
                    url = `http://localhost:8600/order/${id}/txHashEth/${createTxHash}`;
                    await this.httpService.putRequest(url).then(response=>response.json());
                    status = "ORDERCREATEDINSC";
                    url = `http://localhost:8600/order/${id}/status/${status}`;
                    await this.httpService.putRequest(url).then(response=>response.json());
                }else console.log("confirmations = 0")
            }else if(status == "REDEEMORDERSC"){
                let secret = await this.atomicSwaps.ethtest.getSecretSwap(order[0].hashedSecret)

                if(!(secret == ETALONOX)){
                    let recipientPublicKey = await this.atomicSwaps.btctest.privKeyToPublicKey()
                    const scriptValues = {
                        secretHash: order[0].hashedSecret.slice(2),
                        ownerPublicKey: order[0].publicKeySeller,
                        recipientPublicKey, 
                        locktime: order[0].refundTime
                    }
                    let amount = order[0].buyAmount;
                    let txHash = await this.atomicSwaps.btctest.withdrawRawTransaction({scriptValues, secret, amount})
                    console.log("txHash ", txHash)

                    status = "WITHDRAWTXBTC";
                    let url = `http://localhost:8600/order/${id}/status/${status}`;
                    await this.httpService.putRequest(url).then(response=>response.json());
                    console.log("clearInterval")
                    clearInterval(monitoring)
                }
            }
        }, 60000);
    }

    async replyToOrder(dataOrder){
        try{
            let id = dataOrder.idOrder;
            let password = cryptoRandomString({length:16});
            this.password = password;
            let secretHash = this.atomicSwaps.ethtest.stringToSHA(password);
            await this.addHashedSecret(id, secretHash)
            let addressSellerToReceive = await this.generateAddressAndPrivkey.generateAddress("ETH")
            let url = `http://localhost:8600/order/${id}/addressSellerToReceive/${addressSellerToReceive}`;
            await this.httpService.putRequest(url).then(response=>response.json());
            let status = "INPROCESS"
            url = `http://localhost:8600/order/${id}/status/${status}`;
            await this.httpService.putRequest(url).then(response=>response.json());

            let ownerPublicKey = await this.atomicSwaps.btctest.privKeyToPublicKey()
            url = `http://localhost:8600/order/${id}/publicKeySeller/${ownerPublicKey}`;
            await this.httpService.putRequest(url).then(response=>response.json());
            let order = await this.getOrderById(id);
            let recipientPublicKey = order[0].publicKeyBuyer;
            let locktime = await this.atomicSwaps.ethtest.getTimestampPlusHour();
            url = `http://localhost:8600/order/${id}/refundTime/${locktime}`;
            await this.httpService.putRequest(url).then(response=>response.json());
            let data = {
                secretHash,
                ownerPublicKey,
                recipientPublicKey,
                locktime
            }
            let scriptData = this.atomicSwaps.btctest.createScript(data);
            let scriptAddress = scriptData.scriptAddress;
            let txHash = await this.protocols.btctest.sendTransaction(scriptAddress, order[0].buyAmount)
            console.log("Swap txHash Btc", txHash)
            url = `http://localhost:8600/order/${id}/txHashBtc/${txHash}`;
            await this.httpService.putRequest(url).then(response=>response.json());
            await this.addScriptAddress(id,scriptAddress)
            this.monitoringSeller(id)
            return true;
        }catch(e){
            console.log(e)
        }
    }

    monitoringSeller(id){
        let monitoring = setInterval(async() => {
            let url = `http://localhost:8600/order/id/${id}`;
            let order = await this.httpService.getRequest(url).then(response=>response.json());
            let status = order[0].status;
            console.log(status)
            if(status == "ORDERCREATEDINSC"){
                let txInfo = await this.protocols.ethtest.web3.eth.getTransaction(order[0].txHashEth)
                console.log("txInfo.blockNumber", txInfo.blockNumber)
                if(txInfo.blockNumber){
                    status = "REDEEMORDERSC"
                    url = `http://localhost:8600/order/${id}/status/${status}`;
                    await this.httpService.putRequest(url).then(response=>response.json());
                    console.log("txInfo.blockNumber = ", txInfo.blockNumber)
                    let bytes32 = this.atomicSwaps.ethtest.stringToBytes32Internal(this.password);
                    let redeemOrder = await this.atomicSwaps.ethtest.redeemOrder(
                        order[0].hashedSecret,
                        bytes32,
                    )
                    console.log("redeemOrder ETH txHash", redeemOrder)
                    console.log("clearInterval")
                    clearInterval(monitoring)
                }
            }
        }, 60000);
    }

    async getOrders(){
        let url = `http://localhost:8600/all-orders`;
        let result = await this.httpService.getRequest(url).then(response=>response.json());
        return result;
    }

    async addHashedSecret(id, hashedSecret){
        let url = `http://localhost:8600/order/${id}/hashedSecret/${hashedSecret}`;
        let result = await this.httpService.putRequest(url).then(response=>response.json());
        return result;
    }

    async addScriptAddress(id, scriptAddress){
        let url = `http://localhost:8600/order/${id}/scriptAddress/${scriptAddress}`;
        let result = await this.httpService.putRequest(url).then(response=>response.json());
        return result;
    }

    async getOrderById(id){
        let url = `http://localhost:8600/order/id/${id}`;
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