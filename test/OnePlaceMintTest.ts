import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, BigNumber } from "ethers";
import { deploy } from "./lib";

const toWei = ethers.utils.parseEther;
const keccak256 = ethers.utils.solidityKeccak256;
const arrayify = ethers.utils.arrayify;
const bnArrayFrom = (array: number[]) => array.map((el: number) => BigNumber.from(el));

/**
 * npx hardhat test
 */

describe("OnePlaceMint", function () {

    let accounts: Signer[];
    let Nft: any;
    let OnePlaceMint: any;

    beforeEach(async function() {
        accounts = await ethers.getSigners();

        Nft = await deploy("Nft");
        OnePlaceMint = await deploy("OnePlaceMint", [ Nft.address ]);
        await OnePlaceMint.grantRole(await OnePlaceMint.MINTER(), await accounts[0].getAddress());

        expect(await Nft.totalTokens()).to.equal(0);
        expect(await Nft.balanceOf(await accounts[1].getAddress())).to.equal(0);
    });

    describe("One operation, pay first", function() {
        it("should send 3 NFTs", async function() {
            await OnePlaceMint.connect(accounts[1]).payMint(3, { value: toWei("0.01").mul(3) });
            await OnePlaceMint.mint(await accounts[1].getAddress(), 3);
            expect(await Nft.balanceOf(await accounts[1].getAddress())).to.equal(3);
        });
        it("should not send 5 NFTs", async function() {
            await OnePlaceMint.connect(accounts[1]).payMint(3, { value: toWei("0.01").mul(3) });
            await OnePlaceMint.mint(await accounts[1].getAddress(), 3);
            await OnePlaceMint.mint(await accounts[1].getAddress(), 2);
            expect(await Nft.balanceOf(await accounts[1].getAddress())).to.equal(3);
        });
    });

    describe("One operation, mint first", function() {
        it("should send 3 NFTs", async function() {
            await OnePlaceMint.mint(await accounts[1].getAddress(), 3);
            await OnePlaceMint.connect(accounts[1]).payMint(3, { value: toWei("0.01").mul(3) });
            expect(await Nft.balanceOf(await accounts[1].getAddress())).to.equal(3);
        });
        it("should not send 5 NFTs", async function() {
            await OnePlaceMint.mint(await accounts[1].getAddress(), 3);
            await OnePlaceMint.connect(accounts[1]).payMint(3, { value: toWei("0.01").mul(3) });
            await OnePlaceMint.mint(await accounts[1].getAddress(), 2);
            expect(await Nft.balanceOf(await accounts[1].getAddress())).to.equal(3);
        });
    });

    describe("Two operations, pay first", function() {
        it("should send 5 NFTs", async function() {
            await OnePlaceMint.connect(accounts[1]).payMint(3, { value: toWei("0.01").mul(3) });
            await OnePlaceMint.connect(accounts[1]).payMint(2, { value: toWei("0.01").mul(2) });
            await OnePlaceMint.mint(await accounts[1].getAddress(), 3);
            expect(await Nft.balanceOf(await accounts[1].getAddress())).to.equal(3);
            await OnePlaceMint.mint(await accounts[1].getAddress(), 2);
            expect(await Nft.balanceOf(await accounts[1].getAddress())).to.equal(5);
        });
        it("should not send 7 NFTs", async function() {
            await OnePlaceMint.connect(accounts[1]).payMint(3, { value: toWei("0.01").mul(3) });
            await OnePlaceMint.connect(accounts[1]).payMint(2, { value: toWei("0.01").mul(2) });
            await OnePlaceMint.mint(await accounts[1].getAddress(), 3);
            await OnePlaceMint.mint(await accounts[1].getAddress(), 2);
            await OnePlaceMint.mint(await accounts[1].getAddress(), 2);
            expect(await Nft.balanceOf(await accounts[1].getAddress())).to.equal(5);
        });
    });

    describe("Two operations, mint first", function() {
        it("should send 5 NFTs", async function() {
            await OnePlaceMint.mint(await accounts[1].getAddress(), 3);
            await OnePlaceMint.mint(await accounts[1].getAddress(), 2);
            await OnePlaceMint.connect(accounts[1]).payMint(3, { value: toWei("0.01").mul(3) });
            expect(await Nft.balanceOf(await accounts[1].getAddress())).to.equal(3);
            await OnePlaceMint.connect(accounts[1]).payMint(2, { value: toWei("0.01").mul(2) });
            expect(await Nft.balanceOf(await accounts[1].getAddress())).to.equal(5);
        });
        it("should not send 7 NFTs", async function() {
            await OnePlaceMint.mint(await accounts[1].getAddress(), 3);
            await OnePlaceMint.mint(await accounts[1].getAddress(), 2);
            await OnePlaceMint.connect(accounts[1]).payMint(3, { value: toWei("0.01").mul(3) });
            await OnePlaceMint.connect(accounts[1]).payMint(2, { value: toWei("0.01").mul(2) });
            await OnePlaceMint.mint(await accounts[1].getAddress(), 2);
            expect(await Nft.balanceOf(await accounts[1].getAddress())).to.equal(5);
        });
    });
});
