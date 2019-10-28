require('dotenv').config();


module.exports = {
  scripts: {
    development: 'truffle migrate --reset ',
    export: 'copyfiles -f build/contracts/*.json ../app/src/providers/services/web3/contracts/json && copyfiles -f build/contracts/*.json ../api/src/contracts'
  }
};