import EdcLib from "./EdcLib";
import {ECRO_ID} from "../../constants";

export default class EcroLib extends EdcLib {

	getTxHistory(){
		return super.getTxHistory(ECRO_ID);
	}
	
    getBalance(raw=true, account, asset=ECRO_ID){
		return super.getBalance(raw, account, asset);
	}

	getCurrentRate(){
        return new Promise(async(resolve, reject)=>{
            try{
				let result = await super.getCurrentRate(ECRO_ID);
                return resolve(result) 
            }catch(e){
                return reject(e);
            }
        })
    }

    sendTransaction(toAccount, amount, fee, memo, fromAccount,asset=ECRO_ID){
		return new Promise(async(resolve,reject)=>{
			try{
				if(!fee){
					fee = 10;
				}
				amount = super.fromDecimals(amount,4).toString();
				let result;
				if(toAccount != fromAccount){
					result = await super.makeTransaction(toAccount, amount, fee, memo, fromAccount, asset);
				}else{
					result = "From and to - the same accounts";
				}
				return resolve(result)
			}catch(e){
    	        return reject(e);
    	    }
		})
	}

}