import { useState } from 'react';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';

// TasksPage - Main page showing task list and form
// This is what users see at the root route "/"
const TasksPage = () => {
  // State to trigger TaskList refresh when new task is created
  const [refreshTasks, setRefreshTasks] = useState(0);

  return (
    <div className="page-content">
      <div className="container">
        <h2 className="page-title">My Tasks</h2>

        {/* Form to add new tasks */}
        {/* onTaskCreated callback triggers TaskList to refresh */}
        <TaskForm
          onTaskCreated={() => setRefreshTasks(prev => prev + 1)}
        />

        {/* List of all tasks */}
        {/* key={refreshTasks} forces component to remount when new task added */}
        <TaskList key={refreshTasks} />
      </div>
    </div>
  );
};

export default TasksPage;
