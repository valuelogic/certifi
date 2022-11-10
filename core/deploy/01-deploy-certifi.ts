import { DeployFunction } from 'hardhat-deploy/dist/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DEVELOPMENT_CHAINS, networkConfig } from '../helper-hardhat-config';
import verify from '../utils/verify';
const deploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, network, getNamedAccounts } = hre;
    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts();

    log('Deploying Certifi...');

    let tokenAddress: string;

    if (DEVELOPMENT_CHAINS.includes(network.name)) {
        const token = await get('MockDaiToken');
        tokenAddress = token.address;
    } else {
        tokenAddress = networkConfig[network.name].tokenAddress!;
    }

    const args = [tokenAddress, networkConfig[network.name].fee];
    const certifi = await deploy('Certifi', {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmation || 0,
    });

    log(`Certifi has been deployed at ${certifi.address}`);

    if (
        !DEVELOPMENT_CHAINS.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(certifi.address, args);
    }
};

export default deploy;
deploy.tags = ['all', 'certifi'];
