import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Toaster as SonnerToaster, toast } from 'sonner';
import type { FlashMessages } from '@/types';

export function Toaster() {
    const { props } = usePage();
    const flash = props.flash as FlashMessages;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.info) {
            toast.info(flash.info);
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
    }, [flash]);

    return (
        <SonnerToaster
            position="top-right"
            expand={true}
            richColors
            closeButton
            offset="80px"
            toastOptions={{
                duration: 5000,
                style: {
                    fontFamily: 'inherit',
                },
            }}
        />
    );
}
