//SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/interfaces/IERC20.sol';

enum Decision {
    NONE,
    PENDING,
    ACCEPTED,
    REJECTED
}

error Certifi__IssuerAlreadyRegistered(address _wallet);
error Certifi__RegistrationProcessAlreadyStarted(address _requester);
error Certifi__RequestNotPending(address _requester);
error Certifi__WrongDecision(Decision _decision);
error Certifi__WrongRequestId(uint256 _requestId);
error Certifi_HashAlreadyUsed(bytes32 _hash);
error Certifi_InsufficientBalance(address _issuer, uint256 _balance);
error Certifi_WithdrawFailed(
    address _issuer,
    uint256 _amount,
    uint256 _balance
);
error Certifi__IssuerNotRegistered(address _wallet);

contract Certifi is Ownable {
    struct RegistrationRequest {
        Decision decision;
        string requesterDataUrl;
    }

    struct Issuer {
        bool manageable;
        address wallet;
        string dataUrl;
        uint256 id;
    }

    struct Certificate {
        address owner;
        uint256 issuerId;
        string dataUrl;
    }

    IERC20 i_token;
    uint256 i_fee;

    uint256 s_idCounter;

    mapping(address => RegistrationRequest) s_registrationRequests;

    mapping(uint256 => Issuer) s_issuers;
    mapping(address => uint256) s_issuerAddressToId;
    mapping(address => uint256) s_balances;
    mapping(address => Certificate[]) s_ownerToCertificates;

    event RegistrationRequested(address _requester, string _issuerDataUrl);
    event IssuerRegistered(
        uint256 _issuerId,
        address _wallet,
        string _issuerDataUrl
    );
    event RegistrationRejected(address _requester);
    event CertificateIssued(
        uint256 issuerId,
        address _certified,
        string _certificateDataUrl
    );

    event Deposited(address _issuer, uint256 _amount);
    event Withdrawn(address _issuer, uint256 _amount);
    event FeesCollected(uint256 _amount);

    constructor(address _token, uint256 _fee) {
        i_token = IERC20(_token);
        i_fee = _fee;
    }

    function createRegistrationRequest(string memory _requesterDataUrl)
        external
    {
        Decision decision = s_registrationRequests[msg.sender].decision;
        if (decision == Decision.PENDING) {
            revert Certifi__RegistrationProcessAlreadyStarted(msg.sender);
        }
        if (decision == Decision.ACCEPTED) {
            revert Certifi__IssuerAlreadyRegistered(msg.sender);
        }

        RegistrationRequest memory request = RegistrationRequest(
            Decision.PENDING,
            _requesterDataUrl
        );

        s_registrationRequests[msg.sender] = request;

        emit RegistrationRequested(msg.sender, _requesterDataUrl);
    }

    function finalizeRegistration(address _requester, Decision _decision)
        external
        onlyOwner
    {
        if (s_registrationRequests[_requester].decision != Decision.PENDING) {
            revert Certifi__RequestNotPending(_requester);
        }

        s_registrationRequests[_requester].decision = _decision;

        if (_decision == Decision.ACCEPTED) {
            uint256 id = s_idCounter + 1;
            Issuer memory newIssuer = Issuer(
                false,
                _requester,
                s_registrationRequests[_requester].requesterDataUrl,
                id
            );

            s_issuers[id] = newIssuer;
            s_issuerAddressToId[_requester] = id;

            emit IssuerRegistered(id, _requester, newIssuer.dataUrl);
        } else if (_decision == Decision.REJECTED) {
            emit RegistrationRejected(_requester);
        } else {
            revert Certifi__WrongDecision(_decision);
        }
    }

    function issueCertificate(
        address _certified,
        string memory _certificateDataUrl
    ) external {
        if (s_issuerAddressToId[msg.sender] == 0) {
            revert Certifi__IssuerNotRegistered(msg.sender);
        }
        if (s_balances[msg.sender] < i_fee) {
            revert Certifi_InsufficientBalance(
                msg.sender,
                s_balances[msg.sender]
            );
        }

        s_balances[msg.sender] -= i_fee;
        s_balances[address(this)] += i_fee;

        uint256 issuerId = s_issuerAddressToId[msg.sender];

        Certificate memory certificate = Certificate(
            _certified,
            issuerId,
            _certificateDataUrl
        );

        s_ownerToCertificates[_certified].push(certificate);

        emit CertificateIssued(issuerId, _certified, _certificateDataUrl);
    }

    //Token needs to be approved, before deposit;
    function deposit(uint256 _amount) external {
        s_balances[msg.sender] += _amount;
        i_token.transferFrom(msg.sender, address(this), _amount);

        emit Deposited(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external {
        uint256 balance = s_balances[msg.sender];
        if (balance < _amount) {
            revert Certifi_WithdrawFailed(msg.sender, _amount, balance);
        }
        s_balances[msg.sender] = balance - _amount;
        i_token.transfer(msg.sender, _amount);

        emit Withdrawn(msg.sender, _amount);
    }

    function withdraw(address _wallet) external onlyOwner {
        uint256 balance = s_balances[address(this)];
        s_balances[address(this)] = 0;
        i_token.transfer(_wallet, balance);
        emit FeesCollected(balance);
    }

    function getCertificates(address _owner)
        external
        view
        returns (Certificate[] memory)
    {
        return s_ownerToCertificates[_owner];
    }

    function getRegistrationRequest(address _requester)
        external
        view
        returns (RegistrationRequest memory)
    {
        return s_registrationRequests[_requester];
    }

    function getIssuerId(address _wallet) external view returns (uint256) {
        return s_issuerAddressToId[_wallet];
    }

    function getIssuerById(uint256 _id) external view returns (Issuer memory) {
        return s_issuers[_id];
    }

    function getTokenBalance(address _wallet) external view returns (uint256) {
        return s_balances[_wallet];
    }
}
