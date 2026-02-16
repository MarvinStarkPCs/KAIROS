import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Head, router, useForm } from '@inertiajs/react';
import { MessageSquare, Plus, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { route } from 'ziggy-js';

interface User {
    id: number;
    name: string;
    email: string;
}

interface LatestMessage {
    id: number;
    body: string;
    created_at: string;
    user_name: string;
    is_mine: boolean;
}

interface Conversation {
    id: number;
    last_message_at: string | null;
    latest_message: LatestMessage | null;
    other_user: User | null;
    unread_count: number;
}

interface Props {
    conversations: Conversation[];
    availableUsers: User[];
}

export default function Index({ conversations, availableUsers }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [userSearchQuery, setUserSearchQuery] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('comunicacion.start'), {
            onSuccess: () => {
                reset();
                setDialogOpen(false);
            },
        });
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Ayer';
        } else if (diffDays < 7) {
            return date.toLocaleDateString('es-ES', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        }
    };

    const truncateMessage = (message: string, maxLength: number = 50) => {
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    };

    const filteredConversations = conversations.filter((conv) =>
        conv.other_user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.other_user?.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUsers = availableUsers.filter((user) =>
        user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
    );

    const selectedUser = availableUsers.find((u) => u.id.toString() === data.user_id);

    const handleDialogChange = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            setUserSearchQuery('');
            reset();
        }
    };

    // Polling: Auto-refresh conversations every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['conversations'],
                preserveScroll: true,
                preserveState: true,
            });
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <AppLayout>
            <Head title="Comunicaciones" />

            <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Comunicaciones</h1>
                        <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">Conversa con otros usuarios del sistema</p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" />
                                <span className="sm:inline">Nueva conversación</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Iniciar nueva conversación</DialogTitle>
                                <DialogDescription>
                                    Busca y selecciona un usuario
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Buscar por nombre o email..."
                                            value={userSearchQuery}
                                            onChange={(e) => setUserSearchQuery(e.target.value)}
                                            className="pl-10"
                                            autoFocus
                                        />
                                    </div>

                                    {selectedUser && (
                                        <div className="flex items-center justify-between rounded-lg border border-primary bg-primary/5 p-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium text-sm">{selectedUser.name}</p>
                                                <p className="truncate text-xs text-muted-foreground">{selectedUser.email}</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setData('user_id', '')}
                                                className="ml-2 shrink-0 text-xs"
                                            >
                                                Cambiar
                                            </Button>
                                        </div>
                                    )}

                                    {!selectedUser && (
                                        <div className="max-h-[40vh] overflow-y-auto rounded-lg border">
                                            {filteredUsers.length === 0 ? (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    {userSearchQuery ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
                                                </div>
                                            ) : (
                                                <div className="divide-y">
                                                    {filteredUsers.map((user) => (
                                                        <button
                                                            key={user.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setData('user_id', user.id.toString());
                                                                setUserSearchQuery('');
                                                            }}
                                                            className="w-full p-3 text-left transition-colors hover:bg-accent"
                                                        >
                                                            <p className="truncate font-medium text-sm">{user.name}</p>
                                                            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {errors.user_id && (
                                        <p className="text-sm text-destructive">{errors.user_id}</p>
                                    )}
                                </div>
                                <Button type="submit" disabled={processing || !data.user_id} className="w-full">
                                    Iniciar conversación
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Tus conversaciones</CardTitle>
                        <CardDescription>
                            {conversations.length === 0
                                ? 'No tienes conversaciones activas'
                                : `${conversations.length} conversación${conversations.length !== 1 ? 'es' : ''}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {conversations.length > 0 && (
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Buscar conversaciones..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        )}

                        {filteredConversations.length === 0 && conversations.length > 0 && (
                            <div className="py-8 text-center text-muted-foreground">
                                No se encontraron conversaciones
                            </div>
                        )}

                        {filteredConversations.length === 0 && conversations.length === 0 && (
                            <div className="py-12 text-center">
                                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-4 text-muted-foreground">
                                    No tienes conversaciones aún
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Inicia una nueva conversación con el botón de arriba
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            {filteredConversations.map((conversation) => (
                                <button
                                    key={conversation.id}
                                    onClick={() =>
                                        router.visit(route('comunicacion.show', { conversation: conversation.id }))
                                    }
                                    className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent sm:p-4"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center justify-between gap-1">
                                                <h3 className="truncate font-semibold text-sm sm:text-base">
                                                    {conversation.other_user?.name || 'Usuario desconocido'}
                                                </h3>
                                                {conversation.last_message_at && (
                                                    <span className="shrink-0 text-xs text-muted-foreground">
                                                        {formatDate(conversation.last_message_at)}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="truncate text-xs text-muted-foreground sm:text-sm">
                                                {conversation.other_user?.email}
                                            </p>
                                            {conversation.latest_message && (
                                                <p className="mt-1 truncate text-xs text-muted-foreground sm:text-sm">
                                                    {conversation.latest_message.is_mine && 'Tú: '}
                                                    {truncateMessage(conversation.latest_message.body)}
                                                </p>
                                            )}
                                        </div>
                                        {conversation.unread_count > 0 && (
                                            <div className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground sm:ml-4 sm:h-6 sm:w-6">
                                                {conversation.unread_count}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
