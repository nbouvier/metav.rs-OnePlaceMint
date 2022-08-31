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

    let accounts: any[];
    let Nft: any;
    let OnePlaceMint: any;

    beforeEach(async function() {
        accounts = await ethers.getSigners();

        Nft = await deploy("Nft");
        expect(await Nft.totalTokens()).to.equal(0);
        expect(await Nft.balanceOf(accounts[1].address)).to.equal(0);
        await Nft.grantRole(await Nft.MINTER(), accounts[0].address);

        OnePlaceMint = await deploy("OnePlaceMint");
        expect(await OnePlaceMint.bank()).to.equal(accounts[0].address);
        expect(await OnePlaceMint.totalPayedNfts()).to.equal(0);
    });

    describe("#Nft.safeMint()", function() {
        it("should only be accessible for MINTERs", async function() {
            await expect(Nft.connect(accounts[1]).safeMint(accounts[1].address, 1)).to.be.rejected;
            await expect(Nft.safeMint(accounts[1].address, 1)).to.not.be.rejected;
        });
        it("should send NFT to given address", async function() {
            await Nft.safeMint(accounts[1].address, 2);
            expect(await Nft.balanceOf(accounts[1].address)).to.equal(2);
            expect(await Nft.ownerOf(1)).to.equal(accounts[1].address);
            expect(await Nft.ownerOf(2)).to.equal(accounts[1].address);
        });
        it("should increase totalTokens", async function() {
            expect(await Nft.totalTokens()).to.equal(0);
            await Nft.safeMint(accounts[1].address, 1);
            expect(await Nft.totalTokens()).to.equal(1);
            await Nft.safeMint(accounts[1].address, 3);
            expect(await Nft.totalTokens()).to.equal(4);
        });
    });

    describe("#OnePlaceMint.payMint()", function() {
        it("should revert if not enough ether", async function() {
            await expect(OnePlaceMint.connect(accounts[1]).payMint(1, { value: toWei('0.001') })).to.be.rejected;
        });
        it("should revert if paying over max mints", async function() {
            await expect(OnePlaceMint.connect(accounts[1]).payMint(101, { value: toWei('1.01') })).to.be.rejected;
            await expect(OnePlaceMint.connect(accounts[1]).payMint(80, { value: toWei('0.8') })).to.not.be.rejected;
            await expect(OnePlaceMint.connect(accounts[1]).payMint(21, { value: toWei('0.21') })).to.be.rejected;
        });
        it("should transfer founds to bank", async function() {
            const oldBalance = await ethers.provider.getBalance(accounts[0].address);
            await OnePlaceMint.connect(accounts[1]).payMint(1, { value: toWei('0.01') });
            expect(await ethers.provider.getBalance(accounts[0].address)).to.equal(oldBalance.add(toWei('0.01')));
        });
        it("should emit Payed event", async function() {
            expect(await OnePlaceMint.connect(accounts[1]).payMint(1, { value: toWei('0.01') })).to.emit(OnePlaceMint, 'Payed').withArgs(accounts[1].address, 1);
        });
    });
});
