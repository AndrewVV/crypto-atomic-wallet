
export default class Actions {
    getBackground () {
        return {
        	changeProtocol: 'changeProtocol',
            generationMnemonic: 'generationMnemonic',
            getCiphertext: 'getCiphertext',
            getMnemonic: 'getMnemonic',
            getExportMnemonic: 'getExportMnemonic',
            getAddress: 'getAddress',
            getExportPrivKey: 'getExportPrivKey',
            getBalance: 'getBalance',
            sendTransaction: 'sendTransaction',
            createAccount: 'createAccount',
            getCiphertextEdc: 'getCiphertextEdc',
            getBrainKey: 'getBrainKey',
            getNameBrainKey: 'getNameBrainKey',
            getTxHistory: 'getTxHistory',
            getCurrentRate: 'getCurrentRate',
            validateAddress: 'validateAddress',
            createOrder: 'createOrder',
            getOrders: 'getOrders',
            replyToOrder: 'replyToOrder',
        }
    }
}