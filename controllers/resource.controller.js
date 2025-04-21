const Resource = require('../models/resource.model');
const User = require('../models/user.model');

// Get all resources with filtering
exports.getResources = async (req, res) => {
  try {
    const { type, status, category, search } = req.query;
    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'fullName email')
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    // Transform the data to ensure we have the user information
    const transformedResources = resources.map(resource => {
      const user = resource.uploadedBy || resource.createdBy;
      return {
        ...resource.toObject(),
        uploadedBy: user
      };
    });

    res.json({
      success: true,
      data: transformedResources
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resources'
    });
  }
};

// Create new resource
exports.createResource = async (req, res) => {
  try {
    const { title, type, content, category, tags, thumbnail } = req.body;
    
    const newResource = new Resource({
      title,
      type,
      content,
      category,
      tags,
      thumbnail,
      uploadedBy: req.user._id,
      createdBy: req.user._id
    });

    await newResource.save();
    
    // Populate the user information before sending response
    const populatedResource = await Resource.findById(newResource._id)
      .populate('uploadedBy', 'fullName email')
      .populate('createdBy', 'fullName email');

    res.status(201).json({
      success: true,
      data: populatedResource
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating resource'
    });
  }
};

// Update resource
exports.updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, content, category, tags, thumbnail } = req.body;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      id,
      { title, type, content, category, tags, thumbnail },
      { new: true }
    )
    .populate('uploadedBy', 'fullName email')
    .populate('createdBy', 'fullName email');

    res.json({
      success: true,
      data: updatedResource
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating resource'
    });
  }
};

// Delete resource
exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    await Resource.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting resource'
    });
  }
};

// Get resource by ID
exports.getResourceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = await Resource.findById(id)
      .populate('uploadedBy', 'fullName email')
      .populate('createdBy', 'fullName email');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Transform the data to ensure we have the user information
    const transformedResource = {
      ...resource.toObject(),
      uploadedBy: resource.uploadedBy || resource.createdBy
    };

    // Increment views
    resource.views += 1;
    await resource.save();

    res.json({
      success: true,
      data: transformedResource
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resource'
    });
  }
};
