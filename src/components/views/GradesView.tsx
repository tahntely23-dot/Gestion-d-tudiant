import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Grade } from '../../types';
import { Award, Plus, Trash2, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { formatGrade, getGradeBadgeColor } from '../../utils/imageLoader';

interface GradesViewProps {
  onOpenAddGrade: () => void;
}

export const GradesView: React.FC<GradesViewProps> = ({ onOpenAddGrade }) => {
  const { grades, students, classes, subjects, deleteGrade, selectedClassId, setSelectedClassId } = useSchool();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>('all');

  // Filtered grades
  const filteredGrades = useMemo(() => {
    return grades.filter((g) => {
      const matchClass = selectedClassId === 'all' || g.classId === selectedClassId;
      const matchSubject = selectedSubjectId === 'all' || g.subjectId === selectedSubjectId;
      const matchTerm = selectedTerm === 'all' || g.term === selectedTerm;
      return matchClass && matchSubject && matchTerm;
    });
  }, [grades, selectedClassId, selectedSubjectId, selectedTerm]);

  // Quick stats
  const averageGrade = filteredGrades.length > 0
    ? (filteredGrades.reduce((acc, g) => acc + (g.score / g.maxScore) * 20, 0) / filteredGrades.length).toFixed(1)
    : '15.0';

  const highestGrade = filteredGrades.length > 0
    ? Math.max(...filteredGrades.map((g) => (g.score / g.maxScore) * 20)).toFixed(1)
    : '20.0';

  const lowestGrade = filteredGrades.length > 0
    ? Math.min(...filteredGrades.map((g) => (g.score / g.maxScore) * 20)).toFixed(1)
    : '10.0';

  return (
    <div className="space-y-6">
      {/* Top Banner / Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/80">
          <p className="text-xs font-semibold text-gray-500">Moyenne de la sélection</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-[#00818c] font-heading">{averageGrade}</span>
            <span className="text-xs text-gray-500">/ 20</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">{filteredGrades.length} note(s) enregistrée(s)</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/80">
          <p className="text-xs font-semibold text-gray-500">Note la plus haute</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-emerald-700 font-heading">{highestGrade}</span>
            <span className="text-xs text-gray-500">/ 20</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-1">Excellence académique</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/80">
          <p className="text-xs font-semibold text-gray-500">Note plancher</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-amber-700 font-heading">{lowestGrade}</span>
            <span className="text-xs text-gray-500">/ 20</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Accompagnement conseillé</p>
        </div>
      </div>

      {/* Filter Toolbar & Add Button */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Filter */}
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2 bg-white/80 border border-teal-900/10 rounded-xl text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#00818c]/30"
          >
            <option value="all">Toutes les classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>

          {/* Subject Filter */}
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-2 bg-white/80 border border-teal-900/10 rounded-xl text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#00818c]/30"
          >
            <option value="all">Toutes les matières</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (Coeff {s.coefficient})
              </option>
            ))}
          </select>

          {/* Term Filter */}
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="px-3 py-2 bg-white/80 border border-teal-900/10 rounded-xl text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#00818c]/30"
          >
            <option value="all">Toutes les périodes</option>
            <option value="Trimestre 1">Trimestre 1</option>
            <option value="Trimestre 2">Trimestre 2</option>
            <option value="Trimestre 3">Trimestre 3</option>
            <option value="Semestre 1">Semestre 1</option>
            <option value="Semestre 2">Semestre 2</option>
          </select>
        </div>

        <button
          id="btn-add-grade"
          onClick={onOpenAddGrade}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00818c] hover:bg-[#006e77] text-white rounded-xl font-bold text-sm shadow-md shadow-teal-800/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Saisir une Note</span>
        </button>
      </div>

      {/* Grades Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-teal-900/5 text-xs uppercase font-bold text-gray-600 tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-5 py-3.5">Élève</th>
                <th className="px-4 py-3.5">Matière</th>
                <th className="px-4 py-3.5">Type & Période</th>
                <th className="px-4 py-3.5">Note Obtenue</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Appréciation</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm text-gray-400">
                    Aucune note trouvée pour cette sélection.
                  </td>
                </tr>
              ) : (
                filteredGrades.map((g) => {
                  const student = students.find((s) => s.id === g.studentId);
                  const badge = getGradeBadgeColor(g.score, g.maxScore);

                  return (
                    <tr key={g.id} className="hover:bg-teal-50/40 transition-colors">
                      <td className="px-5 py-3 flex items-center gap-3">
                        {student?.avatar && (
                          <img
                            src={student.avatar}
                            alt={g.studentName}
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-teal-500/20"
                          />
                        )}
                        <div>
                          <p className="font-bold text-gray-900">{g.studentName}</p>
                          <p className="text-xs text-gray-400">{student?.className}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{g.subjectName}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded mr-1.5">
                          {g.type}
                        </span>
                        <span className="text-xs text-gray-500">{g.term}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 text-xs font-black rounded-lg ${badge.bg} ${badge.text}`}>
                          {g.score} / {g.maxScore}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{g.date}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate italic">
                        {g.comment ? `"${g.comment}"` : '—'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer cette note pour ${g.studentName} ?`)) {
                              deleteGrade(g.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Supprimer la note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
