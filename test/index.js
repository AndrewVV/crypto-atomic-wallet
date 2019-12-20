let chai = require('chai');
let should = chai.should();
let expect = chai.expect;
import WalletInterface from '../src/background/WalletInterface.js';
let walletInterface = new WalletInterface();

const testEthAddress = "0x959FD7Ef9089B7142B6B908Dc3A8af7Aa8ff0FA1"
const testEthPrivKey = "abf82ff96b463e9d82b83cb9bb450fe87e6166d4db6d7021d0c71d7e960d5abe";
const testBtcAddress = "mwgQKzcarE896qnUrr1tZ9WqphnBJwi4rp";
const amount = 0.001;
const fee = 0.000021;
const gasLimit = 21000;
const gasPrice = "0x3b9aca00";
const value = "0x38d7ea4c68000";

describe("Start of tests", () => {
    it("test randomizer", async () => {
        let result = await walletInterface.randomizer.resultRandomizer();
        expect(result.length).to.equal(16);
        result.should.to.be.an('array');
    })
})

describe("mnemonic tests", () => {
    it("Generation mnemonic", async () => {
        let mnemonic = await walletInterface.generateRandomPhrase();
        expect(mnemonic.toLowerCase()).to.equal(mnemonic);
        expect(mnemonic.length).to.above(50)
        mnemonic.should.to.be.an('string');
    })
})

describe("ETH test", () => {
    it("getBalance", async () => {
        let balance = await walletInterface.protocols.ethtest.getBalance(false, testEthAddress)
        balance.should.to.be.an('number');
    })

    it("formatTransactionParams", async() => {
        let data = await walletInterface.protocols.ethtest.formatTransactionParams(
            testEthAddress,
            testEthAddress,
            testEthPrivKey,
            amount,
            
        )
        data.should.to.be.an('object');
        expect(data.from).to.equal(data.to);
        expect(data.privateKey).to.equal(testEthPrivKey);
        expect(data.gasLimit).to.equal(gasLimit);
        expect(data.gasPrice).to.equal(gasPrice);
        expect(data.value).to.equal(value);
    })

    it("makeTransaction", async() =>{
        let data = {
            from: testEthAddress,
            to: testEthAddress,
            privateKey: testEthPrivKey,
            gasLimit,
            gasPrice,
            value
        }
        let txHash = await walletInterface.protocols.ethtest.makeTransaction(data)
        txHash.should.to.be.an("string")
        expect(txHash.slice(2).length).to.equal(64);
    })
})

describe("BTC test", () => {
    it("getBalance", async () => {
        let balance = await walletInterface.protocols.btctest.getBalance(false, testBtcAddress)
        balance.should.to.be.an('number');
    })

    it("createSignRawTx", async () => {
        let rawTx = await walletInterface.protocols.btctest.createSignRawTx(testBtcAddress,amount,fee);
        rawTx.should.to.be.an("string")
    })
})