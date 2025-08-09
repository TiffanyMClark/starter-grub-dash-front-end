const router = require("express").Router();
const dishesController = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

//  handling dish list and dish creation
router
  .route("/")
  .get(dishesController.list)
  .post(dishesController.create)
  .all(methodNotAllowed);

// handling individual dish
router
  .route("/:dishId")
  .get(dishesController.read)
  .put(dishesController.update)
  .all(methodNotAllowed);

module.exports = router;
