const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

// middleware for orders that must exist
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return res
      .status(404)
      .json({ error: `Order with id ${orderId} not found` });
  }

  res.locals.order = order;
  next();
}
// and then middleware for validating order
function validateOrderBody(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  if (!deliverTo || deliverTo === "") {
    return next({ status: 400, message: "Order must include a deliverTo" });
  }
  if (!mobileNumber || mobileNumber === "") {
    return next({ status: 400, message: "Order must include a mobileNumber" });
  }
  if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }

  for (let i = 0; i < dishes.length; i++) {
    const dish = dishes[i];
    if (
      !dish.quantity ||
      typeof dish.quantity !== "number" ||
      dish.quantity <= 0
    ) {
      return next({
        status: 400,
        message: `Dish ${i} must have a quantity that is an integer greater than 0`,
      });
    }
  }

  res.locals.orderData = { deliverTo, mobileNumber, status, dishes };
  next();
}

// middleware for status
function validateStatus(req, res, next) {
  const { status } = res.locals.orderData;

  const validStatuses = [
    "pending",
    "preparing",
    "out-for-delivery",
    "delivered",
  ];
  if (!status || !validStatuses.includes(status)) {
    return next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  }

  if (res.locals.order.status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  }

  next();
}

// middleware for Id in matching route
function validateMatchingId(req, res, next) {
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body;

  if (id && id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
    });
  }

  next();
}

// middleware deleting
function validateDeletable(req, res, next) {
  if (res.locals.order.status !== "pending") {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  }
  next();
}
// list of orders
function list(req, res) {
  res.json({ data: orders });
}

function read(req, res) {
  res.json({ data: res.locals.order });
}

function create(req, res) {
  const { deliverTo, mobileNumber, dishes } = res.locals.orderData;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status: "pending",
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}
// update order
function update(req, res) {
  const order = res.locals.order;
  const { deliverTo, mobileNumber, status, dishes } = res.locals.orderData;

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;

  res.json({ data: order });
}

// delete order
function deleteOrder(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  read: [orderExists, read],
  create: [validateOrderBody, create],
  update: [
    orderExists,
    validateOrderBody,
    validateMatchingId,
    validateStatus,
    update,
  ],
  deleteOrder: [orderExists, validateDeletable, deleteOrder],
  orderExists,
  validateOrderBody,
  validateMatchingId,
  validateStatus,
  validateDeletable,
};
