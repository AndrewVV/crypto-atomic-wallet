import ActionsClass from '../common/class.actions.js';
const Actions = new ActionsClass();

$(document).ready(function() {
    $("#buy-crypto").on('input', ()=> {
        let buyTicker = document.getElementById("buy-crypto").value
        let sellTicker = document.getElementById("sell-crypto").value
        if(buyTicker === sellTicker && buyTicker === "ethtest") {
            document.getElementById("sell-crypto").value = "btctest"
        }else if (buyTicker === sellTicker && sellTicker === "btctest") {
            document.getElementById("sell-crypto").value = "ethtest"
        }else if (buyTicker === "ltctest") {
            document.getElementById("sell-crypto").value = "ethtest"
        } else alert("some problem with #buy-crypto")
    });

    $("#amount-for-purchase").on('input', ()=> {
        if(document.getElementById("buy-crypto").value === "btctest"){
            let amount = document.getElementById("amount-for-purchase").value
            $('#your-spend-amount').html(amount*50)
        }else if(document.getElementById("buy-crypto").value === "ethtest"){
            let amount = document.getElementById("amount-for-purchase").value
            $('#your-spend-amount').html(amount/50)
        }else if(document.getElementById("buy-crypto").value === "ltctest"){
            let amount = document.getElementById("amount-for-purchase").value
            $('#your-spend-amount').html(amount/4)
        }
    });

    $("#create-order").on("click", async ()=> {
        let buyTicker = document.getElementById("buy-crypto").value
        let sellTicker = document.getElementById("sell-crypto").value
        let buyAmount = document.getElementById("amount-for-purchase").value
        let sellAmount = document.getElementById("your-spend-amount").innerHTML
        let data = {buyTicker, buyAmount, sellTicker,sellAmount}
		let createOrder = await new Promise((resolve, reject) => {
			chrome.runtime.sendMessage({"action": (Actions.getBackground().createOrder), data}, response => {
  				resolve(response)
			});			
        })
        alert(createOrder.result)
    });

    $("#get-orders").click(async()=> {
        let result = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({"action": (Actions.getBackground().getOrders)}, response => {
                    resolve(response)
            });                 
        })
        result = JSON.stringify(result)
        $('#all-orders').html(result);       
    });

    $("#reply-to-order").click(async()=> {
        let id = document.getElementById("id-order").value
        let data = {id}
        let result = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({"action": (Actions.getBackground().replyToOrder), data}, response => {
                    resolve(response)
            });                 
        })
        console.log("All good in #reply-to-order")    
    });

    let ticker = document.getElementById("wallet-interface").value
    chrome.runtime.sendMessage({"action": (Actions.getBackground().changeProtocol),"data": ticker}); 
    
    $("#wallet-interface").on('input',async()=> {
        let ticker = document.getElementById("wallet-interface").value
        chrome.runtime.sendMessage({"action": (Actions.getBackground().changeProtocol),"data": ticker});
        console.log('changeProtocol ',ticker)
    });

    $("#generate-mnemonic").on("click", async ()=> {
    	let password = document.getElementById('password').value;
		let mnemonic = await new Promise((resolve, reject) => {
			chrome.runtime.sendMessage({"action": (Actions.getBackground().generationMnemonic)}, response => {
  				resolve(response)
			});			
		})
		$('#mnemonic').html(mnemonic);
		let data = {"password": password, "mnemonic": mnemonic}
		let ciphertext = await new Promise((resolve, reject) => {
			chrome.runtime.sendMessage({"action": (Actions.getBackground().getCiphertext), "data": data}, response => {
  				resolve(response)
			});					
		})
		chrome.storage.local.set({'ciphertext': ciphertext}, function() {
      		console.log('Ciphertext saved');
    	});
    });

    $("#open-wallet").on("click", async ()=> {
        let password = document.getElementById('password').value;
        if(!password){
            alert('Enter your password')
        }else{
            let ciphertext = await new Promise((resolve,reject) => {
    			chrome.storage.local.get(['ciphertext'], response => {
    				resolve(response)
    			});            	
            }) 
			let data = {"password": password, "ciphertext": ciphertext.ciphertext}
			let mnemonic = await new Promise((resolve, reject) => {
				chrome.runtime.sendMessage({"action": (Actions.getBackground().getMnemonic), "data": data}, response => {
  					resolve(response)
				});					
            })
            if(!mnemonic){
            	alert('Wrong password')
            }else{
                $('#open-wallet-done').html('Wallet is open');
            }
        }
    });

    $("#showaddress").click(async()=> {
        let ticker = document.getElementById("wallet-interface").value;
        if(ticker === "erc20test") ticker = "ethtest"
        ticker = ticker.toUpperCase();
        let data = {"ticker": ticker}
        let result = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({"action": (Actions.getBackground().getAddress), "data": data}, response => {
                resolve(response)
            });                 
        })
        console.log("Show address: ",result)
        $('#address').html(result);
    });

    $("#get-balance").click(async()=> {
        let result = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({"action": (Actions.getBackground().getBalance)}, response => {
                    resolve(response)
            });                 
        })
        console.log("Balance: ",result)
        $('#balance').html(result);       
    });

    $("#get-rate").click(async()=> {
        let result = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({"action": (Actions.getBackground().getCurrentRate)}, response => {
                    resolve(response)
            });                 
        })
        console.log("Current rate: ",result)
        $('#current-rate').html(result);       
    });

    $("#validate").click(async()=> {
        let address = document.getElementById('validate-address').value;
        let data = {address}
        let result = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({"action": (Actions.getBackground().validateAddress), data}, response => {
                    resolve(response)
            });                 
        })
        console.log("Validate: ",result)
        $('#validate-result').html(result);       
    });

    $("#get-history").click(async()=> {
        let history = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({"action": (Actions.getBackground().getTxHistory)}, response => {
                    resolve(response)
            });                 
        })
        console.log("History: ",history)
        history = JSON.stringify(history)
        $('#history').html(history);       
    });

    $("#send").click(async ()=> {
        let to = document.getElementById('receiver').value;
        let value = document.getElementById('value').value;
        let gasPrice = document.getElementById('gasprise').value;
        let data = {"to": to, "value": value, "gasPrice": gasPrice};
        let result = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({"action": (Actions.getBackground().sendTransaction), "data": data}, response => {
                    resolve(response)
                });                 
        })
        console.log(result)
        $('#txhash').html(result);
    });

    $("#export-privkey").click(async()=> {
        console.log('Export private key')
        let password = document.getElementById('password').value;
        if(!password){
            alert('Enter your password')
        }else{
            let ciphertext = await new Promise((resolve,reject) => {
                chrome.storage.local.get(['ciphertext'], response => {
                    resolve(response)
                });            	
            })
            let data = {"password": password, "ciphertext": ciphertext.ciphertext}
            let mnemonic = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({"action": (Actions.getBackground().getExportMnemonic), "data": data}, response => {
                      resolve(response)
                });					
            })
            if(!mnemonic){
                alert('Wrong password')
            }else{
                let ticker = document.getElementById("wallet-interface").value;
                ticker = ticker.toUpperCase();
                let data = {"ticker": ticker}
                let result = await new Promise((resolve, reject) => {
                    chrome.runtime.sendMessage({"action": (Actions.getBackground().getExportPrivKey), "data": data}, response => {
                        resolve(response)
                    });                 
                })
                alert("Please save your private key: "+result)
            }
        }
    });

    $("#import-mnemonic").click(async()=> {
        console.log('Import Mnemonic')
        let password = document.getElementById('password').value;
        let mnemonic = document.getElementById('import-your-mnemonic').value;
        let data = {"password": password, "mnemonic": mnemonic}
		let ciphertext = await new Promise((resolve, reject) => {
			chrome.runtime.sendMessage({"action": (Actions.getBackground().getCiphertext), "data": data}, response => {
  				resolve(response)
			});					
		})
		chrome.storage.local.set({'ciphertext': ciphertext}, function() {
            console.log('Ciphertext saved');
        });
    });

    $("#export-mnemonic").click(async()=> {
        console.log('Export Mnemonic')
        let password = document.getElementById('password').value;
        if(!password){
            alert('Enter your password')
        }else{
            let ciphertext = await new Promise((resolve,reject) => {
                chrome.storage.local.get(['ciphertext'], response => {
                    resolve(response)
                });            	
            })
            let data = {"password": password, "ciphertext": ciphertext.ciphertext}
            let mnemonic = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({"action": (Actions.getBackground().getExportMnemonic), "data": data}, response => {
                      resolve(response)
                });					
            })
            if(!mnemonic){
                alert('Wrong password')
            }else{
                alert(mnemonic)
            }
        }
    });

    $("#expand-view").attr("href", `chrome-extension://${window.location.hostname}/page/home.html`);
});