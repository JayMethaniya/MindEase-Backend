const blogModel = require('../models/blog.model');

module.exports.getBlogs = async (req, res) => {
  try {
    const blogs = await blogModel.find()
      .populate('authorId', 'fullName email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: blogs
    });
  } catch (error) {
    console.error("Get Blogs Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error" 
    });
  }
};

module.exports.createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;
    const image = req.file?.path;

    // Determine the author ID based on who is making the request
    const authorId = req.admin?._id || req.user?._id;
    if (!authorId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No valid author found"
      });
    }

    const newBlog = new blogModel({
      title,
      content,
      authorId,
      blogImage: image
    });

    await newBlog.save();
    
    // Populate author details before sending response
    const populatedBlog = await blogModel.findById(newBlog._id)
      .populate('authorId', 'fullName email');

    res.status(201).json({
      success: true,
      data: populatedBlog
    });
  } catch (error) {
    console.error("Create Blog Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error" 
    });
  }
};

module.exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const image = req.file?.path;

    // Check if the user is the author or an admin
    const blog = await blogModel.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    const isAuthor = blog.authorId.equals(req.user?._id) || blog.authorId.equals(req.admin?._id);
    if (!isAuthor) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only update your own blogs"
      });
    }

    const updateData = { title, content };
    if (image) {
      updateData.blogImage = image;
    }

    const updatedBlog = await blogModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('authorId', 'fullName email');

    res.status(200).json({
      success: true,
      data: updatedBlog
    });
  } catch (error) {
    console.error("Update Blog Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error" 
    });
  }
};

module.exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the user is the author or an admin
    const blog = await blogModel.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    const isAuthor = blog.authorId.equals(req.user?._id) || blog.authorId.equals(req.admin?._id);
    if (!isAuthor) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only delete your own blogs"
      });
    }

    await blogModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully"
    });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error" 
    });
  }
};