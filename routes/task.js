const express = require('express');
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");
const Task = require('../models/taskModel');

// Route to create a new task
router.post('/tasks', authenticateUser, async (req, res) => {
    try {
        const { title, priority, checklist, dueDate } = req.body;
        const createdBy = req.user._id;
        const task = new Task({ title, priority, checklist, dueDate, createdBy });
        await task.save();
        res.status(201).json({ message: 'Task created successfully', task });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// Route to fetch all tasks
router.get('/tasks', authenticateUser, async (req, res) => {
    try {
        const tasks = await Task.find({ createdBy: req.user._id });
        res.status(200).json({ tasks });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// PUT /tasks/:taskId
router.put('/tasks/:taskId', authenticateUser, async (req, res) => {
    try {
      const taskId = req.params.taskId;
      const { isChecked } = req.body;
      
      // Update the task's isChecked status in the database
      const updatedTask = await Task.findByIdAndUpdate(taskId, { isChecked }, { new: true });
      
      res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  });

// PUT route to update task status
router.put('/tasks/:id/status', authenticateUser, async (req, res) => {
    const taskId = req.params.id;
    const { status } = req.body;

    try {
        // Find the task by ID
        const task = await Task.findByIdAndUpdate(taskId, { status }, { new: true });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task status updated successfully', task });
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET route for the dashboard
router.get('/dashboard', async (req, res) => {
    try {
        // Fetch tasks from the database
        const tasks = await Task.find();

        // Group tasks by status
        const backlogTasks = tasks.filter(task => task.status === 'Backlog');
        const progressTasks = tasks.filter(task => task.status === 'Progress');
        const doneTasks = tasks.filter(task => task.status === 'Done');

        // Send tasks to the client
        res.status(200).json({ backlogTasks, progressTasks, doneTasks });
    } catch (error) {
        console.error('Error fetching tasks for dashboard:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;