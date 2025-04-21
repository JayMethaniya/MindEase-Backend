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

    const newBlog = new blogModel({
      title,
      content,
      authorId: req.userId,
      blogImage: image
    });

    await newBlog.save();
    res.status(201).json({
      success: true,
      data: newBlog
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

    const updatedBlog = await blogModel.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }
    ).populate('authorId', 'fullName email');

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

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

    const deletedBlog = await blogModel.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

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