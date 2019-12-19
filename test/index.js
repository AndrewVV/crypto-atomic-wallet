let chai = require('chai');
let should = chai.should();
let expect = chai.expect;
import WalletInterface from '../src/background/WalletInterface.js';
let walletInterface = new WalletInterface();

describe("Start of tests", ()=>{

    it("test randomizer", async () => {
        let result = await walletInterface.randomizer.resultRandomizer();
        expect(result.length).to.equal(16);
        result.should.to.be.an('array');
    })

})