import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';

// Usa un directorio temporal como base de datos de prueba para no tocar ./data,
// que es la carpeta que usa la app real.
const testDbPath = fs.mkdtempSync(path.join(os.tmpdir(), 'university-test-'));

// Los módulos que dependen de src/db/db.ts se importan dinámicamente dentro de
// before(), porque ese archivo crea la instancia de PGlite al ser importado y
// necesitamos fijar process.env.DB_PATH antes de que eso ocurra.
let dbModule: typeof import('../../db/db.js');
let repository: typeof import('./university.repository.js');
let service: typeof import('./university.service.js');

const createStudent = async (name: string, bannerCode: string): Promise<string> => {
  const { rows } = await dbModule.db.query<{ id: string }>(
    'INSERT INTO students (name, banner_code) VALUES ($1, $2) RETURNING id',
    [name, bannerCode],
  );

  return rows[0].id;
};

const createCourse = async (name: string, credits: number): Promise<string> => {
  const { rows } = await dbModule.db.query<{ id: string }>(
    'INSERT INTO courses (name, credits) VALUES ($1, $2) RETURNING id',
    [name, credits],
  );

  return rows[0].id;
};

const createEnrollment = async (studentId: string, courseId: string, isActive: boolean): Promise<void> => {
  await dbModule.db.query(
    'INSERT INTO student_enrollment (student_id, course_id, is_active) VALUES ($1, $2, $3)',
    [studentId, courseId, isActive],
  );
};

before(async () => {
  process.env.DB_PATH = testDbPath;

  dbModule = await import('../../db/db.js');
  repository = await import('./university.repository.js');
  service = await import('./university.service.js');

  await dbModule.initDb();
});

after(async () => {
  await dbModule.db.close();
  fs.rmSync(testDbPath, { recursive: true, force: true });
});

describe('Punto 1: getStudentByIdRepository y getCourseByIdRepository', () => {
  it('getStudentByIdRepository retorna el estudiante cuando existe', async () => {
    const studentId = await createStudent('Test Student 1', 'A00099001');

    const student = await repository.getStudentByIdRepository(studentId);

    assert.ok(student);
    assert.equal(student.id, studentId);
    assert.equal(student.name, 'Test Student 1');
    assert.equal(student.bannerCode, 'A00099001');
  });

  it('getCourseByIdRepository retorna el curso cuando existe', async () => {
    const courseId = await createCourse('Test Course 1', 3);

    const course = await repository.getCourseByIdRepository(courseId);

    assert.ok(course);
    assert.equal(course.id, courseId);
    assert.equal(course.name, 'Test Course 1');
    assert.equal(Number(course.credits), 3);
  });
});

describe('Punto 2: getStudentEnrollmentsDetailsRepository', () => {
  it('retorna el detalle (nombre de estudiante, curso y créditos) de cada inscripción', async () => {
    const studentId = await createStudent('Test Student 2', 'A00099002');
    const courseId = await createCourse('Test Course 2', 4);
    await createEnrollment(studentId, courseId, true);

    const enrollments = await repository.getStudentEnrollmentsDetailsRepository(studentId);

    assert.equal(enrollments.length, 1);
    assert.equal(enrollments[0].studentId, studentId);
    assert.equal(enrollments[0].studentName, 'Test Student 2');
    assert.equal(enrollments[0].courseId, courseId);
    assert.equal(enrollments[0].courseName, 'Test Course 2');
    assert.equal(Number(enrollments[0].credits), 4);
    assert.equal(enrollments[0].isActive, true);
  });
});

describe('Punto 3: conflicto 409 en updateEnrollmentStatusService', () => {
  // Estas pruebas requieren que getStudentByIdRepository y getCourseByIdRepository
  // (Punto 1) ya estén implementadas, porque updateEnrollmentStatusService las
  // usa para validar que el estudiante y el curso existan antes de revisar el conflicto.

  it('lanza 409 si isActive=true y la inscripción ya está activa', async () => {
    const studentId = await createStudent('Test Student 4', 'A00099004');
    const courseId = await createCourse('Test Course 4', 2);
    await createEnrollment(studentId, courseId, true);

    await assert.rejects(
      () => service.updateEnrollmentStatusService(courseId, studentId, true),
      (error: { output: { statusCode: number }; message: string }) => {
        assert.equal(error.output.statusCode, 409);
        assert.equal(error.message, 'The user is already enrolled in that course');
        return true;
      },
    );
  });

  it('lanza 409 si isActive=false y la inscripción ya está inactiva', async () => {
    const studentId = await createStudent('Test Student 5', 'A00099005');
    const courseId = await createCourse('Test Course 5', 2);
    await createEnrollment(studentId, courseId, false);

    await assert.rejects(
      () => service.updateEnrollmentStatusService(courseId, studentId, false),
      (error: { output: { statusCode: number }; message: string }) => {
        assert.equal(error.output.statusCode, 409);
        assert.equal(error.message, 'The user is not enrolled in that course');
        return true;
      },
    );
  });

  it('permite desactivar una inscripción activa sin lanzar conflicto', async () => {
    const studentId = await createStudent('Test Student 6', 'A00099006');
    const courseId = await createCourse('Test Course 6', 2);
    await createEnrollment(studentId, courseId, true);

    const updated = await service.updateEnrollmentStatusService(courseId, studentId, false);

    assert.equal(updated.isActive, false);
  });
});
