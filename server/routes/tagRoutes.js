const express = require('express');
const router = express.Router();
const {
    getTags,
    createTag,
    updateTag,
    deleteTag
} = require('../controllers/tagController');

// Base route /api/tags
router.get('/', getTags);
router.post('/', createTag);
router.put('/:id', updateTag);
router.delete('/:id', deleteTag);

module.exports = router;
