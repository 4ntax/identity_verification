// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract IdentityVerification {
    struct Identity {
        string name;
        uint256 dateOfBirth;
        string physicalAddress;
        string nationality;
        string idNumber;
        bool isVerified;
        uint256 verificationDate;
    }

    address public admin;
    mapping(address => Identity) public identities;
    mapping(address => bool) public isRegistered;

    event IdentityRegistered(address indexed user, string name);
    event IdentityVerified(address indexed user, uint256 timestamp);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    function validateIdNumber(string memory _idNumber) internal pure returns (bool) {
        bytes memory idBytes = bytes(_idNumber);
        return idBytes.length == 16;
    }

    function registerIdentity(
        string memory _name,
        uint256 _dateOfBirth,
        string memory _physicalAddress,
        string memory _nationality,
        string memory _idNumber
    ) public {
        require(!isRegistered[msg.sender], "Identity already registered!!");
        require(validateIdNumber(_idNumber), "ID number must be exactly 16 characters");

        identities[msg.sender] = Identity({
            name: _name,
            dateOfBirth: _dateOfBirth,
            physicalAddress: _physicalAddress,
            nationality: _nationality,
            idNumber: _idNumber,
            isVerified: false,
            verificationDate: 0
        });

        isRegistered[msg.sender] = true;
        emit IdentityRegistered(msg.sender, _name);
    }

    function verifyIdentity(address _user) public onlyAdmin {
        require(isRegistered[_user], "Identity not registered");
        require(!identities[_user].isVerified, "Identity already verified");

        identities[_user].isVerified = true;
        identities[_user].verificationDate = block.timestamp;
        emit IdentityVerified(_user, block.timestamp);
    }

    function getIdentity(address _user) public view returns (
        string memory name,
        uint256 dateOfBirth,
        string memory physicalAddress,
        string memory nationality,
        string memory idNumber,
        bool isVerified,
        uint256 verificationDate
    ) {
        require(isRegistered[_user], "Identity not registered");
        Identity memory identity = identities[_user];
        
        return (
            identity.name,
            identity.dateOfBirth,
            identity.physicalAddress,
            identity.nationality,
            identity.idNumber,
            identity.isVerified,
            identity.verificationDate
        );
    }
}