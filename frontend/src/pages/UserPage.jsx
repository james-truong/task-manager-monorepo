import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { tasksAPI } from '../services/api';

// UserPage - Displays user profile information and task statistics
// This is what users see at the /user route
const UserPage = () => {
  // Access user data from context
  const { user, logout } = useContext(AuthContext);

  // State for task statistics
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    highPriority: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tasks and calculate statistics
  useEffect(() => {
    const fetchTaskStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all tasks for the user
        const tasks = await tasksAPI.getTasks();

        // Calculate statistics
        const statistics = {
          total: tasks.length,
          completed: tasks.filter(task => task.completed).length,
          pending: tasks.filter(task => !task.completed).length,
          highPriority: tasks.filter(task => task.priority === 'high').length
        };

        setStats(statistics);
      } catch (err) {
        setError('Failed to load task statistics');
        console.error('Error fetching task stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskStats();
  }, []);

  // Calculate completion percentage
  const completionPercentage = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  // Show loading if user data isn't available yet
  if (!user) {
    return (
      <div className="page-content">
        <div className="container">
          <div className="loading">Loading user data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="container">
        <h2 className="page-title">User Profile</h2>

        {/* Profile Card */}
        <div className="profile-card">
          {/* User Avatar/Initial */}
          <div className="profile-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          {/* User Information */}
          <div className="profile-info">
            <div className="profile-field">
              <label>Name:</label>
              <p>{user.name}</p>
            </div>

            <div className="profile-field">
              <label>Email:</label>
              <p>{user.email}</p>
            </div>

            <div className="profile-field">
              <label>Account Created:</label>
              <p>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Task Statistics Section */}
        <div className="stats-section">
          <h3 className="stats-title">Task Statistics</h3>

          {loading ? (
            <div className="loading">Loading statistics...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <>
              {/* Completion Progress Bar */}
              <div className="progress-section">
                <div className="progress-header">
                  <span className="progress-label">Overall Completion</span>
                  <span className="progress-percentage">{completionPercentage}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="stats-grid">
                {/* Total Tasks */}
                <div className="stat-card">
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-label">Total Tasks</div>
                </div>

                {/* Completed Tasks */}
                <div className="stat-card stat-completed">
                  <div className="stat-value">{stats.completed}</div>
                  <div className="stat-label">Completed</div>
                </div>

                {/* Pending Tasks */}
                <div className="stat-card stat-pending">
                  <div className="stat-value">{stats.pending}</div>
                  <div className="stat-label">Pending</div>
                </div>

                {/* High Priority Tasks */}
                <div className="stat-card stat-high">
                  <div className="stat-value">{stats.highPriority}</div>
                  <div className="stat-label">High Priority</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          <button className="btn btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
