// the file needs to know where to loook for the data
const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data.js"));

// middleware to check the dish

function validateDish(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;

  if (!name || name === "") {
    return next({
      status: 400,
      message: "Dish must include a name.",
    });
  }
  if (!description || description === "") {
    return next({
      status: 400,
      message: "Dish must include a description.",
    });
  }
  if (!price || price <= 0 || typeof price !== "number") {
    return next({
      status: 400,
      message: "Dish must include a price that is an integer greater than 0.",
    });
  }
  if (!image_url || image_url === "") {
    return next({
      status: 400,
      message: "Dish must include a image_url.",
    });
  }
  res.locals.dishData = { name, description, price, image_url };
  next();
}
// middleware to check if the dish exists
function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);

  if (!foundDish) {
    return next({
      status: 404,
      message: `Dish does not exist: ${dishId}`,
    });
  }

  res.locals.dish = foundDish;
  next();
}

function validateDishId(req, _, next) {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;

  if (id && id !== dishId) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }

  next();
}

module.exports = {
  validateDish,
  dishExists,
  validateDishId,
};
