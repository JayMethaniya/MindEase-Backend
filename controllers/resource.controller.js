const Resource = require('../models/resource.model');

module.exports.createResource = async (req, res) => {
  try {
    const { title, videoUrl, articleContent, initiativeDetails, type } = req.body;

    // Determine the correct content field based on type
    let content = '';
    if (type === 'video') content = videoUrl;
    else if (type === 'article') content = articleContent;
    else if (type === 'initiative') content = initiativeDetails;

    const newResource = new Resource({
      title,
      videoUrl,
      articleContent,
      initiativeDetails,
      type,
      content,
      createdBy: req.userId,
    });

    await newResource.save();
    res.status(201).json(newResource);
  } catch (error) {
    console.error("Create Resource Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports.getResources = async (req, res) => {
  try {
    const resources = await Resource.find().populate('createdBy', 'fullName');
    res.status(200).json(resources);
  } catch (error) {
    console.error("Get Resources Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// New method to delete a resource
module.exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params; // Get the resource ID from the request parameters
    const resource = await Resource.findByIdAndDelete(id); // Delete the resource

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Delete Resource Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
