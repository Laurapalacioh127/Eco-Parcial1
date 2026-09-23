import Boom from '@hapi/boom';
import { Request, Response } from 'express';

import {
  enrollStudentService,
  getCourseByIdService,
  getCoursesService,
  getEnrollmentsService,
  getStudentByIdService,
  getStudentEnrollmentsDetailsService,
  getStudentsService,
  updateEnrollmentStatusService,
} from './university.service';

export const getStudentsController = async (req: Request, res: Response) => {
  const students = await getStudentsService();
  res.status(200).json(students);
};

export const getStudentByIdController = async (req: Request, res: Response) => {
  const studentId = req.params.studentId;
  const student = await getStudentByIdService(String(studentId));
  res.status(200).json(student);
};

export const getCoursesController = async (req: Request, res: Response) => {
  const courses = await getCoursesService();
  res.status(200).json(courses);
};

export const getCourseByIdController = async (req: Request, res: Response) => {
  const courseId = req.params.courseId;
  const course = await getCourseByIdService(String(courseId));
  res.status(200).json(course);
};

export const getEnrollmentsController = async (req: Request, res: Response) => {
  const enrollments = await getEnrollmentsService();
  res.status(200).json(enrollments);
};

export const getStudentEnrollmentsDetailsController = async (req: Request, res: Response) => {
  const studentId = req.params.studentId;
  const enrollments = await getStudentEnrollmentsDetailsService(String(studentId));
  res.status(200).json(enrollments);
};

export const enrollStudentController = async (req: Request, res: Response) => {
  const courseId = req.params.courseId;
  const studentId = req.params.studentId;
  const enrollment = await enrollStudentService(String(courseId), String(studentId));
  res.status(201).json(enrollment);
};

export const updateEnrollmentStatusController = async (req: Request, res: Response) => {
  const courseId = req.params.courseId;
  const studentId = req.params.studentId;
  const isActive = req.body.isActive;

  if (isActive === undefined) {
    throw Boom.badRequest('isActive is required');
  }

  if (typeof isActive !== 'boolean') {
    throw Boom.badRequest('isActive must be a boolean');
  }

  const enrollment = await updateEnrollmentStatusService(String(courseId), String(studentId), isActive);
  res.status(200).json(enrollment);
};
