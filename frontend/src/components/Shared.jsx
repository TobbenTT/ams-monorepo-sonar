import { useState } from 'react';

export function KPICard({ label, value, trend, trendDir, variant }) {
    return (
        <div className={`kpi-card ${variant || ''}`}>
            <div className="kpi-label">{label}</div>
            <div className="kpi-value">{value}</div>
            {trend && <div className={`kpi-trend ${trendDir || 'neutral'}`}>{trend}</div>}
        </div>
    );
}

export function StatusBadge({ status }) {
    const MAP = {
        ACTIVE: 'badge-success', APPROVED: 'badge-success', COMPLETED: 'badge-success', DONE: 'badge-success',
        DRAFT: 'badge-warning', PENDING_VALIDATION: 'badge-warning', PENDING: 'badge-warning', IN_PROGRESS: 'badge-info',
        REVIEWED: 'badge-info', PRESENTED: 'badge-info',
        REJECTED: 'badge-danger', CANCELLED: 'badge-danger', CRITICAL: 'badge-danger', INACTIVE: 'badge-danger',
        CLOSED: 'badge-neutral',
    };
    return <span className={`badge ${MAP[status] || 'badge-neutral'}`}>{(status || '').replace(/_/g, ' ')}</span>;
}

export function PriorityBadge({ priority }) {
    const p = String(priority).charAt(0);
    const labels = { '1': '🔴 Emergency', '2': '🟠 Urgent', '3': '🟡 Normal', '4': '🟢 Planned' };
    return <span className={`badge priority-${p}`}>{labels[p] || priority}</span>;
}

export function CritBadge({ crit }) {
    const cls = { 'AA': 'crit-AA', 'A+': 'crit-Aplus', 'A': 'crit-A', 'B': 'crit-B', 'C': 'crit-C', 'D': 'crit-D' };
    return crit ? <span className={`badge ${cls[crit] || 'badge-neutral'}`}>{crit}</span> : null;
}

export function DataTable({ columns, data, onRowClick, emptyMsg, pageSize = 15, sortable = false }) {
    const [page, setPage] = useState(0);
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');

    if (!data || data.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>{emptyMsg || 'No data available'}</h3>
                <p>Try seeding the database or adjusting filters</p>
            </div>
        );
    }

    let sorted = [...data];
    if (sortable && sortKey) {
        sorted.sort((a, b) => {
            const av = a[sortKey] ?? '';
            const bv = b[sortKey] ?? '';
            const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }

    const totalPages = Math.ceil(sorted.length / pageSize);
    const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize);

    const handleSort = (key) => {
        if (!sortable) return;
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
        setPage(0);
    };

    return (
        <div>
            <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            {columns.map(c => (
                                <th
                                    key={c.key}
                                    className={sortable ? 'sortable' : ''}
                                    onClick={() => handleSort(c.key)}
                                >
                                    {c.label}
                                    {sortable && (
                                        <span className={`sort-icon${sortKey === c.key ? ' active' : ''}`}>
                                            {sortKey === c.key ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                                        </span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map((row, i) => (
                            <tr key={row.id || i} onClick={() => onRowClick?.(row)} style={onRowClick ? { cursor: 'pointer' } : {}}>
                                {columns.map(c => (
                                    <td key={c.key} className={c.mono ? 'mono' : ''}>
                                        {c.render ? c.render(row) : row[c.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="pagination">
                    <button onClick={() => setPage(0)} disabled={page === 0}>«</button>
                    <button onClick={() => setPage(p => p - 1)} disabled={page === 0}>‹</button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                        const p = start + i;
                        if (p >= totalPages) return null;
                        return <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p + 1}</button>;
                    })}
                    <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>›</button>
                    <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>»</button>
                    <span className="pagination-info">{data.length} items</span>
                </div>
            )}
        </div>
    );
}

export function LoadingSpinner({ message }) {
    return <div className="loading-container" role="status"><div className="spinner" aria-hidden="true"></div><span>{message || 'Loading...'}</span></div>;
}

export function MetaChip({ label, value }) {
    return <span className="meta-chip"><strong>{label}:</strong> {value}</span>;
}

export function ProgressBar({ value, variant, label }) {
    return (
        <div>
            {label && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{label}</span><span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{value}%</span></div>}
            <div className="progress-bar" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><div className={`progress-fill ${variant || ''}`} style={{ width: `${value}%` }}></div></div>
        </div>
    );
}
