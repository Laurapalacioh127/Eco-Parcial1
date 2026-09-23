import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';

import { DB_PATH } from '../config/config';

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new PGlite(DB_PATH);

export const initDb = async () => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      banner_code TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS courses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      credits INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS student_enrollment (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_id UUID NOT NULL REFERENCES students(id),
      course_id UUID NOT NULL REFERENCES courses(id),
      is_active BOOLEAN NOT NULL DEFAULT true
    );
  `);

  await seedDb();
};

const seedDb = async () => {
  const { rows } = await db.query<{ count: number }>('SELECT COUNT(*)::int AS count FROM students');

  if (rows[0].count > 0) {
    return;
  }

  const studentNames = [
    'Ana Torres', 'Luis Ramirez', 'Maria Gomez', 'Carlos Diaz', 'Sofia Perez',
    'Jorge Martinez', 'Valentina Cruz', 'Diego Herrera', 'Camila Rojas', 'Andres Vargas',
  ];

  const studentIds: string[] = [];
  for (let i = 0; i < studentNames.length; i++) {
    const bannerCode = `A${String(54000 + i).padStart(8, '0')}`;
    const { rows } = await db.query<{ id: string }>(
      'INSERT INTO students (name, banner_code) VALUES ($1, $2) RETURNING id',
      [studentNames[i], bannerCode],
    );
    studentIds.push(rows[0].id);
  }

  const courses = [
    { name: 'Mathematics I', credits: 4 },
    { name: 'Data Structures', credits: 4 },
    { name: 'Databases', credits: 3 },
    { name: 'Software Engineering', credits: 3 },
    { name: 'Computer Networks', credits: 2 },
  ];

  const courseIds: string[] = [];
  for (const course of courses) {
    const { rows } = await db.query<{ id: string }>(
      'INSERT INTO courses (name, credits) VALUES ($1, $2) RETURNING id',
      [course.name, course.credits],
    );
    courseIds.push(rows[0].id);
  }

  for (let i = 0; i < 5; i++) {
    const studentId = studentIds[i % studentIds.length];
    const courseId = courseIds[i % courseIds.length];
    const isActive = i % 3 !== 0;

    await db.query(
      'INSERT INTO student_enrollment (student_id, course_id, is_active) VALUES ($1, $2, $3)',
      [studentId, courseId, isActive],
    );
  }
};
