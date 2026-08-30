import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import Pagination from '../components/Pagination';
import AssignTaskModal from '../components/AssignTaskModal';

const STATUS_OPTIONS = ['Not Started', 'Pending / In Progress', 'Completed'];
const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 8, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchStats = useCallback(async () => {
    const { data } = await api.get('/admin/dashboard/stats');
    setStats(data.data);
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/tasks', {
        params: { search, status, priority, page, limit: 8 },
      });
      setTasks(data.data);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, page]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const t = setTimeout(fetchTasks, 300); // debounce search
    return () => clearTimeout(t);
  }, [fetchTasks]);

  const refreshAll = () => {
    fetchStats();
    fetchTasks();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    await api.delete(`/admin/tasks/${id}`);
    refreshAll();
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Manage employees and monitor task progress</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/admin/employees" className="btn btn-outline">Manage Employees</Link>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Assign Task</button>
          </div>
        </div>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Employees</div>
              <div className="stat-value">{stats.totalEmployees}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Tasks</div>
              <div className="stat-value">{stats.totalTasks}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Not Started</div>
              <div className="stat-value">{stats.notStarted}</div>
            </div>
            <div className="stat-card accent-amber">
              <div className="stat-label">Pending / In Progress</div>
              <div className="stat-value">{stats.inProgress}</div>
            </div>
            <div className="stat-card accent-green">
              <div className="stat-label">Completed</div>
              <div className="stat-value">{stats.completed}</div>
            </div>
          </div>
        )}

        <div className="toolbar">
          <div className="search-input-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              placeholder="Search tasks by title or description..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="select-input" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="select-input" value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }}>
            <option value="">All Priorities</option>
            {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}><div className="loading-wrap">Loading tasks…</div></td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state">No tasks found. Try adjusting your filters or assign a new task.</div></td></tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task._id}>
                    <td>
                      <div className="cell-title">{task.title}</div>
                      <div className="cell-desc">{task.description}</div>
                    </td>
                    <td>{task.assignedTo?.name || '—'}</td>
                    <td><PriorityBadge priority={task.priority} /></td>
                    <td><StatusBadge status={task.status} /></td>
                    <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                    <td>{new Date(task.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task._id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={setPage}
        />
      </main>

      {showModal && (
        <AssignTaskModal onClose={() => setShowModal(false)} onCreated={refreshAll} />
      )}
    </div>
  );
};

export default AdminDashboard;
