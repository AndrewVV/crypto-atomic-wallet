const CONTRACT_ADDRESS = '0x3c34b3f63c56f9666e549805e7980b6720f4fb14'; //'0x2FC216fE00774921D975e299F35FD12DF1049f3d';
const ABI = [
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "_fee",
				"type": "uint16"
			}
		],
		"name": "changeFeePercent",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_hashedSecret",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "_refundTime",
				"type": "uint256"
			},
			{
				"internalType": "address payable",
				"name": "_participant",
				"type": "address"
			}
		],
		"name": "initiate",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "_hashedSecret",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_initTimestamp",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_refundTime",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "_participant",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "_initiator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_fee",
				"type": "uint256"
			}
		],
		"name": "Initiated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_hashedSecret",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "_secret",
				"type": "bytes32"
			}
		],
		"name": "redeem",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "_hashedSecret",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "_secret",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_redeemTime",
				"type": "uint256"
			}
		],
		"name": "Redeemed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_hashedSecret",
				"type": "bytes32"
			}
		],
		"name": "refund",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "_hashedSecret",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_refundTime",
				"type": "uint256"
			}
		],
		"name": "Refunded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "withdrawFee",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "_owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "WithdrawFee",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_secret",
				"type": "bytes32"
			}
		],
		"name": "bytes32ToSHA256",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "feeAmount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "feePercent",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_hashedSecret",
				"type": "bytes32"
			}
		],
		"name": "getBalanceSwap",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_hashedSecret",
				"type": "bytes32"
			}
		],
		"name": "getSecretSwap",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTimestamp",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "source",
				"type": "string"
			}
		],
		"name": "stringToBytes32",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "result",
				"type": "bytes32"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "source",
				"type": "string"
			}
		],
		"name": "stringToSHA256",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "swaps",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "hashedSecret",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "secret",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "initTimestamp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "refundTime",
				"type": "uint256"
			},
			{
				"internalType": "address payable",
				"name": "initiator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "nonce",
				"type": "uint256"
			},
			{
				"internalType": "address payable",
				"name": "participant",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "fee",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "emptied",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "initiated",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const GASLIMITSC = 200000;
const ETALON_OX = "0x0000000000000000000000000000000000000000000000000000000000000000";

export {
    CONTRACT_ADDRESS,
    ABI,
    GASLIMITSC,
    ETALON_OX,
}

const CREATED_ORDER = "CREATED_ORDER";
const REPLIED_TO_ORDER = "REPLIED_TO_ORDER";
const CREATED_ORDER_IN_SC = "CREATED_ORDER_IN_SC";
const REDEEMED_ORDER_IN_SC = "REDEEMED_ORDER_IN_SC";
const SEND_TX_BTC = "SEND_TX_BTC";
const WITHDRAW_TX_BTC = "WITHDRAW_TX_BTC";

export {
    CREATED_ORDER,
    REPLIED_TO_ORDER,
    CREATED_ORDER_IN_SC,
    REDEEMED_ORDER_IN_SC,
    SEND_TX_BTC,
    WITHDRAW_TX_BTC,
}