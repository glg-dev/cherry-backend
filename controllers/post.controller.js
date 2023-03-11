const PostModel = require("../models/post.model");
const UserModel = require("../models/user.model");
const { uploadErrors } = require("../utils/errors.utils");
const ObjectId = require("mongoose").Types.ObjectId;
const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);

module.exports.getPosts = async (req, res) => {
  const posts = await PostModel.find().sort({ createdAt: -1 });
  res.status(200).json(posts);
};

module.exports.createPost = async (req, res) => {
  let fileName;

  if (req.file !== null) {
    try {
      if (
        req.file.detectedMimeType !== "image/jpg" &&
        req.file.detectedMimeType !== "image/jpeg" &&
        req.file.detectedMimeType !== "image/png"
      )
        throw Error("Invalid format");

      if (req.file.size > 500000) throw Error("max size");
    } catch (err) {
      const errors = uploadErrors(err);
      return res.status(500).json({ errors });
    }

    fileName = req.body.authorId + Date.now() + ".jpg";
    await pipeline(
      req.file.stream,
      fs.createWriteStream(
        `${__dirname}/../../frontend/public/uploads/posts/${fileName}`
      )
    );
  }

  if (!req.body.message && !req.file) {
    res.status(400).json({ message: "Merci d'ajouter un message" });
  }

  const post = await PostModel.create({
    message: req.body.message,
    authorId: req.body.authorId,
    picture: req.file !== null ? `./uploads/posts/${fileName}` : "",
    video: req.body.video,
    likers: [],
    comments: [],
  });
  res.status(201).json(post);
};

module.exports.editPost = async (req, res) => {
  const post = await PostModel.findById(req.params.id);

  if (!post) {
    res.status(400).json({ message: "Ce post n'existe pas" });
  }

  const updatePost = await PostModel.findByIdAndUpdate(
    post,
    { $set: { message: req.body.message } },
    { new: true }
  );

  res.status(200).json(updatePost);
};

module.exports.deletePost = async (req, res) => {
  const post = await PostModel.findById(req.params.id);

  if (!post) {
    res.status(400).json({ message: "Ce post n'existe pas" });
  }
  await PostModel.findByIdAndRemove(req.params.id);
  res.status(200).json("Message supprimé " + req.params.id);
};

module.exports.likePost = async (req, res) => {
  try {
    await PostModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likers: req.body.userId } },
      { new: true }
    ).then((data) => res.status(200).send(data));
    await UserModel.findByIdAndUpdate(
      req.body.userId,
      { $addToSet: { likes: req.params.id } },
      { new: true }
    );
  } catch (err) {
    res.status(400).json(err);
  }
};

module.exports.dislikePost = async (req, res) => {
  try {
    await PostModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { likers: req.body.userId } },
      { new: true }
    ).then((data) => res.status(200).send(data));
    await UserModel.findByIdAndUpdate(
      req.body.userId,
      { $pull: { likes: req.params.id } },
      { new: true }
    );
  } catch (err) {
    res.status(400).json(err);
  }
};

module.exports.commentPost = async (req, res) => {
  const post = await PostModel.findById(req.params.id);

  if (!post) {
    res.status(400).json({ message: "Ce post n'existe pas" });
  }
  try {
    const comment = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            commenterId: req.body.commenterId,
            commenterPseudo: req.body.commenterPseudo,
            text: req.body.text,
            timestamp: new Date().getTime(),
          },
        },
      },
      { new: true }
    );
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.editCommentPost = async (req, res) => {
  const post = await PostModel.findById(req.params.id);

  if (!post) {
    res.status(400).json({ message: "Ce post n'existe pas" });
  }

  const commentToEdit = post.comments.find((comment) => {
    return comment._id.equals(new ObjectId(req.body.commentId));
  });

  if (!commentToEdit) return res.status(404).send("Commentaire non trouvé");
  return post
    .save((commentToEdit.text = req.body.text))
    .then((data) => res.status(200).send(data));
};

module.exports.deleteCommentPost = (req, res) => {
  try {
    return PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          comments: {
            _id: req.body.commentId,
          },
        },
      },
      { new: true }
    ).then((data) => res.status(200).send(data));
  } catch (error) {
    res.status(400).send(err);
  }
};
