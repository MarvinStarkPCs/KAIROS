import { usePage, router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { MessageSquare } from 'lucide-react';
import { type SharedData } from '@/types';

export function MessageNotifications() {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const unreadCount = auth.unreadMessages || 0;
    const previousCountRef = useRef<number | null>(null);
    const isInitialMount = useRef(true);

    // Polling: Auto-refresh unread count every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['auth'],
                preserveScroll: true,
                preserveState: true,
            });
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // En el primer montaje, solo guardar el valor actual sin mostrar notificación
        if (isInitialMount.current) {
            previousCountRef.current = unreadCount;
            isInitialMount.current = false;
            console.log('Initial unread count:', unreadCount);
            return;
        }

        // Solo mostrar notificación si el contador aumentó
        if (previousCountRef.current !== null && unreadCount > previousCountRef.current) {
            const newMessages = unreadCount - previousCountRef.current;

            console.log('New messages detected:', newMessages, 'Previous:', previousCountRef.current, 'Current:', unreadCount);

            toast.info(
                newMessages === 1
                    ? 'Tienes un nuevo mensaje'
                    : `Tienes ${newMessages} mensajes nuevos`,
                {
                    icon: <MessageSquare className="h-4 w-4" />,
                    duration: 5000,
                    action: {
                        label: 'Ver',
                        onClick: () => router.visit('/comunicacion'),
                    },
                }
            );
        }

        previousCountRef.current = unreadCount;
    }, [unreadCount]);

    return null;
}
