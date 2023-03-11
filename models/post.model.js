const mongoose = require("mongoose")

const postSchema = mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    authorId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 240
    },
    picture: {
      type: String
    },
    video: {
      type: String
    },
    likers: {
      type: [String],
      required: true
    },
    comments: {
      type: [
        {
          commenterId: String,
          commenterPseudo: String,
          text: String,
          timestamp: Number
        }
      ],
      required: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('post', postSchema)