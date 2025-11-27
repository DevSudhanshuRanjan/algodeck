import { useState } from 'react';
import { 
  Plus, 
  Folder, 
  FileText, 
  Pin, 
  MoreVertical,
  Edit,
  Trash2,
  ChevronRight,
  Search,
  X
} from 'lucide-react';
import { useData } from '../../context';
import { Button, Card, Modal, Input, Badge } from '../../components/common';
import './Notes.css';

// Helper to get ID (supports both MongoDB _id and local id)
const getId = (item) => item?._id || item?.id;

const Notes = () => {
  const { 
    noteFolders, 
    notes, 
    addNoteFolder, 
    addNote, 
    updateNote,
    deleteNote, 
    deleteNoteFolder,
    toggleNotePin 
  } = useData();

  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [noteForm, setNoteForm] = useState({
    title: '',
    heading: '',
    content: '',
    tags: '',
  });

  const filteredNotes = notes
    .filter(n => selectedFolder ? n.folderId === getId(selectedFolder) : true)
    .filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      addNoteFolder({ name: newFolderName.trim() });
      setNewFolderName('');
      setShowFolderModal(false);
    }
  };

  const handleSaveNote = () => {
    const noteData = {
      ...noteForm,
      folderId: getId(selectedFolder) || getId(noteFolders[0]),
      tags: noteForm.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    if (editingNote) {
      updateNote(getId(editingNote), noteData);
    } else {
      addNote(noteData);
    }

    resetNoteForm();
  };

  const resetNoteForm = () => {
    setNoteForm({ title: '', heading: '', content: '', tags: '' });
    setEditingNote(null);
    setShowNoteModal(false);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      heading: note.heading,
      content: note.content,
      tags: note.tags.join(', '),
    });
    setShowNoteModal(true);
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notes-page animate-fade-in">
      {/* Header */}
      <div className="notes-header">
        <h1>Notes</h1>
        <div className="notes-header-actions">
          <Button 
            variant="secondary" 
            icon={<Plus size={18} />}
            onClick={() => setShowFolderModal(true)}
          >
            New Folder
          </Button>
          <Button 
            icon={<Plus size={18} />}
            onClick={() => setShowNoteModal(true)}
            disabled={noteFolders.length === 0}
          >
            New Note
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="notes-search">
        <Input
          placeholder="Search notes..."
          icon={<Search size={18} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
        />
      </div>

      <div className="notes-content">
        {/* Folders Sidebar */}
        <div className="notes-folders">
          <div className="notes-folders-header">
            <h3>Folders</h3>
          </div>
          <div className="notes-folders-list">
            <button
              className={`notes-folder-item ${!selectedFolder ? 'active' : ''}`}
              onClick={() => setSelectedFolder(null)}
            >
              <Folder size={18} />
              <span>All Notes</span>
              <Badge size="sm">{notes.length}</Badge>
            </button>
            {noteFolders.map(folder => (
              <button
                key={getId(folder)}
                className={`notes-folder-item ${getId(selectedFolder) === getId(folder) ? 'active' : ''}`}
                onClick={() => setSelectedFolder(folder)}
              >
                <Folder size={18} />
                <span>{folder.name}</span>
                <Badge size="sm">
                  {notes.filter(n => n.folderId === getId(folder)).length}
                </Badge>
                <button 
                  className="notes-folder-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this folder and all its notes?')) {
                      deleteNoteFolder(getId(folder));
                      if (getId(selectedFolder) === getId(folder)) {
                        setSelectedFolder(null);
                      }
                    }
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </button>
            ))}
          </div>
        </div>

        {/* Notes List */}
        <div className="notes-list">
          {selectedFolder && (
            <div className="notes-list-header">
              <h2>{selectedFolder.name}</h2>
              <span>{filteredNotes.length} notes</span>
            </div>
          )}

          {filteredNotes.length > 0 ? (
            <div className="notes-grid">
              {filteredNotes.map(note => (
                <Card key={getId(note)} className="note-card" hover>
                  <div className="note-card-header">
                    <div className="note-card-icon">
                      {note.isPinned ? (
                        <Pin size={18} className="pinned" />
                      ) : (
                        <FileText size={18} />
                      )}
                    </div>
                    <div className="note-card-actions">
                      <button 
                        className="note-action-btn"
                        onClick={() => toggleNotePin(getId(note))}
                        title={note.isPinned ? 'Unpin' : 'Pin'}
                      >
                        <Pin size={16} className={note.isPinned ? 'pinned' : ''} />
                      </button>
                      <button 
                        className="note-action-btn"
                        onClick={() => handleEditNote(note)}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="note-action-btn delete"
                        onClick={() => {
                          if (confirm('Delete this note?')) {
                            deleteNote(getId(note));
                          }
                        }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 className="note-card-title">{note.title}</h3>
                  <p className="note-card-heading">{note.heading}</p>
                  <p className="note-card-preview">
                    {note.content.slice(0, 100)}...
                  </p>
                  <div className="note-card-footer">
                    <div className="note-card-tags">
                      {note.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <span className="note-card-time">
                      {getTimeAgo(note.updatedAt)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="notes-empty">
              <FileText size={48} />
              <h3>No notes yet</h3>
              <p>
                {noteFolders.length === 0 
                  ? 'Create a folder first, then add your notes'
                  : 'Start by creating your first note'}
              </p>
              {noteFolders.length > 0 && (
                <Button onClick={() => setShowNoteModal(true)}>
                  Create Note
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Folder Modal */}
      <Modal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        title="New Folder"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowFolderModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>
              Create Folder
            </Button>
          </>
        }
      >
        <Input
          label="Folder Name"
          placeholder="e.g., Algorithms, Data Structures"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          fullWidth
          autoFocus
        />
      </Modal>

      {/* New/Edit Note Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={resetNoteForm}
        title={editingNote ? 'Edit Note' : 'New Note'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={resetNoteForm}>
              Cancel
            </Button>
            <Button onClick={handleSaveNote}>
              {editingNote ? 'Save Changes' : 'Create Note'}
            </Button>
          </>
        }
      >
        <div className="note-form">
          <Input
            label="Title"
            placeholder="Note title"
            value={noteForm.title}
            onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
            fullWidth
          />
          <Input
            label="Heading"
            placeholder="A brief description"
            value={noteForm.heading}
            onChange={(e) => setNoteForm({ ...noteForm, heading: e.target.value })}
            fullWidth
          />
          <div className="input-wrapper input-full">
            <label className="input-label">Content</label>
            <textarea
              className="input-field"
              placeholder="Write your notes here... (Markdown supported)"
              value={noteForm.content}
              onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
              rows={10}
            />
          </div>
          <Input
            label="Tags"
            placeholder="Comma-separated tags (e.g., tree, traversal, recursion)"
            value={noteForm.tags}
            onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
            fullWidth
          />
        </div>
      </Modal>
    </div>
  );
};

export default Notes;
