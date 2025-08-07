const router = require("express").Router();
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router
  .route("/")
  .get(controller.list)
  .post(controller.validateOrderBody, controller.create)
  .all(methodNotAllowed);

router
  .route("/:orderId")
  .get(controller.orderExists, controller.read)
  .put(
    controller.orderExists,
    controller.validateOrderBody,
    controller.validateMatchingId,
    controller.validateStatus,
    controller.update
  )
  .delete(
    controller.orderExists,
    controller.validateDeletable,
    controller.deleteOrder
  )
  .all(methodNotAllowed);

module.exports = router;
