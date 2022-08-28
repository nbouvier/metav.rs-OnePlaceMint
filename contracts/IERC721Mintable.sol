// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

abstract contract IERC721Mintable is IERC721 {

    function safeMint(address to) external virtual returns (uint256 tokenId);

}