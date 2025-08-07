const router = require("express").Router({ mergeParams: true });
const controller = require("./dishes.controller");
const {
  validateDish,
  dishExists,
  validateDishId,
} = require("./dishes.middleware");
const methodNotAllowed = require("../errors/methodNotAllowed");

router
  .route("/")
  .get(controller.list)
  .post(controller.validateDish, controller.create)
  .all(methodNotAllowed);

router
  .route("/:dishId")
  .get(controller.dishExists, controller.read)
  .put(
    controller.dishExists,
    controller.validateDish,
    controller.validateDishId,
    controller.update
  )
  .all(methodNotAllowed);
