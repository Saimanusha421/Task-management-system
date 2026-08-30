import { useState, useEffect } from 'react';
import api from '../api/axios';

const AssignTaskModal = ({ onClose, onCreated }) => {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', priority: 'Medium' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/admin/employees').then(({ data }) => setEmployees(data.data)).catch(() => {});
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Task title is required';
    if (!form.description.trim()) errs.description = 'Task description is required';
    if (!form.assignedTo) errs.assignedTo = 'Please select an employee';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post('/admin/tasks', form);
      onCreated();
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to assign task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Assign New Task</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {apiError && <div className="alert alert-error">{apiError}</div>}

            <div className="form-group">
              <label className="form-label">Task Title</label>
              <input
                className="form-input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Prepare Q3 report"
              />
              {errors.title && <div className="form-error">{errors.title}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Task details..."
              />
              {errors.description && <div className="form-error">{errors.description}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select
                className="form-input"
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              >
                <option value="">Select an employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </select>
              {errors.assignedTo && <div className="form-error">{errors.assignedTo}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner" /> : 'Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTaskModal;
