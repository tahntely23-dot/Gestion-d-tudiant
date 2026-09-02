import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ClassRoom } from '../../types';
import { School, Users, Plus, Edit2, Trash2, BookOpen, DoorOpen, User, ArrowRight } from 'lucide-react';

interface ClassesViewProps {
  onOpenAddClass: () => void;
  onEditClass: (cls: ClassRoom) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({ onOpenAddClass, onEditClass }) => {
  const { classes, students, deleteClass, setSelectedClassId, setActiveTab } = useSchool();
  const [selectedClassDetails, setSelectedClassDetails] = useState<ClassRoom | null>(null);

  return (
    <div className="space-y-6">
      {/* Header action */}
      <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-heading">
            Salles de Classe & Divisions ({classes.length})
          </h2>
          <p className="text-xs text-gray-500">
            Structure pédagogique, professeurs principaux et affectations de salles
          </p>
        </div>

        <button
          id="btn-add-class"
          onClick={onOpenAddClass}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00818c] hover:bg-[#006e77] text-white rounded-xl font-bold text-sm shadow-md shadow-teal-800/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Classe</span>
        </button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => {
          const classStudents = students.filter((s) => s.classId === cls.id);
          const fillPercentage = Math.min(100, Math.round((classStudents.length / cls.capacity) * 100));

          return (
            <div
              key={cls.id}
              className="glass-card rounded-2xl p-5 border border-white/80 hover:border-[#00818c]/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                {/* Top: Name & Badges */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#00818c] flex items-center justify-center font-bold font-heading text-base group-hover:scale-110 transition-transform">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base group-hover:text-[#00818c] transition-colors">
                        {cls.name}
                      </h3>
                      <p className="text-xs text-gray-400">{cls.level}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-1 bg-teal-50 text-[#00818c] rounded-lg">
                    {cls.academicYear}
                  </span>
                </div>

                {/* Info Pills */}
                <div className="mt-4 space-y-2 text-xs text-gray-600 bg-white/50 p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <DoorOpen className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="font-semibold text-gray-800">{cls.room}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#00818c] shrink-0" />
                    <span>Prof. Principal : <strong>{cls.mainTeacherName}</strong></span>
                  </div>
                </div>

                {/* Capacity Progress */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Effectif : {classStudents.length} élèves</span>
                    <span className="font-bold text-teal-800">{fillPercentage}% (Max {cls.capacity})</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        fillPercentage >= 90 ? 'bg-amber-500' : 'bg-gradient-to-r from-[#00818c] to-[#00a896]'
                      }`}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Student Avatars Preview */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex -space-x-2 overflow-hidden py-1">
                    {classStudents.slice(0, 5).map((s) => (
                      <img
                        key={s.id}
                        src={s.avatar}
                        alt={s.name}
                        title={s.name}
                        className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                      />
                    ))}
                    {classStudents.length > 5 && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-800 ring-2 ring-white">
                        +{classStudents.length - 5}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedClassId(cls.id);
                      setActiveTab('students');
                    }}
                    className="text-xs font-bold text-[#00818c] hover:underline flex items-center gap-1"
                  >
                    Voir la liste <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setSelectedClassId(cls.id);
                    setActiveTab('attendance');
                  }}
                  className="flex-1 py-1.5 bg-teal-50 hover:bg-teal-100 text-[#00818c] text-xs font-bold rounded-xl transition-all"
                >
                  Faire l'Appel
                </button>

                <button
                  onClick={() => onEditClass(cls)}
                  className="p-1.5 text-gray-500 hover:text-[#00818c] hover:bg-teal-50 rounded-xl transition-all"
                  title="Modifier la classe"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Voulez-vous supprimer la classe ${cls.name} ?`)) {
                      deleteClass(cls.id);
                    }
                  }}
                  className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Supprimer la classe"
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
