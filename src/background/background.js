/* eslint-disable */

import WalletInterface from './libs/WalletInterface';
import ActionsClass from '../common/class.actions.js';
let walletInterface = new WalletInterface();
const Actions = new ActionsClass();

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
    	(async () => {
    		switch (request.action) {
                case (Actions.getBackground().changeProtocol):
                    walletInterface.changeProtocol(request.data);
                    break;
    			case (Actions.getBackground().generationMnemonic):
					let newMnemonic = await walletInterface.generateRandomPhrase()
					walletInterface.generateAddressAndPrivkey.phrase = newMnemonic;
					sendResponse(newMnemonic);
    				break;
    			case (Actions.getBackground().getCiphertext):
					let ciphertext = await walletInterface.encryptMnemonic(request.data.mnemonic,request.data.password);
					walletInterface.generateAddressAndPrivkey.phrase = request.data.mnemonic;
    				sendResponse(ciphertext)
    				break;
    			case (Actions.getBackground().getMnemonic):
					let mnemonic = await walletInterface.decryptMnemonic(request.data.ciphertext,request.data.password);
    				sendResponse(mnemonic);
					walletInterface.generateAddressAndPrivkey.phrase = mnemonic;
					break;
				case (Actions.getBackground().getExportMnemonic):
					let exportmnemonic = await walletInterface.decryptMnemonic(request.data.ciphertext,request.data.password);
					sendResponse(exportmnemonic);
					break;
                case (Actions.getBackground().getAddress):
                    let address = await walletInterface.generateAddressAndPrivkey.generateAddress(request.data.ticker);
                    sendResponse(address);
					break;
				case (Actions.getBackground().getExportPrivKey):
					let exportPrivKey = await walletInterface.generateAddressAndPrivkey.generatePrivKey(request.data.ticker);
					sendResponse(exportPrivKey);
					break;
                case (Actions.getBackground().getBalance):
                    let balance = await walletInterface.setBalance(request.data);
                    sendResponse(balance);
                    break;
                case (Actions.getBackground().sendTransaction):
                    let txHash = await walletInterface.sendTransaction(request.data.to, request.data.value, request.data.gasPrice);
                    sendResponse(txHash);
					break;
				case (Actions.getBackground().getTxHistory):
					let txHistory = await walletInterface.getTxHistory();
					sendResponse(txHistory);
					break;
				case (Actions.getBackground().getCurrentRate):
					let currentRate = await walletInterface.getCurrentRate();
					sendResponse(currentRate);
					break;
				case (Actions.getBackground().validateAddress):
					let validate = await walletInterface.validateAddress(request.data);
					sendResponse(validate);
					break;
				case (Actions.getBackground().getFee):
					let fee = await walletInterface.getFee();
					sendResponse(fee);
					break;
				case (Actions.getBackground().createOrder):
					let createOrder = await walletInterface.createOrder(request.data);
					sendResponse(createOrder)
					break;
				case (Actions.getBackground().getOrders):
					let orders = await walletInterface.getOrders();
					sendResponse(orders)
					break;
				case (Actions.getBackground().replyToOrder):
					let resultReplyToOrder = await walletInterface.replyToOrder(request.data);
					sendResponse(resultReplyToOrder)
					break;
    		}
	})();
	return true;
    }

);

chrome.windows.onRemoved.addListener(function () { 
	chrome.storage.local.set({ isBrowserClosed: true }); 
});