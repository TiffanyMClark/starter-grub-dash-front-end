const router = require("express").Router();

const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router
  .route("/:orderId")
  .get(controller.read)
  .delete(controller.delete)
  .put(controller.update)
  .all(methodNotAllowed);
router
  .route("/")
  .post(controller.create)
  .get(controller.list)
  .all(methodNotAllowed);

module.exports = router;
