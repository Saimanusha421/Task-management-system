import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/employees');
      setEmployees(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post('/admin/employees', form);
      setShowModal(false);
      setForm({ name: '', email: '', password: '' });
      fetchEmployees();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (emp) => {
    await api.put(`/admin/employees/${emp._id}/status`, { isActive: !emp.isActive });
    fetchEmployees();
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page">
        <div className="page-header">
          <div>
            <Link to="/admin" className="page-subtitle">&larr; Back to Dashboard</Link>
            <h1 className="page-title" style={{ marginTop: 6 }}>Employees</h1>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Employee</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5}><div className="loading-wrap">Loading employees…</div></td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={5}><div className="empty-state">No employees yet. Add your first employee to get started.</div></td></tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id}>
                    <td className="cell-title">{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>
                      <span className={`badge ${emp.isActive ? 'badge-completed' : 'badge-high'}`}>
                        {emp.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td>{new Date(emp.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => toggleActive(emp)}>
                        {emp.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Employee</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate} noValidate>
              <div className="modal-body">
                {apiError && <div className="alert alert-error">{apiError}</div>}
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
                  {errors.name && <div className="form-error">{errors.name}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" />
                  {errors.email && <div className="form-error">{errors.email}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Temporary Password</label>
                  <input type="password" className="form-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" />
                  {errors.password && <div className="form-error">{errors.password}</div>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <span className="spinner" /> : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
