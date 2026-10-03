import { useUnreadMessages } from '@/hooks/use-unread-messages';
import { router } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function MessageNotifications() {
    const unreadCount = useUnreadMessages();
    const previousCountRef = useRef<number | null>(null);
    const isInitialMount = useRef(true);

    useEffect(() => {
        // En el primer montaje, solo guardar el valor actual sin mostrar notificación
        if (isInitialMount.current) {
            previousCountRef.current = unreadCount;
            isInitialMount.current = false;
            return;
        }

        // Solo mostrar notificación si el contador aumentó
        if (previousCountRef.current !== null && unreadCount > previousCountRef.current) {
            const newMessages = unreadCount - previousCountRef.current;

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
