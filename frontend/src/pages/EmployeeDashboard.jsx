import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { PriorityBadge } from '../components/Badge';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['Not Started', 'Pending / In Progress', 'Completed'];

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 8, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/employee/tasks', {
        params: { search, status, page, limit: 8 },
      });
      setTasks(data.data);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    const t = setTimeout(fetchTasks, 300);
    return () => clearTimeout(t);
  }, [fetchTasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingId(taskId);
    try {
      await api.put(`/employee/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } finally {
      setUpdatingId(null);
    }
  };

  const summary = tasks.reduce(
    (acc, t) => {
      if (t.status === 'Not Started') acc.notStarted++;
      else if (t.status === 'Completed') acc.completed++;
      else acc.inProgress++;
      return acc;
    },
    { notStarted: 0, inProgress: 0, completed: 0 }
  );

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Tasks</h1>
            <p className="page-subtitle">Welcome back, {user?.name}. Here's what's on your plate.</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Not Started</div>
            <div className="stat-value">{summary.notStarted}</div>
          </div>
          <div className="stat-card accent-amber">
            <div className="stat-label">Pending / In Progress</div>
            <div className="stat-value">{summary.inProgress}</div>
          </div>
          <div className="stat-card accent-green">
            <div className="stat-label">Completed</div>
            <div className="stat-value">{summary.completed}</div>
          </div>
        </div>

        <div className="toolbar">
          <div className="search-input-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              placeholder="Search your tasks..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="select-input" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Assigned By</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5}><div className="loading-wrap">Loading tasks…</div></td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={5}><div className="empty-state">No tasks match your filters.</div></td></tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task._id}>
                    <td>
                      <div className="cell-title">{task.title}</div>
                      <div className="cell-desc">{task.description}</div>
                    </td>
                    <td>{task.assignedBy?.name || '—'}</td>
                    <td><PriorityBadge priority={task.priority} /></td>
                    <td>
                      <select
                        className="status-select"
                        value={task.status}
                        disabled={updatingId === task._id}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>{new Date(task.createdAt).toLocaleDateString()}</td>
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
    </div>
  );
};

export default EmployeeDashboard;
