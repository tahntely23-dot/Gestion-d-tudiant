import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Users,
  School,
  Award,
  CalendarCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  ChevronRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { formatGrade, getGradeBadgeColor } from '../../utils/imageLoader';

interface DashboardViewProps {
  onOpenAddStudent: () => void;
  onOpenAddGrade: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenAddStudent, onOpenAddGrade }) => {
  const { students, classes, subjects, grades, attendance, schedule, setActiveTab, setSelectedStudentId } = useSchool();

  // Metrics
  const totalStudents = students.length;
  const totalClasses = classes.length;
  
  // Calculate average attendance
  const totalAttendanceRate = students.length > 0 
    ? (students.reduce((acc, s) => acc + (s.attendanceRate || 95), 0) / students.length).toFixed(1)
    : '96.2';

  // Calculate school overall average grade
  const overallAvgGrade = students.length > 0
    ? (students.reduce((acc, s) => acc + (s.averageGrade || 14), 0) / students.length).toFixed(1)
    : '15.4';

  // Top performing students
  const topStudents = [...students].sort((a, b) => b.averageGrade - a.averageGrade).slice(0, 4);

  // Today's schedule items (e.g. Lundi / current)
  const todaysClasses = schedule.slice(0, 4);

  // Recent grades
  const recentGrades = grades.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Glassmorphic gradient */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 glass-card-teal text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-teal-100 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Plateforme Administrative Scolaire
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight leading-snug">
              Bienvenue sur EduGlass Pro
            </h2>
            <p className="text-sm text-teal-50/90 leading-relaxed">
              Consultez les résultats académiques, gérez les présences en temps réel, éditez les bulletins officiels et pilotez votre établissement.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenAddStudent}
              className="px-4 py-2.5 bg-white text-[#006e77] rounded-xl font-bold text-xs sm:text-sm hover:bg-teal-50 shadow-lg hover:shadow-xl transition-all"
            >
              + Nouvel Élève
            </button>
            <button
              onClick={onOpenAddGrade}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/30 transition-all"
            >
              + Saisir Note
            </button>
            <button
              onClick={() => setActiveTab('report_cards')}
              className="px-4 py-2.5 bg-emerald-500/80 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs sm:text-sm backdrop-blur-md transition-all shadow-md"
            >
              Bulletins PDF
            </button>
          </div>
        </div>

        {/* Decorative glass glow shapes */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 -top-16 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Students */}
        <div
          onClick={() => setActiveTab('students')}
          className="glass-card rounded-2xl p-5 hover:translate-y-[-2px] transition-all cursor-pointer border border-white/80 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">Total Élèves</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00818c] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-heading">
              {totalStudents}
            </span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +100%
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Inscrits cette année</p>
        </div>

        {/* Classes */}
        <div
          onClick={() => setActiveTab('classes')}
          className="glass-card rounded-2xl p-5 hover:translate-y-[-2px] transition-all cursor-pointer border border-white/80 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">Classes & Salles</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <School className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-heading">
              {totalClasses}
            </span>
            <span className="text-xs text-teal-600 font-semibold">Toutes actives</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">De la 3ème à la Terminale</p>
        </div>

        {/* Attendance Rate */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="glass-card rounded-2xl p-5 hover:translate-y-[-2px] transition-all cursor-pointer border border-white/80 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">Taux de Présence</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-heading">
              {totalAttendanceRate}%
            </span>
            <span className="text-xs text-emerald-600 font-semibold">+0.8%</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Assiduité globale élevée</p>
        </div>

        {/* School Average Grade */}
        <div
          onClick={() => setActiveTab('grades')}
          className="glass-card rounded-2xl p-5 hover:translate-y-[-2px] transition-all cursor-pointer border border-white/80 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">Moyenne Générale</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-heading">
              {overallAvgGrade}
            </span>
            <span className="text-xs text-gray-500 font-semibold">/ 20</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Trimestre en cours</p>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Class Overview & Top Students */}
        <div className="lg:col-span-2 space-y-6">
          {/* Class Rooms Performance */}
          <div className="glass-card rounded-2xl p-6 border border-white/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 font-heading">
                  Vue des Classes & Effectifs
                </h3>
                <p className="text-xs text-gray-500">Taux de remplissage et professeurs principaux</p>
              </div>
              <button
                onClick={() => setActiveTab('classes')}
                className="text-xs font-semibold text-[#00818c] hover:underline flex items-center gap-1"
              >
                Tout voir <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {classes.map((cls) => {
                const fillPercent = Math.min(100, Math.round((cls.studentCount / cls.capacity) * 100));
                return (
                  <div
                    key={cls.id}
                    onClick={() => setActiveTab('classes')}
                    className="p-4 rounded-xl bg-white/60 hover:bg-white border border-teal-900/5 hover:border-teal-500/30 transition-all cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#00818c] transition-colors">
                          {cls.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">{cls.room}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 bg-teal-50 text-[#00818c] rounded-md">
                        {cls.studentCount} / {cls.capacity}
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                        <span>Capacité</span>
                        <span className="font-semibold">{fillPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#00818c] to-[#00a896] h-full rounded-full transition-all duration-500"
                          style={{ width: `${fillPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
                      <span className="truncate">Prof: {cls.mainTeacherName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Performing Students */}
          <div className="glass-card rounded-2xl p-6 border border-white/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 font-heading">
                  Tableau d'Honneur & Majors de Promotion
                </h3>
                <p className="text-xs text-gray-500">Meilleures moyennes générales du trimestre</p>
              </div>
              <button
                onClick={() => setActiveTab('students')}
                className="text-xs font-semibold text-[#00818c] hover:underline flex items-center gap-1"
              >
                Voir les élèves <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {topStudents.map((std, idx) => {
                const badge = getGradeBadgeColor(std.averageGrade);
                return (
                  <div
                    key={std.id}
                    onClick={() => {
                      setSelectedStudentId(std.id);
                      setActiveTab('report_cards');
                    }}
                    className="p-3.5 rounded-xl bg-white/70 hover:bg-white border border-teal-900/5 hover:border-[#00818c]/40 transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <img
                          src={std.avatar}
                          alt={std.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500/20"
                        />
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-amber-900 text-[10px] font-black flex items-center justify-center shadow-xs">
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate group-hover:text-[#00818c] transition-colors">
                          {std.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{std.className}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${badge.bg} ${badge.text}`}>
                        {formatGrade(std.averageGrade)}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-1">{std.attendanceRate}% assidu</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Timetable & Recent Grades */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="glass-card rounded-2xl p-6 border border-white/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 font-heading">
                  Cours du Jour
                </h3>
                <p className="text-xs text-gray-500">Planning des salles aujourd'hui</p>
              </div>
              <button
                onClick={() => setActiveTab('schedule')}
                className="text-xs font-semibold text-[#00818c] hover:underline"
              >
                Planning
              </button>
            </div>

            <div className="space-y-3">
              {todaysClasses.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-white/60 border border-teal-900/5 flex items-center justify-between hover:bg-white transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#00818c] flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{item.subjectName}</h4>
                      <p className="text-[11px] text-gray-500">
                        {item.className} • {item.room}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
                      {item.startTime} - {item.endTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Grades Feed */}
          <div className="glass-card rounded-2xl p-6 border border-white/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 font-heading">
                  Dernières Évaluations
                </h3>
                <p className="text-xs text-gray-500">Saisies récentes par les enseignants</p>
              </div>
              <button
                onClick={() => setActiveTab('grades')}
                className="text-xs font-semibold text-[#00818c] hover:underline"
              >
                Toutes
              </button>
            </div>

            <div className="space-y-2.5">
              {recentGrades.map((g) => {
                const badge = getGradeBadgeColor(g.score, g.maxScore);
                return (
                  <div
                    key={g.id}
                    className="p-3 rounded-xl bg-white/60 hover:bg-white border border-teal-900/5 flex items-center justify-between transition-all"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-gray-900 truncate">{g.studentName}</p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {g.subjectName} • <span className="italic">{g.type}</span>
                      </p>
                    </div>
                    <span className={`text-xs font-black px-2 py-1 rounded-lg shrink-0 ${badge.bg} ${badge.text}`}>
                      {g.score} / {g.maxScore}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
