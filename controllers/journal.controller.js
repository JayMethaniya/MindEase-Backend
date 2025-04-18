const Journal = require('../models/journal.model');

// Create a new journal entry
const createJournalEntry = async (req, res) => {
  try {
    const { title, content, mood, userId } = req.body;

    const journalEntry = new Journal({
      userId,
      title,
      content,
      mood
    });

    await journalEntry.save();

    res.status(201).json({
      success: true,
      message: 'Journal entry created successfully',
      data: journalEntry
    });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create journal entry',
      error: error.message
    });
  }
};

// Get all journal entries for a user
const getUserJournalEntries = async (req, res) => {
  try {
    const { userId } = req.query;
    const entries = await Journal.find({ userId })
      .sort({ date: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      data: entries
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journal entries',
      error: error.message
    });
  }
};

// Update a journal entry
const updateJournalEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, mood, userId } = req.body;

    const entry = await Journal.findOneAndUpdate(
      { _id: id, userId },
      { title, content, mood },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Journal entry updated successfully',
      data: entry
    });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update journal entry',
      error: error.message
    });
  }
};

// Delete a journal entry
const deleteJournalEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const entry = await Journal.findOneAndDelete({ _id: id, userId });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete journal entry',
      error: error.message
    });
  }
};

module.exports = {
  createJournalEntry,
  getUserJournalEntries,
  updateJournalEntry,
  deleteJournalEntry
}; 