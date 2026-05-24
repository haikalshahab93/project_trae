import express from "express";
import {
  buildQuote,
  fetchAvailableCurrencies,
} from "../services/exchangeRateService.js";

export const rateRouter = express.Router();

rateRouter.get("/currencies", async (req, res, next) => {
  try {
    const results = await fetchAvailableCurrencies(req.query.search);
    res.json({ results });
  } catch (error) {
    next(error);
  }
});

rateRouter.get("/latest", async (req, res, next) => {
  try {
    const quote = await buildQuote({
      amount: Number(req.query.amount || 1),
      fromCurrency: String(req.query.from || "QAR").toUpperCase(),
      toCurrency: String(req.query.to || "IDR").toUpperCase(),
    });

    res.json(quote);
  } catch (error) {
    next(error);
  }
});
