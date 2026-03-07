import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Escrow Contract", function () {
    let escrow;
    let owner;
    let buyer;
    let seller;
    let otherAccount;

    beforeEach(async function () {
        [owner, buyer, seller, otherAccount] = await ethers.getSigners();
        const Escrow = await ethers.getContractFactory("Escrow");
        escrow = await Escrow.deploy();
    });

    describe("createEscrow", function () {
        it("Should create an escrow transaction and lock funds", async function () {
            const depositAmount = ethers.parseEther("1.0");
            const duration = 60 * 60 * 24; // 1 day

            await expect(escrow.connect(buyer).createEscrow(seller.address, duration, { value: depositAmount }))
                .to.emit(escrow, "EscrowCreated");

            const txn = await escrow.transactions(0);
            expect(txn.buyer).to.equal(buyer.address);
            expect(txn.seller).to.equal(seller.address);
            expect(txn.amount).to.equal(depositAmount);
            expect(txn.isCompleted).to.be.false;
        });

        it("Should fail if amount is 0", async function () {
            await expect(escrow.connect(buyer).createEscrow(seller.address, 3600, { value: 0 }))
                .to.be.revertedWith("Amount must be greater than 0");
        });
    });

    describe("releaseFunds", function () {
        let depositAmount;
        let duration;

        beforeEach(async function () {
            depositAmount = ethers.parseEther("1.0");
            duration = 60 * 60 * 24; // 1 day
            await escrow.connect(buyer).createEscrow(seller.address, duration, { value: depositAmount });
        });

        it("Should allow buyer to manually release funds", async function () {
            await expect(escrow.connect(buyer).releaseFunds(0))
                .to.emit(escrow, "FundsReleased")
                .withArgs(0, seller.address, depositAmount);

            const txn = await escrow.transactions(0);
            expect(txn.isCompleted).to.be.true;
        });

        it("Should revert if non-buyer tries to release funds", async function () {
            await expect(escrow.connect(seller).releaseFunds(0))
                .to.be.revertedWith("Only buyer can release funds");
        });
    });

    describe("autoReleaseFunds", function () {
        let depositAmount;
        let duration;

        beforeEach(async function () {
            depositAmount = ethers.parseEther("1.0");
            duration = 60 * 60 * 24; // 1 day
            await escrow.connect(buyer).createEscrow(seller.address, duration, { value: depositAmount });
        });

        it("Should automatically release funds after deadline", async function () {
            // Increase time to past the deadline
            await time.increase(duration + 1);

            // Anyone should be able to trigger the auto release
            await expect(escrow.connect(otherAccount).autoReleaseFunds(0))
                .to.emit(escrow, "FundsReleased")
                .withArgs(0, seller.address, depositAmount);

            const txn = await escrow.transactions(0);
            expect(txn.isCompleted).to.be.true;
        });

        it("Should revert if deadline has not passed", async function () {
            await expect(escrow.connect(otherAccount).autoReleaseFunds(0))
                .to.be.revertedWith("Deadline not passed yet");
        });
    });
});
