import { useState } from 'react';
import { cn } from './ui/utils';

const VARIANT_BORDERS = {
    '': 'border-l-primary',
    warning: 'border-l-[#E65100]',
    info: 'border-l-[#0D47A1]',
    danger: 'border-l-destructive',
    purple: 'border-l-[#4A148C]',
    success: 'border-l-primary',
};

export function KPICard({ label, value, trend, trendDir, variant }) {
    return (
        <div className={cn(
            "bg-card border border-border rounded-lg p-4 shadow-sm border-l-4 transition-all hover:-translate-y-0.5 hover:shadow-md",
            VARIANT_BORDERS[variant || '']
        )}>
            <div className="text-[0.7rem] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
            <div className="text-2xl font-extrabold text-foreground leading-tight">{value}</div>
            {trend && (
                <div className={cn("text-xs font-semibold mt-1", {
                    'text-green-700': trendDir === 'up',
                    'text-red-600': trendDir === 'down',
                    'text-muted-foreground': !trendDir || trendDir === 'neutral',
                })}>{trend}</div>
            )}
        </div>
    );
}

const STATUS_STYLES = {
    ACTIVE: 'bg-green-50 text-green-800 border-green-200',
    APPROVED: 'bg-green-50 text-green-800 border-green-200',
    COMPLETED: 'bg-green-50 text-green-800 border-green-200',
    DONE: 'bg-green-50 text-green-800 border-green-200',
    VALIDATED: 'bg-blue-50 text-blue-800 border-blue-200',
    DRAFT: 'bg-amber-50 text-amber-800 border-amber-200',
    PENDING_VALIDATION: 'bg-amber-50 text-amber-800 border-amber-200',
    PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
    IN_PROGRESS: 'bg-blue-50 text-blue-800 border-blue-200',
    REVIEWED: 'bg-blue-50 text-blue-800 border-blue-200',
    PRESENTED: 'bg-blue-50 text-blue-800 border-blue-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    CRITICAL: 'bg-red-50 text-red-700 border-red-200',
    INACTIVE: 'bg-red-50 text-red-700 border-red-200',
    CLOSED: 'bg-gray-100 text-gray-600 border-gray-300',
    SCHEDULED: 'bg-purple-50 text-purple-800 border-purple-200',
};

export function StatusBadge({ status }) {
    return (
        <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-[0.7rem] font-semibold border",
            STATUS_STYLES[status] || 'bg-gray-100 text-gray-600 border-gray-300'
        )}>
            {(status || '').replace(/_/g, ' ')}
        </span>
    );
}

const PRIORITY_COLORS = {
    '1': 'bg-red-100 text-red-800 border-red-300',
    '2': 'bg-orange-100 text-orange-800 border-orange-300',
    '3': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    '4': 'bg-green-100 text-green-800 border-green-300',
};

export function PriorityBadge({ priority }) {
    const p = String(priority).charAt(0);
    // Jorge 2026-04-23: P1 <24h, P2 <7d, P3 >7d, P4 = Parada de plantas.
    const labels = { '1': 'P1 <24h', '2': 'P2 <7d', '3': 'P3 >7d', '4': 'P4 Parada de Plantas' };
    return (
        <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-[0.7rem] font-semibold border",
            PRIORITY_COLORS[p] || 'bg-gray-100 text-gray-600 border-gray-300'
        )}>
            {labels[p] || priority}
        </span>
    );
}

const CRIT_COLORS = {
    'AA': 'bg-red-600 text-white',
    'A+': 'bg-red-500 text-white',
    'A': 'bg-orange-500 text-white',
    'B': 'bg-yellow-400 text-yellow-900',
    'C': 'bg-blue-400 text-white',
    'D': 'bg-gray-400 text-white',
};

