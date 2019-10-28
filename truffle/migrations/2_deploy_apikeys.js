var ERC223 = artifacts.require("bloomen-token/ERC223");
var ApiKeys = artifacts.require("./bloomen/ApiKeys.sol");

 module.exports = function(deployer,network) {
   var _erc223,_apiKeys;
   deployer
   .then(() => ERC223.deployed())
   .then((instance) => {
      _erc223 = instance;
      return deployer.deploy(ApiKeys,_erc223.address);   
    }).then((instance) => {
      _apiKeys = instance
      return _apiKeys.addWhitelisted(deployer.networks[network].from)
    }).then(() => _apiKeys.addWhitelisted(_erc223.address));
 };
