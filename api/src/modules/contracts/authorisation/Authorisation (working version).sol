pragma solidity 0.5.7;
pragma experimental ABIEncoderV2;

import "./Ownable.sol";
import "./SafeMath.sol";


/**
 * @dev Contract module which provides an authorisation control mechanism, where
 * there is an 'owner' that can grant access to a specific 'reader'.
 * The 'reader' can request access to an 'owner'.
 */
contract Authorisation is Ownable {
    using SafeMath for uint256;
    using SafeMath32 for uint32;
    using SafeMath16 for uint16;

    event AuthorisationGranted(
        uint256 authorisationId,
        address _owner,
        address _reader
    );
    event AuthorisationRequested(
        address indexed _reader,
        address indexed _owner
    );
    event AuthorisationRemoved(address indexed _owner, address indexed _reader);

    struct AuthorisationStruct {
        address owner;
        mapping(address => bool) allowed;
    }

    struct RequestAuthorisationStruct {
        address reader;
        mapping(address => bool) requested;
    }

    mapping(address => AuthorisationStruct) authorisationStructs;
    mapping(address => RequestAuthorisationStruct) requestAuthorisationStructs;

    /**
     * @dev Gives authorisation to the '_reader'. Only the '_owner' can execute it.
     */
    function giveAuthorisation(address _owner, address _reader) public {
        _authorise(_owner, _reader);
    }

    /**
     * @dev Removes authorisation to the '_reader'. Only the '_owner' can execute it.
     */
    function removeAuthorisation(address _owner, address _reader) public {
        authorisationStructs[_owner].allowed[_reader] = false;
    }

    /**
     * @dev Check authorisation of the '_reader' for the '_owner'.
     */
    function isAuthorised(address _owner, address _reader)
        public
        view
        returns (bool)
    {
        return _isAuthorised(_owner, _reader);
    }

    /**
     * @dev Request auhtorisation of the sender to the '_owner'.
     */
    function requestAuthorisation(address _owner, address _reader) public {
        requestAuthorisationStructs[_reader].reader = _reader;
        requestAuthorisationStructs[_reader].requested[_owner] = true;
    }

    /**
     * @dev Approves authorisation by the sender to the '_reader'. Only the '_owner' can execute it.
     */
    function approveAuthorisation(address _owner, address _reader) public {
        requestAuthorisationStructs[_reader].requested[_owner] = false;
        _authorise(_owner, _reader);
    }

    /**
     * @dev Gives authorisation to the '_reader'. Only the '_owner' can execute it.
     */
    function _authorise(address _owner, address _reader) private {
        if (!_isAuthorised(_owner, _reader)) {
            authorisationStructs[_owner].owner = _owner;
            authorisationStructs[_owner].allowed[_reader] = true;
        }
    }

    /**
     * @dev Gives authorisation to the '_reader'. Only the '_owner' can execute it.
     */
    function _isAuthorised(address _owner, address _reader)
        private
        view
        returns (bool)
    {
        return authorisationStructs[_owner].allowed[_reader];
    }
}