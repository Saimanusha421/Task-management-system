const Task = require('../models/Task');
const User = require('../models/User');
const { sendEmail, statusUpdatedTemplate } = require('../utils/sendEmail');

// @desc    Get tasks assigned to the logged-in employee, with search + pagination
// @route   GET /api/employee/tasks?search=&status=&page=&limit=
// @access  Private/Employee
const getMyTasks = async (req, res, next) => {
  try {
    const { search = '', status, page = 1, limit = 10 } = req.query;

    const query = { assignedTo: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
      Task.find(query)
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

// @desc    Update the status of a task assigned to the logged-in employee (sends email to admin)
// @route   PUT /api/employee/tasks/:id/status
// @access  Private/Employee
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Not Started', 'Pending / In Progress', 'Completed'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const task = await Task.findOne({ _id: req.params.id, assignedTo: req.user._id }).populate(
      'assignedBy',
      'name email'
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found or not assigned to you' });
    }

    task.status = status;
    await task.save();

    if (task.assignedBy) {
      await sendEmail({
        to: task.assignedBy.email,
        subject: `Task Status Updated: ${task.title}`,
        html: statusUpdatedTemplate({
          adminName: task.assignedBy.name,
          employeeName: req.user.name,
          taskTitle: task.title,
          status: task.status,
        }),
      });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyTasks, updateTaskStatus };
