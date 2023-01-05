const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const Blog = require("../models/blogModel");
const APIFeatures = require("../utils/APIFeatures");

exports.getAllBlogs = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Blog.find({ state: "published" }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const blogs = await features.query;
  res.status(200).json({
    status: "success",
    results: blogs.length,
    data: {
      blogs,
    },
  });
});
exports.setAuthorId = catchAsync(async (req, res, next) => {
  req.body.author = req.user.id;
  next();
});
exports.createBlog = catchAsync(async (req, res, next) => {
  const newBlogToCreate = {
    title: req.body.title,
    description: req.body.description,
    author: req.body.author,
    state: req.body.state,
    tags: req.body.tags,
    body: req.body.body,
  };
  const newBlog = await Blog.create(newBlogToCreate);
  if (!newBlog) {
    return next(new AppError("Blog could not be created", 400));
  }
  res.status(201).json({
    status: "success",
    data: {
      blog: newBlog,
    },
  });
});
exports.getBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findOneAndUpdate(
    { $and: [{ _id: req.params.id }, { state: "published" }] },
    { $inc: { read_count: +1 } },
    {
      runValidators: true,
      new: true,
    }
  );

  if (!blog) return next(new AppError("Blog not found", 404));

  // blog.read_count++;
  // await blog.save();
  res.status(200).json({
    status: "success",
    data: {
      blog,
    },
  });
});
exports.updateBlog = catchAsync(async (req, res, next) => {
  let blog = await Blog.findOne({ _id: req.params.id });

  if (!blog) return next(new AppError("Blog not found", 404));
  
  console.log(blog.author.id, req.user.id);
  if (req.user.id !== blog.author.id) {
    return next(
      new AppError("You are not authorized to update this blog", 401)
    );
  }

  if (req.body.title) {
    blog.title = req.body.title;
  }
  if (req.body.description) {
    blog.description = req.body.description;
  }
  if (req.body.state) {
    blog.state = req.body.state;
  }
  if (req.body.tags) {
    blog.tags = req.body.tags;
  }
  if (req.body.body) {
    blog.body = req.body.body;
  }

  const updatedBlog = await blog.save();

  if (!updatedBlog) return next(new AppError("Blog not updated", 401));
  res.status(200).json({
    status: "success",
    data: {
      updatedBlog,
    },
  });
});

exports.deleteBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return next(new AppError("Blog not found", 404));
  if (req.user.id !== blog.author.id)
    return next(
      new AppError("You are not authorized to delete this blog", 401)
    );
  const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
  if (!deletedBlog) return next(new AppError("Blog not found", 400));
  console.log('Deleted successfully')
  res.status(200).json({
    status: "success",
    data: "Successfully deleted blog!",
  });
});
exports.getMyBlogs = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Blog.find({ author: req.user._id }).select("-__v -author"),
    req.query
  )
    .filter()
    .limitFields()
    .sort()
    .paginate();

  const blogs = await features.query;
  if (!blogs) return next(new AppError("No blogs found", 404));
  res.status(204).json({
    status: "success",
    results: blogs.length,
    data: {
      blogs,
    },
  });
});