import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  noteFoldersApi, 
  notesApi, 
  questionFoldersApi, 
  questionsApi 
} from '../services/api';

const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  const [noteFolders, setNoteFolders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [questionFolders, setQuestionFolders] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data from MongoDB on mount
  const fetchAllData = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [
        noteFoldersRes,
        notesRes,
        questionFoldersRes,
        questionsRes
      ] = await Promise.all([
        noteFoldersApi.getAll(),
        notesApi.getAll(),
        questionFoldersApi.getAll(),
        questionsApi.getAll()
      ]);

      setNoteFolders(noteFoldersRes.folders || []);
      setNotes(notesRes.notes || []);
      setQuestionFolders(questionFoldersRes.folders || []);
      setQuestions(questionsRes.questions || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch data when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    } else {
      // Clear data on logout
      setNoteFolders([]);
      setNotes([]);
      setQuestionFolders([]);
      setQuestions([]);
      setLoading(false);
    }
  }, [isAuthenticated, fetchAllData]);

  // ==================== NOTE FOLDER CRUD ====================
  
  const addNoteFolder = async (folder) => {
    try {
      const response = await noteFoldersApi.create(folder.name);
      const newFolder = response.folder;
      setNoteFolders(prev => [...prev, newFolder]);
      return newFolder;
    } catch (err) {
      console.error('Error creating note folder:', err);
      throw err;
    }
  };

  const updateNoteFolder = async (id, updates) => {
    try {
      const response = await noteFoldersApi.update(id, updates.name);
      const updatedFolder = response.folder;
      setNoteFolders(prev => prev.map(f => f._id === id ? updatedFolder : f));
      return updatedFolder;
    } catch (err) {
      console.error('Error updating note folder:', err);
      throw err;
    }
  };

  const deleteNoteFolder = async (id) => {
    try {
      await noteFoldersApi.delete(id);
      setNoteFolders(prev => prev.filter(f => f._id !== id));
      // Also remove notes from that folder from local state
      setNotes(prev => prev.filter(n => n.folderId !== id));
    } catch (err) {
      console.error('Error deleting note folder:', err);
      throw err;
    }
  };

  // ==================== NOTE CRUD ====================
  
  const addNote = async (note) => {
    try {
      const response = await notesApi.create(note);
      const newNote = response.note;
      setNotes(prev => [...prev, newNote]);
      // Update folder note count
      setNoteFolders(prev => prev.map(f => 
        f._id === note.folderId ? { ...f, noteCount: (f.noteCount || 0) + 1 } : f
      ));
      return newNote;
    } catch (err) {
      console.error('Error creating note:', err);
      throw err;
    }
  };

  const updateNote = async (id, updates) => {
    try {
      const response = await notesApi.update(id, updates);
      const updatedNote = response.note;
      setNotes(prev => prev.map(n => n._id === id ? updatedNote : n));
      return updatedNote;
    } catch (err) {
      console.error('Error updating note:', err);
      throw err;
    }
  };

  const deleteNote = async (id) => {
    try {
      const note = notes.find(n => n._id === id);
      await notesApi.delete(id);
      setNotes(prev => prev.filter(n => n._id !== id));
      // Update folder note count
      if (note) {
        setNoteFolders(prev => prev.map(f => 
          f._id === note.folderId ? { ...f, noteCount: Math.max(0, (f.noteCount || 1) - 1) } : f
        ));
      }
    } catch (err) {
      console.error('Error deleting note:', err);
      throw err;
    }
  };

  const toggleNotePin = async (id) => {
    try {
      const response = await notesApi.togglePin(id);
      const updatedNote = response.note;
      setNotes(prev => prev.map(n => n._id === id ? updatedNote : n));
      return updatedNote;
    } catch (err) {
      console.error('Error toggling note pin:', err);
      throw err;
    }
  };

  // ==================== QUESTION FOLDER CRUD ====================
  
  const addQuestionFolder = async (folder) => {
    try {
      const response = await questionFoldersApi.create(folder.name);
      const newFolder = response.folder;
      setQuestionFolders(prev => [...prev, newFolder]);
      return newFolder;
    } catch (err) {
      console.error('Error creating question folder:', err);
      throw err;
    }
  };

  const addSubfolder = async (parentId, subfolder) => {
    try {
      const response = await questionFoldersApi.addSubfolder(parentId, subfolder.name);
      const updatedFolder = response.folder;
      setQuestionFolders(prev => prev.map(f => f._id === parentId ? updatedFolder : f));
      return updatedFolder;
    } catch (err) {
      console.error('Error creating subfolder:', err);
      throw err;
    }
  };

  const updateQuestionFolder = async (id, updates) => {
    try {
      const response = await questionFoldersApi.update(id, updates.name);
      const updatedFolder = response.folder;
      setQuestionFolders(prev => prev.map(f => f._id === id ? updatedFolder : f));
      return updatedFolder;
    } catch (err) {
      console.error('Error updating question folder:', err);
      throw err;
    }
  };

  const deleteQuestionFolder = async (id) => {
    try {
      await questionFoldersApi.delete(id);
      // Get subfolder IDs before removing
      const folder = questionFolders.find(f => f._id === id);
      const subfolderIds = folder?.subfolders?.map(sf => sf._id || sf.id) || [];
      
      setQuestionFolders(prev => prev.filter(f => f._id !== id));
      // Also remove questions from that folder and its subfolders
      setQuestions(prev => prev.filter(q => 
        q.folderId !== id && !subfolderIds.includes(q.folderId)
      ));
    } catch (err) {
      console.error('Error deleting question folder:', err);
      throw err;
    }
  };

  // ==================== QUESTION CRUD ====================
  
  const addQuestion = async (question) => {
    try {
      const response = await questionsApi.create(question);
      const newQuestion = response.question;
      setQuestions(prev => [...prev, newQuestion]);
      return newQuestion;
    } catch (err) {
      console.error('Error creating question:', err);
      throw err;
    }
  };

  const updateQuestion = async (id, updates) => {
    try {
      const response = await questionsApi.update(id, updates);
      const updatedQuestion = response.question;
      setQuestions(prev => prev.map(q => q._id === id ? updatedQuestion : q));
      return updatedQuestion;
    } catch (err) {
      console.error('Error updating question:', err);
      throw err;
    }
  };

  const deleteQuestion = async (id) => {
    try {
      await questionsApi.delete(id);
      setQuestions(prev => prev.filter(q => q._id !== id));
    } catch (err) {
      console.error('Error deleting question:', err);
      throw err;
    }
  };

  const toggleQuestionComplete = async (id) => {
    try {
      const response = await questionsApi.toggleComplete(id);
      const updatedQuestion = response.question;
      setQuestions(prev => prev.map(q => q._id === id ? updatedQuestion : q));
      return updatedQuestion;
    } catch (err) {
      console.error('Error toggling question complete:', err);
      throw err;
    }
  };

  // ==================== STATS & UTILS ====================
  
  const getStats = () => {
    const totalNotes = notes.length;
    const totalQuestions = questions.length;
    const completedQuestions = questions.filter(q => q.isCompleted).length;
    
    return {
      totalNotes,
      totalQuestions,
      completedQuestions,
      completionRate: totalQuestions > 0 
        ? Math.round((completedQuestions / totalQuestions) * 100) 
        : 0,
    };
  };

  const getRecentActivity = (limit = 5) => {
    const noteActivities = notes.map(n => ({
      type: 'note',
      id: n._id,
      title: n.title,
      updatedAt: n.updatedAt,
      folderId: n.folderId,
    }));

    const questionActivities = questions
      .filter(q => q.isCompleted)
      .map(q => ({
        type: 'question',
        id: q._id,
        title: q.title,
        difficulty: q.difficulty,
        updatedAt: q.completedAt || q.updatedAt,
        folderId: q.folderId,
      }));

    return [...noteActivities, ...questionActivities]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, limit);
  };

  // Refresh data from server
  const refreshData = () => {
    return fetchAllData();
  };

  const value = {
    // Note Folders
    noteFolders,
    addNoteFolder,
    updateNoteFolder,
    deleteNoteFolder,
    
    // Notes
    notes,
    addNote,
    updateNote,
    deleteNote,
    toggleNotePin,
    
    // Question Folders
    questionFolders,
    addQuestionFolder,
    addSubfolder,
    updateQuestionFolder,
    deleteQuestionFolder,
    
    // Questions
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    toggleQuestionComplete,
    
    // Utils
    getStats,
    getRecentActivity,
    refreshData,
    loading,
    error,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
