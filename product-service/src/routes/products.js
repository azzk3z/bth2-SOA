const express = require("express");
const router = express.Router();
const controller = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");

// Tat ca API san pham deu yeu cau xac thuc qua Auth Service
router.use(authMiddleware);

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
