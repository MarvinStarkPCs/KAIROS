# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KAIROS is an academic program management system built with Laravel 12 and React 19. It manages students, academic programs, enrollments, schedules, attendance, and payments for an educational institution (appears to be focused on music education).

## Tech Stack

**Backend:**
- Laravel 12 (PHP 8.2+)
- Inertia.js for SPA architecture
- Spatie Laravel Permission for role-based access control
- Spatie Laravel Activity Log for audit trails
- Laravel Fortify for authentication

**Frontend:**
- React 19 with TypeScript
- Inertia.js React adapter
- Vite 7 for build tooling
- Tailwind CSS 4 with shadcn/ui components
- Radix UI primitives
- Sonner for toast notifications
- Laravel Wayfinder for type-safe routing
- Ziggy for Laravel routes in JavaScript

## Development Commands

### Starting the Development Environment

```bash
# Start all development servers (Laravel, queue, Vite)
composer dev

# Start with SSR support
composer dev:ssr
```

This runs Laravel's built-in server, queue worker, and Vite dev server concurrently.

### Testing

```bash
# Run all tests (uses Pest)
composer test

# Alternative
php artisan test
```

### Code Quality

```bash
# Format PHP code
./vendor/bin/pint

# Format frontend code
npm run format

# Check formatting without making changes
npm run format:check

# Lint and auto-fix JavaScript/TypeScript
npm run lint

# Type-check TypeScript
npm run types
```

### Building for Production

```bash
# Build frontend assets
npm run build

# Build with SSR support
npm run build:ssr
```

## Database Architecture

The system follows a hierarchical structure:

1. **AcademicProgram** - Programs offered (e.g., Piano, Guitar)
   - Has many `StudyPlan` (modules/courses within the program)
   - Has many `Schedule` (class schedules)
   - Has many `Enrollment` (student enrollments in the program)

2. **StudyPlan** - Modules/courses within a program
   - Has many `Activity` (assignments, projects)
   - Belongs to `AcademicProgram`

3. **Activity** - Tasks/assignments within a study plan
   - Has many `EvaluationCriteria` (grading rubrics)
   - Belongs to `StudyPlan`

4. **Enrollment** - Student registration in a program
   - Belongs to `User` (student)
   - Belongs to `AcademicProgram`
   - Unique constraint: student can only have one active/waiting enrollment per program

5. **Schedule** - Class schedules for programs
   - Belongs to `AcademicProgram`
   - Belongs to `User` (professor)
   - Has many `ScheduleEnrollment` (students enrolled in this schedule)

6. **ScheduleEnrollment** - Junction table for students in schedules
   - Belongs to `Schedule`
   - Belongs to `User` (student)

7. **Attendance** - Track student attendance
   - Belongs to `ScheduleEnrollment`

8. **Payment** - Financial transactions
   - Belongs to `User` (student)
   - Can belong to `AcademicProgram` or `Enrollment`

## Key Conventions

### Flash Messages

Use the global flash helper functions in controllers:
- `flash_success($message)` - Success notifications
- `flash_error($message)` - Error notifications
- `flash_info($message)` - Info notifications
- `flash_warning($message)` - Warning notifications

These are automatically displayed via the Sonner toast system in the frontend.

### Routing

Routes are defined in `routes/web.php` and automatically converted to type-safe TypeScript functions via Laravel Wayfinder. Generated routes are in `resources/js/routes/index.ts`.

To use in React components:
```typescript
import { inscripciones } from '@/routes';

// Navigate to index
router.visit(inscripciones.index().url);

// Navigate to create
router.visit(inscripciones.create().url);

// Navigate to edit with ID
router.visit(inscripciones.edit({ enrollment: enrollmentId }).url);
```

### Inertia Pages

Pages are located in `resources/js/pages/{Module}/{Action}.tsx` and rendered via:
```php
return Inertia::render('Module/Action', [
    'data' => $data,
]);
```

### Models and Relationships

All models use Spatie Activity Log for audit trails. When creating or modifying models:
- Configure `getActivitylogOptions()` to specify logged attributes
- Use `logOnly()`, `logOnlyDirty()`, and `useLogName()`
- Define relationships explicitly with return types

### UI Components

The project uses shadcn/ui components located in `resources/js/components/ui/`. Common components:
- `Button`, `Input`, `Label`, `Textarea` - Form controls
- `Dialog`, `AlertDialog` - Modals
- `Table` - Data tables
- `Card` - Content containers
- `DropdownMenu`, `Select` - Dropdowns
- `Sidebar` - Navigation sidebar

Custom app-specific components are in `resources/js/components/`.

### Layout System

Two layout variants available via `AppShell` component:
- `header` - Header-based layout (simpler pages)
- `sidebar` - Sidebar navigation layout (main app)

### Role-Based Access Control

Uses Spatie Laravel Permission. Common roles:
- `Estudiante` (Student)
- Other roles defined in seeders

Query users by role: `User::role('Estudiante')`

## Running Migrations and Seeds

```bash
# Run migrations
php artisan migrate

# Run specific seeder
php artisan db:seed --class=RolePermissionSeeder

# Fresh migration with all seeds
php artisan migrate:fresh --seed
```

## Common Development Patterns

### Creating a CRUD Module

1. Create migration in `database/migrations/`
2. Create model in `app/Models/` with relationships and activity log
3. Create controller in `app/Http/Controllers/`
4. Add routes in `routes/web.php`
5. Create React pages in `resources/js/pages/{Module}/`
6. Build routes will auto-generate when Vite runs

### Form Validation

Use Laravel validation in controllers with Spanish error messages:
```php
$validated = $request->validate([
    'field' => ['required', 'exists:table,id'],
], [
    'field.required' => 'El campo es obligatorio',
    'field.exists' => 'El valor seleccionado no existe',
]);
```

### Working with Inertia Forms

Use Inertia's `useForm` hook for form handling with optimistic UI updates and error management.

## Important Notes

- All user-facing text should be in Spanish
- Enrollment has a unique constraint preventing duplicate active/waiting enrollments per student-program combination
- The `max_slots` field was removed from academic programs (no capacity limits)
- Activity log is configured globally via Spatie package
- TypeScript types for Inertia props should be defined in `resources/js/types/`
