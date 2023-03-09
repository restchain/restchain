const axios = require("axios");

// Log content type
require("axios-debug-log")({
  request: function (debug, config) {
    debug("Request with " + config.headers["content-type"]);
  },
  response: function (debug, response) {
    debug(
      "Response with " + response.headers["content-type"],
      "from " + response.config.url
    );
  },
  error: function (debug, error) {
    // Read https://www.npmjs.com/package/axios#handling-errors for more info
    debug("Boom", error.response.data);
  }
});

const BASE_URL = "http://localhost:8085";
// Create instance of axios which utilizes BASE_URL
const axiosInstance = axios.create({
  baseURL: BASE_URL
});

/**
 * Test DATA
 */
const getTestData = async () => {
  try {
    const resp = await axiosInstance.get("http://webcode.me");
    console.log(resp.data);
  } catch (err) {
    // Handle Error Here
    console.error(err);
  }
};

/**
 * List all contracts
 */
const getListImpl = async () => {
  try {
    console.log("1. Called list impl ....");

    const resp = await axiosInstance.get("http://localhost:8085/contract/4");
    console.log(resp.data);
  } catch (err) {
    // Handle Error Here
    console.error("STATUS ERROR impl", err.response.data, err.response.status);
  }
};

/**
 * Create Session
 */
const craeteSession = async () => {
  const loginData = {
    address: "0x535CCa8697F29DaC037a734D6984eeD7EA943A85",
    password: "test"
  };
  try {
    const resp = await axiosInstance.post(
      "http://localhost:8085/login",
      loginData,
      {
        maxRedirects: 0,
        validateStatus: function (status) {
          console.log("status in", status);
          return true;
        },

        headers: { "content-type": "application/x-www-form-urlencoded" }
      }
    );
    console.log("Login [STATUS]:", resp.data);
    // console.log("Login [Headers]:", resp.headers);
    const cookie = resp.headers["set-cookie"][0]; // get cookie from request
    console.log("Login [cookie]:", cookie);
    axiosInstance.defaults.headers.Cookie = cookie;
    getListImpl();
  } catch (err) {
    // Handle Error Here
    console.error("!! STATUS ERROR", err.response.status);
  }
};

craeteSession();