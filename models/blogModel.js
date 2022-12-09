const mongoose = require("mongoose");
const { Schema } = mongoose;
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog must have a title"],
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Blog must have a description"],
      maxlength: [
        100,
        "A blog description must have less or equal to 100 characters",
      ],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Blog must have an author"],
    },
    state: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    read_count: {
      type: Number,
      default: 0,
    },
    reading_time: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    body: {
      type: String,
      required: [true, "Blog must have a body"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

blogSchema.index({ title: "text" });

blogSchema.pre(/^find/, function (next) {
  this.populate({
    path: "author",
    select: "first_name last_name email",
  });
  next();
});
blogSchema.pre("save", function (next) {
  this.reading_time = Math.ceil(this.body.split(" ").length / 200);
  next();
});
const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;