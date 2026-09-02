import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import {
  Search,
  Plus,
  Filter,
  LayoutGrid,
  List,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  FileText,
  UserCheck,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { formatGrade, getGradeBadgeColor } from '../../utils/imageLoader';

interface StudentsViewProps {
  onOpenAddStudent: () => void;
  onEditStudent: (student: Student) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({ onOpenAddStudent, onEditStudent }) => {
  const {
    students,
    classes,
    deleteStudent,
    searchQuery,
    setSearchQuery,
    selectedClassId,
    setSelectedClassId,
    setSelectedStudentId,
    setActiveTab,
  } = useSchool();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchSearch =
        searchQuery === '' ||
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.className.toLowerCase().includes(searchQuery.toLowerCase());

      const matchClass = selectedClassId === 'all' || student.classId === selectedClassId;
      const matchStatus = statusFilter === 'all' || student.status === statusFilter;

      return matchSearch && matchClass && matchStatus;
    });
  }, [students, searchQuery, selectedClassId, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Controls Bar: Search, Class Filter, Status Filter, View Toggle, Add Button */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="student-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, email, matricule..."
              className="w-full pl-9 pr-4 py-2 bg-white/80 border border-teal-900/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00818c]/30 text-gray-900"
            />
          </div>

          {/* Class Filter */}
          <select
            id="student-class-filter"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2 bg-white/80 border border-teal-900/10 rounded-xl text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#00818c]/30"
          >
            <option value="all">Toutes les classes ({students.length})</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.studentCount})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white/80 border border-teal-900/10 rounded-xl text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#00818c]/30"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="graduated">Diplômés</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>

        {/* View Toggle & Add Button */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center p-1 bg-white/80 rounded-xl border border-teal-900/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-[#00818c] text-white shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Vue Grille"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-[#00818c] text-white shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Vue Tableau"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            id="btn-add-student-main"
            onClick={onOpenAddStudent}
            className="flex items-center gap-2 px-4 py-2 bg-[#00818c] hover:bg-[#006e77] text-white rounded-xl font-semibold text-sm shadow-md shadow-teal-800/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel Élève</span>
          </button>
        </div>
      </div>

      {/* Student List Count / Active Filter Summary */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span>
          Affichage de <strong className="text-gray-800">{filteredStudents.length}</strong> élève(s)
          {selectedClassId !== 'all' && (
            <span className="text-[#00818c] ml-1">
              • Classe: {classes.find((c) => c.id === selectedClassId)?.name}
            </span>
          )}
        </span>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((student) => {
            const badge = getGradeBadgeColor(student.averageGrade);
            return (
              <div
                key={student.id}
                className="glass-card rounded-2xl p-5 border border-white/80 hover:border-[#00818c]/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  {/* Card Header: Avatar, Name, Class & Grade */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-teal-500/20 shadow-xs"
                        />
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#00818c] transition-colors">
                          {student.name}
                        </h4>
                        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-[#00818c] mt-0.5">
                          {student.className}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${badge.bg} ${badge.text}`}>
                        {formatGrade(student.averageGrade)}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-1">{student.rollNumber}</p>
                    </div>
                  </div>

                  {/* Attendance and stats bar */}
                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Taux d'assiduité</span>
                      <span className="font-bold text-teal-700">{student.attendanceRate}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#00818c] h-full rounded-full"
                        style={{ width: `${student.attendanceRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Parent info */}
                  <div className="mt-3 text-xs text-gray-500 space-y-1">
                    <p className="truncate flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </p>
                    <p className="truncate flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{student.parentPhone}</span>
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedStudentId(student.id);
                      setActiveTab('report_cards');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-[#00818c] text-xs font-bold rounded-xl transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Bulletin</span>
                  </button>

                  <button
                    onClick={() => setSelectedStudentForDetail(student)}
                    className="p-1.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
                    title="Détails"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onEditStudent(student)}
                    className="p-1.5 rounded-xl text-gray-500 hover:text-[#00818c] hover:bg-teal-50 transition-all"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Voulez-vous vraiment supprimer l'élève ${student.name} ?`)) {
                        deleteStudent(student.id);
                      }
                    }}
                    className="p-1.5 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="glass-card rounded-2xl overflow-hidden border border-white/80 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-teal-900/5 text-xs uppercase font-bold text-gray-600 tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5">Élève</th>
                  <th className="px-4 py-3.5">Matricule</th>
                  <th className="px-4 py-3.5">Classe</th>
                  <th className="px-4 py-3.5">Moyenne</th>
                  <th className="px-4 py-3.5">Présence</th>
                  <th className="px-4 py-3.5">Contact Parent</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => {
                  const badge = getGradeBadgeColor(student.averageGrade);
                  return (
                    <tr key={student.id} className="hover:bg-teal-50/40 transition-colors">
                      <td className="px-5 py-3 flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-teal-500/20"
                        />
                        <div>
                          <p className="font-bold text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-400">{student.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{student.rollNumber}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 text-xs font-semibold bg-teal-50 text-[#00818c] rounded-md">
                          {student.className}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${badge.bg} ${badge.text}`}>
                          {formatGrade(student.averageGrade)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-teal-800">{student.attendanceRate}%</td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        <p className="font-medium text-gray-800">{student.parentName}</p>
                        <p className="text-gray-400">{student.parentPhone}</p>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedStudentId(student.id);
                              setActiveTab('report_cards');
                            }}
                            className="p-1.5 text-[#00818c] hover:bg-teal-50 rounded-lg"
                            title="Bulletin"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedStudentForDetail(student)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                            title="Détails"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditStudent(student)}
                            className="p-1.5 text-gray-500 hover:text-[#00818c] hover:bg-teal-50 rounded-lg"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Supprimer ${student.name} ?`)) {
                                deleteStudent(student.id);
                              }
                            }}
                            className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Profile Quick View Modal */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-white space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudentForDetail.avatar}
                  alt={selectedStudentForDetail.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-[#00818c]/20 shadow-md"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 font-heading">
                    {selectedStudentForDetail.name}
                  </h3>
                  <p className="text-xs text-[#00818c] font-semibold">
                    {selectedStudentForDetail.className} • {selectedStudentForDetail.rollNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-teal-50/60 p-4 rounded-2xl border border-teal-100 text-center">
              <div>
                <p className="text-xs text-gray-500">Moyenne Générale</p>
                <p className="text-xl font-extrabold text-[#00818c]">
                  {formatGrade(selectedStudentForDetail.averageGrade)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Assiduité</p>
                <p className="text-xl font-extrabold text-emerald-700">
                  {selectedStudentForDetail.attendanceRate}%
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-400">Date de naissance :</span>
                <span className="font-semibold">{selectedStudentForDetail.dateOfBirth}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-400">Email :</span>
                <span className="font-semibold">{selectedStudentForDetail.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-400">Responsables légaux :</span>
                <span className="font-semibold">{selectedStudentForDetail.parentName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-400">Téléphone parents :</span>
                <span className="font-semibold">{selectedStudentForDetail.parentPhone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-400">Adresse :</span>
                <span className="font-semibold">{selectedStudentForDetail.address}</span>
              </div>
              {selectedStudentForDetail.notes && (
                <div className="pt-2">
                  <span className="text-gray-400 block mb-1">Appréciation de l'équipe :</span>
                  <p className="p-3 bg-white/70 rounded-xl text-gray-700 italic border border-gray-100">
                    "{selectedStudentForDetail.notes}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedStudentId(selectedStudentForDetail.id);
                  setSelectedStudentForDetail(null);
                  setActiveTab('report_cards');
                }}
                className="flex-1 py-2.5 bg-[#00818c] hover:bg-[#006e77] text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Générer Bulletin Officiel</span>
              </button>
              <button
                onClick={() => {
                  const s = selectedStudentForDetail;
                  setSelectedStudentForDetail(null);
                  onEditStudent(s);
                }}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold text-xs transition-all"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
