import { useState } from 'react';
import { 
  Plus, 
  Folder, 
  HelpCircle, 
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  Check,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useData } from '../../context';
import { Button, Card, Modal, Input, Badge } from '../../components/common';
import './Questions.css';

// Helper to get ID (supports both MongoDB _id and local id)
const getId = (item) => item?._id || item?.id;

const Questions = () => {
  const { 
    questionFolders, 
    questions, 
    addQuestionFolder, 
    addSubfolder,
    addQuestion, 
    updateQuestion,
    deleteQuestion, 
    deleteQuestionFolder,
    toggleQuestionComplete 
  } = useData();

  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedSubfolder, setSelectedSubfolder] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showSubfolderModal, setShowSubfolderModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [newFolderName, setNewFolderName] = useState('');
  const [questionForm, setQuestionForm] = useState({
    questionNumber: '',
    title: '',
    difficulty: 'medium',
    link: '',
    tags: '',
    notes: '',
  });

  const currentFolderId = getId(selectedSubfolder) || getId(selectedFolder);

  const filteredQuestions = questions
    .filter(q => currentFolderId ? q.folderId === currentFolderId : true)
    .filter(q => 
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(q => difficultyFilter === 'all' || q.difficulty === difficultyFilter)
    .sort((a, b) => a.questionNumber - b.questionNumber);

  const getCompletionStats = (folderId) => {
    const folderQuestions = questions.filter(q => q.folderId === folderId);
    const completed = folderQuestions.filter(q => q.isCompleted).length;
    return { total: folderQuestions.length, completed };
  };

  const toggleFolderExpand = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      addQuestionFolder({ name: newFolderName.trim() });
      setNewFolderName('');
      setShowFolderModal(false);
    }
  };

  const handleCreateSubfolder = () => {
    if (newFolderName.trim() && selectedFolder) {
      addSubfolder(getId(selectedFolder), { name: newFolderName.trim() });
      setNewFolderName('');
      setShowSubfolderModal(false);
    }
  };

  const handleSaveQuestion = () => {
    const questionData = {
      ...questionForm,
      questionNumber: parseInt(questionForm.questionNumber) || 0,
      folderId: currentFolderId || getId(questionFolders[0]),
      tags: questionForm.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    if (editingQuestion) {
      updateQuestion(getId(editingQuestion), questionData);
    } else {
      addQuestion(questionData);
    }

    resetQuestionForm();
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      questionNumber: '',
      title: '',
      difficulty: 'medium',
      link: '',
      tags: '',
      notes: '',
    });
    setEditingQuestion(null);
    setShowQuestionModal(false);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      questionNumber: question.questionNumber.toString(),
      title: question.title,
      difficulty: question.difficulty,
      link: question.link,
      tags: question.tags.join(', '),
      notes: question.notes,
    });
    setShowQuestionModal(true);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'easy';
      case 'medium': return 'medium';
      case 'hard': return 'hard';
      default: return 'default';
    }
  };

  return (
    <div className="questions-page animate-fade-in">
      {/* Header */}
      <div className="questions-header">
        <h1>Questions</h1>
        <div className="questions-header-actions">
          <Button 
            variant="secondary" 
            icon={<Plus size={18} />}
            onClick={() => setShowFolderModal(true)}
          >
            New Folder
          </Button>
          <Button 
            icon={<Plus size={18} />}
            onClick={() => setShowQuestionModal(true)}
            disabled={questionFolders.length === 0}
          >
            New Question
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="questions-filters">
        <Input
          placeholder="Search questions..."
          icon={<Search size={18} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="questions-search"
        />
        <select 
          className="questions-filter-select"
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
        >
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="questions-content">
        {/* Folders Sidebar */}
        <div className="questions-folders">
          <div className="questions-folders-header">
            <h3>Folders</h3>
          </div>
          <div className="questions-folders-list">
            <button
              className={`questions-folder-item ${!selectedFolder && !selectedSubfolder ? 'active' : ''}`}
              onClick={() => {
                setSelectedFolder(null);
                setSelectedSubfolder(null);
              }}
            >
              <Folder size={18} />
              <span>All Questions</span>
              <Badge size="sm">{questions.length}</Badge>
            </button>

            {questionFolders.map(folder => {
              const isExpanded = expandedFolders[getId(folder)];
              const stats = getCompletionStats(getId(folder));
              
              return (
                <div key={getId(folder)} className="questions-folder-group">
                  <button
                    className={`questions-folder-item ${getId(selectedFolder) === getId(folder) && !selectedSubfolder ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedFolder(folder);
                      setSelectedSubfolder(null);
                      if (folder.subfolders?.length > 0) {
                        toggleFolderExpand(getId(folder));
                      }
                    }}
                  >
                    {folder.subfolders?.length > 0 && (
                      <span className="folder-expand-icon">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                    )}
                    <Folder size={18} />
                    <span>{folder.name}</span>
                    <button 
                      className="folder-add-subfolder"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFolder(folder);
                        setShowSubfolderModal(true);
                      }}
                      title="Add subfolder"
                    >
                      <Plus size={14} />
                    </button>
                  </button>

                  {isExpanded && folder.subfolders?.length > 0 && (
                    <div className="questions-subfolders">
                      {folder.subfolders.map(subfolder => {
                        const subStats = getCompletionStats(getId(subfolder));
                        return (
                          <button
                            key={getId(subfolder)}
                            className={`questions-folder-item subfolder ${getId(selectedSubfolder) === getId(subfolder) ? 'active' : ''}`}
                            onClick={() => {
                              setSelectedFolder(folder);
                              setSelectedSubfolder(subfolder);
                            }}
                          >
                            <Folder size={16} />
                            <span>{subfolder.name}</span>
                            <Badge size="sm">
                              {subStats.total}
                            </Badge>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Questions List */}
        <div className="questions-list">
          {(selectedFolder || selectedSubfolder) && (
            <div className="questions-list-header">
              <div className="questions-list-title">
                <h2>
                  {selectedSubfolder 
                    ? `${selectedFolder.name} › ${selectedSubfolder.name}`
                    : selectedFolder.name}
                </h2>
                <span>{filteredQuestions.length} questions</span>
              </div>
            </div>
          )}

          {filteredQuestions.length > 0 ? (
            <div className="questions-grid">
              {filteredQuestions.map(question => (
                <Card key={getId(question)} className="question-card" hover>
                  <div className="question-card-header">
                    <button 
                      className={`question-checkbox ${question.isCompleted ? 'checked' : ''}`}
                      onClick={() => toggleQuestionComplete(getId(question))}
                    >
                      {question.isCompleted && <Check size={14} />}
                    </button>
                    <span className="question-number">#{question.questionNumber}</span>
                    <Badge variant={getDifficultyColor(question.difficulty)} size="sm" dot>
                      {question.difficulty}
                    </Badge>
                    <div className="question-card-actions">
                      <button 
                        className="question-action-btn"
                        onClick={() => handleEditQuestion(question)}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="question-action-btn delete"
                        onClick={() => {
                          if (confirm('Delete this question?')) {
                            deleteQuestion(getId(question));
                          }
                        }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className={`question-card-title ${question.isCompleted ? 'completed' : ''}`}>
                    {question.title}
                  </h3>
                  
                  {question.notes && (
                    <p className="question-card-notes">{question.notes}</p>
                  )}
                  
                  <div className="question-card-footer">
                    <div className="question-card-tags">
                      {question.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <a 
                      href={question.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="question-link"
                    >
                      <ExternalLink size={16} />
                      Open Problem
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="questions-empty">
              <HelpCircle size={48} />
              <h3>No questions yet</h3>
              <p>
                {questionFolders.length === 0 
                  ? 'Create a folder first, then add your questions'
                  : 'Start by adding your first question'}
              </p>
              {questionFolders.length > 0 && (
                <Button onClick={() => setShowQuestionModal(true)}>
                  Add Question
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
          placeholder="e.g., LeetCode, CodeForces"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          fullWidth
          autoFocus
        />
      </Modal>

      {/* New Subfolder Modal */}
      <Modal
        isOpen={showSubfolderModal}
        onClose={() => setShowSubfolderModal(false)}
        title={`New Subfolder in ${selectedFolder?.name || ''}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowSubfolderModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubfolder}>
              Create Subfolder
            </Button>
          </>
        }
      >
        <Input
          label="Subfolder Name"
          placeholder="e.g., Arrays, Trees, Graphs"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          fullWidth
          autoFocus
        />
      </Modal>

      {/* New/Edit Question Modal */}
      <Modal
        isOpen={showQuestionModal}
        onClose={resetQuestionForm}
        title={editingQuestion ? 'Edit Question' : 'New Question'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={resetQuestionForm}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuestion}>
              {editingQuestion ? 'Save Changes' : 'Add Question'}
            </Button>
          </>
        }
      >
        <div className="question-form">
          <div className="question-form-row">
            <Input
              label="Question Number"
              placeholder="e.g., 1, 15, 42"
              type="number"
              value={questionForm.questionNumber}
              onChange={(e) => setQuestionForm({ ...questionForm, questionNumber: e.target.value })}
            />
            <div className="input-wrapper">
              <label className="input-label">Difficulty</label>
              <select
                className="input-field"
                value={questionForm.difficulty}
                onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <Input
            label="Title"
            placeholder="Question title"
            value={questionForm.title}
            onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
            fullWidth
          />
          <Input
            label="Problem Link"
            placeholder="https://leetcode.com/problems/..."
            value={questionForm.link}
            onChange={(e) => setQuestionForm({ ...questionForm, link: e.target.value })}
            fullWidth
          />
          <Input
            label="Tags"
            placeholder="Comma-separated tags (e.g., array, two-pointers)"
            value={questionForm.tags}
            onChange={(e) => setQuestionForm({ ...questionForm, tags: e.target.value })}
            fullWidth
          />
          <div className="input-wrapper input-full">
            <label className="input-label">Personal Notes (Optional)</label>
            <textarea
              className="input-field"
              placeholder="Your approach, tips, complexity analysis..."
              value={questionForm.notes}
              onChange={(e) => setQuestionForm({ ...questionForm, notes: e.target.value })}
              rows={4}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Questions;
