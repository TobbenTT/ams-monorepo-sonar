import { describe, it, expect } from 'vitest';
import { shortTag, displayTagWithLocation } from './equipmentTag';

describe('shortTag', () => {
    it('returns empty for null/undefined/empty', () => {
        expect(shortTag(null)).toBe('');
        expect(shortTag(undefined)).toBe('');
        expect(shortTag('')).toBe('');
        expect(shortTag('   ')).toBe('');
    });

    it('returns tag unchanged when already short', () => {
        expect(shortTag('3150XM0020')).toBe('3150XM0020');
        expect(shortTag('PMP-AGUA-01')).toBe('01'); // dash → último segmento
        expect(shortTag('BOMBA01')).toBe('BOMBA01');
    });

    it('extracts last segment from dashed func_loc', () => {
        expect(shortTag('SN-3000-3100-3150-3150XM0020')).toBe('3150XM0020');
        expect(shortTag('SN-1000-1200-1210-1210CN0001M6')).toBe('1210CN0001M6');
    });

    it('extracts last segment from slashed path', () => {
        expect(shortTag('Planta/Area/Sistema/Equipo01')).toBe('Equipo01');
    });

    it('handles trailing separator gracefully', () => {
        expect(shortTag('SN-3000-')).toBe('SN-3000-'); // last segment empty → no cut
    });

    it('preserves tag if no separator present', () => {
        expect(shortTag('3150XM0020')).toBe('3150XM0020');
        expect(shortTag('OCP1')).toBe('OCP1');
    });

    it('trims whitespace', () => {
        expect(shortTag('  SN-3000-3150XM0020  ')).toBe('3150XM0020');
    });
});

describe('displayTagWithLocation', () => {
    it('returns short tag if no funcLoc', () => {
        expect(displayTagWithLocation('3150XM0020', null)).toBe('3150XM0020');
        expect(displayTagWithLocation('3150XM0020', '')).toBe('3150XM0020');
    });

    it('returns short tag when tag matches end of funcLoc', () => {
        expect(displayTagWithLocation('3150XM0020', 'SN-3000-3100-3150-3150XM0020')).toBe('3150XM0020');
    });

    it('returns short version when both contain paths', () => {
        expect(displayTagWithLocation('SN-3000-3150XM0020', 'SN-3000-3100-3150-3150XM0020')).toBe('3150XM0020');
    });
});
