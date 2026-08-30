const Pagination = ({ page, totalPages, total, limit, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxButtons = 5;
  let start = Math.max(1, page - Math.floor(maxButtons / 2));
  let end = Math.min(totalPages, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="pagination">
      <span className="pagination-info">
        Showing {from}-{to} of {total}
      </span>
      <div className="pagination-controls">
        <button className="page-btn" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          &lsaquo;
        </button>
        {start > 1 && (
          <>
            <button className="page-btn" onClick={() => onPageChange(1)}>1</button>
            {start > 2 && <span>…</span>}
          </>
        )}
        {pages.map((p) => (
          <button
            key={p}
            className={`page-btn ${p === page ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span>…</span>}
            <button className="page-btn" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
          </>
        )}
        <button className="page-btn" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
          &rsaquo;
        </button>
      </div>
    </div>
  );
};

export default Pagination;
