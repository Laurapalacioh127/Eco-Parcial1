export interface Student {
  id: string;
  name: string;
  bannerCode: string;
}

export interface Course {
  id: string;
  name: string;
  credits: number;
}

export interface EnrollmentDetails {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  credits: string;
  isActive: boolean;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  isActive: boolean;
}

