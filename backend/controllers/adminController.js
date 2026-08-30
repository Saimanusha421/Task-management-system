const { validationResult } = require('express-validator');
const User = require('../models/User');
const Task = require('../models/Task');
const { sendEmail, taskAssignedTemplate } = require('../utils/sendEmail');

// @desc    Get all employees
// @route   GET /api/admin/employees
// @access  Private/Admin
const getEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new employee account
// @route   POST /api/admin/employees
// @access  Private/Admin
const createEmployee = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const employee = await User.create({ name, email, password, role: 'employee' });

    res.status(201).json({
      success: true,
      data: { id: employee._id, name: employee.name, email: employee.email, role: employee.role },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate / deactivate an employee account
// @route   PUT /api/admin/employees/:id/status
// @access  Private/Admin
const setEmployeeStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const employee = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'employee' },
      { isActive: !!isActive },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign a new task to an employee (sends email notification)
// @route   POST /api/admin/tasks
// @access  Private/Admin
const assignTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    const { title, description, assignedTo, priority } = req.body;

    const employee = await User.findOne({ _id: assignedTo, role: 'employee' });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Assigned employee not found' });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      assignedBy: req.user._id,
      priority: priority || 'Medium',
    });

    // Fire-and-forget style await, but errors are swallowed inside sendEmail so
    // task creation always succeeds even if the email fails to send.
    await sendEmail({
      to: employee.email,
      subject: `New Task Assigned: ${task.title}`,
      html: taskAssignedTemplate({
        employeeName: employee.name,
        taskTitle: task.title,
        priority: task.priority,
        adminName: req.user.name,
      }),
    });

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'assignedBy', select: 'name email' },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task (title/description/priority/assignee) - admin only
// @route   PUT /api/admin/tasks/:id
// @access  Private/Admin
const updateTask = async (req, res, next) => {
  try {
    const { title, description, priority, assignedTo } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { ...(title && { title }), ...(description && { description }), ...(priority && { priority }), ...(assignedTo && { assignedTo }) },
      { new: true, runValidators: true }
    ).populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'assignedBy', select: 'name email' },
    ]);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/admin/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks with search + pagination + filters
// @route   GET /api/admin/tasks?search=&status=&priority=&page=&limit=
// @access  Private/Admin
const getAllTasks = async (req, res, next) => {
  try {
    const { search = '', status, priority, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignedTo', 'name email')
        .populate('assignedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Task.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task statistics for the admin dashboard
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const [notStarted, inProgress, completed, totalEmployees, totalTasks] = await Promise.all([
      Task.countDocuments({ status: 'Not Started' }),
      Task.countDocuments({ status: 'Pending / In Progress' }),
      Task.countDocuments({ status: 'Completed' }),
      User.countDocuments({ role: 'employee' }),
      Task.countDocuments({}),
    ]);

    res.status(200).json({
      success: true,
      data: {
        notStarted,
        inProgress,
        completed,
        totalEmployees,
        totalTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  setEmployeeStatus,
  assignTask,
  updateTask,
  deleteTask,
  getAllTasks,
  getDashboardStats,
};
