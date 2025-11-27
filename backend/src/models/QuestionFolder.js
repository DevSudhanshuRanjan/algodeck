import mongoose from 'mongoose';

const subfolderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
});

const questionFolderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  subfolders: [subfolderSchema],
}, {
  timestamps: true,
});

// Compound index for user's folders
questionFolderSchema.index({ userId: 1, name: 1 });

const QuestionFolder = mongoose.model('QuestionFolder', questionFolderSchema);

export default QuestionFolder;
