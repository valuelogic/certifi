import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-etherscan';
import 'hardhat-deploy';
import 'dotenv/config';
import 'solidity-coverage';
import '@typechain/hardhat';

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
const KOVAN_RPC_URL = process.env.KOVAN_RPC_URL || '';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.16',
        settings: {
            optimizer: {
                enabled: true,
                runs: 100,
            },
        },
    },
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            chainId: 31337,
        },
        // kovan: {
        //   url: KOVAN_RPC_URL,
        //   accounts: [
        //     PRIVATE_KEY,
        //   ],
        //   chainId: 42,
        // },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
};

export default config;
