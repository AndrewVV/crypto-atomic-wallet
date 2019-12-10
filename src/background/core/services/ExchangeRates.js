import HttpService from './HttpService.js';

export default class ExchangeRates{
    constructor(){
        this.httpService = new HttpService();
    }
    async getUahToUsdRate() {
        try{
            let url = "https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5"
            let result = await this.httpService.getRequest(url).then(response=>response.json())
            return result[0].sale;
        }catch(e){
            throw new Error('Some problem with request getUahToUsdRate in ExchangeRates');
        }
    }
}