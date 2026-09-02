import React, { useState } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

// Views
import { DashboardView } from './components/views/DashboardView';
import { StudentsView } from './components/views/StudentsView';
import { ClassesView } from './components/views/ClassesView';
import { SubjectsView } from './components/views/SubjectsView';
import { GradesView } from './components/views/GradesView';
import { AttendanceView } from './components/views/AttendanceView';
import { TeachersView } from './components/views/TeachersView';
import { ScheduleView } from './components/views/ScheduleView';
import { ReportCardsView } from './components/views/ReportCardsView';
import { SettingsView } from './components/views/SettingsView';
import { LoginView } from './components/views/LoginView';

// Modals
import { StudentModal } from './components/modals/StudentModal';
import { ClassModal } from './components/modals/ClassModal';
import { GradeModal } from './components/modals/GradeModal';
import { SubjectModal } from './components/modals/SubjectModal';
import { TeacherModal } from './components/modals/TeacherModal';
import { ScheduleModal } from './components/modals/ScheduleModal';

// Types
import { Student, ClassRoom, Subject, Teacher } from './types';
import { Menu } from 'lucide-react';

function MainAppContent() {
  const { activeTab, setActiveTab, isAuthenticated, currentUser } = useSchool();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals state (All hooks must be declared before any conditional return)
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState<ClassRoom | null>(null);

  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);

  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // If not authenticated, display login screen
  if (!isAuthenticated || !currentUser) {
    return <LoginView />;
  }

  // General Quick Add Modal selector or direct open
  const handleQuickAdd = () => {
    switch (activeTab) {
      case 'students':
        setStudentToEdit(null);
        setIsStudentModalOpen(true);
        break;
      case 'classes':
        setClassToEdit(null);
        setIsClassModalOpen(true);
        break;
      case 'subjects':
        setSubjectToEdit(null);
        setIsSubjectModalOpen(true);
        break;
      case 'grades':
        setIsGradeModalOpen(true);
        break;
      case 'teachers':
        setTeacherToEdit(null);
        setIsTeacherModalOpen(true);
        break;
      case 'schedule':
        setIsScheduleModalOpen(true);
        break;
      case 'dashboard':
      default:
        setStudentToEdit(null);
        setIsStudentModalOpen(true);
        break;
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            onOpenAddStudent={() => {
              setStudentToEdit(null);
              setIsStudentModalOpen(true);
            }}
            onOpenAddGrade={() => setIsGradeModalOpen(true)}
          />
        );
      case 'students':
        return (
          <StudentsView
            onOpenAddStudent={() => {
              setStudentToEdit(null);
              setIsStudentModalOpen(true);
            }}
            onEditStudent={(s) => {
              setStudentToEdit(s);
              setIsStudentModalOpen(true);
            }}
          />
        );
      case 'classes':
        return (
          <ClassesView
            onOpenAddClass={() => {
              setClassToEdit(null);
              setIsClassModalOpen(true);
            }}
            onEditClass={(c) => {
              setClassToEdit(c);
              setIsClassModalOpen(true);
            }}
          />
        );
      case 'subjects':
        return (
          <SubjectsView
            onOpenAddSubject={() => {
              setSubjectToEdit(null);
              setIsSubjectModalOpen(true);
            }}
            onEditSubject={(sub) => {
              setSubjectToEdit(sub);
              setIsSubjectModalOpen(true);
            }}
          />
        );
      case 'grades':
        return <GradesView onOpenAddGrade={() => setIsGradeModalOpen(true)} />;
      case 'attendance':
        return <AttendanceView />;
      case 'teachers':
        return (
          <TeachersView
            onOpenAddTeacher={() => {
              setTeacherToEdit(null);
              setIsTeacherModalOpen(true);
            }}
            onEditTeacher={(t) => {
              setTeacherToEdit(t);
              setIsTeacherModalOpen(true);
            }}
          />
        );
      case 'schedule':
        return <ScheduleView onOpenAddSchedule={() => setIsScheduleModalOpen(true)} />;
      case 'report_cards':
        return <ReportCardsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onOpenAddStudent={() => setIsStudentModalOpen(true)} onOpenAddGrade={() => setIsGradeModalOpen(true)} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#f0fdfc] via-[#e6f7f6] to-[#f4faf9] text-[#101e1e]">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile Header Bar toggle */}
        <div className="lg:hidden flex items-center justify-between p-4 glass-nav border-b border-white">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-white/80 hover:bg-white text-gray-700 shadow-xs"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="font-extrabold text-sm text-[#0f2d30] font-heading">
            EduGlass Pro
          </h2>
          <div className="w-8" />
        </div>

        {/* Global Header */}
        <div className="no-print">
          <Header onOpenAddModal={handleQuickAdd} />
        </div>

        {/* Page View Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Modals */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setStudentToEdit(null);
        }}
        studentToEdit={studentToEdit}
      />

      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => {
          setIsClassModalOpen(false);
          setClassToEdit(null);
        }}
        classToEdit={classToEdit}
      />

      <GradeModal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
      />

      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setSubjectToEdit(null);
        }}
        subjectToEdit={subjectToEdit}
      />

      <TeacherModal
        isOpen={isTeacherModalOpen}
        onClose={() => {
          setIsTeacherModalOpen(false);
          setTeacherToEdit(null);
        }}
        teacherToEdit={teacherToEdit}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <SchoolProvider>
      <MainAppContent />
    </SchoolProvider>
  );
}
