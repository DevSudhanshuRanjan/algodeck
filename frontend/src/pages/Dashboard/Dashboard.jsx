import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  HelpCircle, 
  CheckCircle, 
  Plus,
  ChevronRight
} from 'lucide-react';
import { useAuth, useData } from '../../context';
import { Button, Card, Badge } from '../../components/common';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { getStats, getRecentActivity, noteFolders, questionFolders } = useData();
  const navigate = useNavigate();

  const stats = getStats();
  const recentActivity = getRecentActivity(5);

  const statCards = [
    {
      label: 'Notes',
      value: stats.totalNotes,
      icon: FileText,
      color: 'primary',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      label: 'Questions',
      value: stats.totalQuestions,
      icon: HelpCircle,
      color: 'secondary',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      label: 'Completed',
      value: stats.completedQuestions,
      icon: CheckCircle,
      color: 'success',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
  ];

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="dashboard animate-fade-in">
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <div className="dashboard-welcome-text">
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋</h1>
          <p>Here's an overview of your progress</p>
        </div>
        <div className="dashboard-welcome-actions">
          <Button 
            icon={<Plus size={18} />}
            onClick={() => navigate('/notes')}
          >
            New Note
          </Button>
          <Button 
            variant="secondary"
            icon={<Plus size={18} />}
            onClick={() => navigate('/questions')}
          >
            New Question
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats">
        {statCards.map((stat, index) => (
          <Card key={index} className="dashboard-stat-card" hover>
            <div 
              className="dashboard-stat-icon"
              style={{ background: stat.gradient }}
            >
              <stat.icon size={24} />
            </div>
            <div className="dashboard-stat-content">
              <span className="dashboard-stat-value">{stat.value}</span>
              <span className="dashboard-stat-label">{stat.label}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Activity */}
        <Card className="dashboard-activity-card">
          <div className="card-header">
            <h2 className="card-title">Recent Activity</h2>
          </div>
          <div className="dashboard-activity-list">
            {recentActivity.length > 0 ? (
              recentActivity.map((item, index) => (
                <div key={index} className="dashboard-activity-item">
                  <div className="dashboard-activity-icon">
                    {item.type === 'note' ? (
                      <FileText size={18} />
                    ) : (
                      <HelpCircle size={18} />
                    )}
                  </div>
                  <div className="dashboard-activity-content">
                    <span className="dashboard-activity-title">{item.title}</span>
                    <div className="dashboard-activity-meta">
                      {item.difficulty && (
                        <Badge variant={item.difficulty} size="sm" dot>
                          {item.difficulty}
                        </Badge>
                      )}
                      <span className="dashboard-activity-time">
                        {getTimeAgo(item.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="dashboard-empty">
                <p>No recent activity yet</p>
                <p>Start by creating notes or adding questions!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Access */}
        <div className="dashboard-quick-access">
          {/* Notes Section Card */}
          <Card 
            className="dashboard-section-card" 
            hover
            onClick={() => navigate('/notes')}
          >
            <div className="dashboard-section-header">
              <div className="dashboard-section-icon notes">
                <FileText size={24} />
              </div>
              <ChevronRight size={20} className="dashboard-section-arrow" />
            </div>
            <h3 className="dashboard-section-title">Notes Section</h3>
            <p className="dashboard-section-meta">
              {noteFolders.length} folders • {stats.totalNotes} notes
            </p>
          </Card>

          {/* Questions Section Card */}
          <Card 
            className="dashboard-section-card" 
            hover
            onClick={() => navigate('/questions')}
          >
            <div className="dashboard-section-header">
              <div className="dashboard-section-icon questions">
                <HelpCircle size={24} />
              </div>
              <ChevronRight size={20} className="dashboard-section-arrow" />
            </div>
            <h3 className="dashboard-section-title">Questions Section</h3>
            <p className="dashboard-section-meta">
              {questionFolders.length} folders • {stats.totalQuestions} questions
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
