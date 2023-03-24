const router = require('express').Router();
const expressListRoutes = require("express-list-routes");
const auth = require("./auth.route");
const user = require("./user.route");

router.get('/', async (req, res, next) => {
  res.send({ message: 'Ok api is working 🚀' });
});

router.use("/auth", auth);
router.use("/users", user);

expressListRoutes(router, { prefix: "/api/v1" });

module.exports = router;
