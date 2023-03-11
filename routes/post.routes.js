const express = require("express");
const {
  getPosts,
  createPost,
  editPost,
  deletePost,
  likePost,
  dislikePost,
  commentPost,
  editCommentPost,
  deleteCommentPost,
} = require("../controllers/post.controller");
const router = express.Router();
const multer = require("multer");
const upload = multer();

router.get("/", getPosts);
router.post("/", upload.single("file"), createPost);
router.put("/:id", editPost);
router.delete("/:id", deletePost);
router.patch("/like-post/:id", likePost);
router.patch("/dislike-post/:id", dislikePost);

// Comments
router.patch("/comment-post/:id", commentPost);
router.patch("/edit-comment-post/:id", editCommentPost);
router.patch("/delete-comment-post/:id", deleteCommentPost);

module.exports = router;
