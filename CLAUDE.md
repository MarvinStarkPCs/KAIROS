# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KAIROS is an academic management system built with Laravel 12 (backend) + React 19 + TypeScript (frontend), using Inertia.js as the integration layer. The system manages students, teachers, academic programs, schedules, attendance, payments, and includes a comprehensive role-based permission system with audit logging.

**Language**: Spanish (all UI text, validation messages, and database content should be in Spanish)

## Development Commands

### Starting Development Environment
```bash
# Run Laravel server + queue worker + Vite dev server concurrently (recommended)
composer run dev

# Or run components separately:
php artisan serve           # Laravel server on port 8000
php artisan queue:listen    # Queue worker
npm run dev                 # Vite dev server
```

### Building for Production
```bash
npm run build              # Build frontend assets
npm run build:ssr          # Build with server-side rendering

# SSR development mode:
composer run dev:ssr       # Runs everything including SSR server
```

### Testing
```bash
composer run test          # Run Pest test suite (clears config first)
php artisan test           # Direct test invocation
php artisan test --filter=TestName  # Run specific test
```

### Code Quality
```bash
# Frontend
npm run lint               # ESLint with auto-fix
npm run format             # Format with Prettier
npm run format:check       # Check formatting without changes
npm run types              # TypeScript type checking

# Backend
./vendor/bin/pint          # Laravel Pint code formatter
```

### Database
```bash
php artisan migrate        # Run migrations
php artisan migrate:fresh --seed  # Fresh database with seeders
php artisan db:seed --class=RolePermissionSeeder  # Seed roles/permissions
```

## Architecture Overview

### Inertia.js Integration Pattern

The application uses Inertia.js to create a single-page application experience without building an API:

1. **Server-Side Routing**: All routes defined in `routes/web.php` (Laravel)
2. **Controllers**: Return Inertia responses with data props
3. **React Pages**: Automatically resolved from `resources/js/pages/` directory
4. **Shared Props**: Global data provided via `HandleInertiaRequests` middleware

**Example flow**:
```php
// routes/web.php
Route::get('/usuarios', [UserController::class, 'index'])->name('usuarios.index');

// UserController.php
public function index()
{
    return Inertia::render('Security/Users/index', [
        'users' => User::with('roles')->paginate(10)
    ]);
}
```

This renders `resources/js/pages/Security/Users/index.tsx` with the `users` prop.

### Shared Data Architecture

The `HandleInertiaRequests` middleware (`app/Http/Middleware/HandleInertiaRequests.php`) shares data globally to all React components:

- `name`: Application name from config
- `quote`: Random inspiring quote (message + author)
- `auth.user`: Currently authenticated user object
- `sidebarOpen`: Sidebar state from cookie

Access in React components via `usePage().props`.

### Permission System Architecture

Built on Spatie Laravel-Permission package:

**Database Structure**:
- `roles` table: Role definitions
- `permissions` table: Permission definitions
- `model_has_roles`: User → Role assignments
- `role_has_permissions`: Role → Permission assignments
- `model_has_permissions`: Direct user permissions (override)

**Three Default Roles** (see `RolePermissionSeeder`):
- **Administrador**: Full access to all permissions
- **Profesor**: Can view students, teachers, schedules, attendance, communication, reports
- **Estudiante**: Can view dashboard, schedules, attendance, communication

**Permission Naming Convention**: `{acción}_{recurso}` (e.g., `ver_estudiantes`, `crear_usuario`, `editar_rol`)

**Usage in Controllers**:
```php
$user->hasPermissionTo('ver_usuarios');
$user->can('editar_estudiante');
```

### Activity Log (Audit Trail)

Uses Spatie Laravel-ActivityLog to track all changes:
- Automatically logs model changes when models use `LogsActivity` trait
- Stores: subject (what changed), causer (who changed it), description, properties (old/new values)
- View logs at `/auditoria` route via `AuditController`
- Filter by date, user, event type

**To make a model loggable**:
```php
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class YourModel extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['field1', 'field2'])
            ->logOnlyDirty();
    }
}
```

### Frontend Component Organization

