//SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import '@openzeppelin/contracts/access/Ownable.sol';

error Certifi__IssuerAlreadyRegistered(address _wallet);
error Certifi__RegistrationProcessAlreadyStarted(address _wallet);
error Certifi__WrongRequestId(uint256 _requestId);

contract Certifi is Ownable {
    enum Decison {
        NONE,
        ACCEPTED,
        CANCELED
    }

    struct RegistrationRequest {
        Decison decision;
        address wallet;
        string issuerDataUrl;
    }

    struct Issuer {
        address wallet;
        string metadataUrl;
        uint256 id;
        mapping(address => bool) authorized;
    }

    // struct Certificate {
    //     string metadataUrl;
    //     address issuer;
    //     address owner;
    // }

    // mapping(address => bool) s_registrationRequested;
    // RegistrationRequest[] s_pendingRegistration;

    uint256 s_registrationRequestCounter;
    uint256[] s_pendingRegistrationRequests;
    mapping(uint256 => RegistrationRequest) s_registrationRequests;
    mapping(address => bool) s_pendingRequestAddresses;

    uint256 s_issuerIdCounter;
    uint256 s_issuers;
    mapping(uint256 => Issuer) s_idToIssuer;
    mapping(address => uint256) s_issuersAddressToId;

    // mapping(address => Certificate[]) s_ownersToCertificate;
    // mapping(address => Certificate[]) s_issuerToCertificate;

    // mapping(address => bytes32) s_personalHash;
    // mapping(bytes32 => Certificate[]) s_certificatePersmissions;

    event RegistrationRequested(uint256 _requestId, address _wallet);
    event IssuerRegistered(uint256 _issuerId, uint256 requestId);
    event RegistrationCanceled(uint256 _issuerId);

    function createRegistrationRequest(string memory _dataUrl) external {
        if (s_issuersAddressToId[msg.sender] != 0) {
            revert Certifi__IssuerAlreadyRegistered(msg.sender);
        }

        if (s_pendingRequestAddresses[msg.sender]) {
            revert Certifi__RegistrationProcessAlreadyStarted(msg.sender);
        }

        s_registrationRequestCounter++;
        s_pendingRegistrationRequests.push(s_registrationRequestCounter);
        s_registrationRequests[
            s_registrationRequestCounter
        ] = RegistrationRequest(Decison.NONE, msg.sender, _dataUrl);
        s_pendingRequestAddresses[msg.sender] = true;

        emit RegistrationRequested(s_registrationRequestCounter, msg.sender);
    }

    function finalizeRegistration(uint256 _requestId, Decison _decision)
        external
        onlyOwner
    {
        uint256[] memory pendingRegistration = s_pendingRegistrationRequests;
        int256 index = -1;
        for (uint256 i; i < pendingRegistration.length; i++) {
            if (pendingRegistration[i] == _requestId) {
                index = int256(i);
                break;
            }
        }

        if (index == -1) {
            revert Certifi__WrongRequestId(_requestId);
        }

        s_pendingRegistrationRequests[uint256(index)] = s_pendingRegistrationRequests[
            pendingRegistration.length - 1
        ];
        s_pendingRegistrationRequests.pop();

        RegistrationRequest memory request = s_registrationRequests[_requestId];
        s_pendingRequestAddresses[request.wallet] = false;

        if (_decision == Decison.CANCELED) {
            s_registrationRequests[_requestId].decision = Decison.CANCELED;

            emit RegistrationCanceled(_requestId);
        } else {
            uint256 id = s_issuerIdCounter + 1;
            Issuer storage newIssuer = s_idToIssuer[id];
            newIssuer.id = id;
            newIssuer.wallet = request.wallet;
            newIssuer.metadataUrl = request.issuerDataUrl;

            s_issuersAddressToId[request.wallet] = id;
            s_issuerIdCounter = id;

            s_registrationRequests[_requestId].decision = Decison.ACCEPTED;

            emit IssuerRegistered(id, _requestId);
        }
    }


}
