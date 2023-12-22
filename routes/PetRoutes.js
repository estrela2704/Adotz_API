const router = require("express").Router();

const PetController = require("../controllers/PetController");

const authMidlleware = require("../helpers/verify-token");
const imageUpload = require("../helpers/image-upload");

router.post(
  "/create",
  authMidlleware,
  imageUpload.array("images"),
  PetController.create
);
router.get("/", PetController.getAll);
router.get("/mypets", authMidlleware, PetController.getAllUserPets);
router.get("/myadoptions", authMidlleware, PetController.getAllUserAdoptions);
router.get("/:id", PetController.getPetById);
router.delete("/:id", authMidlleware, PetController.removePetById);
router.patch(
  "/:id",
  imageUpload.array("images"),
  authMidlleware,
  PetController.updatePet
);

module.exports = router;
