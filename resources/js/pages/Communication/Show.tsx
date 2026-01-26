import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { route } from 'ziggy-js';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Message {
    id: number;
    body: string;
    created_at: string;
    is_mine: boolean;
    user: User;
}

interface Conversation {
    id: number;
    other_user: User;
}

interface Props {
    conversation: Conversation;
    messages: Message[];
}

export default function Show({ conversation, messages: initialMessages }: Props) {
    const [messages, setMessages] = useState(initialMessages);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        body: '',
    });

    const scrollToBottom = (smooth = false) => {
        messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    };

    // Sync local state with props when they change
    useEffect(() => {
        setMessages(initialMessages);
        // Scroll inmediato al cargar mensajes
        setTimeout(() => scrollToBottom(false), 100);
    }, [initialMessages]);

    useEffect(() => {
        // Scroll suave cuando cambian los mensajes
        scrollToBottom(true);
    }, [messages]);

    // Auto-focus textarea on mount and scroll to bottom
    useEffect(() => {
        textareaRef.current?.focus();
        // Scroll inicial al montar el componente
        setTimeout(() => scrollToBottom(false), 200);
    }, []);

    // Polling: Auto-refresh messages every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            // Reload only messages without full page refresh
            router.reload({
                only: ['messages'],
                preserveScroll: true,
                preserveState: true,
            });
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.body.trim()) return;

        // Send to server
        post(route('comunicacion.send', { conversation: conversation.id }), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                // Force immediate reload to show the new message
                router.reload({
                    only: ['messages'],
                    preserveScroll: true,
                    onSuccess: () => {
                        textareaRef.current?.focus();
                    }
                });
            },
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Hoy';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Ayer';
        } else {
            return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
        }
    };

    const groupMessagesByDate = (messages: Message[]) => {
        const groups: { [key: string]: Message[] } = {};

        messages.forEach((message) => {
            const dateKey = new Date(message.created_at).toDateString();
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(message);
        });

        return Object.entries(groups).map(([date, msgs]) => ({
            date,
            messages: msgs,
        }));
    };

    const messageGroups = groupMessagesByDate(messages);

    return (
        <AppLayout>
            <Head title={`Conversación con ${conversation.other_user.name}`} />

            <div className="space-y-4 sm:space-y-6">
                <div>
                    <Button
                        variant="ghost"
                        onClick={() => router.visit(route('comunicacion.index'))}
                        className="mb-2 sm:mb-4"
                        size="sm"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Volver a conversaciones</span>
                        <span className="sm:hidden">Volver</span>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-3xl">
                            {conversation.other_user.name}
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">{conversation.other_user.email}</p>
                    </div>
                </div>

                <Card className="flex h-[calc(100vh-16rem)] min-h-[400px] flex-col sm:h-[600px]">
                    <CardHeader className="border-b px-3 py-2 sm:px-6 sm:py-4">
                        <CardTitle className="text-base sm:text-lg">Mensajes</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4">
                        {messages.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                                <div>
                                    <p>No hay mensajes aún</p>
                                    <p className="text-sm">Envía el primer mensaje para comenzar la conversación</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {messageGroups.map((group) => (
                                    <div key={group.date}>
                                        <div className="mb-4 text-center">
                                            <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                                                {formatDate(group.messages[0].created_at)}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {group.messages.map((message) => (
                                                <div
                                                    key={message.id}
                                                    className={cn(
                                                        'flex',
                                                        message.is_mine ? 'justify-end' : 'justify-start'
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            'max-w-[85%] rounded-lg px-3 py-2 sm:max-w-[70%] sm:px-4',
                                                            message.is_mine
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'bg-muted'
                                                        )}
                                                    >
                                                        {!message.is_mine && (
                                                            <p className="mb-1 text-xs font-medium">
                                                                {message.user.name}
                                                            </p>
                                                        )}
                                                        <p className="whitespace-pre-wrap break-words text-sm sm:text-base">
                                                            {message.body}
                                                        </p>
                                                        <p
                                                            className={cn(
                                                                'mt-1 text-xs',
                                                                message.is_mine
                                                                    ? 'text-primary-foreground/70'
                                                                    : 'text-muted-foreground'
                                                            )}
                                                        >
                                                            {formatTime(message.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </CardContent>
                    <div className="border-t p-3 sm:p-4">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Textarea
                                ref={textareaRef}
                                placeholder="Escribe tu mensaje..."
                                value={data.body}
                                onChange={(e) => setData('body', e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="min-h-[50px] resize-none text-sm sm:min-h-[60px] sm:text-base"
                                disabled={processing}
                            />
                            <Button type="submit" disabled={processing || !data.body.trim()} size="icon" className="shrink-0">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                        {errors.body && (
                            <p className="mt-2 text-sm text-destructive">{errors.body}</p>
                        )}
                        <p className="mt-2 hidden text-xs text-muted-foreground sm:block">
                            Presiona Enter para enviar, Shift+Enter para nueva línea
                        </p>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
