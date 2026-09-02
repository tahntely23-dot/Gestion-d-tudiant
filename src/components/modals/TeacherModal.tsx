import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Teacher } from '../../types';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherToEdit?: Teacher | null;
}

export const TeacherModal: React.FC<TeacherModalProps> = ({ isOpen, onClose, teacherToEdit }) => {
  const { addTeacher, updateTeacher, subjects, classes } = useSchool();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80');
  const [experienceYears, setExperienceYears] = useState(8);

  useEffect(() => {
    if (teacherToEdit) {
      setName(teacherToEdit.name);
      setEmail(teacherToEdit.email);
      setPhone(teacherToEdit.phone);
      setSpecialty(teacherToEdit.specialty);
      setSelectedSubjects(teacherToEdit.subjects);
      setSelectedClasses(teacherToEdit.classes);
      setAvatar(teacherToEdit.avatar);
      setExperienceYears(teacherToEdit.experienceYears);
    } else {
      setName('');
      setEmail('');
      setPhone('+33 6 ');
      setSpecialty('Mathématiques');
      setSelectedSubjects(subjects.slice(0, 1).map((s) => s.id));
      setSelectedClasses(classes.slice(0, 2).map((c) => c.id));
      setAvatar('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80');
      setExperienceYears(8);
    }
  }, [teacherToEdit, isOpen, subjects, classes]);

  if (!isOpen) return null;

  const handleToggleSubject = (id: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleToggleClass = (id: string) => {
    setSelectedClasses((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    if (teacherToEdit) {
      updateTeacher({
        ...teacherToEdit,
        name,
        email,
        phone,
        specialty,
        subjects: selectedSubjects,
        classes: selectedClasses,
        avatar,
        experienceYears: Number(experienceYears),
      });
    } else {
      addTeacher({
        name,
        email,
        phone,
        specialty,
        subjects: selectedSubjects,
        classes: selectedClasses,
        avatar,
        status: 'active',
        experienceYears: Number(experienceYears),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg font-heading">
            {teacherToEdit ? 'Modifier le Professeur' : 'Ajouter un Enseignant'}
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
            <label className="block font-semibold text-gray-700 mb-1">Nom et Titre *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Dr. Robert Dubois"
              className="w-full px-3.5 py-2 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Spécialité Principale</label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="ex: Physique, Lettres..."
                className="w-full px-3.5 py-2 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Années d'Expérience</label>
              <input
                type="number"
                min="0"
                max="45"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email Professionnel *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prof@eduglass.edu"
                className="w-full px-3.5 py-2 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Téléphone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+33 6 ..."
                className="w-full px-3.5 py-2 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">Matières Enseignées</label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-100 max-h-24 overflow-y-auto">
              {subjects.map((s) => {
                const isSelected = selectedSubjects.includes(s.id);
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => handleToggleSubject(s.id)}
                    className={`px-2 py-1 text-xs rounded-lg font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#00818c] text-white shadow-xs'
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">Classes Affectées</label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-100 max-h-24 overflow-y-auto">
              {classes.map((cls) => {
                const isSelected = selectedClasses.includes(cls.id);
                return (
                  <button
                    type="button"
                    key={cls.id}
                    onClick={() => handleToggleClass(cls.id)}
                    className={`px-2 py-1 text-xs rounded-lg font-semibold transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    {cls.name}
                  </button>
                );
              })}
            </div>
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
              {teacherToEdit ? 'Enregistrer' : 'Ajouter le professeur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
