import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useSyncExternalStore } from 'react';

// Cada consulta arranca Laravel en el servidor compartido: no bajar este intervalo.
const POLL_MS = 60_000;
const ENDPOINT = '/api/comunicacion/no-leidos';

let count = 0;
let initialized = false;
let timer: number | null = null;
const listeners = new Set<() => void>();

function setCount(value: number) {
    if (value === count) return;
    count = value;
    listeners.forEach((listener) => listener());
}

async function refresh() {
    if (document.visibilityState !== 'visible') return;

    try {
        const response = await fetch(ENDPOINT, {
            headers: { Accept: 'application/json' },
        });
        // Sesión vencida o acceso bloqueado devuelven HTML: se ignora.
        if (
            !response.ok ||
            !response.headers.get('content-type')?.includes('application/json')
        ) {
            return;
        }
        const data = await response.json();
        if (typeof data.unread === 'number') setCount(data.unread);
    } catch {
        // Sin conexión: se reintenta en el siguiente ciclo.
    }
}

function onVisibilityChange() {
    if (document.visibilityState === 'visible') refresh();
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    if (listeners.size === 1) {
        timer = window.setInterval(refresh, POLL_MS);
        document.addEventListener('visibilitychange', onVisibilityChange);
    }

    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
            if (timer !== null) window.clearInterval(timer);
            timer = null;
            document.removeEventListener('visibilitychange', onVisibilityChange);
        }
    };
}

/** Mensajes no leídos: el valor de la página y un sondeo liviano mientras la pestaña está visible. */
export function useUnreadMessages(): number {
    const fromPage = usePage<SharedData>().props.auth.unreadMessages ?? 0;

    if (!initialized) {
        count = fromPage;
        initialized = true;
    }

    useEffect(() => setCount(fromPage), [fromPage]);

    return useSyncExternalStore(
        subscribe,
        () => count,
        () => fromPage,
    );
}
