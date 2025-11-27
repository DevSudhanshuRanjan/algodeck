const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for making API requests
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth API
export const authApi = {
  demoLogin: (email, name) =>
    request('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    }),

  getMe: () => request('/auth/me'),

  updatePreferences: (preferences) =>
    request('/auth/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    }),

  logout: () => request('/auth/logout', { method: 'POST' }),
};

// Note Folders API
export const noteFoldersApi = {
  getAll: () => request('/note-folders'),

  create: (name) =>
    request('/note-folders', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  update: (id, name) =>
    request(`/note-folders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),

  delete: (id) =>
    request(`/note-folders/${id}`, {
      method: 'DELETE',
    }),
};

// Notes API
export const notesApi = {
  getAll: (folderId = null, search = null) => {
    const params = new URLSearchParams();
    if (folderId) params.append('folderId', folderId);
    if (search) params.append('search', search);
    return request(`/notes?${params.toString()}`);
  },

  getOne: (id) => request(`/notes/${id}`),

  create: (noteData) =>
    request('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    }),

  update: (id, noteData) =>
    request(`/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(noteData),
    }),

  togglePin: (id) =>
    request(`/notes/${id}/pin`, {
      method: 'PATCH',
    }),

  delete: (id) =>
    request(`/notes/${id}`, {
      method: 'DELETE',
    }),
};

// Question Folders API
export const questionFoldersApi = {
  getAll: () => request('/question-folders'),

  create: (name) =>
    request('/question-folders', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  addSubfolder: (id, name) =>
    request(`/question-folders/${id}/subfolders`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  update: (id, name) =>
    request(`/question-folders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),

  delete: (id) =>
    request(`/question-folders/${id}`, {
      method: 'DELETE',
    }),
};

// Questions API
export const questionsApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.folderId) params.append('folderId', filters.folderId);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.completed !== undefined) params.append('completed', filters.completed);
    if (filters.search) params.append('search', filters.search);
    return request(`/questions?${params.toString()}`);
  },

  getStats: () => request('/questions/stats'),

  getOne: (id) => request(`/questions/${id}`),

  create: (questionData) =>
    request('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    }),

  update: (id, questionData) =>
    request(`/questions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(questionData),
    }),

  toggleComplete: (id) =>
    request(`/questions/${id}/complete`, {
      method: 'PATCH',
    }),

  delete: (id) =>
    request(`/questions/${id}`, {
      method: 'DELETE',
    }),
};

export default {
  auth: authApi,
  noteFolders: noteFoldersApi,
  notes: notesApi,
  questionFolders: questionFoldersApi,
  questions: questionsApi,
};
