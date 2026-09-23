import Boom from '@hapi/boom';

import {
  enrollStudentRepository,
  getCourseByIdRepository,
  getCoursesRepository,
  getEnrollmentRepository,
  getEnrollmentsRepository,
  getStudentByIdRepository,
  getStudentEnrollmentsDetailsRepository,
  getStudentsRepository,
  setStudentEnrollementStatusRepository,
} from './university.repository';
import { Course, Enrollment, EnrollmentDetails, Student } from './university.types';

export const getStudentsService = async (): Promise<Student[]> => {
  return getStudentsRepository();
};

export const getCoursesService = async (): Promise<Course[]> => {
  return getCoursesRepository();
};

export const getStudentByIdService = async (studentId: string): Promise<Student> => {
  const student = await getStudentByIdRepository(studentId);

  if (!student) {
    throw Boom.notFound('Student not found');
  }

  return student;
};

export const getCourseByIdService = async (courseId: string): Promise<Course> => {
  const course = await getCourseByIdRepository(courseId);

  if (!course) {
    throw Boom.notFound('Course not found');
  }

  return course;
};

export const getEnrollmentsService = async (): Promise<Enrollment[]> => {
  return getEnrollmentsRepository();
};

export const getStudentEnrollmentsDetailsService = async (studentId: string): Promise<EnrollmentDetails[]> => {
  const student = await getStudentByIdRepository(studentId);

  if (!student) {
    throw Boom.notFound('Student not found');
  }

  return getStudentEnrollmentsDetailsRepository(studentId);
};

export const enrollStudentService = async (courseId: string, studentId: string): Promise<Enrollment> => {
  const course = await getCourseByIdRepository(courseId);

  if (!course) {
    throw Boom.notFound('Course not found');
  }

  const student = await getStudentByIdRepository(studentId);

  if (!student) {
    throw Boom.notFound('Student not found');
  }

  const enrollmentExists = await getEnrollmentRepository(studentId, courseId);

  if (enrollmentExists) {
    throw Boom.conflict('User is already enrolled into that course');
  }

  return enrollStudentRepository(courseId, studentId, true);
};

export const updateEnrollmentStatusService = async (
  courseId: string,
  studentId: string,
  isActive: boolean,
): Promise<Enrollment> => {
  const course = await getCourseByIdRepository(courseId);

  if (!course) {
    throw Boom.notFound('Course not found');
  }

  const student = await getStudentByIdRepository(studentId);

  if (!student) {
    throw Boom.notFound('Student not found');
  }

  const enrollment = await getEnrollmentRepository(studentId, courseId);

  if (!enrollment) {
    throw Boom.notFound('Enrollment not found');
  }

  // @TODO: Complete your code here
  
  return setStudentEnrollementStatusRepository(courseId, studentId, isActive);
};
