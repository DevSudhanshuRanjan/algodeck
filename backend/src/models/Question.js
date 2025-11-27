import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  folderId: {
    type: String,
    required: true,
    index: true,
  },
  questionNumber: {
    type: Number,
    default: 0,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  link: {
    type: String,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  notes: {
    type: String,
    default: '',
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Compound indexes
questionSchema.index({ userId: 1, folderId: 1 });
questionSchema.index({ userId: 1, isCompleted: 1 });
questionSchema.index({ userId: 1, difficulty: 1 });
questionSchema.index({ userId: 1, questionNumber: 1 });

// Text index for search
questionSchema.index({ title: 'text', notes: 'text', tags: 'text' });

const Question = mongoose.model('Question', questionSchema);

export default Question;
