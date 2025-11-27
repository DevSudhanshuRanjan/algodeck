import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Palette, 
  LogOut, 
  Trash2
} from 'lucide-react';
import { useAuth, useData } from '../../context';
import { Button, Card, Modal } from '../../components/common';
import './Settings.css';

const Settings = () => {
  const { user, logout } = useAuth();
  const { noteFolders, notes, questionFolders, questions } = useData();
  const navigate = useNavigate();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [defaultView, setDefaultView] = useState('dashboard');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    // Clear all user data
    localStorage.clear();
    logout();
    navigate('/login');
  };

  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    : 'November 2025';

  return (
    <div className="settings-page animate-fade-in">
      <h1>Settings</h1>

      <div className="settings-sections">
        {/* Profile Section */}
        <Card className="settings-card">
          <div className="settings-section-header">
            <User size={20} />
            <h2>Profile</h2>
          </div>
          <div className="settings-profile">
            <div className="settings-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user?.name?.charAt(0) || 'U'}</span>
              )}
            </div>
            <div className="settings-profile-info">
              <h3>{user?.name || 'User'}</h3>
              <p>{user?.email || 'user@example.com'}</p>
              <span className="settings-member-since">Member since {memberSince}</span>
            </div>
          </div>
        </Card>

        {/* Preferences Section */}
        <Card className="settings-card">
          <div className="settings-section-header">
            <Palette size={20} />
            <h2>Preferences</h2>
          </div>

          <div className="settings-option">
            <div className="settings-option-info">
              <h4>Default View</h4>
              <p>Choose which page to show after login</p>
            </div>
            <select 
              className="settings-select"
              value={defaultView}
              onChange={(e) => setDefaultView(e.target.value)}
            >
              <option value="dashboard">Dashboard</option>
              <option value="notes">Notes</option>
              <option value="questions">Questions</option>
            </select>
          </div>
        </Card>

        {/* Danger Zone Section */}
        <Card className="settings-card settings-danger-zone">
          <div className="settings-section-header">
            <Trash2 size={20} />
            <h2>Danger Zone</h2>
          </div>
          
          <div className="settings-danger-actions">
            <Button 
              variant="ghost"
              icon={<LogOut size={18} />}
              onClick={handleLogout}
            >
              Sign Out
            </Button>
            <Button 
              variant="danger"
              icon={<Trash2 size={18} />}
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </Button>
          </div>
          
          <p className="settings-danger-warning">
            ⚠️ Deleting your account will permanently remove all your data including notes, 
            questions, and folders. This action cannot be undone.
          </p>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount}>
              Yes, Delete My Account
            </Button>
          </>
        }
      >
        <div className="delete-modal-content">
          <p>Are you sure you want to delete your account?</p>
          <p className="delete-modal-warning">
            This will permanently delete all your:
          </p>
          <ul>
            <li>{notes.length} notes</li>
            <li>{questions.length} questions</li>
            <li>{noteFolders.length + questionFolders.length} folders</li>
          </ul>
          <p className="delete-modal-warning">
            This action cannot be undone!
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
