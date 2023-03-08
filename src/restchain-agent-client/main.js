const axios = require('axios');


const express = require("express");
const app = express();

const SmartContractAddress = "your smart contract address";
const SmartContractABI = "contract_abi";
const address = "account adress"
const privatekey = "private key of the above account address";
const rpcurl = "infura rpc url";

const Web3 = require('web3');
const {get} = require("axios");
const provider = new Web3.providers.HttpProvider('https://rpc-mumbai.maticvigil.com/');
const web3 = new Web3(provider);



const BASE_URL = "http://localhost:8085";

// Create instance of axios which utilizes BASE_URL
const axiosInstance = axios.create({ baseURL: BASE_URL });



const createSession = async () => {
    console.log("create session");
    const authParams = {
      address: "0x535CCa8697F29DaC037a734D6984eeD7EA943A85",
      password: "test"

    };
    const resp = await axios.post(BASE_URL+"/login", authParams,{headers: {'content-type': 'application/x-www-form-urlencoded'}});
    const cookie = resp.headers["set-cookie"][0]; // get cookie from request
    axiosInstance.defaults.headers.Cookie = cookie;   // attach cookie to axiosInstance for future requests
  }

  // send Post request to https://stackoverflow.com/protected after created session 
createSession().then(() => {
    axiosInstance.get('/contract/listImpl') // with new cookie
  })




console.log("1. Call for last Ethereum block ....")
web3.eth.getBlockNumber().then((result) => {
    console.log("Latest Ethereum Block is ", result);
});








const getTestData = async () => {
    try {
        const resp = await axiosInstance.get('http://webcode.me');
        console.log(resp.data);
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
};

const getListImpl = async () => {
    try {
        const resp = await axios.get('http://localhost:8085/contract/listImpl');
        console.log(resp.data);
    } catch (err) {
        // Handle Error Here
        console.error("STATUS ERROR",err.response.data,err.response.status);
    }
};
getListImpl()


console.log("2. Testing axios ....")
getTestData()


console.log("3. Testing login ....")
const loginData = {
    address: "0x535CCa8697F29DaC037a734D6984eeD7EA943A85",
    password: "test"
}


// axios.post('http://localhost:8085/login', loginData,
//     {headers: {'content-type': 'application/x-www-form-urlencoded'}}
// ).then((response) => {
//     console.log("resp",response.status)
//     // console.log("4. Implementations ....")
//     // axios.get('http://localhost:8085/contract/listImpl').then(resp => {
//     // });
//
// });
const postLogin = async () => {
    try {
        const resp = await axios.post('http://localhost:8085/login',loginData, {headers: {'content-type': 'application/x-www-form-urlencoded'}});
        console.log("DATA",resp.data);
        getListImpl()
    } catch (err) {
        // Handle Error Here
        console.error("STATUS ERROR",err.response.status);
    }
};

postLogin()

console.log("4. Testing send Data ...")

app.listen(2400, () => {
    console.log("Server started at port 2400");
});

// const sendData = async () => {
//
//     console.log("in function");
//     var provider = new Provider(privatekey, rpcurl);
//     var web3 = new Web3(provider);
//     var myContract = new web3.eth.Contract(SmartContractABI, SmartContractAddress);
//     var oldvalue = await myContract.methods.retrieve().call();
//     console.log("oldvalue", oldvalue);
//
//
//     var receipt = await myContract.methods.store(5781).send({ from: address });
//     console.log(receipt);
//
//     var newvalue = await myContract.methods.retrieve().call();
//     console.log("newvalue", newvalue);
//
//     console.log("done with all things");
//
// }
//
// sendData();
