import express from 'express';
import { Question } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all questions for user (optionally filtered by folder)
router.get('/', async (req, res) => {
  try {
    const { folderId, difficulty, completed, search } = req.query;
    const query = { userId: req.user._id };

    if (folderId) {
      query.folderId = folderId;
    }

    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    if (completed !== undefined) {
      query.isCompleted = completed === 'true';
    }

    let questions;
    if (search) {
      questions = await Question.find({
        ...query,
        $text: { $search: search },
      }).sort({ questionNumber: 1 });
    } else {
      questions = await Question.find(query).sort({ questionNumber: 1 });
    }

    res.json({ success: true, questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Get stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Question.countDocuments({ userId: req.user._id });
    const completed = await Question.countDocuments({ 
      userId: req.user._id, 
      isCompleted: true 
    });

    const byDifficulty = await Question.aggregate([
      { $match: { userId: req.user._id } },
      { 
        $group: { 
          _id: '$difficulty', 
          total: { $sum: 1 },
          completed: { 
            $sum: { $cond: ['$isCompleted', 1, 0] } 
          }
        } 
      }
    ]);

    res.json({
      success: true,
      stats: {
        total,
        completed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        byDifficulty: byDifficulty.reduce((acc, curr) => {
          acc[curr._id] = { total: curr.total, completed: curr.completed };
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get single question
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ success: true, question });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// Create question
router.post('/', async (req, res) => {
  try {
    const { folderId, questionNumber, title, difficulty, link, tags, notes } = req.body;

    if (!folderId) {
      return res.status(400).json({ error: 'Folder ID is required' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const question = await Question.create({
      userId: req.user._id,
      folderId,
      questionNumber: questionNumber || 0,
      title: title.trim(),
      difficulty: difficulty || 'medium',
      link: link || '',
      tags: tags || [],
      notes: notes || '',
    });

    res.status(201).json({ success: true, question });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Update question
router.patch('/:id', async (req, res) => {
  try {
    const { questionNumber, title, difficulty, link, tags, notes, folderId } = req.body;
    const updates = {};

    if (questionNumber !== undefined) updates.questionNumber = questionNumber;
    if (title !== undefined) updates.title = title.trim();
    if (difficulty !== undefined) updates.difficulty = difficulty;
    if (link !== undefined) updates.link = link;
    if (tags !== undefined) updates.tags = tags;
    if (notes !== undefined) updates.notes = notes;
    if (folderId !== undefined) updates.folderId = folderId;

    const question = await Question.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ success: true, question });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Toggle completion
router.patch('/:id/complete', async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    question.isCompleted = !question.isCompleted;
    question.completedAt = question.isCompleted ? new Date() : null;
    await question.save();

    res.json({ success: true, question });
  } catch (error) {
    console.error('Toggle complete error:', error);
    res.status(500).json({ error: 'Failed to toggle completion' });
  }
});

// Delete question
router.delete('/:id', async (req, res) => {
  try {
    const question = await Question.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

export default router;