```
resources/js/
├── app.tsx                    # Inertia entry point
├── pages/                     # Inertia page components (routes)
│   ├── auth/                  # Login, register, password reset
│   ├── Security/              # Roles, Users, Audit pages
│   ├── ProgramAcademy/        # Academic programs
│   ├── Schedules/             # Schedule management
│   ├── Assists/               # Attendance tracking
│   ├── Pay/                   # Payments
│   └── settings/              # User settings (profile, password, 2FA)
├── components/
│   ├── ui/                    # Radix UI-based primitives (button, dialog, etc.)
│   ├── app-header.tsx         # Top navigation bar
│   └── app-sidebar.tsx        # Left navigation sidebar
├── layouts/
│   ├── app-layout.tsx         # Main authenticated layout (header + sidebar)
│   └── auth-layout.tsx        # Unauthenticated pages layout
├── hooks/                     # Custom React hooks (use-appearance.ts for theming)
└── actions/                   # Auto-generated TypeScript types from Laravel routes
```

### Styling Architecture

**Tailwind CSS 4** with custom CSS variables for theming:

- Theme variables defined in `resources/css/app.css`
- Light/dark mode support via `[data-appearance="dark"]` attribute on `<html>`
- Theme persistence in localStorage
- Component variants managed with `class-variance-authority`

**Radix UI Components**: Unstyled, accessible primitives styled with Tailwind in `components/ui/`

### Route Generation for Frontend

**Ziggy** generates TypeScript-safe Laravel routes for frontend:

```tsx
import { route } from 'ziggy-js';

// Use in components:
<Link href={route('usuarios.index')}>Users</Link>
```

All named Laravel routes are available type-safe in React.

### TypeScript Integration

**Wayfinder Plugin** auto-generates TypeScript types from Laravel:
- Action types from controllers in `resources/js/actions/`
- Validates Inertia props match controller return types
- Enable with `formVariants: true` in vite.config.ts

### Authentication Flow

**Laravel Fortify** handles:
- Login, registration, email verification
- Password reset, password confirmation
- Two-factor authentication with recovery codes

**React Pages**:
- `resources/js/pages/auth/login.tsx`
- `resources/js/pages/auth/register.tsx`
- `resources/js/pages/auth/two-factor-challenge.tsx`

**Middleware**: Applied in `routes/web.php` (`auth`, `verified`)

## Database Schema

**Key Tables**:
- `users`: Core user table with 2FA columns
- `roles`, `permissions`: Spatie permission tables
- `academic_programs`: Program name, description, duration, max_slots, status
- `study_plans`: Curriculum linked to programs
- `enrollments`: Student enrollments (student_id, program_id, enrollment_date, status)
- `student_progress`: Student progress tracking
- `activity_log`: Audit trail (subject_type, subject_id, causer_id, description, properties)

## Important Conventions

### File Naming
- **Controllers**: PascalCase (e.g., `UserController.php`, `RoleController.php`)
  - Exception: Some controllers use snake_case (e.g., `program_academy.php`, `schedules.php`) - follow existing pattern in that module
- **React Components**: kebab-case for files (e.g., `app-sidebar.tsx`), PascalCase for component names
- **React Pages**: kebab-case or camelCase (matches Inertia render path)

### Route Naming
- Use Spanish resource names in URLs (e.g., `/usuarios`, `/roles`, `/pagos`)
- Use dot notation for route names (e.g., `usuarios.index`, `roles.edit`)

### Code Style
- **Backend**: Follow Laravel conventions, use Pint for formatting
- **Frontend**: ESLint + Prettier configured, use `npm run format` before committing

### Component Import Alias
Vite configured with `@` alias pointing to `resources/js/`:
```tsx
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
```

## Module Status Reference

**Fully Implemented**:
- Authentication & 2FA
- User management (CRUD)
- Role management (CRUD with permissions)
- Audit logging (view & filter)
- Settings (profile, password, 2FA)

**Partially Implemented** (UI exists, minimal backend logic):
- Academic Programs (`program_academy` controller)
- Schedules (`schedules` controller)
- Attendance (`Assists` controller)
- Payments (`Pay` controller)

When implementing these modules, follow the pattern established in `UserController` and `RoleController`.

## Testing Approach

**Pest PHP** configured for testing:
- Test files in `tests/Feature/` and `tests/Unit/`
- Use Pest's `it()` syntax for readable test descriptions
- Laravel's database factories available for test data

## Key Dependencies

**Backend**:
- `spatie/laravel-permission`: Role-based access control
- `spatie/laravel-activitylog`: Audit logging
- `laravel/fortify`: Authentication scaffolding
- `inertiajs/inertia-laravel`: Server-side Inertia adapter

**Frontend**:
- `@inertiajs/react`: Client-side Inertia adapter
- `@radix-ui/*`: Accessible UI primitives
- `lucide-react`: Icon library
- `class-variance-authority`: Component variant management
- `ziggy-js`: Laravel routes in JavaScript