export function CritBadge({ crit }) {
    if (!crit) return null;
    return (
        <span className={cn(
            "inline-flex items-center justify-center px-2 py-0.5 rounded text-[0.7rem] font-bold min-w-[28px]",
            CRIT_COLORS[crit] || 'bg-gray-100 text-gray-600'
        )}>
            {crit}
        </span>
    );
}

export function DataTable({ columns, data, onRowClick, emptyMsg, pageSize = 15, sortable = false }) {
    const [page, setPage] = useState(0);
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-16 px-5 text-muted-foreground">
                <div className="text-5xl mb-4 opacity-40">📋</div>
                <h3 className="text-base font-semibold mb-1">{emptyMsg || 'No data available'}</h3>
                <p className="text-sm">Try seeding the database or adjusting filters</p>
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
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            {columns.map(c => (
                                <th
                                    key={c.key}
                                    className={cn(
                                        "text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap",
                                        sortable && "cursor-pointer hover:text-foreground select-none"
                                    )}
                                    onClick={() => handleSort(c.key)}
                                >
                                    {c.label}
                                    {sortable && (
                                        <span className={cn("ml-1 text-[0.65rem]", sortKey === c.key ? 'text-primary' : 'text-muted-foreground/40')}>
                                            {sortKey === c.key ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                                        </span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map((row, i) => (
                            <tr
                                key={row.id || i}
                                onClick={() => onRowClick?.(row)}
                                className={cn(
                                    "border-b border-border/50 transition-colors hover:bg-muted/30",
                                    onRowClick && "cursor-pointer"
                                )}
                            >
                                {columns.map(c => (
                                    <td key={c.key} className={cn("px-3 py-2.5", c.mono && "font-mono text-xs")}>
                                        {c.render ? c.render(row) : row[c.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 py-3 flex-wrap">
                    <button className="px-2 py-1 text-xs rounded border border-border bg-card hover:bg-muted disabled:opacity-40" onClick={() => setPage(0)} disabled={page === 0}>«</button>
                    <button className="px-2 py-1 text-xs rounded border border-border bg-card hover:bg-muted disabled:opacity-40" onClick={() => setPage(p => p - 1)} disabled={page === 0}>‹</button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                        const p = start + i;
                        if (p >= totalPages) return null;
                        return (
                            <button
                                key={p}
                                className={cn(
                                    "px-2.5 py-1 text-xs rounded border",
                                    p === page ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:bg-muted"
                                )}
                                onClick={() => setPage(p)}
                            >
                                {p + 1}
                            </button>
                        );
                    })}
                    <button className="px-2 py-1 text-xs rounded border border-border bg-card hover:bg-muted disabled:opacity-40" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>›</button>
                    <button className="px-2 py-1 text-xs rounded border border-border bg-card hover:bg-muted disabled:opacity-40" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>»</button>
                    <span className="text-xs text-muted-foreground ml-2">{data.length} items</span>
                </div>
            )}
        </div>
    );
}

export function LoadingSpinner({ message }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground" role="status">
            <div className="w-8 h-8 border-[3px] border-border border-t-primary rounded-full animate-spin" aria-hidden="true"></div>
            <span className="text-sm">{message || 'Loading...'}</span>
        </div>
    );
}

export function MetaChip({ label, value }) {
    return (
        <span className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-md text-xs font-mono text-muted-foreground">
            <strong className="text-foreground">{label}:</strong> {value}
        </span>
    );
}

export function ProgressBar({ value, variant, label }) {
    const FILL_COLORS = {
        '': 'bg-primary',
        success: 'bg-green-600',
        warning: 'bg-amber-500',
        danger: 'bg-red-600',
        info: 'bg-blue-600',
    };
    return (
        <div>
            {label && (
                <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{label}</span>
                    <span className="text-xs font-bold text-foreground">{value}%</span>
                </div>
            )}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
                <div className={cn("h-full rounded-full transition-all duration-500", FILL_COLORS[variant || ''])} style={{ width: `${value}%` }}></div>
            </div>
        </div>
    );
}
