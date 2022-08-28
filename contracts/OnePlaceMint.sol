// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

import './IERC721Mintable.sol';

contract OnePlaceMint is AccessControl, ERC721Holder {

    using EnumerableSet for EnumerableSet.UintSet;

    event Payed(address indexed _buyer, uint256 _amount, uint256 _timestamp);
    event Minted(address indexed _to, uint256 _amount, uint256 _timestamp);

    bytes32 constant public MINTER = keccak256("MINTER");
    uint256 constant public MAX_MINTS = 100;
    uint256 constant public MINT_PRICE = 0.01 ether;

    IERC721Mintable public erc721Contract;
    address payable public bank;
    mapping(address => EnumerableSet.UintSet) private pendingMints;
    mapping(address => uint256) public payedMints;
    uint256 public totalPayedNfts;
    uint256 public totalMintedNfts;

    constructor(IERC721Mintable _erc721Contract) {
        erc721Contract = _erc721Contract;
        _grantRole(DEFAULT_ADMIN_ROLE, tx.origin);
        bank = payable(tx.origin);
        totalMintedNfts = 0;
        totalPayedNfts = 0;
    }

    function payMint(uint256 _amount) payable external {
        require(totalPayedNfts + _amount <= MAX_MINTS, "Mint: Payed over pay limit.");
        require(msg.value == _amount * MINT_PRICE, "Mint: Not enough ethers.");
        bank.transfer(msg.value);
        totalPayedNfts += _amount;
        uint256 remainingPayments = _amount;
        if (pendingMints[msg.sender].length() != 0) {
            uint256 toSend = _amount >= pendingMints[msg.sender].length() ? pendingMints[msg.sender].length() : _amount;
            remainingPayments -= toSend;
            for (uint256 i=0; i<toSend; i++) {
                uint256 tokenId = pendingMints[msg.sender].at(0);
                pendingMints[msg.sender].remove(tokenId);
                erc721Contract.safeTransferFrom(address(this), msg.sender, tokenId);
            }
        }
        if (remainingPayments != 0) {
            payedMints[msg.sender] += remainingPayments;
        }
        emit Payed(msg.sender, _amount, block.timestamp);
    }

    function mint(address _to, uint256 _amount) external onlyRole(MINTER) {
        require(_amount > 0, "Mint: Can't mint 0 NFT.");
        require(totalMintedNfts + _amount <= MAX_MINTS, "Mint: Mint over mint limit.");
        totalMintedNfts += _amount;
        uint256 remainingMints = _amount;
        if (payedMints[_to] != 0) {
            uint256 toSend = _amount >= payedMints[_to] ? payedMints[_to] : _amount;
            remainingMints -= toSend;
            payedMints[_to] -= toSend;
            for (uint256 i=0; i<toSend; i++) {
                erc721Contract.safeMint(_to);
            }
        }
        if (remainingMints != 0) {
            for (uint256 i=0; i<remainingMints; i++) {
                uint256 tokenId = erc721Contract.safeMint(address(this));
                pendingMints[_to].add(tokenId);
            }
        }
        emit Minted(_to, _amount, block.timestamp);
        // Do some specific actions only accessible by the button
    }

}
