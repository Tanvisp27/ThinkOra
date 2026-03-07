// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Escrow {
    struct EscrowTransaction {
        address buyer;
        address seller;
        uint256 amount;
        uint256 deadline;
        bool isCompleted;
        bool isRefunded;
    }

    mapping(uint256 => EscrowTransaction) public transactions;
    uint256 public nextTransactionId;

    event EscrowCreated(uint256 indexed transactionId, address indexed buyer, address indexed seller, uint256 amount, uint256 deadline);
    event FundsReleased(uint256 indexed transactionId, address indexed receiver, uint256 amount);
    event FundsRefunded(uint256 indexed transactionId, address indexed buyer, uint256 amount);

    /**
     * @dev Creates a new escrow transaction, locking the funds.
     * @param _seller The address of the seller receiving the funds.
     * @param _duration The duration in seconds from now until the deadline.
     */
    function createEscrow(address _seller, uint256 _duration) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(_seller != address(0), "Invalid seller address");
        require(_seller != msg.sender, "Buyer cannot be seller");
        require(_duration > 0, "Duration must be greater than 0");

        uint256 transactionId = nextTransactionId++;
        uint256 deadline = block.timestamp + _duration;

        transactions[transactionId] = EscrowTransaction({
            buyer: msg.sender,
            seller: _seller,
            amount: msg.value,
            deadline: deadline,
            isCompleted: false,
            isRefunded: false
        });

        emit EscrowCreated(transactionId, msg.sender, _seller, msg.value, deadline);
    }

    /**
     * @dev Buyer manually releases funds to the seller.
     * @param _transactionId The ID of the escrow transaction.
     */
    function releaseFunds(uint256 _transactionId) external {
        EscrowTransaction storage txn = transactions[_transactionId];
        
        require(!txn.isCompleted, "Transaction already completed");
        require(!txn.isRefunded, "Transaction already refunded");
        require(msg.sender == txn.buyer, "Only buyer can release funds");

        txn.isCompleted = true;
        
        (bool success, ) = txn.seller.call{value: txn.amount}("");
        require(success, "Transfer failed");

        emit FundsReleased(_transactionId, txn.seller, txn.amount);
    }

    /**
     * @dev Automatically releases funds to the seller if the deadline has passed.
     * Anyone can call this function after the deadline to enforce the contract.
     * @param _transactionId The ID of the escrow transaction.
     */
    function autoReleaseFunds(uint256 _transactionId) external {
        EscrowTransaction storage txn = transactions[_transactionId];
        
        require(!txn.isCompleted, "Transaction already completed");
        require(!txn.isRefunded, "Transaction already refunded");
        require(block.timestamp >= txn.deadline, "Deadline not passed yet");

        txn.isCompleted = true;
        
        (bool success, ) = txn.seller.call{value: txn.amount}("");
        require(success, "Transfer failed");

        emit FundsReleased(_transactionId, txn.seller, txn.amount);
    }

    /**
     * @dev Seller manually refunds funds to the buyer.
     * @param _transactionId The ID of the escrow transaction.
     */
    function refundBuyer(uint256 _transactionId) external {
        EscrowTransaction storage txn = transactions[_transactionId];
        
        require(!txn.isCompleted, "Transaction already completed");
        require(!txn.isRefunded, "Transaction already refunded");
        require(msg.sender == txn.seller, "Only seller can issue a refund");

        txn.isCompleted = true;
        txn.isRefunded = true;
        
        (bool success, ) = txn.buyer.call{value: txn.amount}("");
        require(success, "Refund transfer failed");

        emit FundsRefunded(_transactionId, txn.buyer, txn.amount);
    }
}
