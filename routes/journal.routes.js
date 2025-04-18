const express = require('express');
const router = express.Router();
const {
  createJournalEntry,
  getUserJournalEntries,
  updateJournalEntry,
  deleteJournalEntry
} = require('../controllers/journal.controller');

// Journal routes
router.post('/', createJournalEntry);
router.get('/', getUserJournalEntries);
router.put('/:id', updateJournalEntry);
router.delete('/:id', deleteJournalEntry);

module.exports = router; 