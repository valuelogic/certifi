import { DeployFunction } from 'hardhat-deploy/dist/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DEVELOPMENT_CHAINS } from '../helper-hardhat-config';

const deployMocks: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, network, getNamedAccounts } = hre;
    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts();

    if (DEVELOPMENT_CHAINS.includes(network.name)) {
        log('Deploying mocks...');
        const token = await deploy('MockDaiToken', {
            from: deployer,
            args: [],

            log: true,
        });

        log(`Mock DAI has been deployed at ${token.address}`);

        log('Mocks has been deployed!');
    }
};

export default deployMocks;
deployMocks.tags = ['all', 'mocks'];
