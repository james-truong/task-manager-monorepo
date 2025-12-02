import { useState } from 'react';
import toast from 'react-hot-toast';
import { tasksAPI } from '../services/api';

// onTaskCreated is a prop - a function passed from the parent component
// When we create a task, we call this function to tell parent to refresh
const TaskForm = ({ onTaskCreated }) => {
  // ========== STATE MANAGEMENT ==========

  // Store the task description input value
  const [description, setDescription] = useState('');

  // Store the due date (optional)
  const [dueDate, setDueDate] = useState('');

  // Store the priority (defaults to 'medium')
  const [priority, setPriority] = useState('medium');

  // Track loading state during API call
  const [isLoading, setIsLoading] = useState(false);

  // ========== FORM SUBMISSION ==========

  const handleSubmit = async (e) => {
    // Prevent default form submission (which reloads the page)
    e.preventDefault();

    // Validate input - don't allow empty tasks
    if (!description.trim()) {
      toast.error('Please enter a task description');
      return;
    }

    setIsLoading(true);

    try {
      // Call API to create new task
      // Pass dueDate only if it has a value, and priority
      await tasksAPI.createTask(description.trim(), false, dueDate || null, priority);

      // Success! Clear the input fields
      setDescription('');
      setDueDate('');
      setPriority('medium');  // Reset to default

      // Show success toast
      toast.success('Task created successfully!');

      // Call the callback function from parent
      // This tells the parent (TaskList) to refresh and show the new task
      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (err) {
      // Show error toast if task creation fails
      toast.error(`Failed to create task: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== RENDER UI ==========

  return (
    <div className="task-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          {/* Task description input - controlled component */}
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What do you need to do?"
            disabled={isLoading}
            className="task-input"
          />

          {/* Due date input - optional */}
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isLoading}
            className="task-date-input"
            title="Optional due date"
          />

          {/* Priority selector dropdown */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={isLoading}
            className="task-priority-select"
            title="Task priority"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !description.trim()}
          >
            {isLoading ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
