import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
}

export const StudentModal: React.FC<StudentModalProps> = ({ isOpen, onClose, studentToEdit }) => {
  const { classes, addStudent, updateStudent } = useSchool();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [gender, setGender] = useState<'M' | 'F' | 'Autre'>('M');
  const [dateOfBirth, setDateOfBirth] = useState('2007-05-15');
  const [rollNumber, setRollNumber] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=80');
  const [notes, setNotes] = useState('');

  // Field validation states
  const [errors, setErrors] = useState<{
    name?: string;
    classId?: string;
    email?: string;
  }>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name);
      setEmail(studentToEdit.email);
      setClassId(studentToEdit.classId);
      setGender(studentToEdit.gender);
      setDateOfBirth(studentToEdit.dateOfBirth);
      setRollNumber(studentToEdit.rollNumber);
      setParentName(studentToEdit.parentName);
      setParentPhone(studentToEdit.parentPhone);
      setParentEmail(studentToEdit.parentEmail);
      setAddress(studentToEdit.address);
      setAvatar(studentToEdit.avatar);
      setNotes(studentToEdit.notes || '');
    } else {
      setName('');
      setEmail('');
      setClassId(classes[0]?.id || '');
      setGender('M');
      setDateOfBirth('2007-05-15');
      setRollNumber(`EDU-2024-0${Math.floor(Math.random() * 90 + 10)}`);
      setParentName('');
      setParentPhone('+33 6 ');
      setParentEmail('');
      setAddress('');
      setAvatar(`https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 50000000)}?w=250&auto=format&fit=crop&q=80`);
      setNotes('');
    }
    setErrors({});
    setTouched({});
  }, [studentToEdit, isOpen, classes]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, classId: true, email: true });

    const newErrors: { name?: string; classId?: string; email?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Le nom et prénom sont obligatoires.';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Le nom doit comporter au moins 3 caractères.';
    }

    if (!classId) {
      newErrors.classId = 'Veuillez assigner une classe à l\'élève.';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Format d\'adresse email invalide.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (studentToEdit) {
      updateStudent({
        ...studentToEdit,
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@student.eduglass.edu`,
        classId,
        gender,
        dateOfBirth,
        rollNumber,
        parentName,
        parentPhone,
        parentEmail,
        address,
        avatar,
        notes,
      });
    } else {
      addStudent({
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@student.eduglass.edu`,
        classId,
        className: classes.find((c) => c.id === classId)?.name || '',
        gender,
        dateOfBirth,
        rollNumber: rollNumber || `EDU-2024-0${Math.floor(Math.random() * 90 + 10)}`,
        parentName,
        parentPhone,
        parentEmail,
        address,
        avatar: avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=80',
        status: 'active',
        admissionDate: '2024-09-01',
        notes,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-white max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg font-heading">
            {studentToEdit ? "Modifier l'Élève" : "Inscrire un Nouvel Élève"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs" noValidate>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-gray-700">Nom et Prénom *</label>
              {touched.name && !errors.name && name.trim().length >= 3 && (
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Valide
                </span>
              )}
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (touched.name) {
                  setErrors((prev) => ({
                    ...prev,
                    name: !e.target.value.trim()
                      ? 'Le nom et prénom sont obligatoires.'
                      : e.target.value.trim().length < 3
                      ? 'Le nom doit comporter au moins 3 caractères.'
                      : undefined,
                  }));
                }
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              placeholder="ex: Alexandre Dupont"
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                errors.name
                  ? 'bg-rose-50/50 border-2 border-rose-400 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-400/30'
                  : 'bg-white/90 border border-teal-900/10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00818c]/30'
              }`}
            />
            {errors.name && (
              <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Classe Assignée *</label>
              <select
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  if (touched.classId) {
                    setErrors((prev) => ({
                      ...prev,
                      classId: !e.target.value ? 'Veuillez assigner une classe.' : undefined,
                    }));
                  }
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                  errors.classId
                    ? 'bg-rose-50/50 border-2 border-rose-400 text-rose-900'
                    : 'bg-white/90 border border-teal-900/10 text-gray-900'
                }`}
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              {errors.classId && (
                <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{errors.classId}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Genre</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'M' | 'F' | 'Autre')}
                className="w-full px-3.5 py-2.5 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30"
              >
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Date de Naissance</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Matricule Scolaire</label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="EDU-2024-XXX"
                className="w-full px-3.5 py-2.5 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Email Élève</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (touched.email && e.target.value.trim()) {
                  setErrors((prev) => ({
                    ...prev,
                    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value.trim())
                      ? 'Format d\'adresse email invalide.'
                      : undefined,
                  }));
                }
              }}
              placeholder="alexandre@student.eduglass.edu"
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                errors.email
                  ? 'bg-rose-50/50 border-2 border-rose-400 text-rose-900'
                  : 'bg-white/90 border border-teal-900/10 text-gray-900'
              }`}
            />
            {errors.email && (
              <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-3">
            <p className="font-bold text-[#00818c]">Contact des Responsables Légaux</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-600 mb-1">Nom des Parents</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="M. et Mme Dupont"
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-600 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-gray-600 mb-1">Adresse Postale</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="14 Rue des Lilas, 75015 Paris"
                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Observations / Profil</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Remarques pédagogiques ou médicales..."
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
              {studentToEdit ? 'Enregistrer' : 'Inscrire'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
