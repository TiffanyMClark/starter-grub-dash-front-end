const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign IDs when necessary
const nextId = require("../utils/nextId");

// Validation Functions removed the validate file and put in order file.

function bodyHasDeliverTo(req, res, next) {
  const { data = {} } = req.body;

  if (!data.deliverTo) {
    return next({
      status: 400,
      message: "Order must include a deliverTo.",
    });
  }

  return next();
}

function bodyHasMobileNumber(req, res, next) {
  const { data = {} } = req.body;

  if (!data.mobileNumber) {
    return next({
      status: 400,
      message: "Order must include a mobileNumber.",
    });
  }
  return next();
}

function bodyHasDishes(req, res, next) {
  const { data = {} } = req.body;
  if (!data.dishes || !data.dishes.length || !Array.isArray(data.dishes)) {
    return next({
      status: 400,
      message: "Order must include at least one dish.",
    });
  }
  return next();
}

function bodyHasDishQuantity(req, res, next) {
  const { data = {} } = req.body;
  const dishes = data.dishes;
  const indexesOfDishesWithoutQuantity = dishes.reduce((acc, dish, index) => {
    if (
      !dish.quantity ||
      dish.quantity <= 0 ||
      typeof dish.quantity !== "number"
    ) {
      acc.push(index);
    }
    return acc;
  }, []);

  if (indexesOfDishesWithoutQuantity.length === 0) {
    return next();
  }

  const stringOfDishesIndex = indexesOfDishesWithoutQuantity.join(", ");
  next({
    status: 400,
    message: `Dishes ${stringOfDishesIndex} must have a quantity that is an integer greater than 0.`,
  });
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundId = orders.find((order) => order.id === orderId);
  if (foundId) {
    res.locals.order = foundId;
    return next();
  }
  next({
    status: 404,
    message: `Order id does not exist: ${orderId}`,
  });
}

function bodyIdMatchesRouteId(req, res, next) {
  const orderId = res.locals.order.id;
  const { data = {} } = req.body; // Get data from req.body

  if (data.id) {
    if (data.id === orderId) {
      return next();
    }
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${data.id}, Route: ${orderId}.`,
    });
  }
  return next();
}

function bodyHasStatus(req, res, next) {
  const { data = {} } = req.body;

  if (!data.status || data.status === "invalid") {
    return next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered.",
    });
  }
  if (data.status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed.",
    });
  }
  res.locals.order.status = data.status;
  return next();
}

function orderStatusIsPending(req, res, next) {
  const order = res.locals.order;

  if (order.status !== "pending") {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending.",
    });
  }
  return next();
}

// Route handlers
function destroy(req, res) {
  const orderId = res.locals.order.id;
  const orderIndex = orders.findIndex((order) => order.id === orderId);
  orders.splice(orderIndex, 1);
  res.sendStatus(204);
}

function update(req, res, next) {
  const { orderId } = req.params;
  const order = res.locals.order;
  const {
    data: { deliverTo, mobileNumber, dishes, quantity, id, status } = {},
  } = req.body; // Destructure request body

  if (id && id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
    });
  }

  if (
    !status ||
    !["pending", "preparing", "out-for-delivery", "delivered"].includes(status)
  ) {
    return next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  }

  if (order.status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  }

  // Update the order properties
  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.dishes = dishes;
  order.quantity = quantity;

  // Send the updated order
  res.json({ data: order });
}

function read(req, res) {
  res.json({ data: res.locals.order });
}

function create(req, res) {
  const { data = {} } = req.body;
  const newOrder = {
    ...data,
    id: nextId(),
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function list(req, res) {
  res.json({ data: orders });
}

module.exports = {
  create: [
    bodyHasDeliverTo,
    bodyHasMobileNumber,
    bodyHasDishes,
    bodyHasDishQuantity,
    create,
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    bodyHasDeliverTo,
    bodyHasMobileNumber,
    bodyHasDishes,
    bodyHasDishQuantity,
    bodyIdMatchesRouteId,
    bodyHasStatus,
    update,
  ],
  delete: [orderExists, orderStatusIsPending, destroy],
  list,
};
