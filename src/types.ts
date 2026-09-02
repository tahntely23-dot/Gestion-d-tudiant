export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'suspended';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type GradeType = 'Exam' | 'Quiz' | 'Devoir' | 'Projet' | 'Contrôle Continu';
export type TermPeriod = 'Trimestre 1' | 'Trimestre 2' | 'Trimestre 3' | 'Semestre 1' | 'Semestre 2';

export type UserRole = 'user' | 'admin' | 'direction' | 'teacher' | 'student' | 'staff';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role: string;
  created_at: string;
  provider?: 'google' | 'facebook' | 'email';
  updated_at?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  avatar: string;
  title?: string;
  department?: string;
  provider?: 'google' | 'facebook' | 'email';
}

export interface Student {
  id: string;
  name: string;
  email: string;
  classId: string;
  className: string;
  avatar: string;
  rollNumber: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'Autre';
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  status: StudentStatus;
  admissionDate: string;
  attendanceRate: number;
  averageGrade: number;
  notes?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  coefficient: number;
  icon: string;
  color: string;
  teacherId: string;
  teacherName: string;
  classIds: string[];
  description?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  level: string;
  academicYear: string;
  room: string;
  mainTeacherId: string;
  mainTeacherName: string;
  capacity: number;
  studentCount: number;
  color: string;
}

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  type: GradeType;
  score: number;
  maxScore: number;
  date: string;
  term: TermPeriod;
  comment?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  arrivalTime?: string;
  note?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  subjects: string[];
  classes: string[];
  avatar: string;
  status: 'active' | 'on_leave';
  experienceYears: number;
}

export interface ScheduleItem {
  id: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherName: string;
  room: string;
  dayOfWeek: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi';
  startTime: string;
  endTime: string;
  color: string;
}

export interface SchoolNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'alert' | 'success' | 'warning';
  read: boolean;
}

export type ViewTab = 
  | 'dashboard'
  | 'students'
  | 'classes'
  | 'subjects'
  | 'grades'
  | 'attendance'
  | 'teachers'
  | 'schedule'
  | 'report_cards'
  | 'settings';
