import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AttendanceStatus } from '../../types';
import { CalendarCheck, CheckCircle2, XCircle, Clock, AlertCircle, Save, Filter, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AttendanceView: React.FC = () => {
  const { classes, students, attendance, bulkRecordAttendance, selectedClassId, setSelectedClassId } = useSchool();

  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // Default to first class if "all"
  const currentClassId = selectedClassId === 'all' ? classes[0]?.id || 'cls-1' : selectedClassId;
  const currentClass = classes.find((c) => c.id === currentClassId);
  const classStudents = students.filter((s) => s.classId === currentClassId);

  // Local state for roll-call modifications before saving
  const [studentStatuses, setStudentStatuses] = useState<Record<string, { status: AttendanceStatus; note: string }>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Initialize from existing attendance records or default to present
  React.useEffect(() => {
    const initialMap: Record<string, { status: AttendanceStatus; note: string }> = {};
    classStudents.forEach((std) => {
      const existing = attendance.find((a) => a.studentId === std.id && a.date === attendanceDate);
      initialMap[std.id] = {
        status: existing ? existing.status : 'present',
        note: existing?.note || '',
      };
    });
    setStudentStatuses(initialMap);
  }, [currentClassId, attendanceDate, attendance, students]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentStatuses((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setStudentStatuses((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note,
      },
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, { status: AttendanceStatus; note: string }> = {};
    classStudents.forEach((std) => {
      updated[std.id] = {
        status,
        note: studentStatuses[std.id]?.note || '',
      };
    });
    setStudentStatuses(updated);
  };

  const handleSaveAttendance = () => {
    const list = Object.entries(studentStatuses).map(([studentId, data]: [string, { status: AttendanceStatus; note: string }]) => ({
      studentId,
      status: data.status,
      note: data.note,
    }));

    bulkRecordAttendance(currentClassId, attendanceDate, list);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#00818c', '#00a896', '#02c39a', '#05668d'],
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Stats for the selected class and date
  const statusValues = Object.values(studentStatuses) as { status: AttendanceStatus; note: string }[];
  const presentCount = statusValues.filter((v) => v.status === 'present').length;
  const lateCount = statusValues.filter((v) => v.status === 'late').length;
  const absentCount = statusValues.filter((v) => v.status === 'absent').length;
  const excusedCount = statusValues.filter((v) => v.status === 'excused').length;
  const totalCount = classStudents.length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Date / Class Selectors */}
      <div className="glass-card rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Classe
            </label>
            <select
              value={currentClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3.5 py-2 bg-white/80 border border-teal-900/10 rounded-xl text-sm text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#00818c]/30"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.studentCount} élèves)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Date de l'Appel
            </label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="px-3.5 py-2 bg-white/80 border border-teal-900/10 rounded-xl text-sm text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#00818c]/30"
            />
          </div>
        </div>

        {/* Quick Batch Actions & Save */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleMarkAll('present')}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition-all"
          >
            Tous Présents
          </button>
          <button
            onClick={handleSaveAttendance}
            className="flex items-center gap-2 px-5 py-2 bg-[#00818c] hover:bg-[#006e77] text-white rounded-xl font-bold text-sm shadow-md shadow-teal-800/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{savedSuccess ? 'Enregistré !' : "Valider l'Appel"}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats for selected day */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-emerald-500/20 bg-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Présents</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-800 mt-1 font-heading">
            {presentCount} <span className="text-xs font-normal text-gray-500">/ {totalCount}</span>
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-amber-500/20 bg-amber-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">En Retard</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-800 mt-1 font-heading">
            {lateCount} <span className="text-xs font-normal text-gray-500">/ {totalCount}</span>
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-rose-500/20 bg-rose-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800">Absents</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-800 mt-1 font-heading">
            {absentCount} <span className="text-xs font-normal text-gray-500">/ {totalCount}</span>
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-blue-500/20 bg-blue-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800">Excusés</span>
            <AlertCircle className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-blue-800 mt-1 font-heading">
            {excusedCount} <span className="text-xs font-normal text-gray-500">/ {totalCount}</span>
          </p>
        </div>
      </div>

      {/* Roll-Call Student Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/80 shadow-sm">
        <div className="p-4 bg-teal-900/5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">
            Feuille d'Appel : {currentClass?.name} ({classStudents.length} élèves)
          </h3>
          <span className="text-xs font-medium text-gray-500">
            Professeur : {currentClass?.mainTeacherName}
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {classStudents.map((student) => {
            const currentStatus = studentStatuses[student.id]?.status || 'present';
            const note = studentStatuses[student.id]?.note || '';

            return (
              <div
                key={student.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/60 transition-colors"
              >
                {/* Student Info */}
                <div className="flex items-center gap-3 min-w-[220px]">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-teal-500/20 shadow-xs"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{student.name}</h4>
                    <p className="text-xs text-gray-400">{student.rollNumber}</p>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'present')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      currentStatus === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs scale-105'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Présent
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'late')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      currentStatus === 'late'
                        ? 'bg-amber-500 text-white shadow-xs scale-105'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Retard
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'absent')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      currentStatus === 'absent'
                        ? 'bg-rose-600 text-white shadow-xs scale-105'
                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Absent
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'excused')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      currentStatus === 'excused'
                        ? 'bg-blue-600 text-white shadow-xs scale-105'
                        : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    Excusé
                  </button>
                </div>

                {/* Justification note input */}
                <div className="w-full sm:w-60">
                  <input
                    type="text"
                    placeholder="Motif / Justification..."
                    value={note}
                    onChange={(e) => handleNoteChange(student.id, e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00818c]"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
