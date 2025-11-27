import mongoose from 'mongoose';

const noteFolderSchema = new mongoose.Schema({
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
  noteCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Compound index for user's folders
noteFolderSchema.index({ userId: 1, name: 1 });

const NoteFolder = mongoose.model('NoteFolder', noteFolderSchema);

export default NoteFolder;
