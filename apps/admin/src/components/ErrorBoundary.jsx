import { Component } from 'react';

/**
 * ErrorBoundary that auto-reloads on stale chunk errors (after deploys).
 * When Vite rebuilds, old chunk hashes no longer exist on the server.
 * Instead of showing an error, we reload once to get the new index.html.
 */
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error) {
        // Detect stale chunk / dynamic import failure → auto-reload once
        const msg = error?.message || '';
        if (
            msg.includes('Failed to fetch dynamically imported module') ||
            msg.includes('Importing a module script failed') ||
            msg.includes('error loading dynamically imported module') ||
            msg.includes('ChunkLoadError')
        ) {
            // Prevent infinite reload loop: only reload once per session
            const key = 'chunk_reload_ts';
            const last = sessionStorage.getItem(key);
            const now = Date.now();
            if (!last || now - Number(last) > 10000) {
                sessionStorage.setItem(key, String(now));
                window.location.reload();
                return;
            }
        }
    }

    render() {
        if (this.state.hasError) {
            const msg = this.state.error?.message || '';
            const isChunkError = msg.includes('dynamically imported module') || msg.includes('ChunkLoadError');

            return (
                <div className="text-center py-16 px-5 text-muted-foreground">
                    <div className="text-5xl mb-4 opacity-40">⚠️</div>
                    <h3 className="text-base font-semibold mb-1 text-foreground">
                        {isChunkError ? 'Nueva versión disponible' : 'Algo salió mal'}
                    </h3>
                    <p className="text-sm mb-4">
                        {isChunkError
                            ? 'Se desplegó una actualización. Recarga la página para continuar.'
                            : (msg || 'Ocurrió un error inesperado')}
                    </p>
                    <button
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        onClick={() => {
                            if (isChunkError) {
                                window.location.reload();
                            } else {
                                this.setState({ hasError: false, error: null });
                            }
                        }}
                    >
                        {isChunkError ? 'Recargar' : 'Intentar de nuevo'}
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
