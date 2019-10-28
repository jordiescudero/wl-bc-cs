pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "bloomen-token/contracts/ERC223ReceivingContract.sol";
import "bloomen-token/contracts/ERC223.sol";
import "solidity-rlp/contracts/RLPReader.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/access/roles/WhitelistedRole.sol";

contract ApiKeys is ERC223ReceivingContract, WhitelistedRole{

  using SafeMath for uint256;
  using RLPReader for bytes;
  using RLPReader for uint;
  using RLPReader for RLPReader.RLPItem;

  struct ApiKey {
    string apiKey;
    uint256 startDate;
    uint256 time;
  }

  uint256 constant private PAGE_SIZE = 10;

  ERC223 private _erc223;

  mapping (bytes32 => ApiKey) private apiKeys_;

  constructor (address _erc223Addr) public {
    _erc223 = ERC223(_erc223Addr);
  }

  function tokenFallback(address _user, uint _amount, bytes memory _data) public onlyWhitelisted {
    RLPReader.RLPItem memory item = _data.toRlpItem();
    RLPReader.RLPItem[] memory itemList = item.toList();                    
    string memory apikey = string(itemList[1].toBytes());
    bytes32 apikeyHash = keccak256(bytes(apikey));
    ApiKey storage apiKey = apiKeys_[apikeyHash];

    // 1 token === 1 day 

    if (apiKey.startDate == 0) {
      // new apikey
      apiKey.apiKey = apikey;
      apiKey.startDate = now;
      apiKey.time = _amount * 60 * 60 * 24;

    } else if ((apiKey.startDate + apiKey.time) > now) {
      // add time to the apikey
      apiKey.time += _amount * 60 * 60 * 24;
    } else {
      //expired apikey
      apiKey.startDate = now;
      apiKey.time = _amount * 60 * 60 * 24;
    }
  }

  function getApiKey(string memory _apiKey) public view returns (ApiKey memory) {
    bytes32 apikeyHash = keccak256(bytes(_apiKey));
    ApiKey memory apiKey = apiKeys_[apikeyHash];
    require(apiKey.startDate > 0, "not exist");
    return apiKey;
  }

  function transferToSender() public onlyWhitelisted  {
    uint256 balance = _erc223.balanceOf(address(this));
    require(balance > 0, "empty transfers not allowed");
    _erc223.transfer(msg.sender,balance);
  }

}