const router = require("express").Router();
const { signUp, signIn, logout } = require("../controllers/auth.controller");
const { uploadProfilePic } = require("../controllers/upload.controller");
const {
  getAllUsers,
  userInfo,
  updateUser,
  deleteUser,
  follow,
  unfollow,
} = require("../controllers/user.controller");
const multer = require("multer");
const upload = multer();

// Auth
router.post("/register", signUp);
router.post("/login", signIn);
router.get("/logout", logout);

// User DB
router.get("/", getAllUsers);
router.get("/:id", userInfo);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.patch("/follow/:id", follow);
router.patch("/unfollow/:id", unfollow);

// Uploads
router.post("/upload", upload.single("file"), uploadProfilePic);

module.exports = router;
