const blogModel = require('../models/blog.model');

module.exports.createBlog = async (req, res) => {
  try {
    const { title, content, authorId } = req.body;
    const image = req.files?.blogImage ? req.files.blogImage[0].path : null;// Assuming you're using multer for file uploads

    const newBlog = new blogModel({
      title,
      content,
      authorId,
      image
    });

    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    console.error("Create Blog Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
module.exports.getBlogs = async (req, res) => {
  try {
    const blogs = await blogModel.find().populate('authorId', 'fullName email');
    res.status(200).json(blogs);
  } catch (error) {
    console.error("Get Blogs Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}