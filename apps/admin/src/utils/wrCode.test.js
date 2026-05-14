import { describe, it, expect } from 'vitest';
import { formatWRCode } from './wrCode';

describe('formatWRCode', () => {
    it('formats aviso_number as AV-NNNNN with leading zeros', () => {
        expect(formatWRCode({ aviso_number: 1 })).toBe('AV-00001');
        expect(formatWRCode({ aviso_number: 179 })).toBe('AV-00179');
        expect(formatWRCode({ aviso_number: 12345 })).toBe('AV-12345');
    });

    it('falls back to request_id if no aviso_number', () => {
        const wr = { request_id: 'abc-123-def-456' };
        expect(formatWRCode(wr)).toBeTruthy();
    });

    it('handles null/undefined gracefully', () => {
        expect(formatWRCode(null)).toBe('');
        expect(formatWRCode(undefined)).toBe('');
        expect(formatWRCode({})).toBe('');
    });
});
