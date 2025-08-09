const express = require("express");
const cors = require("cors");

const errorHandler = require("./src/errors/errorHandler");
const notFound = require("./src/errors/notFound");
const ordersRouter = require("./src/orders/orders.router");
const dishesRouter = require("./src/dishes/dishes.router");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/dishes", dishesRouter);
app.use("/orders", ordersRouter);

app.use(notFound);

app.use(errorHandler);

module.exports = app;
