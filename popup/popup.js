import ActionsClass from '../common/class.actions.js';
const Actions = new ActionsClass();

$(document).ready(function() {
    $("#buy-crypto").on('input', ()=> {
        let buyTicker = document.getElementById("buy-crypto").value
        let sellTicker = document.getElementById("sell-crypto").value
        if(buyTicker === sellTicker && buyTicker === "ethtest") {
            document.getElementById("sell-crypto").value = "btctest"
        } else if (buyTicker === sellTicker && sellTicker === "btctest") {
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
        let idOrder = document.getElementById("id-order").value
        let data = {idOrder}
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
            let ciphertextEDC = await new Promise((resolve,reject) => {
    			chrome.storage.local.get(['ciphertextEdc'], response => {
    				resolve(response)
    			});            	
            })
            if(Object.keys(ciphertextEDC).length > 0){
                data = {"password": password, "ciphertext": ciphertextEDC.ciphertextEdc}
                let brainKey = await new Promise((resolve, reject) => {
                    chrome.runtime.sendMessage({"action": (Actions.getBackground().getBrainKey), "data": data}, response => {
                        resolve(response)
                    });					
                })
                let accountName = await new Promise((resolve, reject) => {
                    chrome.runtime.sendMessage({"action": (Actions.getBackground().getNameBrainKey), "data": brainKey}, response => {
                        resolve(response)
                    });					
                })       
            }
            if(!mnemonic){
            	alert('Wrong password')
            }else{
                $('#open-wallet-done').html('Wallet is open');
            }
        }
    });

    $("#showaddress").click(async()=> {
        let ticker = document.getElementById("wallet-interface").value;
        ticker = ticker.toUpperCase();
        let result;
        if(ticker == "EDC" || ticker == "EDCTEST" || ticker == "ECRO" || ticker == "ECROTEST"){
            let name = await new Promise((resolve,reject) => {
                chrome.storage.local.get(['nameEdc'], response => {
                    resolve(response)
                });            	
            })
            result = name.nameEdc;
        }else{
            let data = {"ticker": ticker}
            result = await new Promise((resolve, reject) => {
                    chrome.runtime.sendMessage({"action": (Actions.getBackground().getAddress), "data": data}, response => {
                        resolve(response)
                    });                 
            })
        }
        console.log("Show address: ",result)
        $('#address').html(result);
    });

    $("#get-balance").click(async()=> {
        let name = await new Promise((resolve,reject) => {
            chrome.storage.local.get(['nameEdc'], response => {
                resolve(response)
            });            	
        })
        let result = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({"action": (Actions.getBackground().getBalance), "data": name.nameEdc}, response => {
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
        let memo = document.getElementById('memo').value;
        let name = await new Promise((resolve,reject) => {
            chrome.storage.local.get(['nameEdc'], response => {
                resolve(response)
            });            	
        })
        let data = {"to": to, "value": value, "gasPrice": gasPrice, "memo": memo, "from": name.nameEdc};
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
                let result;
                if(ticker == "EDC" || ticker == "EDCTEST"){
                    alert("Please choose another cryptocurrency")
                }else{
                    let data = {"ticker": ticker}
                    result = await new Promise((resolve, reject) => {
                            chrome.runtime.sendMessage({"action": (Actions.getBackground().getExportPrivKey), "data": data}, response => {
                                resolve(response)
                            });                 
                    })
                    alert("Please save your private key: "+result)
                }
            }
        }
    });

    $("#create-account").click(async ()=> {
        let password = document.getElementById('password').value;
        let accountName = document.getElementById('account-name').value;
        let result = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({"action": (Actions.getBackground().createAccount), "data": accountName}, response => {
                    resolve(response)
                });                 
        })		
        let data = {"password": password, "brainKey": result.phrase}
		let ciphertext = await new Promise((resolve, reject) => {
			chrome.runtime.sendMessage({"action": (Actions.getBackground().getCiphertextEdc), "data": data}, response => {
  				resolve(response)
			});					
		})
		chrome.storage.local.set({'ciphertextEdc': ciphertext}, function() {
      		console.log('Ciphertext EDC saved');
    	});
        chrome.storage.local.set({'nameEdc': accountName}, function() {
            console.log('Account name saved');
        });
        $('#edc-create-done').html(result.result);
        $('#edc-brainkey').html(result.phrase);
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

    $("#import-brainkey").click(async()=> {
        console.log('Import Brainkey')
        let password = document.getElementById('password').value;
        let brainkey = document.getElementById('import-your-brainkey').value;
        let data = {"password": password, "brainKey": brainkey}
		let ciphertext = await new Promise((resolve, reject) => {
			chrome.runtime.sendMessage({"action": (Actions.getBackground().getCiphertextEdc), "data": data}, response => {
  				resolve(response)
			});					
		})
		chrome.storage.local.set({'ciphertextEdc': ciphertext}, function() {
            console.log('Ciphertext EDC saved');
        });
        let accountName = await new Promise((resolve, reject) => {
			chrome.runtime.sendMessage({"action": (Actions.getBackground().getNameBrainKey), "data": brainkey}, response => {
  				resolve(response)
			});					
        })
        chrome.storage.local.set({'nameEdc': accountName}, function() {
            console.log('Account name saved');
        });       
    });

    $("#export-brainkey").click(async()=> {
        console.log('Export Brainkey')
        let password = document.getElementById('password').value;
        if(!password){
            alert('Enter your password')
        }else{
            let ciphertextEdc = await new Promise((resolve,reject) => {
                chrome.storage.local.get(['ciphertextEdc'], response => {
                    resolve(response)
                });            	
            })
            let data = {"password": password, "ciphertext": ciphertextEdc.ciphertextEdc}
            let brainKey = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({"action": (Actions.getBackground().getBrainKey), "data": data}, response => {
                      resolve(response)
                });					
            })
            if(!brainKey){
                alert('Wrong password')
            }else{
                alert(brainKey)
            }
        }
    });

    $("#expand-view").attr("href", `chrome-extension://${window.location.hostname}/page/home.html`);
});