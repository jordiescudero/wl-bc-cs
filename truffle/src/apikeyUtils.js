require('dotenv').config();
const inquirer = require('inquirer');
var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = process.env.DEVELOPMENT_MNEMONIC;

var fs = require('fs');
var contractJSON = JSON.parse(fs.readFileSync('./build/contracts/ApiKeys.json', 'utf8'));
const GAS = 990000;

const Web3 = require('web3');

var hdprovider = new HDWalletProvider(mnemonic, process.env.DEVELOPMENT_URL);

const web3 = new Web3(hdprovider);

const RLP = require('rlp');

const transactionObject = {
    from: hdprovider.getAddress(0),
    gas: GAS,
    gasPrice: 0
};

const contractInstance = new web3.eth.Contract(contractJSON.abi, contractJSON.networks[process.env.ALASTRIA_NETWORKID].address);

function doStuff() {
    switch (process.argv[2]) {
        case 'getApiKey':
            getApiKey(process.argv[3]);
            break;
        case 'transferToSender':
            transferToSender();
            break;
        case 'tokenFallback':
            tokenFallback();
            break;
        default:
            console.log('no command... getApiKey|transferToSender|tokenFallback')
    }
    hdprovider.engine.stop();
}

function getApiKey(apiKey) {
    contractInstance.methods.getApiKey(apiKey).call(transactionObject).then(
        (result) => {
            console.log('GET:', result)
        });
}

async function transferToSender() {
    contractInstance.methods.transferToSender()
        .send(transactionObject).then(checkTransaction);
}

async function tokenFallback() {

    let questions = [
        {type: 'input', name: 'address', message: 'Specify the address:'},
        {type: 'number', name: 'amount', message: 'Tokens:'},
        {type: 'input', name: 'apiKey', message: 'ApiKey:'},
    ];

    let answer = await inquirer.prompt(questions);

    const data = [];
    data.push(0);
    data.push(0);
    data.push("DEV-PORTAL");
    data.push(encodeURI('Api Payment'));
    data.push(answer.apiKey);

    contractInstance.methods.tokenFallback(answer.address, answer.amount, RLP.encode(data))
        .send(transactionObject).then(checkTransaction);
}

function checkTransaction(result) {
    web3.eth.getTransactionReceipt(result,
        (status) => {
            if (GAS == status.gasUsed) {
                //transaction error
                console.log('KO');
            } else {
                console.log('OK');
            }
        }
    );
}

doStuff();
