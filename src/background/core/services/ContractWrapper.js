const fs = require('fs');
class ContractWrapper{
    constructor(provider,validator){
        this.provider = provider;
        this.validator = validator;
    }
    getContract(){
        return new Promise(async(resolve,reject)=>{
            try{
                let contractAddress= await this.getContractAddress();
                let abi = await this.getContractAbi();
                let contract= new this.provider.eth.Contract(
                    abi);
                contract.options.address=contractAddress;
                this.validator.validateObject(contract, 'Smart Contract');
                return resolve(contract);
            }catch (e) {
                return reject(e);
            }
        })
    }

    getContractAddress(){
        return new Promise((resolve,reject)=>{
            try{
                let result = process.env.CONTRACT_ADDRESS;
                this.validator.validateString(result,'Contract Address');
                return resolve(result);
            }catch(e){
                return reject(e);
            }
        });
    }

    getContractAbi(){
        return new Promise((resolve,reject)=>{
            try{
                let result = fs.readFileSync(process.env.ABI_PATH,'utf8');
                if(result){
                    this.validator.validateJson(result,'Contract ABI');
                    result = JSON.parse(result);
                    return resolve(result);
                }else{
                    throw new Error('Error Reading Contract Abi');
                }
            }catch(e){
                return reject(e);
            }
        });
    }
}
module.exports = ContractWrapper;