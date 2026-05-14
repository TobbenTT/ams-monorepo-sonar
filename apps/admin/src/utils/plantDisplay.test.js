import { describe, it, expect } from 'vitest';
import { displayPlantName, PLANT_DISPLAY_NAMES } from './plantDisplay';

describe('displayPlantName', () => {
    it('returns mapped alias for known plant_id', () => {
        expect(displayPlantName('GOLDFIELDS-SN')).toBe('Planta Minera Cliente');
        expect(displayPlantName('OCP-JFC1')).toBe('Jorf Fertilizers Complex 1');
    });

    it('prefers local alias over DB name for known plants (0D1 anonimización)', () => {
        // Si BD tiene "Goldfields - Salares Norte" pero local mapping
        // dice "Planta Minera Cliente", local gana.
        const obj = { plant_id: 'GOLDFIELDS-SN', name: 'Goldfields - Salares Norte' };
        expect(displayPlantName(obj)).toBe('Planta Minera Cliente');
    });

    it('falls back to DB name for unknown plant_id', () => {
        const obj = { plant_id: 'UNKNOWN-PLANT-XYZ', name: 'Some Real Name' };
        expect(displayPlantName(obj)).toBe('Some Real Name');
    });

    it('returns plant_id when nothing else is available', () => {
        expect(displayPlantName('UNMAPPED-ID')).toBe('UNMAPPED-ID');
    });

    it('handles null/undefined/empty input', () => {
        expect(displayPlantName(null)).toBe('');
        expect(displayPlantName(undefined)).toBe('');
        expect(displayPlantName('')).toBe('');
    });

    it('exports all known plants in PLANT_DISPLAY_NAMES', () => {
        expect(Object.keys(PLANT_DISPLAY_NAMES)).toContain('GOLDFIELDS-SN');
        expect(Object.keys(PLANT_DISPLAY_NAMES)).toContain('OCP-JFC1');
    });
});
