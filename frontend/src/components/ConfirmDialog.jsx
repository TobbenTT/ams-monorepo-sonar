import { createContext, useContext, useState, useCallback } from 'react';

const ConfirmContext = createContext();

export function useConfirm() {
    return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }) {
    const [state, setState] = useState(null);

    const confirm = useCallback((title, message) => {
        return new Promise((resolve) => {
            setState({ title, message, resolve });
        });
    }, []);

    const handleClose = (result) => {
        state?.resolve(result);
        setState(null);
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {state && (
                <div className="confirm-overlay" onClick={() => handleClose(false)} role="dialog" aria-modal="true" aria-label={state.title}>
                    <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
                        <h3>{state.title}</h3>
                        <p>{state.message}</p>
                        <div className="confirm-actions">
                            <button className="btn btn-secondary btn-sm" onClick={() => handleClose(false)}>Cancel</button>
                            <button className="btn btn-primary btn-sm" onClick={() => handleClose(true)} autoFocus>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}
