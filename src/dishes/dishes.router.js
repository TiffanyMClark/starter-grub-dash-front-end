const router = require("express").Router({ mergeParams: true });
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router
  .route("/")
  .get(controller.list)
  .post(controller.create, controller.validateDish)
  .all(methodNotAllowed);

router
  .route("/:dishId")
  .get(controller.dishExists, controller.read)
  .put(
    controller.dishExists,
    controller.update,
    controller.validateDish,
    controller.validateDishId
  )
  .all(methodNotAllowed);

module.exports = router;
