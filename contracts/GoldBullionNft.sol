// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts@4.9.3/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@4.9.3/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts@4.9.3/access/Ownable.sol";
import "@openzeppelin/contracts@4.9.3/access/AccessControl.sol";
import "@openzeppelin/contracts@4.9.3/utils/Base64.sol";
import "@openzeppelin/contracts@4.9.3/utils/Strings.sol";

/**
* @title ContractName
* @dev ContractDescription
* @custom:dev-run-script scripts/myFunc.js
*/
contract GoldBullionNFT is ERC721, ERC721Burnable, AccessControl {
    using Strings for uint256;
    bytes32 public constant GOLD_KEEPER = keccak256("GOLD_KEEPER");

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    struct GoldBulionDetails {
        string data;
        string imageUrl;
    }
    mapping (uint256 => GoldBulionDetails) onchaindata;

    // 3000000 (33 USD)
    constructor() ERC721("Gold Vault", "GLDVLT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOLD_KEEPER, msg.sender);
    }

    // gas 344275 (3.8 USD)
    function safeMint(address to, uint256 tokenId, string memory data, string memory pictureUrl) 
    public onlyRole(GOLD_KEEPER) {
        _safeMint(to, tokenId);
        onchaindata[tokenId].data = data;
        onchaindata[tokenId].imageUrl = pictureUrl;
        depositFees[tokenId].minter = msg.sender;
    }

    // if we can pack all gold data in uint256 then no extra data needed
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        bytes memory dataURI = abi.encodePacked(
            '{',
                '"name": "Gold Bar no #', tokenId.toString(), '",',
                '"description": "', onchaindata[tokenId].data, '",',
                '"image": "', onchaindata[tokenId].imageUrl, '"',
                // '"attributes": [{"trait_type": "purity", "value": 99.99}, {"trait_type": "location", "value":"HongKong"}]'
            '}'
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }

    // =================================== deposit fees ==================================
    // deposit fees mechanism
    event Dispute(uint256 tokenId, bool setOrNot);
    enum State {PENDING, PAID, COLLECTED, DISPUTE}
    struct DepositFees {
        address minter;
        uint256 fee;
        uint256 paid;
        uint256 dueDate;
        State state;
        uint256 disputeValue;
    }
    mapping (uint256 => DepositFees) public depositFees;
    function payDepositFees(uint256 tokenId) public payable {
        DepositFees storage depFees = depositFees[tokenId];

        require (ownerOf(tokenId) == msg.sender, "You not owner of that tokenId!");
        require (msg.value >= depFees.fee, "value lower than deposit fees!");

        depFees.paid += msg.value;
        depFees.state = State.PAID;
    }
    function setDespositFees(uint256 tokenId, uint256 fee, uint256 dueDateSec) public {
        DepositFees storage depFees = depositFees[tokenId];

        require(depFees.minter == msg.sender, "you are not minter for that token!");

        depFees.fee = fee;
        depFees.dueDate = block.timestamp + dueDateSec;
        depFees.state = State.PENDING;

    }
    function collectDepositFees(uint256 tokenId) public {
        DepositFees storage depFees = depositFees[tokenId];

        require(depFees.minter == msg.sender, "you are not minter for that token!");
        require(depFees.dueDate <= block.timestamp, "the time has not come yet!");
        require(depFees.paid >= depFees.fee, "hasn't been paid yet!");

        uint256 fee = depFees.fee;
        depFees.paid -= fee;
        depFees.fee = 0;
        depFees.state = State.COLLECTED;

        payable (msg.sender).transfer(fee);
    }
    function claimNftBack(uint256 tokenId) public payable {
        DepositFees storage depFees = depositFees[tokenId];

        require(depFees.minter == msg.sender, "you are not minter for that token!");
        require(depFees.dueDate <= block.timestamp, "the time has not come yet!");
        require(depFees.paid < depFees.fee, "has been paid already!");

        depFees.state = State.DISPUTE;
        depFees.disputeValue = msg.value;
        emit Dispute(tokenId, true);
    }
    function claimBackApproved(uint256 tokenId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        DepositFees storage depFees = depositFees[tokenId];
        address owner = ownerOf(tokenId);
        uint256 toReturn = depFees.disputeValue + depFees.paid;

        depFees.disputeValue = 0;
        depFees.paid = 0;
        depFees.state = State.PENDING;
        _transfer(owner, depFees.minter, tokenId);
        emit Dispute(tokenId, false);

        payable(owner).transfer(toReturn);
    }
    function claimBackDeclined(uint256 tokenId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        DepositFees storage depFees = depositFees[tokenId];
        depFees.state = State.PENDING;
        emit Dispute(tokenId, false);
    }
}