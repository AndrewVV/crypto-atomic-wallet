let chai = require('chai');
let should = chai.should();
let expect = chai.expect;
import WalletInterface from '../src/background/WalletInterface.js';
let walletInterface = new WalletInterface();

const btcAddress = "3PbJsixkjmjzsjCpi4xAYxxaL5NnxrbF9B";
const ltcAddress = "LSF4B96UyCy2WVaBGXz3UywSrBnKcRZDt9";
const testEthAddress = "0x959FD7Ef9089B7142B6B908Dc3A8af7Aa8ff0FA1"
const testEthPrivKey = "abf82ff96b463e9d82b83cb9bb450fe87e6166d4db6d7021d0c71d7e960d5abe";
const testBtcAddress = "mwgQKzcarE896qnUrr1tZ9WqphnBJwi4rp";
const testBchAddress = "qznwqlqtzgqkxpt6gp92da2peprj3202s53trwdn7t";
const testLtcAddress = "muHzNs9RLXJQebJPcNnQUQNFCmABQiCR9v";
const testDashAddress = "mwgQKzcarE896qnUrr1tZ9WqphnBJwi4rp"
const amount = 0.001;
const fee = 0.000021;
const gasLimit = 21000;
const gasPrice = "0x3b9aca00";
const value = "0x38d7ea4c68000";
const testRawTxEth = "0xf86c82159d843b9aca0082520894959fd7ef9089b7142b6b908dc3a8af7aa8ff0fa187038d7ea4c68000801ba09221e3037404c09caec0fe99f3ca533e9e186550533828bb53cf1df94f35bfa6a07a522525eeec3ee6e071965b144ad510afc1af4505f4848f15667e589622b0a8"

const secretHash = "0xb3d91bf8a23fa7eb3e26d53440e90a1273030c6eb869a07b04650edd9497b384";
const ownerPublicKey = "02eca60d98cc3cc2ee0973fb17da325b835708a778eaec2e135e58ab2c40705a64";
const recipientPublicKey = "0257e80887f60d814c053ccf0856ec780ebc18462fa2ebb92bd8fc2436c813424e";
const locktime = 1577185132;
let scriptValues = {
    secretHash,
    ownerPublicKey,
    recipientPublicKey,
    locktime
}
let testScriptAddress = "2N9EGTVfff9P5ztZx7os23aWCBtn2k45Z1z";

