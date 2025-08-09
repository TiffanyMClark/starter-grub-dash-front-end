const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// using to generate unique ids
const nextId = require("../utils/nextId");
const validation = require("../utils/validation");
const { isIdMatchingWithRouteId } = require("../utils/validation");
// Validate dishes quantity
function validateDishesQuantity(req, res, next) {
  const data = req.body.data;
  data.dishes.forEach((dish, index) => {
    if (
      !dish.quantity ||
      typeof dish.quantity !== "number" ||
      dish.quantity < 0
    ) {
      next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });
  next();
}
// Check if order exists
function isExists(req, res, next) {
  const { orderId } = req.params;
  const orderFound = orders.find((order) => order.id === orderId);
  if (orderFound) {
    res.locals.order = orderFound;
    next();
  } else {
    next({
      status: 404,
      message: `Order does not exist: ${orderId}.`,
    });
  }
}
// Check if status is invalid
function isStatusInValid(req, res, next) {
  const body = req.body.data;
  if (body.status === "invalid") {
    next({
      status: 400,
      message: "status is invalid",
    });
  } else {
    next();
  }
}
// Update an existing order
function update(req, res) {
  const order = res.locals.order;
  const body = req.body.data;
  let id;
  if (body.id) {
    id = body.id;
  } else {
    id = order.id;
  }
  res.json({ data: { ...body, id } });
}
// Create a new order
function create(req, res, next) {
  const { data } = req.body;
  const newOrder = {
    id: nextId(),
    ...data,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}
// Read an existing order
function read(req, res) {
  const order = res.locals.order;
  res.status(200).json({ data: order });
}
// List all existing orders
function list(req, res) {
  res.status(200).json({ data: orders });
}
// Delete an existing order
function destroy(req, res, next) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  if (orders[index].status === "pending") {
    orders.splice(index, 1);
    res.sendStatus(204);
  } else {
    next({
      status: 400,
      message: "status is in pending",
    });
  }
}

module.exports = {
  list,
  read: [isExists, read],
  create: [
    validation.validateObjectStringKeys("deliverTo", "Order"),
    validation.validateObjectStringKeys("mobileNumber", "Order"),
    validation.validateObjectArrayKeys("dishes", "Order"),
    validateDishesQuantity,
    create,
  ],
  update: [
    isExists,
    isIdMatchingWithRouteId("orderId", "Order"),
    validation.validateObjectStringKeys("status", "Order"),
    validation.validateObjectStringKeys("deliverTo", "Order"),
    validation.validateObjectStringKeys("mobileNumber", "Order"),
    validation.validateObjectArrayKeys("dishes", "Order"),
    validateDishesQuantity,
    isStatusInValid,
    update,
  ],
  delete: [isExists, destroy],
};
