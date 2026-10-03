<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommunicationController extends Controller
{
    /**
     * Mostrar lista de conversaciones del usuario autenticado
     */
    public function index()
    {
        $user = auth()->user();

        // Closures: el polling de la página pide solo 'conversations' y no recalcula lo demás.
        return Inertia::render('Communication/Index', [
            'conversations' => fn () => $this->conversationsFor($user),
            'availableUsers' => fn () => User::where('id', '!=', $user->id)
                ->whereDoesntHave('conversations', function ($query) use ($user) {
                    $query->whereHas('users', function ($q) use ($user) {
                        $q->where('users.id', $user->id);
                    });
                })
                ->select('id', 'name', 'email')
                ->get(),
        ]);
    }

    private function conversationsFor(User $user)
    {
        $unread = Conversation::unreadCountsFor($user->id);

        return $user->conversations()
            ->with([
                'users' => function ($query) use ($user) {
                    $query->where('users.id', '!=', $user->id);
                },
                'latestMessage.user',
            ])
            ->get()
            ->map(function ($conversation) use ($user, $unread) {
                $otherUser = $conversation->users->first();

                return [
                    'id' => $conversation->id,
                    'last_message_at' => $conversation->last_message_at,
                    'latest_message' => $conversation->latestMessage ? [
                        'id' => $conversation->latestMessage->id,
                        'body' => $conversation->latestMessage->body,
                        'created_at' => $conversation->latestMessage->created_at,
                        'user_name' => $conversation->latestMessage->user->name,
                        'is_mine' => $conversation->latestMessage->user_id === $user->id,
                    ] : null,
                    'other_user' => $otherUser ? [
                        'id' => $otherUser->id,
                        'name' => $otherUser->name,
                        'email' => $otherUser->email,
                    ] : null,
                    'unread_count' => $unread->get($conversation->id, 0),
                ];
            });
    }

    /**
     * Mostrar una conversación específica con sus mensajes
     */
    public function show(Conversation $conversation)
    {
        $user = auth()->user();

        // Verificar que el usuario pertenece a esta conversación
        if (!$conversation->users->contains($user)) {
            abort(403, 'No tienes acceso a esta conversación');
        }

        // Marcar conversación como leída
        $conversation->users()->updateExistingPivot($user->id, [
            'last_read_at' => now(),
        ]);

        // Closures: el polling del chat pide solo 'messages'.
        return Inertia::render('Communication/Show', [
            'conversation' => function () use ($conversation, $user) {
                $otherUser = $conversation->users->firstWhere('id', '!=', $user->id);

                return [
                    'id' => $conversation->id,
                    'other_user' => [
                        'id' => $otherUser->id,
                        'name' => $otherUser->name,
                        'email' => $otherUser->email,
                    ],
                ];
            },
            'messages' => fn () => $conversation->messages()
                ->with('user:id,name')
                ->orderBy('created_at', 'asc')
                ->get()
                ->map(fn ($message) => [
                    'id' => $message->id,
                    'body' => $message->body,
                    'created_at' => $message->created_at,
                    'is_mine' => $message->user_id === $user->id,
                    'user' => [
                        'id' => $message->user->id,
                        'name' => $message->user->name,
                    ],
                ]),
        ]);
    }

    /**
     * Iniciar una nueva conversación con otro usuario
     */
    public function start(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ], [
            'user_id.required' => 'Debe seleccionar un usuario',
            'user_id.exists' => 'El usuario seleccionado no existe',
        ]);

        $currentUser = auth()->user();
        $otherUserId = $validated['user_id'];

        // Verificar que no intenta crear conversación consigo mismo
        if ($currentUser->id === $otherUserId) {
            flash_error('No puedes crear una conversación contigo mismo');
            return back();
        }

        // Verificar si ya existe una conversación entre estos usuarios
        $existingConversation = Conversation::whereHas('users', function ($query) use ($currentUser) {
            $query->where('users.id', $currentUser->id);
        })->whereHas('users', function ($query) use ($otherUserId) {
            $query->where('users.id', $otherUserId);
        })->first();

        if ($existingConversation) {
            flash_info('Ya tienes una conversación con este usuario');
            return redirect()->route('comunicacion.show', $existingConversation);
        }

        // Crear nueva conversación
        $conversation = Conversation::create();

        // Agregar usuarios a la conversación
        $conversation->users()->attach([$currentUser->id, $otherUserId]);

        flash_success('Conversación iniciada correctamente');

        return redirect()->route('comunicacion.show', $conversation);
    }

    /**
     * Enviar un mensaje en una conversación
     */
    public function sendMessage(Request $request, Conversation $conversation)
    {
        $user = auth()->user();

        // Verificar que el usuario pertenece a esta conversación
        if (!$conversation->users->contains($user)) {
            abort(403, 'No tienes acceso a esta conversación');
        }

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ], [
            'body.required' => 'El mensaje no puede estar vacío',
            'body.max' => 'El mensaje no puede exceder 5000 caracteres',
        ]);

        // Crear el mensaje
        $conversation->messages()->create([
            'user_id' => $user->id,
            'body' => $validated['body'],
        ]);

        // Actualizar timestamp de la conversación
        $conversation->update([
            'last_message_at' => now(),
        ]);

        return back();
    }

    /**
     * Total de mensajes no leídos; lo consulta el header periódicamente.
     */
    public function unreadCount(Request $request)
    {
        return response()->json([
            'unread' => Conversation::unreadCountsFor($request->user()->id)->sum(),
        ]);
    }

    /**
     * Obtener lista de todos los usuarios disponibles para chat
     */
    public function users()
    {
        $currentUser = auth()->user();

        $users = User::where('id', '!=', $currentUser->id)
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return response()->json($users);
    }
}
