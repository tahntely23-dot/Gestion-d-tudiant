import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Subject } from '../../types';
import { BookOpen, Plus, Edit2, Trash2, Award, User, Layers, Calculator, Atom, Globe, Dna, Compass, Code } from 'lucide-react';

interface SubjectsViewProps {
  onOpenAddSubject: () => void;
  onEditSubject: (subject: Subject) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({ onOpenAddSubject, onEditSubject }) => {
  const { subjects, classes, deleteSubject } = useSchool();

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator':
        return Calculator;
      case 'Atom':
        return Atom;
      case 'BookOpen':
        return BookOpen;
      case 'Globe':
        return Globe;
      case 'Dna':
        return Dna;
      case 'Compass':
        return Compass;
      case 'Code':
        return Code;
      default:
        return BookOpen;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-heading">
            Matières Enseignées & Coefficients ({subjects.length})
          </h2>
          <p className="text-xs text-gray-500">
            Programme pédagogique, pondérations d'examen et enseignants référents
          </p>
        </div>

        <button
          id="btn-add-subject"
          onClick={onOpenAddSubject}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00818c] hover:bg-[#006e77] text-white rounded-xl font-bold text-sm shadow-md shadow-teal-800/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Matière</span>
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((subject) => {
          const IconComponent = getSubjectIcon(subject.icon);
          const assignedClasses = classes.filter((c) => subject.classIds.includes(c.id));

          return (
            <div
              key={subject.id}
              className="glass-card rounded-2xl p-5 border border-white/80 hover:border-[#00818c]/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#00818c] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {subject.code}
                      </span>
                      <h3 className="font-bold text-gray-900 text-sm mt-1 group-hover:text-[#00818c] transition-colors">
                        {subject.name}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      Coeff. {subject.coefficient}
                    </span>
                  </div>
                </div>

                {subject.description && (
                  <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                    {subject.description}
                  </p>
                )}

                {/* Teacher & Classes info */}
                <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-3.5 h-3.5 text-[#00818c] shrink-0" />
                    <span className="truncate">Enseignant : <strong>{subject.teacherName}</strong></span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1.5">
                      <Layers className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>Classes concernées ({assignedClasses.length}) :</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {assignedClasses.map((cls) => (
                        <span
                          key={cls.id}
                          className="px-2 py-0.5 bg-teal-50 text-[#00818c] text-[11px] font-semibold rounded-md"
                        >
                          {cls.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => onEditSubject(subject)}
                  className="p-1.5 text-gray-500 hover:text-[#00818c] hover:bg-teal-50 rounded-xl transition-all"
                  title="Modifier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Voulez-vous supprimer la matière ${subject.name} ?`)) {
                      deleteSubject(subject.id);
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
