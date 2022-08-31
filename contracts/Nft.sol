// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

contract Nft is ERC721, AccessControl {

    bytes32 constant public MINTER = keccak256("MINTER");

    uint256 public totalTokens;

    constructor() ERC721('Nft', 'NFT') {
        _grantRole(DEFAULT_ADMIN_ROLE, tx.origin);
        totalTokens = 0;
    }

    function safeMint(address to, uint256 amount) external onlyRole(MINTER) {
        for (uint256 i=1; i<=amount; i++) {
            _safeMint(to, totalTokens + i, "Mint");
        }
        totalTokens += amount;
    }

    function supportsInterface(bytes4 interfaceId) public view override(AccessControl, ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

}
