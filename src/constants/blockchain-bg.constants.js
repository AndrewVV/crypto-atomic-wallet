const BTC = 'BTC';
const BTCTEST = 'BTCTEST';
const TESTNET = 'testnet';
const BTCDECIMALS = 8;
const TXSIZE = 0.5; // 500 bytes

const ETH = 'ETH';
const GASLIMIT = 21000;
const GWEIDECIMAL = 9;
const ERC20_ABI = [ { "constant": true, "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "_spender", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "_from", "type": "address" }, { "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "unpause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "founder", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "paused", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "_spender", "type": "address" }, { "internalType": "uint256", "name": "_subtractedValue", "type": "uint256" } ], "name": "decreaseApproval", "outputs": [ { "internalType": "bool", "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "uint256", "name": "_tokens", "type": "uint256" } ], "name": "burnTokens", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "_owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "pause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "_owner", "type": "address" } ], "name": "getFrozenBalance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "_owner", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" } ], "name": "freezeTokens", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "_owner", "type": "address" } ], "name": "getTotalBalance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "_spender", "type": "address" }, { "internalType": "uint256", "name": "_addedValue", "type": "uint256" } ], "name": "increaseApproval", "outputs": [ { "internalType": "bool", "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "_owner", "type": "address" }, { "internalType": "address", "name": "_spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "remaining", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "_owner", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" } ], "name": "unfreezeTokens", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "_owner", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "TokenFreezeEvent", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "_owner", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "TokenUnfreezeEvent", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "_owner", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_tokens", "type": "uint256" } ], "name": "TokensBurned", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Pause", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Unpause", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" } ]
const DEFAULT_ERC20_ADDRESS = "0x71488380673692d18d6ecf08878faec5227336a4";
const DEFAULT_VALUE = "0";
const GASLIMIT_ERC20 = 100000;

const BCH = 'BCH';
const BCHTEST = 'BCHTEST';

const LTC = 'LTC';
const LTCTEST = 'LTCTEST';

const DASH = 'DASH';
const DASHTEST = 'DASHTEST';

export {
    BTC,
    BTCTEST,
    TESTNET,
    BTCDECIMALS,
    TXSIZE,
    ETH,
    GASLIMIT,
    GWEIDECIMAL,
    ERC20_ABI,
    DEFAULT_ERC20_ADDRESS,
    DEFAULT_VALUE,
    GASLIMIT_ERC20,
    BCH,
    BCHTEST,
    LTC,
    LTCTEST,
    DASH,
    DASHTEST,
};


const BTCAPIPROVIDER = 'https://api.blockcypher.com/v1/btc/main/';
const APITOKENPROD = 'ed5a77ec9be14c6b94b9fb3985d53da5';
const BTCTESTAPIPROVIDER = 'https://api.blockcypher.com/v1/btc/test3/';
const APITOKENDEV = '27dfd110d19147ab99e211f715df1bf5';

const ETHAPIPROVIDER = 'http://api.etherscan.io/api';
const APIETHERSCANKEY = 'DR18ANXPC9EYQXNTSE5V7T6PIFYMI15X5K';
const INFURAMAINNET = 'https://mainnet.infura.io/v3/d67bf7aef71d46d0b519e7941174ef9f';
const ETHTESTAPIPROVIDER = 'http://api-ropsten.etherscan.io/api';
const INFURATESTNET = 'https://ropsten.infura.io/v3/d67bf7aef71d46d0b519e7941174ef9f';

const BCHAPIPROVIDER = 'https://rest.bitcoin.com/v2/';
const BCHTESTAPIPROVIDER = 'https://trest.bitcoin.com/v2/';

const LTCAPIPROVIDER = 'https://api.blockcypher.com/v1/ltc/main/';
const LTCTESTAPIPROVIDER = 'https://sochain.com/api/v2/';

const DASHAPIPROVIDER = 'https://api.blockcypher.com/v1/dash/main/';

export {
    BTCAPIPROVIDER,
    APITOKENPROD,
    APITOKENDEV,
    BTCTESTAPIPROVIDER,
    ETHAPIPROVIDER,
    APIETHERSCANKEY,
    INFURAMAINNET,
    ETHTESTAPIPROVIDER,
    INFURATESTNET,
    BCHAPIPROVIDER,
    BCHTESTAPIPROVIDER,
    LTCAPIPROVIDER,
    LTCTESTAPIPROVIDER,
    DASHAPIPROVIDER,
};

const RATEUAHUSD = 24;

export {
    RATEUAHUSD,
};
