import btc from '../components/assets/images/coins/btc.svg';
import dsh from '../components/assets/images/coins/dsh.svg';
import eth from '../components/assets/images/coins/eth.svg';
import ltc from '../components/assets/images/coins/ltc.svg';
import ecr from '../components/assets/images/coins/ecr.svg';
import edc from '../components/assets/images/coins/edc.svg';
import btcCash from '../components/assets/images/coins/btcCash.svg';

import { PRODUCTION } from '.';

const tickersPROD = [
    {
        value: 'BTC',
        name: 'Bitcoin',
        img: btc,
        explorer: 'https://live.blockcypher.com/btc/address/',
    },
    {
        value: 'ETH',
        name: 'Ethereum',
        img: eth,
        explorer: 'https://etherscan.io/address/',
    },
    {
        value: 'BCH',
        name: 'Bitcoin Cash',
        img: btcCash,
        explorer: 'https://explorer.bitcoin.com/bch/address/',
    },
    {
        value: 'LTC',
        name: 'Litecoin',
        img: ltc,
        explorer: 'https://live.blockcypher.com/ltc/address/',
    },
    {
        value: 'DASH',
        name: 'Dash',
        img: dsh,
        explorer: 'https://live.blockcypher.com/dash/address/',
    },
    {
        value: 'EDC',
        name: 'EDC Blockchain',
        img: edc,
        explorer: 'https://explorer.blockchain.mn/account/',
    },
    {
        value: 'ECRO',
        name: 'Ecro',
        img: ecr,
        explorer: 'https://explorer.blockchain.mn/account/',
    },
];

const tickersDEV = [
    {
        value: 'BTCTEST',
        name: 'Bitcoin TEST',
        img: btc,
        explorer: 'https://live.blockcypher.com/btc-testnet/address/',
    },
    {
        value: 'ETHTEST',
        name: 'Ethereum TEST',
        img: eth,
        explorer: 'https://ropsten.etherscan.io/address/',
    },
    {
        value: 'BCHTEST',
        name: 'Bitcoin Cash TEST',
        img: btcCash,
        explorer: 'https://explorer.bitcoin.com/tbch/address/',
    },
    {
        value: 'LTCTEST',
        name: 'Litecoin TEST',
        img: ltc,
        explorer: 'https://chain.so/address/LTCTEST/',
    },
    {
        value: 'DASHTEST',
        name: 'Dash TEST',
        img: dsh,
        explorer: 'https://chain.so/address/DASHTEST/',
    },
    {
        value: 'EDCTEST',
        name: 'EDC Blockchain TEST',
        img: edc,
        explorer: 'https://testnet-explorer.blockchain.mn/account/',
    },
    {
        value: 'ECROTEST',
        name: 'Ecro TEST',
        img: ecr,
        explorer: 'https://testnet-explorer.blockchain.mn/account/',
    },
];

const tickers = PRODUCTION === 'true' ? tickersPROD : tickersDEV;

export default tickers;
