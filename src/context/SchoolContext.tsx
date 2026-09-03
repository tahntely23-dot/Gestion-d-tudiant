import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, ClassRoom, Subject, Grade, AttendanceRecord, Teacher, ScheduleItem, SchoolNotification, ViewTab, AuthUser, UserProfile } from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_GRADES,
  INITIAL_ATTENDANCE,
  INITIAL_TEACHERS,
  INITIAL_SCHEDULE,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';
import {
  supabase,
  isSupabaseConfigured,
  signInWithOAuthProvider,
  signInWithEmailPassword,
  signUpWithEmailPassword,
  signOutSupabase,
  syncOrCreateProfile,
  profileToAuthUser,
  resetPasswordForEmail,
  fetchStudentsFromSupabase,
  createStudentInSupabase,
  updateStudentInSupabase,
  deleteStudentInSupabase,
} from '../lib/supabase';

interface SchoolContextType {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Auth
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean; user?: AuthUser }>;
  loginWithOAuth: (provider: 'google' | 'facebook') => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  userProfiles: UserProfile[];

  // Data
  students: Student[];
  studentsLoading: boolean;
  studentsError: string | null;
  refreshStudents: () => Promise<void>;
  classes: ClassRoom[];
  subjects: Subject[];
  grades: Grade[];
  attendance: AttendanceRecord[];
  teachers: Teacher[];
  schedule: ScheduleItem[];
  notifications: SchoolNotification[];
  
  // Actions
  addStudent: (student: Partial<Student>) => Promise<{ success: boolean; data?: Student; error?: string }>;
  updateStudent: (student: Student) => Promise<{ success: boolean; data?: Student; error?: string }>;
  deleteStudent: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  addClass: (cls: Omit<ClassRoom, 'id' | 'studentCount'>) => void;
  updateClass: (cls: ClassRoom) => void;
  deleteClass: (id: string) => void;

  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;

  addGrade: (grade: Omit<Grade, 'id'>) => void;
  deleteGrade: (id: string) => void;

  recordAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  bulkRecordAttendance: (classId: string, date: string, statusList: { studentId: string; status: AttendanceRecord['status']; note?: string }[]) => void;

  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (teacher: Teacher) => void;
  deleteTeacher: (id: string) => void;

  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  deleteScheduleItem: (id: string) => void;

  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  resetToDefaults: () => void;

  // Selected student for detail/report card modal
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);

  // Authentication State - Pure Supabase
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Initialize session and subscribe to Supabase Auth state changes
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        console.log('[Auth Init] Vérification de la session active avec Supabase getSession()...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('[Auth Init] Erreur getSession:', error.message);
        }

        if (session?.user && isMounted) {
          console.log('[Auth Init] Session existante trouvée pour user:', session.user.id);
          const profile = await syncOrCreateProfile(session.user);
          const authUser = profileToAuthUser(profile);
          setCurrentUser(authUser);
          setIsAuthenticated(true);
        } else if (isMounted) {
          console.log('[Auth Init] Aucune session active. Utilisateur non connecté.');
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('[Auth Init] Exception lors de la vérification de session:', err);
        if (isMounted) {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    initAuth();

    // Supabase Auth State Change Listener (OAuth, Login, Logout, Token Refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Supabase onAuthStateChange] Événement: ${event}, Session présente:`, Boolean(session));
      
      if (session?.user && isMounted) {
        const profile = await syncOrCreateProfile(session.user);
        const authUser = profileToAuthUser(profile);
        setCurrentUser(authUser);
        setIsAuthenticated(true);
      } else if ((event === 'SIGNED_OUT' || !session) && isMounted) {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Login with Email/Password using pure Supabase Auth
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
    const result = await signInWithEmailPassword(email, password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      return { success: true, user: result.user };
    }
    return { success: false, error: result.error || 'Identifiants incorrects.' };
  };

  // Sign Up with Email/Password using pure Supabase Auth
  const signup = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ success: boolean; error?: string; needsConfirmation?: boolean; user?: AuthUser }> => {
    const result = await signUpWithEmailPassword(email, password, fullName);
    if (result.success) {
      if (result.user && !result.needsConfirmation) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
      }
      return result;
    }
    return { success: false, error: result.error || "Erreur lors de la création du compte." };
  };

  // OAuth Login (Google / Facebook)
  const loginWithOAuth = async (provider: 'google' | 'facebook'): Promise<{ success: boolean; error?: string }> => {
    return await signInWithOAuthProvider(provider);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    return await resetPasswordForEmail(email);
  };

  const logout = async () => {
    await signOutSupabase();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setStudents([]);
  };

  // 1. Pure Supabase Students State
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState<boolean>(true);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  const loadStudentsFromSupabase = async () => {
    setStudentsLoading(true);
    setStudentsError(null);
    try {
      console.log('[SchoolContext] Chargement des élèves depuis Supabase public.students...');
      const res = await fetchStudentsFromSupabase();
      if (res.success) {
        console.log(`[SchoolContext] ${res.data.length} élève(s) chargé(s) depuis Supabase.`);
        setStudents(res.data);
      } else {
        console.warn('[SchoolContext] Échec chargement élèves Supabase:', res.error);
        setStudentsError(res.error || 'Erreur lors du chargement des élèves.');
      }
    } catch (err: any) {
      console.error('[SchoolContext] Exception chargement élèves:', err);
      setStudentsError(err?.message || 'Erreur lors du chargement des élèves.');
    } finally {
      setStudentsLoading(false);
    }
  };

  // Load students on mount and on authentication
  useEffect(() => {
    loadStudentsFromSupabase();
  }, [isAuthenticated]);

  const refreshStudents = async () => {
    await loadStudentsFromSupabase();
  };

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const saved = localStorage.getItem('eduglass_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('eduglass_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [grades, setGrades] = useState<Grade[]>(() => {
    const saved = localStorage.getItem('eduglass_grades');
    return saved ? JSON.parse(saved) : INITIAL_GRADES;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('eduglass_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('eduglass_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('eduglass_schedule');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
  });

  const [notifications, setNotifications] = useState<SchoolNotification[]>(() => {
    const saved = localStorage.getItem('eduglass_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Save other collections to LocalStorage
  useEffect(() => {
    localStorage.setItem('eduglass_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('eduglass_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('eduglass_grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('eduglass_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('eduglass_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('eduglass_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('eduglass_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Recalculate student averages and attendance rates dynamically
  const calculateStudentAverage = (studentId: string): number => {
    const studentGrades = grades.filter((g) => g.studentId === studentId);
    if (studentGrades.length === 0) return 15.0;
    let totalScore = 0;
    let totalCoeff = 0;
    studentGrades.forEach((g) => {
      const subject = subjects.find((s) => s.id === g.subjectId);
      const coeff = subject ? subject.coefficient : 1;
      const normalizedScore = (g.score / g.maxScore) * 20;
      totalScore += normalizedScore * coeff;
      totalCoeff += coeff;
    });
    return totalCoeff > 0 ? parseFloat((totalScore / totalCoeff).toFixed(1)) : 15.0;
  };

  // Add student directly to Supabase PostgreSQL
  const addStudent = async (
    newStdData: Partial<Student>
  ): Promise<{ success: boolean; data?: Student; error?: string }> => {
    const result = await createStudentInSupabase(newStdData);
    if (result.success && result.data) {
      setStudents((prev) => [result.data!, ...prev.filter((s) => s.id !== result.data!.id)]);
      // update class student count
      const targetClassId = result.data.classId || result.data.class_name;
      if (targetClassId) {
        setClasses((prev) =>
          prev.map((c) => (c.id === targetClassId || c.name === result.data?.class_name ? { ...c, studentCount: c.studentCount + 1 } : c))
        );
      }
    }
    return result;
  };

  // Update student in Supabase PostgreSQL
  const updateStudent = async (
    updatedStudent: Student
  ): Promise<{ success: boolean; data?: Student; error?: string }> => {
    const result = await updateStudentInSupabase(updatedStudent.id, updatedStudent);
    if (result.success && result.data) {
      setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? result.data! : s)));
    }
    return result;
  };

  // Delete student in Supabase PostgreSQL
  const deleteStudent = async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    const studentToDelete = students.find((s) => s.id === id);
    const result = await deleteStudentInSupabase(id);
    if (result.success) {
      if (studentToDelete) {
        setClasses((prev) =>
          prev.map((c) => (c.name === studentToDelete.class_name || c.id === studentToDelete.classId ? { ...c, studentCount: Math.max(0, c.studentCount - 1) } : c))
        );
      }
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setGrades((prev) => prev.filter((g) => g.studentId !== id));
      setAttendance((prev) => prev.filter((a) => a.studentId !== id));
    }
    return result;
  };

  const addClass = (clsData: Omit<ClassRoom, 'id' | 'studentCount'>) => {
    const id = `cls-${Date.now()}`;
    const newClass: ClassRoom = {
      ...clsData,
      id,
      studentCount: 0,
    };
    setClasses((prev) => [...prev, newClass]);
  };

  const updateClass = (cls: ClassRoom) => {
    setClasses((prev) => prev.map((c) => (c.id === cls.id ? cls : c)));
    // Sync student class names
    setStudents((prev) =>
      prev.map((s) => (s.classId === cls.id ? { ...s, className: cls.name } : s))
    );
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  const addSubject = (subjData: Omit<Subject, 'id'>) => {
    const id = `sbj-${Date.now()}`;
    const newSubj: Subject = { ...subjData, id };
    setSubjects((prev) => [...prev, newSubj]);
  };

  const updateSubject = (subject: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === subject.id ? subject : s)));
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const addGrade = (gradeData: Omit<Grade, 'id'>) => {
    const id = `grd-${Date.now()}`;
    const newGrade: Grade = { ...gradeData, id };
    setGrades((prev) => [newGrade, ...prev]);

    // Recalculate student average
    setTimeout(() => {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === gradeData.studentId) {
            return {
              ...s,
              averageGrade: calculateStudentAverage(s.id),
            };
          }
          return s;
        })
      );
    }, 50);
  };

  const deleteGrade = (id: string) => {
    const grade = grades.find((g) => g.id === id);
    setGrades((prev) => prev.filter((g) => g.id !== id));
    if (grade) {
      setTimeout(() => {
        setStudents((prev) =>
          prev.map((s) => (s.id === grade.studentId ? { ...s, averageGrade: calculateStudentAverage(s.id) } : s))
        );
      }, 50);
    }
  };

  const recordAttendance = (recData: Omit<AttendanceRecord, 'id'>) => {
    const id = `att-${Date.now()}`;
    const newRecord: AttendanceRecord = { ...recData, id };
    // replace if existing for same student and date
    setAttendance((prev) => {
      const filtered = prev.filter(
        (a) => !(a.studentId === recData.studentId && a.date === recData.date)
      );
      return [newRecord, ...filtered];
    });
  };

  const bulkRecordAttendance = (
    classId: string,
    date: string,
    statusList: { studentId: string; status: AttendanceRecord['status']; note?: string }[]
  ) => {
    const newRecords: AttendanceRecord[] = statusList.map((item) => {
      const student = students.find((s) => s.id === item.studentId);
      return {
        id: `att-${Date.now()}-${item.studentId}`,
        studentId: item.studentId,
        studentName: student ? student.name : 'Élève',
        studentAvatar: student?.avatar,
        classId,
        date,
        status: item.status,
        note: item.note,
        arrivalTime: item.status === 'present' ? '08:00' : item.status === 'late' ? '08:15' : undefined,
      };
    });

    const studentIds = statusList.map((s) => s.studentId);
    setAttendance((prev) => {
      const filtered = prev.filter((a) => !(studentIds.includes(a.studentId) && a.date === date));
      return [...newRecords, ...filtered];
    });
  };

  const addTeacher = (teacherData: Omit<Teacher, 'id'>) => {
    const id = `tch-${Date.now()}`;
    const newTeacher: Teacher = { ...teacherData, id };
    setTeachers((prev) => [...prev, newTeacher]);
  };

  const updateTeacher = (teacher: Teacher) => {
    setTeachers((prev) => prev.map((t) => (t.id === teacher.id ? teacher : t)));
  };

  const deleteTeacher = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  };

  const addScheduleItem = (itemData: Omit<ScheduleItem, 'id'>) => {
    const id = `sch-${Date.now()}`;
    const newItem: ScheduleItem = { ...itemData, id };
    setSchedule((prev) => [...prev, newItem]);
  };

  const deleteScheduleItem = (id: string) => {
    setSchedule((prev) => prev.filter((s) => s.id !== id));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setStudents(INITIAL_STUDENTS);
    setClasses(INITIAL_CLASSES);
    setSubjects(INITIAL_SUBJECTS);
    setGrades(INITIAL_GRADES);
    setAttendance(INITIAL_ATTENDANCE);
    setTeachers(INITIAL_TEACHERS);
    setSchedule(INITIAL_SCHEDULE);
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  return (
    <SchoolContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedClassId,
        setSelectedClassId,
        searchQuery,
        setSearchQuery,
        currentUser,
        isAuthenticated,
        authLoading,
        login,
        signup,
        loginWithOAuth,
        resetPassword,
        logout,
        userProfiles,
        students,
        studentsLoading,
        studentsError,
        refreshStudents,
        classes,
        subjects,
        grades,
        attendance,
        teachers,
        schedule,
        notifications,
        addStudent,
        updateStudent,
        deleteStudent,
        addClass,
        updateClass,
        deleteClass,
        addSubject,
        updateSubject,
        deleteSubject,
        addGrade,
        deleteGrade,
        recordAttendance,
        bulkRecordAttendance,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addScheduleItem,
        deleteScheduleItem,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetToDefaults,
        selectedStudentId,
        setSelectedStudentId,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
