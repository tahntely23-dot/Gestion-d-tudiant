import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ClassRoom } from '../../types';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classToEdit?: ClassRoom | null;
}

export const ClassModal: React.FC<ClassModalProps> = ({ isOpen, onClose, classToEdit }) => {
  const { addClass, updateClass, teachers } = useSchool();

  const [name, setName] = useState('');
  const [level, setLevel] = useState('Lycée - Terminale');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [room, setRoom] = useState('Salle B101');
  const [mainTeacherId, setMainTeacherId] = useState(teachers[0]?.id || '');
  const [capacity, setCapacity] = useState(32);

  useEffect(() => {
    if (classToEdit) {
      setName(classToEdit.name);
      setLevel(classToEdit.level);
      setAcademicYear(classToEdit.academicYear);
      setRoom(classToEdit.room);
      setMainTeacherId(classToEdit.mainTeacherId);
      setCapacity(classToEdit.capacity);
    } else {
      setName('');
      setLevel('Lycée - Terminale');
      setAcademicYear('2024-2025');
      setRoom('Salle B101');
      setMainTeacherId(teachers[0]?.id || '');
      setCapacity(32);
    }
  }, [classToEdit, isOpen, teachers]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const teacher = teachers.find((t) => t.id === mainTeacherId);

    if (classToEdit) {
      updateClass({
        ...classToEdit,
        name,
        level,
        academicYear,
        room,
        mainTeacherId,
        mainTeacherName: teacher ? teacher.name : 'Non assigné',
        capacity: Number(capacity),
      });
    } else {
      addClass({
        name,
        level,
        academicYear,
        room,
        mainTeacherId,
        mainTeacherName: teacher ? teacher.name : 'Non assigné',
        capacity: Number(capacity),
        color: 'teal',
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg font-heading">
            {classToEdit ? 'Modifier la Classe' : 'Créer une Nouvelle Classe'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Nom de la Division *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Terminale S1, Seconde 4..."
              className="w-full px-3.5 py-2 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Niveau</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3.5 py-2 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30"
              >
                <option value="Collège - 6ème">Collège - 6ème</option>
                <option value="Collège - 5ème">Collège - 5ème</option>
                <option value="Collège - 4ème">Collège - 4ème</option>
                <option value="Collège - 3ème">Collège - 3ème</option>
                <option value="Lycée - Seconde">Lycée - Seconde</option>
                <option value="Lycée - Première">Lycée - Première</option>
                <option value="Lycée - Terminale">Lycée - Terminale</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Année Scolaire</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Salle Attitrée</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Salle B204"
                className="w-full px-3.5 py-2 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Capacité Max</label>
              <input
                type="number"
                min="10"
                max="50"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Professeur Principal</label>
            <select
              value={mainTeacherId}
              onChange={(e) => setMainTeacherId(e.target.value)}
              className="w-full px-3.5 py-2 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.specialty})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#00818c] hover:bg-[#006e77] text-white font-bold rounded-xl shadow-md"
            >
              {classToEdit ? 'Enregistrer' : 'Créer la classe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
