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
  DEMO_USERS,
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
  getLocalProfiles,
  resetPasswordForEmail,
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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  loginWithOAuth: (provider: 'google' | 'facebook') => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  quickLogin: (userId: string) => void;
  logout: () => void;
  expireSession: () => void;
  userProfiles: UserProfile[];

  // Data
  students: Student[];
  classes: ClassRoom[];
  subjects: Subject[];
  grades: Grade[];
  attendance: AttendanceRecord[];
  teachers: Teacher[];
  schedule: ScheduleItem[];
  notifications: SchoolNotification[];
  
  // Actions
  addStudent: (student: Omit<Student, 'id' | 'averageGrade' | 'attendanceRate'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  
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
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>(() => getLocalProfiles());

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem('eduglass_auth_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return DEMO_USERS[0];
      }
    }
    return null; // Start at login page if not logged in
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('eduglass_is_authenticated') === 'true';
  });

  // Supabase Auth state change listener (Handles OAuth redirects & token refreshes)
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await syncOrCreateProfile({
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata,
          provider: (session.user.app_metadata?.provider as any) || 'email',
        });
        const authUser = profileToAuthUser(profile);
        setCurrentUser(authUser);
        setIsAuthenticated(true);
        localStorage.setItem('eduglass_auth_user', JSON.stringify(authUser));
        localStorage.setItem('eduglass_is_authenticated', 'true');
        setUserProfiles(getLocalProfiles());
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('eduglass_auth_user');
        localStorage.setItem('eduglass_is_authenticated', 'false');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Login with Email/Password
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
    // Artificial slight network delay for realism
    await new Promise((res) => setTimeout(res, 350));

    // 1. Check Demo Accounts first for instant demonstration
    const matched = DEMO_USERS.find(
      (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (matched) {
      if (matched.password === password || password === 'admin' || password === 'demo' || password === '123456' || password === 'password123') {
        const userObj: AuthUser = {
          id: matched.id,
          name: matched.name,
          email: matched.email,
          role: matched.role,
          roleLabel: matched.roleLabel,
          title: matched.title,
          department: matched.department,
          avatar: matched.avatar,
          provider: 'email',
        };
        // Also register in profiles store
        await syncOrCreateProfile({
          id: matched.id,
          email: matched.email,
          user_metadata: { full_name: matched.name, avatar_url: matched.avatar },
          provider: 'email',
        });
        setCurrentUser(userObj);
        setIsAuthenticated(true);
        localStorage.setItem('eduglass_auth_user', JSON.stringify(userObj));
        localStorage.setItem('eduglass_is_authenticated', 'true');
        setUserProfiles(getLocalProfiles());
        return { success: true, user: userObj };
      } else {
        return { success: false, error: 'Mot de passe incorrect. (Indice: password123)' };
      }
    }

    // 2. Real Supabase or local auth
    const result = await signInWithEmailPassword(email, password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      localStorage.setItem('eduglass_auth_user', JSON.stringify(result.user));
      localStorage.setItem('eduglass_is_authenticated', 'true');
      setUserProfiles(getLocalProfiles());
      return { success: true, user: result.user };
    }

    return { success: false, error: result.error || 'Identifiant non reconnu. Veuillez vérifier vos accès.' };
  };

  // Sign Up with Email/Password
  const signup = async (email: string, password: string, fullName: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
    await new Promise((res) => setTimeout(res, 400));
    const result = await signUpWithEmailPassword(email, password, fullName);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      localStorage.setItem('eduglass_auth_user', JSON.stringify(result.user));
      localStorage.setItem('eduglass_is_authenticated', 'true');
      setUserProfiles(getLocalProfiles());
      return { success: true, user: result.user };
    }
    return { success: false, error: result.error || 'Erreur lors de la création du compte.' };
  };

  // OAuth Login (Google / Facebook)
  const loginWithOAuth = async (provider: 'google' | 'facebook'): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
    const result = await signInWithOAuthProvider(provider);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      localStorage.setItem('eduglass_auth_user', JSON.stringify(result.user));
      localStorage.setItem('eduglass_is_authenticated', 'true');
      setUserProfiles(getLocalProfiles());
      return { success: true, user: result.user };
    }
    return result;
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    return await resetPasswordForEmail(email);
  };

  const quickLogin = (userId: string) => {
    const matched = DEMO_USERS.find((u) => u.id === userId) || DEMO_USERS[0];
    const userObj: AuthUser = {
      id: matched.id,
      name: matched.name,
      email: matched.email,
      role: matched.role,
      roleLabel: matched.roleLabel,
      title: matched.title,
      department: matched.department,
      avatar: matched.avatar,
      provider: 'email',
    };
    setCurrentUser(userObj);
    setIsAuthenticated(true);
    localStorage.setItem('eduglass_auth_user', JSON.stringify(userObj));
    localStorage.setItem('eduglass_is_authenticated', 'true');
    setUserProfiles(getLocalProfiles());
  };

  const logout = async () => {
    await signOutSupabase();
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('eduglass_auth_user');
    localStorage.setItem('eduglass_is_authenticated', 'false');
  };

  // Session expiration simulation (For test case 7)
  const expireSession = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('eduglass_auth_user');
    localStorage.setItem('eduglass_is_authenticated', 'false');
  };

  // Initialize from LocalStorage or Defaults
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('eduglass_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

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

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('eduglass_students', JSON.stringify(students));
  }, [students]);

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
    if (studentGrades.length === 0) return 15.0; // default initial
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

  const addStudent = (newStdData: Omit<Student, 'id' | 'averageGrade' | 'attendanceRate'>) => {
    const id = `std-${Date.now()}`;
    const targetClass = classes.find((c) => c.id === newStdData.classId);
    const newStudent: Student = {
      ...newStdData,
      id,
      className: targetClass ? targetClass.name : 'Non assigné',
      averageGrade: 15.0,
      attendanceRate: 98,
    };
    setStudents((prev) => [newStudent, ...prev]);
    // update class student count
    if (newStdData.classId) {
      setClasses((prev) =>
        prev.map((c) => (c.id === newStdData.classId ? { ...c, studentCount: c.studentCount + 1 } : c))
      );
    }
  };

  const updateStudent = (updatedStudent: Student) => {
    const targetClass = classes.find((c) => c.id === updatedStudent.classId);
    const updated: Student = {
      ...updatedStudent,
      className: targetClass ? targetClass.name : updatedStudent.className,
      averageGrade: calculateStudentAverage(updatedStudent.id),
    };
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteStudent = (id: string) => {
    const student = students.find((s) => s.id === id);
    if (student && student.classId) {
      setClasses((prev) =>
        prev.map((c) => (c.id === student.classId ? { ...c, studentCount: Math.max(0, c.studentCount - 1) } : c))
      );
    }
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setGrades((prev) => prev.filter((g) => g.studentId !== id));
    setAttendance((prev) => prev.filter((a) => a.studentId !== id));
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
        login,
        signup,
        loginWithOAuth,
        resetPassword,
        quickLogin,
        logout,
        expireSession,
        userProfiles,
        students,
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
