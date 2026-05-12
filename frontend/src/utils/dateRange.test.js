import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getDateRange, filterByDateRange } from './dateRange';

describe('getDateRange', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-05-12T12:00:00.000Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns last 7 days range', () => {
        const { start, end } = getDateRange('Last 7 Days');
        const diffDays = Math.round((end - start) / (24 * 3600 * 1000));
        expect(diffDays).toBe(7);
    });

    it('returns last 30 days range', () => {
        const { start, end } = getDateRange('Last 30 Days');
        const diffDays = Math.round((end - start) / (24 * 3600 * 1000));
        expect(diffDays).toBe(30);
    });

    it('returns YTD range starting Jan 1st', () => {
        const { start } = getDateRange('YTD');
        expect(start.getFullYear()).toBe(2026);
        expect(start.getMonth()).toBe(0);
        expect(start.getDate()).toBe(1);
    });

    it('returns last year range Jan 1 → Dec 31', () => {
        const { start, end } = getDateRange('Last Year');
        expect(start.getFullYear()).toBe(2025);
        expect(start.getMonth()).toBe(0);
        expect(start.getDate()).toBe(1);
        expect(end.getFullYear()).toBe(2025);
        expect(end.getMonth()).toBe(11);
        expect(end.getDate()).toBe(31);
    });

    it('falls back to last 30 days for unknown label', () => {
        const { start, end } = getDateRange('Unknown Label');
        const diffDays = Math.round((end - start) / (24 * 3600 * 1000));
        expect(diffDays).toBe(30);
    });
});

describe('filterByDateRange', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-05-12T12:00:00.000Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns input untouched if items is empty/null', () => {
        expect(filterByDateRange([], 'Last 7 Days')).toEqual([]);
        expect(filterByDateRange(null, 'Last 7 Days')).toBe(null);
    });

    it('returns input untouched if no timeRange provided', () => {
        const items = [{ id: 1, created_at: '2020-01-01' }];
        expect(filterByDateRange(items, null)).toBe(items);
        expect(filterByDateRange(items, '')).toBe(items);
    });

    it('filters items within the 7-day window', () => {
        const items = [
            { id: 1, created_at: '2026-05-10T00:00:00Z' }, // inside
            { id: 2, created_at: '2026-05-01T00:00:00Z' }, // outside
            { id: 3, created_at: '2026-05-12T00:00:00Z' }, // inside (today)
        ];
        const filtered = filterByDateRange(items, 'Last 7 Days');
        expect(filtered.map(i => i.id).sort()).toEqual([1, 3]);
    });

    it('drops items with null/missing date field', () => {
        const items = [
            { id: 1, created_at: null },
            { id: 2 }, // missing field
            { id: 3, created_at: '2026-05-11T00:00:00Z' },
        ];
        const filtered = filterByDateRange(items, 'Last 7 Days');
        expect(filtered.map(i => i.id)).toEqual([3]);
    });

    it('supports custom dateField', () => {
        const items = [
            { id: 1, completed_at: '2026-05-11T00:00:00Z', created_at: '2020-01-01' },
            { id: 2, completed_at: '2020-01-01', created_at: '2026-05-11T00:00:00Z' },
        ];
        const filtered = filterByDateRange(items, 'Last 7 Days', 'completed_at');
        expect(filtered.map(i => i.id)).toEqual([1]);
    });
});
