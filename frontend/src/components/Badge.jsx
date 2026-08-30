const priorityClass = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' };
const statusClass = {
  'Not Started': 'badge-not-started',
  'Pending / In Progress': 'badge-in-progress',
  Completed: 'badge-completed',
};

export const PriorityBadge = ({ priority }) => (
  <span className={`badge ${priorityClass[priority] || 'badge-medium'}`}>{priority}</span>
);

export const StatusBadge = ({ status }) => (
  <span className={`badge ${statusClass[status] || 'badge-not-started'}`}>{status}</span>
);
