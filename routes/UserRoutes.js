const router = require("express").Router();

const UserController = require("../controllers/UserController");

const authMidlleware = require("../helpers/verify-token");

const imageUpload = require("../helpers/image-upload");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/checkuser", UserController.checkUser);
router.get("/:id", UserController.getUserById);
router.patch(
  "/edit",
  authMidlleware,
  imageUpload.single("image"),
  UserController.editUser
);

module.exports = router;
