import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Teacher } from '../../types';
import { Users, Plus, Mail, Phone, BookOpen, School, Award, Edit2, Trash2 } from 'lucide-react';

interface TeachersViewProps {
  onOpenAddTeacher: () => void;
  onEditTeacher: (teacher: Teacher) => void;
}

export const TeachersView: React.FC<TeachersViewProps> = ({ onOpenAddTeacher, onEditTeacher }) => {
  const { teachers, subjects, classes, deleteTeacher } = useSchool();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-heading">
            Corps Enseignant & Équipe Pédagogique ({teachers.length})
          </h2>
          <p className="text-xs text-gray-500">
            Coordonnées des professeurs, spécialités et charges de cours
          </p>
        </div>

        <button
          id="btn-add-teacher"
          onClick={onOpenAddTeacher}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00818c] hover:bg-[#006e77] text-white rounded-xl font-bold text-sm shadow-md shadow-teal-800/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Professeur</span>
        </button>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teachers.map((teacher) => {
          const taughtSubjects = subjects.filter((s) => teacher.subjects.includes(s.id));
          const assignedClasses = classes.filter((c) => teacher.classes.includes(c.id));

          return (
            <div
              key={teacher.id}
              className="glass-card rounded-2xl p-5 border border-white/80 hover:border-[#00818c]/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                {/* Avatar & Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={teacher.avatar}
                      alt={teacher.name}
                      className="w-13 h-13 rounded-2xl object-cover ring-2 ring-teal-500/20 shadow-xs"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#00818c] transition-colors">
                        {teacher.name}
                      </h3>
                      <p className="text-xs text-[#00818c] font-semibold">{teacher.specialty}</p>
                      <span className="inline-block text-[10px] text-gray-400 font-medium mt-0.5">
                        {teacher.experienceYears} ans d'ancienneté
                      </span>
                    </div>
                  </div>

                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" title="En activité" />
                </div>

                {/* Contact Info */}
                <div className="mt-4 space-y-1.5 text-xs text-gray-600 bg-white/50 p-3 rounded-xl border border-gray-100">
                  <p className="truncate flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </p>
                  <p className="truncate flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{teacher.phone}</span>
                  </p>
                </div>

                {/* Subjects & Classes */}
                <div className="mt-4 space-y-2 text-xs">
                  <div>
                    <span className="text-gray-400 text-[11px] font-semibold block mb-1">Matières dispensées :</span>
                    <div className="flex flex-wrap gap-1">
                      {taughtSubjects.map((s) => (
                        <span key={s.id} className="px-2 py-0.5 bg-teal-50 text-[#00818c] text-[11px] font-bold rounded-md">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 text-[11px] font-semibold block mb-1">Classes assignées :</span>
                    <div className="flex flex-wrap gap-1">
                      {assignedClasses.map((c) => (
                        <span key={c.id} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[11px] font-semibold rounded-md">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => onEditTeacher(teacher)}
                  className="p-1.5 text-gray-500 hover:text-[#00818c] hover:bg-teal-50 rounded-xl transition-all"
                  title="Modifier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Supprimer le professeur ${teacher.name} ?`)) {
                      deleteTeacher(teacher.id);
                    }
                  }}
                  className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
