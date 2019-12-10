const GET_METHOD = 'GET';
const POST_METHOD = 'POST';
const PUT_METHOD = 'PUT';

class HttpService{
    constructor(){
    };

    postRequest(req_url,data,headers) {
        return new Promise(async(resolve,reject)=>{
            try{
                if(!headers){
                    headers = {"Content-Type": "application/json"};
                }
                var result = await this.httpRequest(POST_METHOD, req_url,data,headers)
                return resolve(result);
            }catch(e){
                return reject(e);
            }
        });
    };
    getRequest(req_url,data,headers) {
        return new Promise(async(resolve,reject)=>{
            try{
                var result = await this.httpRequest(GET_METHOD, req_url,data,headers)
                return resolve(result);
            }catch(e){
                return reject(e);
            }
        });
    };

    putRequest(req_url,data,headers) {
        return new Promise(async(resolve,reject)=>{
            try{
                var result = await this.httpRequest(PUT_METHOD, req_url,data,headers)
                return resolve(result);
            }catch(e){
                return reject(e);
            }
        });
    };
    
    httpRequest(method,req_url,data,headers={}){
        return new Promise(async(resolve,reject)=>{

            var options={
                body:data,
                method: method,
                headers: headers
            };
            fetch(req_url,options).then((res)=>{
                return resolve(res);
            }).catch(function (err) {
                return reject(err)
            });
        })
    }
}

export default HttpService;