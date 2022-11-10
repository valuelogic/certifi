pragma solidity 0.8.16;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract MockDaiToken is ERC20 {
    constructor() ERC20('Mock DAI', 'MDAI') {
        _mint(msg.sender, 1e18 * 100000);
    }
}
