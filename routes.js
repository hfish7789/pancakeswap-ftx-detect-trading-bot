const axios = require("axios");
const { RestClient } = require("ftx-api");

module.exports = (app) => {
  var router = require("express").Router();
  const restClientOptions = {
    // Subaccount nickname URI-encoded
    subAccountName: encodeURI("GMT-USDC"),
    baseUrl: "https://ftx.com/api",
  };

  const ftxClient = new RestClient(
    "39cpDbwlXbFASi-Rcx4hlvFMmU-RcZz0imyY7Ti8",
    "3RdNQGot7VpssZsR9uTtJjLI4dJ4YYxuwwtaZIoX",

    // "19vS1Z7C52nKx9z6kMo5V3NWqlzFn1YVAHshxyBx",
    // "cLmN4-WTFoihOFJrC982VYkYy5pTJTF2l5KDXxVb"

    // "a6FeUMyO_1sLC0sgCqhRDGCunx7tgP0idu8wSPUL",
    // "XXS8VMtgdU_iNItv0j_vMtgWlJnrHfIQmVOxfiUc",
    restClientOptions
  );

  router.get("/bnb_perp", async (req, res) => {
    var data = await ftxClient.getMarket("BNB-PERP");
    res.sendStatus(data.result.price);
  });

  router.post("/bnb_buy", async (req, res) => {
    let balances;
    try {
      balances = await ftxClient.getBalances();
    } catch (error) {
      console.log(error);
    }
    let usd_balance = await balances.result.find((data) => data.coin === "USD")
      .total;
    console.log(usd_balance);

    if (usd_balance > req.body.usd) {
      let quote_request;
      try {
        quote_request = await ftxClient.requestQuote({
          fromCoin: "USD",
          toCoin: "BNB",
          size: req.body.usd,
        });
      } catch (error) {
        console.log(error);
      }
      console.log(quote_request, 11111);

      let quote_state;
      try {
        quote_state = await ftxClient.getQuoteStatus(
          quote_request.result.quoteId
        );
      } catch (error) {
        console.log(error);
      }
      console.log(quote_state, 22222);

      let convert_state;
      try {
        convert_state = await ftxClient.acceptQuote(
          quote_request.result.quoteId
        );
      } catch (error) {
        console.log(error);
      }

      console.log(convert_state.success, 33333);
      res.send(convert_state.success);
    }
    res.send("no_balance");
  });

  router.get("/bnb_sell", async (req, res) => {
    let balances;
    try {
      balances = await ftxClient.getBalances();
    } catch (error) {
      console.log(error);
    }
    let bnb_balance = await balances.result.find((data) => data.coin === "USD")
      .total;
    console.log(bnb_balance);

    if (bnb_balance > 0.5) {
      let quote_request;
      try {
        quote_request = await ftxClient.requestQuote({
          fromCoin: "BNB",
          toCoin: "USD",
          size: 0.5,
        });
      } catch (error) {
        console.log(error);
      }
      console.log(quote_request, 11111);

      let quote_state;
      try {
        quote_state = await ftxClient.getQuoteStatus(
          quote_request.result.quoteId
        );
      } catch (error) {
        console.log(error);
      }
      console.log(quote_state, 22222);

      let convert_state;
      try {
        convert_state = await ftxClient.acceptQuote(
          quote_request.result.quoteId
        );
      } catch (error) {
        console.log(error);
      }

      console.log(convert_state.success, 33333);
      res.send(convert_state.success);
    }
    res.send("no_balance");
  });

  app.use("", router);
};
