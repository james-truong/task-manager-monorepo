import { useContext, useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { tasksAPI, authAPI } from '../services/api';

// UserPage - Displays user profile information and task statistics
// This is what users see at the /user route
const UserPage = () => {
  // Access user data from context
  const { user, logout, refreshUser } = useContext(AuthContext);

  // State for task statistics
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    highPriority: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for avatar upload
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

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

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload avatar
    handleAvatarUpload(file);
  };

  // Upload avatar to server
  const handleAvatarUpload = async (file) => {
    setUploadingAvatar(true);
    try {
      await authAPI.uploadAvatar(file);
      toast.success('Profile picture uploaded successfully!');
      // Refresh user data to show new avatar
      await refreshUser();
      setAvatarPreview(null);
    } catch (err) {
      toast.error(`Failed to upload avatar: ${err.message}`);
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Delete avatar
  const handleDeleteAvatar = async () => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>Are you sure you want to delete your profile picture?</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              toast.promise(
                authAPI.deleteAvatar().then(() => refreshUser()),
                {
                  loading: 'Deleting avatar...',
                  success: 'Profile picture deleted!',
                  error: (err) => `Failed to delete: ${err.message}`,
                }
              );
            }}
            style={{
              padding: '5px 15px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              padding: '5px 15px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      style: {
        minWidth: '300px'
      }
    });
  };

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
          {/* User Avatar */}
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="avatar-img" />
              ) : user.avatar ? (
                <img
                  key={user.avatar}
                  src={authAPI.getAvatarUrl(user._id)}
                  alt={user.name}
                  className="avatar-img"
                />
              ) : (
                <div className="avatar-initial">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Avatar Upload Buttons */}
            <div className="avatar-actions">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? 'Uploading...' : user.avatar ? 'Change Photo' : 'Upload Photo'}
              </button>
              {user.avatar && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleDeleteAvatar}
                  disabled={uploadingAvatar}
                >
                  Remove Photo
                </button>
              )}
            </div>
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
