export const DEVELOPMENT_CHAINS = ['hardhat', 'localhost'];

export interface networkConfigItem {
    chainId: number;
    fee: string;
    tokenAddress?: string;
    blockConfirmation?: number;
}

export interface networkConfigInfo {
    [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
    hardhat: {
        chainId: 31337,
        fee: '1000000000000000000',
    },
    localhost: {
        chainId: 31337,
        fee: '1000000000000000000',
    },
};
