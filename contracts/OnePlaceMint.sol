// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract OnePlaceMint {

    event Payed(address indexed buyer, uint256 amount, uint256 indexed timestamp);

    uint256 constant public MAX_MINTS = 100;
    uint256 constant public MINT_PRICE = 0.01 ether;

    address payable public bank;
    uint256 public totalPayedNfts;

    constructor() {
        bank = payable(tx.origin);
        totalPayedNfts = 0;
    }

    function payMint(uint256 amount) payable external {
        require(totalPayedNfts + amount <= MAX_MINTS, "Mint: Payed over pay limit.");
        require(msg.value == amount * MINT_PRICE, "Mint: Not enough ethers.");
        bank.transfer(msg.value);
        totalPayedNfts += amount;
        emit Payed(msg.sender, amount, block.timestamp);
        // Pending mints can be stored in a mapping(address => uint256)
    }

    // Can have a mint function to reduce pendingMints mapping + mint from there
    // It would need to have an AccessControl feature + to be granted MINTER by Nft contract
    // That way we could send ether to the contract and retreive them when calling the mint function

}
