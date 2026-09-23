# Midterm 1 — Feature University

## Descripción

Esta feature expone un pequeño sistema universitario con tres entidades: `students`, `courses` y `student_enrollment` (la relación de inscripción entre un estudiante y un curso). La capa de base de datos ya está lista (esquema + datos semilla), al igual que las capas de `router` y `controller`. Falta completar:

- **Cuatro funciones de la capa de `repository`** (`src/features/university/university.repository.ts`), marcadas con `// @TODO: Complete your code here`: `getStudentByIdRepository`, `getCourseByIdRepository`, `getStudentEnrollmentsDetailsRepository` y `getEnrollmentRepository`.
- **Una regla de negocio en la capa de `service`** (`src/features/university/university.service.ts`): dentro de `updateEnrollmentStatusService`, marcada también con `// @TODO: Complete your code here`.

El resto del repositorio y de los services ya están resueltos.

## Diagrama de la base de datos

```mermaid
erDiagram
    STUDENTS ||--o{ STUDENT_ENROLLMENT : "se inscribe en"
    COURSES  ||--o{ STUDENT_ENROLLMENT : "tiene inscritos"

    STUDENTS {
        uuid id PK
        text name
        text banner_code
    }

    COURSES {
        uuid id PK
        text name
        integer credits
    }

    STUDENT_ENROLLMENT {
        uuid id PK
        uuid student_id FK
        uuid course_id FK
        boolean is_active
    }
```

## Endpoints disponibles

Nota: las rutas de esta feature están montadas directamente en `/api` (no en `/api/university`).

- `GET /api/students` — lista todos los estudiantes (ya implementado, lo vas a necesitar para probar el resto).
- `GET /api/students/:studentId` (`getStudentByIdController`) — usa `getStudentByIdRepository` (Punto 1). Te sirve para verificar por HTTP si tu implementación quedó bien: si el `id` existe responde **200** con el estudiante, si no existe responde **404**.
- `GET /api/courses` — lista todos los cursos (ya implementado, lo vas a necesitar para probar el resto).
- `GET /api/courses/:courseId` (`getCourseByIdController`) — usa `getCourseByIdRepository` (Punto 1), mismo propósito de verificación que el anterior.
- `GET /api/enrollments` — lista todas las inscripciones con la interfaz simple `Enrollment` (ya implementado).
- `GET /api/students/:studentId/enrollments` (`getStudentEnrollmentsDetailsController`) — lista las inscripciones de un estudiante con el detalle (`EnrollmentDetails`).
- `POST /api/courses/:courseId/students/:studentId` (`enrollStudentController`) — inscribe al estudiante en el curso; responde **409 Conflict** con `"User is already enrolled into that course"` si ya existe una inscripción para ese estudiante y curso.
- `PATCH /api/courses/:courseId/students/:studentId` (`updateEnrollmentStatusController`) — actualiza el estado de la inscripción según el `isActive` recibido en el body (`{ "isActive": false }`); el controller valida que `isActive` venga en el body y sea un booleano, respondiendo **400 Bad Request** si falta o si no es un booleano.

Cada controller delega en su propio service: `enrollStudentController` llama a `enrollStudentService`, y `updateEnrollmentStatusController` llama a `updateEnrollmentStatusService` pasándole el `isActive` recibido en el body.

## Objetivos del examen

### 1. Implementar las funciones de búsqueda por id

Completa `getStudentByIdRepository` y `getCourseByIdRepository` en `university.repository.ts`. Ambas son consultas simples por `id`, y son las que usan los `service` para validar que el estudiante/curso exista antes de inscribir, consultar o dar de baja.

### 2. Devolver el detalle completo de las inscripciones de un estudiante

En `GET /api/students/:studentId/enrollments`, la respuesta debe incluir el detalle de cada inscripción (no solo los ids), usando la interfaz `EnrollmentDetails` de `university.types.ts`: nombre del estudiante, nombre y créditos del curso, y si la inscripción está activa. Implementa `getStudentEnrollmentsDetailsRepository` haciendo un `JOIN` entre `student_enrollment`, `students` y `courses`.

### 3. Implementar `getEnrollmentRepository` y validar el estado de la inscripción

Completa `getEnrollmentRepository`, que busca la inscripción (activa o no) de un estudiante en un curso. Cada vez que uno usuario desee actualizar el status de un enrollement, usted deberá implementar las siguientes reglas de negocio:

- Si se pide `isActive: true` y la inscripción ya está activa, responde **409 Conflict** con `"The user is already enrolled in that course"`.
- Si se pide `isActive: false` y la inscripción ya está inactiva, responde **409 Conflict** con `"The user is not enrolled in that course"`.

Recuerda mapear las columnas `snake_case` de la base de datos (`banner_code`, `student_id`, `course_id`, `is_active`) a los campos `camelCase` que definen las interfaces en `university.types.ts` (`bannerCode`, `studentId`, `courseId`, `isActive`), usando alias SQL (`AS "campoEnCamelCase"`).

## Cómo probar tu implementación

```bash
npm run dev
```

El servidor corre en `http://localhost:3000` y crea automáticamente la base de datos local (PGlite) en `./data/db`, con datos semilla: 5 cursos, 10 estudiantes y 5 inscripciones.

También hay una suite de pruebas automatizadas que verifica los 3 puntos del examen:

```bash
npm test
```

Las pruebas están en `src/features/university/university.test.ts`, organizadas en 3 `describe` (uno por punto), y usan una base de datos PGlite aparte (creada en un directorio temporal del sistema) para no tocar `./data`. Mientras los `// @TODO` sigan sin completarse, vas a ver tests en rojo — eso es lo esperado; a medida que implementes cada punto, esos tests deberían pasar. Ten en cuenta que las pruebas del Punto 3 dependen de que el Punto 1 (`getStudentByIdRepository` y `getCourseByIdRepository`) ya esté implementado, porque `updateEnrollmentStatusService` los usa antes de llegar a la validación de conflicto.
