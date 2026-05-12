// Test setup compartido para vitest + @testing-library/react.
// Auto-cleanup entre tests + matchers extendidos (toBeInTheDocument, etc).
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
    cleanup();
});

// Mock localStorage si los tests lo necesitan
if (typeof window !== 'undefined' && !window.localStorage) {
    const store = {};
    window.localStorage = {
        getItem: (k) => store[k] ?? null,
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    };
}
