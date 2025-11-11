import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Comunicaciones</h1>
                        <p className="mt-2 text-gray-600">Conversa con otros usuarios del sistema</p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Nueva conversación
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Iniciar nueva conversación</DialogTitle>
                                <DialogDescription>
                                    Selecciona un usuario para iniciar una conversación
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Select
                                        value={data.user_id}
                                        onValueChange={(value) => setData('user_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar usuario" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableUsers.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name} ({user.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.user_id && (
                                        <p className="text-sm text-destructive">{errors.user_id}</p>
                                    )}
                                </div>
                                <Button type="submit" disabled={processing} className="w-full">
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
                                    className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-accent"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold">
                                                    {conversation.other_user?.name || 'Usuario desconocido'}
                                                </h3>
                                                {conversation.last_message_at && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDate(conversation.last_message_at)}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {conversation.other_user?.email}
                                            </p>
                                            {conversation.latest_message && (
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {conversation.latest_message.is_mine && 'Tú: '}
                                                    {truncateMessage(conversation.latest_message.body)}
                                                </p>
                                            )}
                                        </div>
                                        {conversation.unread_count > 0 && (
                                            <div className="ml-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
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
