import { describe, it, expect } from 'vitest';
import { isPreExecution, isPostExecution, isWRPreExecution, PRE_EXECUTION_LOCK_MSG } from './woLifecycle';

describe('isPreExecution (WO)', () => {
    it('returns true for null/undefined/empty status (modo creación)', () => {
        expect(isPreExecution(null)).toBe(true);
        expect(isPreExecution(undefined)).toBe(true);
        expect(isPreExecution('')).toBe(true);
    });

    it('returns true for CREADO/LIBERADO/PLANIFICADO/EN_PROGRAMACION/PROGRAMADO/REPROGRAMADO', () => {
        expect(isPreExecution('CREADO')).toBe(true);
        expect(isPreExecution('LIBERADO')).toBe(true);
        expect(isPreExecution('PLANIFICADO')).toBe(true);
        expect(isPreExecution('EN_PROGRAMACION')).toBe(true);
        expect(isPreExecution('PROGRAMADO')).toBe(true);
        expect(isPreExecution('REPROGRAMADO')).toBe(true);
    });

    it('returns true for legacy aliases (PENDIENTE/APROBADO/CREATED/RELEASED/PLANNED/SCHEDULED)', () => {
        expect(isPreExecution('PENDIENTE')).toBe(true);
        expect(isPreExecution('APROBADO')).toBe(true);
        expect(isPreExecution('SCHEDULED')).toBe(true);
    });

    it('returns false for execution + terminal statuses', () => {
        expect(isPreExecution('EN_EJECUCION')).toBe(false);
        expect(isPreExecution('EN_PROGRESO')).toBe(false);
        expect(isPreExecution('COMPLETADO')).toBe(false);
        expect(isPreExecution('CERRADO')).toBe(false);
        expect(isPreExecution('CANCELADO')).toBe(false);
        expect(isPreExecution('CLOSED')).toBe(false);
    });

    it('is case-insensitive', () => {
        expect(isPreExecution('creado')).toBe(true);
        expect(isPreExecution('en_ejecucion')).toBe(false);
    });
});

describe('isPostExecution (WO)', () => {
    it('returns true for execution + terminal statuses', () => {
        expect(isPostExecution('EN_EJECUCION')).toBe(true);
        expect(isPostExecution('COMPLETADO')).toBe(true);
        expect(isPostExecution('CERRADO')).toBe(true);
        expect(isPostExecution('CANCELADO')).toBe(true);
    });

    it('returns false for pre-execution + null', () => {
        expect(isPostExecution('CREADO')).toBe(false);
        expect(isPostExecution('PROGRAMADO')).toBe(false);
        expect(isPostExecution(null)).toBe(false);
        expect(isPostExecution(undefined)).toBe(false);
    });

    it('is symmetric with isPreExecution for known statuses', () => {
        const knownPre = ['CREADO', 'LIBERADO', 'PROGRAMADO'];
        const knownPost = ['EN_EJECUCION', 'CERRADO', 'CANCELADO'];
        for (const s of knownPre) {
            expect(isPreExecution(s)).toBe(true);
            expect(isPostExecution(s)).toBe(false);
        }
        for (const s of knownPost) {
            expect(isPreExecution(s)).toBe(false);
            expect(isPostExecution(s)).toBe(true);
        }
    });
});

describe('isWRPreExecution', () => {
    it('returns true for null/empty (sin status = abierto)', () => {
        expect(isWRPreExecution(null)).toBe(true);
        expect(isWRPreExecution(undefined)).toBe(true);
        expect(isWRPreExecution('')).toBe(true);
    });

    it('returns false for OT_CREADA / CERRADO / RECHAZADO / CANCELADO', () => {
        expect(isWRPreExecution('OT_CREADA')).toBe(false);
        expect(isWRPreExecution('CERRADO')).toBe(false);
        expect(isWRPreExecution('RECHAZADO')).toBe(false);
        expect(isWRPreExecution('CANCELADO')).toBe(false);
    });

    it('returns true for any non-locked WR status', () => {
        expect(isWRPreExecution('NEW')).toBe(true);
        expect(isWRPreExecution('IN_TRIAGE')).toBe(true);
        expect(isWRPreExecution('APPROVED')).toBe(true);
    });
});

describe('PRE_EXECUTION_LOCK_MSG', () => {
    it('is a non-empty message in Spanish', () => {
        expect(typeof PRE_EXECUTION_LOCK_MSG).toBe('string');
        expect(PRE_EXECUTION_LOCK_MSG.length).toBeGreaterThan(20);
        expect(PRE_EXECUTION_LOCK_MSG.toLowerCase()).toContain('ejecución');
    });
});
