window.userWalletAddress = null;
var routerContract;
var factoryContract;
var BN;
var n = 1;
var interValueSet;

window.ethereum.on("accountsChanged", function () {});

window.onload = async (event) => {
  n = 1;
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${Number(56).toString(16)}` }], // chainId must be in hexadecimal numbers
    });
    routerContract = new window.web3.eth.Contract(
      router_abi,
      "0x10ED43C718714eb63d5aA57B78B54704E256024E"
    );
    factoryContract = new window.web3.eth.Contract(
      factory_abi,
      "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73"
    );
    BN = window.web3.utils.BN;
  } else {
    alert("Please install MetaMask or any Ethereum Extension Wallet");
  }

  window.userWalletAddress = window.localStorage.getItem("userWalletAddress");
};

// // 1. Web3 login function
// const loginWithEth = async () => {
//   // 1.1 check if there is global window.web3 instance
//   if (window.web3) {
//     try {
//       // 2. get the user's ethereum account - prompts metamask to login
//       const selectedAccount = await window.ethereum
//         .request({
//           method: "eth_requestAccounts",
//         })
//         .then((accounts) => accounts[0])
//         .catch(() => {
//           // 2.1 if the user cancels the login prompt
//           throw Error("Please select an account");
//         });

//       // 3. set the global userWalletAddress variable to selected account
//       window.userWalletAddress = selectedAccount;

//       // 4. store the user's wallet address in local storage
//       window.localStorage.setItem("userWalletAddress", selectedAccount);

//       // 5. show the user dashboard
//     } catch (error) {
//       alert(error);
//     }
//   } else {
//     alert("wallet not found");
//   }
// };

const getBalance = (balance, decimal) => {
  if (balance.length < decimal + 1) {
    for (let i = 0; i < decimal + 3 - balance.length; i++) {
      balance = `0${balance}`;
    }
  }
  let fixed_balance = balance.slice(0, -(decimal - 5));
  let exact_balance = `${fixed_balance.slice(0, -5)}.${fixed_balance.slice(
    -5
  )}`;
  return Number(exact_balance);
};

const start = () => {
  interValueSet = 3000;
  $("#start_button").attr({ disabled: true });
  $("#stop_button").attr({ disabled: false });
  work();
  interValueSet = setInterval(() => {
    work();
  }, 60000);
};

const stop = () => {
  $("#start_button").attr({ disabled: false });
  $("#stop_button").attr({ disabled: true });
  clearInterval(interValueSet);
};

const work = async () => {
  var bnbContract = new window.web3.eth.Contract(
    token_abi,
    "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
  );
  var busdContract = new window.web3.eth.Contract(
    token_abi,
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"
  );
  var bnbDecimal = await bnbContract.methods.decimals().call();
  var busdDecimal = await busdContract.methods.decimals().call();
  var amounts = await routerContract.methods
    .getAmountsOut(new BN(10).pow(new BN(bnbDecimal)), [
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    ])
    .call();
  var output_busd = getBalance(amounts[1], busdDecimal);

  var priceData = await axios.get("/bnb_perp");
  var output_usd = priceData.data;
  var rate = (output_usd / output_busd).toFixed(5);

  var state = { text: "Skip", color: "black" };
  var trading_status;
  if (1 - rate >= 0.2) {
    state = { text: "Sell", color: "green" };
    trading_status = await axios.get("/bnb_sell");
    if (trading_status === false) {
      state = { text: "Sell fail", color: "red" };
    }
    if (trading_status === "no_balance") {
      state = { text: "No balance", color: "red" };
    }
  } else if (1 - rate <= -0.2) {
    state = { text: "Buy", color: "cyan" };
    trading_status = await axios.post("/bnb_buy", { usd: output_usd / 2 });
    if (trading_status === false) {
      state = { text: "Buy fail", color: "red" };
    }
    if (trading_status === "no_balance") {
      state = { text: "No balance", color: "red" };
    }
  } else {
    state = { text: "Skip", color: "black" };
  }

  $("#table-body").prepend(
    "<tr><td>" +
      n +
      "</td><td>1</td><td>" +
      rate +
      "</td><td>" +
      (1 - rate).toFixed(5) +
      "</td><td style='color: " +
      state.color +
      "'>" +
      state.text +
      "</td></tr>"
  );
  n++;
};

const setAmount = () => {
  alert();
};

const setTime = () => {
  alert();
};
