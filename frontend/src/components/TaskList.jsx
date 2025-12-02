import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { tasksAPI } from '../services/api';

const TaskList = () => {
  // ========== STATE MANAGEMENT ==========

  // Store the array of tasks from the API
  const [tasks, setTasks] = useState([]);

  // Track loading state while fetching tasks
  const [isLoading, setIsLoading] = useState(true);

  // Store any errors that occur
  const [error, setError] = useState(null);

  // Store the current filter ('all', 'active', or 'completed')
  const [filter, setFilter] = useState('all');

  // Store the search query for filtering tasks
  const [searchQuery, setSearchQuery] = useState('');

  // Store the current sort option ('none', 'date', 'priority', 'name')
  const [sortBy, setSortBy] = useState('none');

  // Store sort direction ('asc' or 'desc')
  const [sortDirection, setSortDirection] = useState('asc');

  // ========== INLINE EDITING STATE ==========

  // Track which task is being edited (null = none)
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Store the edited description while editing
  const [editedDescription, setEditedDescription] = useState('');

  // ========== FETCH TASKS ON COMPONENT MOUNT ==========

  // useEffect with empty dependency array [] runs once when component loads
  useEffect(() => {
    fetchTasks();
  }, []); // Empty array = run once on mount

  // Function to fetch all tasks from the API
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call the API to get all tasks
      const data = await tasksAPI.getTasks();

      // Store tasks in state
      // This triggers a re-render and displays the tasks
      setTasks(data);
    } catch (err) {
      // If API call fails, show error toast
      toast.error(`Failed to load tasks: ${err.message}`);
      setError(err.message);
    } finally {
      // Always stop loading, whether success or failure
      setIsLoading(false);
    }
  };

  // ========== TOGGLE TASK COMPLETION ==========

  const handleToggleComplete = async (taskId, currentStatus) => {
    try {
      // Call API to update the task's completed status
      // Toggle: if currently true, set to false, and vice versa
      await tasksAPI.updateTask(taskId, { completed: !currentStatus });

      // After successful update, refresh the task list
      // This ensures UI is in sync with the database
      fetchTasks();

      // Show success toast
      toast.success(!currentStatus ? 'Task completed!' : 'Task marked as active');
    } catch (err) {
      toast.error(`Failed to update task: ${err.message}`);
    }
  };

  // ========== MARK ALL COMPLETE ==========

  const [isMarkingAllComplete, setIsMarkingAllComplete] = useState(false);

  const handleMarkAllComplete = async () => {
    // Find all tasks that are not completed
    const incompleteTasks = tasks.filter(task => !task.completed);

    // If all tasks are already complete, nothing to do
    if (incompleteTasks.length === 0) {
      return;
    }

    setIsMarkingAllComplete(true);

    try {
      // Create an array of promises (API calls to update each task)
      const updatePromises = incompleteTasks.map(task =>
        tasksAPI.updateTask(task._id, { completed: true })
      );

      // Wait for ALL updates to complete
      // Promise.all() runs them in parallel and waits for all to finish
      await Promise.all(updatePromises);

      // After all updates succeed, refresh the task list
      await fetchTasks();

      // Show success toast
      toast.success(`${incompleteTasks.length} task${incompleteTasks.length === 1 ? '' : 's'} completed!`);
    } catch (err) {
      toast.error(`Failed to mark all complete: ${err.message}`);
    } finally {
      setIsMarkingAllComplete(false);
    }
  };

  // ========== DELETE TASK ==========

  const handleDelete = async (taskId) => {
    // Use toast.promise for better UX with confirmation
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>Are you sure you want to delete this task?</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              // Delete the task
              toast.promise(
                tasksAPI.deleteTask(taskId).then(() => fetchTasks()),
                {
                  loading: 'Deleting task...',
                  success: 'Task deleted successfully!',
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

  // ========== INLINE EDITING HANDLERS ==========

  // Start editing a task
  const handleStartEdit = (task) => {
    setEditingTaskId(task._id);
    setEditedDescription(task.description);  // Pre-fill with current description
  };

  // Save edited task
  const handleSaveEdit = async (taskId) => {
    // Don't save if description is empty
    if (!editedDescription.trim()) {
      toast.error('Task description cannot be empty');
      return;
    }

    try {
      // Call API to update task description
      await tasksAPI.updateTask(taskId, { description: editedDescription.trim() });

      // Exit edit mode
      setEditingTaskId(null);
      setEditedDescription('');

      // Refresh task list to show updated description
      await fetchTasks();

      // Show success toast
      toast.success('Task updated successfully!');
    } catch (err) {
      toast.error(`Failed to update task: ${err.message}`);
    }
  };

  // Cancel editing without saving
  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditedDescription('');
  };

  // Handle keyboard shortcuts while editing
  const handleEditKeyDown = (e, taskId) => {
    if (e.key === 'Enter') {
      // Enter key → Save
      handleSaveEdit(taskId);
    } else if (e.key === 'Escape') {
      // Escape key → Cancel
      handleCancelEdit();
    }
  };

  // ========== RENDER UI ==========

  // Show loading spinner while fetching tasks
  if (isLoading) {
    return <div className="loading">Loading tasks...</div>;
  }

  // Show error message if something went wrong
  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchTasks} className="btn">
          Try Again
        </button>
      </div>
    );
  }

  // Show message if there are no tasks
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks yet. Create one to get started!</p>
      </div>
    );
  }

  // ========== CALCULATE STATS ==========
  // Computed values - calculate from existing state
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;

  // ========== SORTING FUNCTION ==========
  // Sort tasks based on current sort settings
  const sortTasks = (tasksToSort) => {
    // If no sorting is applied, return tasks as-is
    if (sortBy === 'none') {
      return tasksToSort;
    }

    // Create a copy to avoid mutating the original array
    const sorted = [...tasksToSort];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          // Handle tasks without due dates - push them to the end
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;  // a goes after b
          if (!b.dueDate) return -1; // a goes before b

          // Compare dates
          const dateA = new Date(a.dueDate);
          const dateB = new Date(b.dueDate);
          comparison = dateA - dateB;
          break;

        case 'priority':
          // Define priority order: high(3) > medium(2) > low(1)
          const priorityValues = { high: 3, medium: 2, low: 1 };
          const priorityA = priorityValues[a.priority] || priorityValues.medium;
          const priorityB = priorityValues[b.priority] || priorityValues.medium;
          comparison = priorityB - priorityA; // Higher priority first by default
          break;

        case 'name':
          // Alphabetical comparison (case-insensitive)
          comparison = a.description.toLowerCase().localeCompare(
            b.description.toLowerCase()
          );
          break;

        default:
          return 0;
      }

      // Apply sort direction
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  };

  // ========== FILTER AND SORT TASKS ==========
  // Apply filters, search, then sort
  const filteredTasks = (() => {
    // Step 1: Apply completion status filter
    let result = tasks.filter(task => {
      let passesFilter = true;
      if (filter === 'active') passesFilter = !task.completed;
      if (filter === 'completed') passesFilter = task.completed;
      return passesFilter;
    });

    // Step 2: Apply search query filter
    result = result.filter(task =>
      task.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim())
    );

    // Step 3: Apply sorting
    result = sortTasks(result);

    return result;
  })();

  // ========== HELPER FUNCTIONS ==========

  // Format date for display (e.g., "Jan 15, 2025")
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Check if a task is overdue
  const isOverdue = (task) => {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    // Set both to midnight for fair comparison
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  // Get priority label and color class
  const getPriorityInfo = (priority) => {
    const priorityMap = {
      low: { label: 'Low', className: 'priority-low' },
      medium: { label: 'Med', className: 'priority-medium' },
      high: { label: 'High', className: 'priority-high' }
    };
    return priorityMap[priority] || priorityMap.medium;
  };

  // Render the list of tasks
  return (
    <div className="task-list">
      {/* Task counter and Mark All Complete button */}
      <div className="task-stats">
        <h3>
          {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}, {completedTasks} completed
        </h3>
        {totalTasks > completedTasks && (
          <button
            onClick={handleMarkAllComplete}
            disabled={isMarkingAllComplete}
            className="btn btn-primary btn-small"
          >
            {isMarkingAllComplete ? 'Marking...' : 'Mark All Complete'}
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className="task-search">
        <input
          type="text"
          className="search-input"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="search-clear-btn"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter buttons */}
      <div className="task-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      {/* Sorting controls */}
      <div className="task-sort">
        <label className="sort-label">Sort by:</label>
        <div className="sort-buttons">
          <button
            className={`sort-btn ${sortBy === 'none' ? 'active' : ''}`}
            onClick={() => {
              setSortBy('none');
              setSortDirection('asc');
            }}
          >
            None
          </button>

          <button
            className={`sort-btn ${sortBy === 'date' ? 'active' : ''}`}
            onClick={() => {
              if (sortBy === 'date') {
                setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
              } else {
                setSortBy('date');
                setSortDirection('asc');
              }
            }}
          >
            Due Date {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>

          <button
            className={`sort-btn ${sortBy === 'priority' ? 'active' : ''}`}
            onClick={() => {
              if (sortBy === 'priority') {
                setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
              } else {
                setSortBy('priority');
                setSortDirection('desc'); // High first by default
              }
            }}
          >
            Priority {sortBy === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>

          <button
            className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
            onClick={() => {
              if (sortBy === 'name') {
                setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
              } else {
                setSortBy('name');
                setSortDirection('asc');
              }
            }}
          >
            Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Show message if no tasks match the filters/search */}
      {filteredTasks.length === 0 && (
        <div className="empty-state">
          <p>
            {searchQuery
              ? `No tasks found matching "${searchQuery}"`
              : filter === 'active'
              ? 'No active tasks'
              : filter === 'completed'
              ? 'No completed tasks'
              : 'No tasks found'}
          </p>
        </div>
      )}

      {/*
        Array.map() - Loop through FILTERED tasks and render each one
        Key prop is required for React to efficiently update the list
      */}
      {filteredTasks.map((task) => (
        <div
          key={task._id}
          className={`task-item ${task.completed ? 'completed' : ''} ${isOverdue(task) ? 'overdue' : ''}`}
        >
          {/* Checkbox to toggle completion status */}
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => handleToggleComplete(task._id, task.completed)}
            className="task-checkbox"
          />

          {/* Priority badge */}
          <span className={`priority-badge ${getPriorityInfo(task.priority).className}`}>
            {getPriorityInfo(task.priority).label}
          </span>

          {/* Conditional rendering: Edit mode vs View mode */}
          {editingTaskId === task._id ? (
            // EDIT MODE - Show input field
            <>
              <input
                type="text"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                onKeyDown={(e) => handleEditKeyDown(e, task._id)}
                className="task-edit-input"
                autoFocus
                placeholder="Task description"
              />
              <button
                onClick={() => handleSaveEdit(task._id)}
                className="btn btn-primary btn-small"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="btn btn-secondary btn-small"
              >
                Cancel
              </button>
            </>
          ) : (
            // VIEW MODE - Show description and buttons
            <>
              {/* Task content - description and due date */}
              <div className="task-content">
                {/* Task description - strike through if completed */}
                <span className="task-description">
                  {task.description}
                </span>

                {/* Due date - only show if task has one */}
                {task.dueDate && (
                  <span className={`task-due-date ${isOverdue(task) ? 'overdue-text' : ''}`}>
                    Due: {formatDate(task.dueDate)}
                    {isOverdue(task) && ' (Overdue!)'}
                  </span>
                )}
              </div>

              {/* Edit button */}
              <button
                onClick={() => handleStartEdit(task)}
                className="btn btn-edit"
              >
                Edit
              </button>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(task._id)}
                className="btn btn-delete"
                aria-label="Delete task"
              >
                Delete
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskList;
