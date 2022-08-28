// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

contract Nft is ERC721 {

    // Limit can be set there, either using AccessControl or hard cap limit

    uint256 public totalTokens;

    constructor() ERC721('Nft', 'NFT') {
        totalTokens = 0;
    }

    function safeMint(address _to) public returns (uint256) {
        totalTokens++;
        _safeMint(_to, totalTokens, "Mint");
        return totalTokens;
    }

}
