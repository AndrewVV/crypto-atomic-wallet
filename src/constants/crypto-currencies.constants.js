import btc from '../components/assets/images/coins/btc.svg';
import dsh from '../components/assets/images/coins/dsh.svg';
import eth from '../components/assets/images/coins/eth.svg';
import ltc from '../components/assets/images/coins/ltc.svg';
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
];

const tickers = PRODUCTION === 'true' ? tickersPROD : tickersDEV;

export default tickers;
