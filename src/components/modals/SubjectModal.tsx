import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Subject } from '../../types';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectToEdit?: Subject | null;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({ isOpen, onClose, subjectToEdit }) => {
  const { addSubject, updateSubject, teachers, classes } = useSchool();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [coefficient, setCoefficient] = useState(4);
  const [icon, setIcon] = useState('BookOpen');
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || '');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(classes.map((c) => c.id));
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (subjectToEdit) {
      setName(subjectToEdit.name);
      setCode(subjectToEdit.code);
      setCoefficient(subjectToEdit.coefficient);
      setIcon(subjectToEdit.icon);
      setTeacherId(subjectToEdit.teacherId);
      setSelectedClassIds(subjectToEdit.classIds);
      setDescription(subjectToEdit.description || '');
    } else {
      setName('');
      setCode('MAT-101');
      setCoefficient(4);
      setIcon('BookOpen');
      setTeacherId(teachers[0]?.id || '');
      setSelectedClassIds(classes.map((c) => c.id));
      setDescription('');
    }
  }, [subjectToEdit, isOpen, teachers, classes]);

  if (!isOpen) return null;

  const handleToggleClass = (id: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    const teacher = teachers.find((t) => t.id === teacherId);

    if (subjectToEdit) {
      updateSubject({
        ...subjectToEdit,
        name,
        code,
        coefficient: Number(coefficient),
        icon,
        teacherId,
        teacherName: teacher ? teacher.name : 'Non assigné',
        classIds: selectedClassIds,
        description,
      });
    } else {
      addSubject({
        name,
        code,
        coefficient: Number(coefficient),
        icon,
        color: 'teal',
        teacherId,
        teacherName: teacher ? teacher.name : 'Non assigné',
        classIds: selectedClassIds,
        description,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg font-heading">
            {subjectToEdit ? 'Modifier la Matière' : 'Ajouter une Matière'}
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
            <label className="block font-semibold text-gray-700 mb-1">Nom de la Matière *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Mathématiques, Philosophie..."
              className="w-full px-3.5 py-2 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Code Matière *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="MATH-101"
                className="w-full px-3.5 py-2 bg-white/90 border border-teal-900/10 rounded-xl text-sm uppercase font-mono focus:ring-2 focus:ring-[#00818c]/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Coefficient</label>
              <input
                type="number"
                min="1"
                max="10"
                value={coefficient}
                onChange={(e) => setCoefficient(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-white/90 border border-teal-900/10 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#00818c]/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Icône</label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3.5 py-2 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30"
              >
                <option value="Calculator">Calculatrice (Maths)</option>
                <option value="Atom">Atome (Physique)</option>
                <option value="BookOpen">Livre (Français / Philo)</option>
                <option value="Globe">Globe (Langues)</option>
                <option value="Dna">ADN (SVT)</option>
                <option value="Compass">Boussole (Histoire)</option>
                <option value="Code">Code (Informatique / NSI)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Enseignant Référent</label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full px-3.5 py-2 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">Classes concernées</label>
            <div className="flex flex-wrap gap-1.5 p-2.5 bg-gray-50 rounded-xl border border-gray-100 max-h-32 overflow-y-auto">
              {classes.map((cls) => {
                const isSelected = selectedClassIds.includes(cls.id);
                return (
                  <button
                    type="button"
                    key={cls.id}
                    onClick={() => handleToggleClass(cls.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#00818c] text-white shadow-xs'
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    {cls.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Description / Objectifs</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contenu du cours..."
              className="w-full px-3.5 py-2 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30"
            />
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
              {subjectToEdit ? 'Enregistrer' : 'Créer la matière'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
