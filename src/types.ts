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
  role: UserRole;
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
  matricule: string;
  first_name: string;
  last_name: string;
  birth_date?: string | null;
  birth_place?: string | null;
  gender: 'M' | 'F' | 'Autre';
  email: string;
  phone?: string | null;
  address: string;
  photo_url?: string | null;
  class_name: string;
  // Supabase columns (real column names)
  class_id?: string | null;
  parent_name?: string | null;
  parent_phone?: string | null;
  parent_email?: string | null;
  academic_year?: string | null;
  enrollment_date?: string | null;
  status: StudentStatus;
  created_at?: string;
  updated_at?: string;

  // Compatibility aliases for existing UI components
  name: string;
  className: string;
  avatar: string;
  rollNumber: string;
  dateOfBirth: string;
  classId?: string | null;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  admissionDate?: string;
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
