import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { X } from 'lucide-react';

export function Alert() {
    const { props } = usePage();
    const [visible, setVisible] = useState(false);
    type Flash = { success?: string; error?: string };
    const flash = props.flash as Flash;

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!visible || !flash) return null;

    const isSuccess = !!flash.success;
    const message = flash.success || flash.error;

    return (
        <div className={`fixed top-4 right-4 p-4 rounded-lg flex items-center gap-3 ${
            isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
            <span>{message}</span>
            <button
                onClick={() => setVisible(false)}
                title="Close alert"
                aria-label="Close alert"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}