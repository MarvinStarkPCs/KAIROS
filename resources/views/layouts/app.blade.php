<!-- Barra superior -->
<nav class="bg-white shadow-md px-6 py-3 flex items-center justify-between">
    <!-- Logo -->
    <div class="flex items-center space-x-2">
        <span class="text-2xl font-bold text-brown-700">🎵 Academia Armonía</span>
        <span class="text-sm text-gray-500">Sistema de Gestión Musical</span>
    </div>

    <!-- Buscador -->
    <div class="flex-1 mx-8">
        <input type="text" placeholder="Buscar estudiantes, profesores..."
               class="w-full rounded-xl border-gray-300 shadow-sm px-4 py-2 focus:ring focus:ring-green-300" />
    </div>

    <!-- Acciones -->
    <div class="flex items-center space-x-4">
        <button class="relative">
            🔔
            <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">3</span>
        </button>
        <button>✉️</button>

        <!-- Usuario -->
        <div class="flex items-center space-x-2">
            <img src="https://ui-avatars.com/api/?name=Maria+Gonzalez" class="w-8 h-8 rounded-full" />
            <div class="text-sm">
                <p class="font-semibold">María González</p>
                <p class="text-gray-500">Administrador</p>
            </div>
        </div>
    </div>
</nav>

<!-- Menú principal -->
<div class="bg-white shadow-sm flex space-x-6 px-6 py-3 border-t">
    <a href="{{ route('dashboard') }}" class="flex items-center space-x-2 text-green-600 font-medium">
        <span>🏠</span> <span>Dashboard</span>
    </a>
    <a href="{{ route('students.index') }}" class="flex items-center space-x-2 text-gray-600 hover:text-green-600">
        <span>👩‍🎓</span> <span>Estudiantes</span>
    </a>
    <a href="{{ route('teachers.index') }}" class="flex items-center space-x-2 text-gray-600 hover:text-green-600">
        <span>👨‍🏫</span> <span>Profesores</span>
    </a>
    <a href="{{ route('payments.index') }}" class="flex items-center space-x-2 text-gray-600 hover:text-green-600">
        <span>💳</span> <span>Pagos</span>
    </a>
    <a href="{{ route('schedule.index') }}" class="flex items-center space-x-2 text-gray-600 hover:text-green-600">
        <span>🕒</span> <span>Horarios</span>
    </a>
    <a href="{{ route('attendance.index') }}" class="flex items-center space-x-2 text-gray-600 hover:text-green-600">
        <span>📋</span> <span>Asistencia</span>
    </a>
    <a href="{{ route('communication.index') }}" class="flex items-center space-x-2 text-gray-600 hover:text-green-600">
        <span>💬</span> <span>Comunicación</span>
    </a>
</div>
