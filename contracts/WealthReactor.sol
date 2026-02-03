// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WealthReactor is Ownable {
    IERC20 public immutable usdc;
    
    uint256 public constant ACCESS_FEE = 30 * 10**6; // $30 USDC (6 decimals)
    uint256 public constant L1_COMMISSION = 6 * 10**6; // $6 to referrer
    uint256 public constant L2_COMMISSION = 3 * 10**6; // $3 to L2 referrer
    
    mapping(address => bool) public hasPaid;
    mapping(address => address) public referrer;
    mapping(address => uint256) public earnings;
    
    event Payment(address indexed user, address indexed referrer, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    
    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
    }
    
    function pay(address _referrer) external {
        require(!hasPaid[msg.sender], "Already paid");
        require(usdc.transferFrom(msg.sender, address(this), ACCESS_FEE), "Transfer failed");
        
        hasPaid[msg.sender] = true;
        
        uint256 toTreasury = ACCESS_FEE;
        
        // L1 commission
        if (_referrer != address(0) && hasPaid[_referrer]) {
            referrer[msg.sender] = _referrer;
            earnings[_referrer] += L1_COMMISSION;
            toTreasury -= L1_COMMISSION;
            
            // L2 commission
            address l2 = referrer[_referrer];
            if (l2 != address(0)) {
                earnings[l2] += L2_COMMISSION;
                toTreasury -= L2_COMMISSION;
            }
        }
        
        // Send remainder to treasury (owner)
        usdc.transfer(owner(), toTreasury);
        
        emit Payment(msg.sender, _referrer, ACCESS_FEE);
    }
    
    function withdraw() external {
        uint256 amount = earnings[msg.sender];
        require(amount > 0, "No earnings");
        
        earnings[msg.sender] = 0;
        require(usdc.transfer(msg.sender, amount), "Transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }
    
    function checkPayment(address user) external view returns (bool) {
        return hasPaid[user];
    }
}