if(process.env.ENVIRONMENT_BG === "production"){
    describe("Start of tests", () => {
        it("Test randomizer", async () => {
            let result = await walletInterface.randomizer.resultRandomizer();
            expect(result.length).to.equal(16);
            result.should.to.be.an('array');
        })

        it("Generation mnemonic", async () => {
            let mnemonic = await walletInterface.generateRandomPhrase();
            expect(mnemonic.toLowerCase()).to.equal(mnemonic);
            expect(mnemonic.length).to.above(50)
            mnemonic.should.to.be.an('string');
        })
    })

    describe("BTC test", () => {
        it("getBalance", async () => {
            let balance = await walletInterface.protocols.btc.getBalance(false, btcAddress)
            balance.should.to.be.an('number');
        })
    
        it("createSignRawTx", async () => {
            let rawTx = await walletInterface.protocols.btc.createSignRawTx(btcAddress,amount,fee);
            rawTx.should.to.be.an("string")
            expect(rawTx.length).to.above(0)
        })
    })

    describe("ETH test", () => {
        it("createAddress", async () => {
            let address = await walletInterface.protocols.eth.createAddress()
            address.should.to.be.an('string');
            expect(address.slice(2).length).to.equal(40);
        })
    
        it("getBalance with address", async () => {
            let balance = await walletInterface.protocols.eth.getBalance(false, testEthAddress)
            balance.should.to.be.an('number');
        })
    
        it("formatTransactionParams", async() => {
            let data = await walletInterface.protocols.eth.formatTransactionParams(
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
    
        it("makeTransaction", async() => {
            let data = {
                from: testEthAddress,
                to: testEthAddress,
                privateKey: testEthPrivKey,
                gasLimit,
                gasPrice,
                value
            }
            let raw = await walletInterface.protocols.eth.makeTransaction(data)
            raw.should.to.be.an("string")
            expect(raw.length).to.above(0)
        })

        // it("sendSignedTransaction", async() => {
        //     let txHash = await walletInterface.protocols.ethtest.sendSignedTransaction(testRawTxEth)
        //     txHash.should.to.be.an("string")
        //     expect(txHash.slice(2).length).to.equal(64);
        // })
    })
}else if(process.env.ENVIRONMENT_BG === "development"){
    describe("Start of tests", () => {
        it("Test randomizer", async () => {
            let result = await walletInterface.randomizer.resultRandomizer();
            expect(result.length).to.equal(16);
            result.should.to.be.an('array');
        })

        it("Generation mnemonic", async () => {
            let mnemonic = await walletInterface.generateRandomPhrase();
            expect(mnemonic.toLowerCase()).to.equal(mnemonic);
            expect(mnemonic.length).to.above(50)
            mnemonic.should.to.be.an('string');
        })
    })

    describe("BTCTEST test", () => {
        it("getBalance", async () => {
            let balance = await walletInterface.protocols.btctest.getBalance(false, testBtcAddress)
            balance.should.to.be.an('number');
        })
    
        it("createSignRawTx", async () => {
            let rawTx = await walletInterface.protocols.btctest.createSignRawTx(testBtcAddress,amount,fee);
            rawTx.should.to.be.an("string")
            expect(rawTx.length).to.above(0)
        })
    })
    
    describe("ETHTEST test", () => {
        it("createAddress", async () => {
            let address = await walletInterface.protocols.ethtest.createAddress()
            address.should.to.be.an('string');
            expect(address.slice(2).length).to.equal(40);
        })
    
        it("getBalance with address", async () => {
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
    
        it("makeTransaction", async() => {
            let data = {
                from: testEthAddress,
                to: testEthAddress,
                privateKey: testEthPrivKey,
                gasLimit,
                gasPrice,
                value
            }
            let raw = await walletInterface.protocols.ethtest.makeTransaction(data)
            raw.should.to.be.an("string")
            expect(raw.length).to.above(0)
        })

        // it("sendSignedTransaction", async() => {
        //     let txHash = await walletInterface.protocols.ethtest.sendSignedTransaction(testRawTxEth)
        //     txHash.should.to.be.an("string")
        //     expect(txHash.slice(2).length).to.equal(64);
        // })
    })
    
    // describe("BCHTEST test", () => {
    //     it("getBalance", async () => {
    //         let balance = await walletInterface.protocols.bchtest.getBalance(false, testBchAddress)
    //         balance.should.to.be.an('number');
    //     })
    // })
    
    // describe("LTCTEST test", () => {
    //     it("getBalance", async () => {
    //         let balance = await walletInterface.protocols.ltctest.getBalance(false, testLtcAddress)
    //         console.log("balance", balance)
    //         balance.should.to.be.an('number');
    //     })
    
    //     it("createSignRawTx", async () => {
    //         let rawTx = await walletInterface.protocols.ltctest.createSignRawTx(testLtcAddress,amount,fee);
    //         rawTx.should.to.be.an("string")
    //         expect(rawTx.length).to.above(0)
    //     })
    // })
    
    
    // describe("DASHTEST test", () => {
    //     it("getBalance", async () => {
    //         let balance = await walletInterface.protocols.dashtest.getBalance(false, testDashAddress)
    //         console.log("balance", balance)
    //         balance.should.to.be.an('number');
    //     })
    
    //     it("createSignRawTx", async () => {
    //         let rawTx = await walletInterface.protocols.dashtest.createSignRawTx(testDashAddress,amount,fee);
    //         rawTx.should.to.be.an("string")
    //         expect(rawTx.length).to.above(0)
    //     })
    // })

    describe("ATOMIC SWAP BTCTEST", () => {
        it("create address script", () => {
            const {scriptAddress} = walletInterface.atomicSwaps.btctest.createScript(scriptValues)
            scriptAddress.should.to.be.an("string");
            expect(scriptAddress).to.equal(testScriptAddress);
        })
    })
}

// test moch
// describe('"grep" option', function(){
//     it('should add a RegExp to the mocha.options object', function(){
//       var mochHttpServise = new Mocha({ httpService: walletInterface.httpService });
//       console.log(mochHttpServise.options.httpService.getRequest)
//     })
// })