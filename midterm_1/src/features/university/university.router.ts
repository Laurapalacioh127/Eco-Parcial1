import { Router } from 'express';

import {
  enrollStudentController,
  getCourseByIdController,
  getCoursesController,
  getEnrollmentsController,
  getStudentByIdController,
  getStudentEnrollmentsDetailsController,
  getStudentsController,
  updateEnrollmentStatusController,
} from './university.controller';

const router = Router();

router.get('/students', getStudentsController);
router.get('/students/:studentId/enrollments', getStudentEnrollmentsDetailsController);
router.get('/students/:studentId', getStudentByIdController);

router.get('/courses', getCoursesController);
router.get('/courses/:courseId', getCourseByIdController);
router.post('/courses/:courseId/students/:studentId', enrollStudentController);
router.patch('/courses/:courseId/students/:studentId', updateEnrollmentStatusController);

router.get('/enrollments', getEnrollmentsController);

export default router;
