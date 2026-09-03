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

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field validation states
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    classId?: string;
    email?: string;
  }>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (studentToEdit) {
      setFirstName(studentToEdit.first_name || studentToEdit.name?.split(' ')[0] || '');
      setLastName(studentToEdit.last_name || studentToEdit.name?.split(' ').slice(1).join(' ') || '');
      setEmail(studentToEdit.email ?? '');
      setClassId(studentToEdit.classId ?? studentToEdit.class_id ?? (classes[0]?.id || ''));
      setGender(studentToEdit.gender ?? 'M');
      setDateOfBirth(studentToEdit.birth_date ?? studentToEdit.dateOfBirth ?? '2007-05-15');
      setRollNumber(studentToEdit.rollNumber ?? studentToEdit.matricule ?? '');
      setParentName(studentToEdit.parentName ?? studentToEdit.parent_name ?? '');
      setParentPhone(studentToEdit.parentPhone ?? studentToEdit.parent_phone ?? '');
      setParentEmail(studentToEdit.parentEmail ?? studentToEdit.parent_email ?? '');
      setAddress(studentToEdit.address ?? '');
      setAvatar(studentToEdit.avatar ?? studentToEdit.photo_url ?? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=80');
      setNotes(studentToEdit.notes ?? '');
    } else {
      setFirstName('');
      setLastName('');
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
    setSubmitError(null);
    setIsSubmitting(false);
  }, [studentToEdit, isOpen, classes]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!firstName.trim()) {
      newErrors.firstName = 'Le prénom est obligatoire.';
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = 'Le prénom doit comporter au moins 2 caractères.';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Le nom de famille est obligatoire.';
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = 'Le nom doit comporter au moins 2 caractères.';
    }
    if (!classId) {
      newErrors.classId = "Veuillez assigner une classe à l'élève.";
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Format d'adresse email invalide.";
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, classId: true, email: true });
    setSubmitError(null);

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    const selectedClass = classes.find((c) => c.id === classId);
    const fullEmail = email.trim() || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.eduglass.edu`;

    const studentPayload: Partial<Student> = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: fullEmail,
      class_id: classId || null,
      classId: classId || undefined,
      class_name: selectedClass?.name || null,
      className: selectedClass?.name || '',
      gender,
      birth_date: dateOfBirth || null,
      dateOfBirth: dateOfBirth || '2007-05-15',
      parentName: parentName.trim() || undefined,
      parent_name: parentName.trim() || undefined,
      parentPhone: parentPhone.trim() || undefined,
      parent_phone: parentPhone.trim() || undefined,
      parentEmail: parentEmail.trim() || undefined,
      parent_email: parentEmail.trim() || undefined,
      address: address.trim() || undefined,
      avatar: avatar || undefined,
      photo_url: avatar || undefined,
      status: 'active',
      notes: notes.trim() || undefined,
      rollNumber: rollNumber || undefined,
      matricule: rollNumber || undefined,
      admissionDate: new Date().toISOString().slice(0, 10),
    };

    try {
      if (studentToEdit) {
        const result = await updateStudent({
          ...studentToEdit,
          ...studentPayload,
          name: `${firstName.trim()} ${lastName.trim()}`,
          id: studentToEdit.id,
          attendanceRate: studentToEdit.attendanceRate ?? 96,
          averageGrade: studentToEdit.averageGrade ?? 15.0,
        });
        if (!result.success) {
          setSubmitError(result.error || 'Erreur lors de la modification.');
          setIsSubmitting(false);
          return;
        }
      } else {
        const result = await addStudent({
          ...studentPayload,
          name: `${firstName.trim()} ${lastName.trim()}`,
          attendanceRate: 96,
          averageGrade: 15.0,
        });
        if (!result.success) {
          setSubmitError(result.error || "Erreur lors de l'ajout de l'élève.");
          setIsSubmitting(false);
          return;
        }
      }
      onClose();
    } catch (err: any) {
      setSubmitError(err?.message || 'Une erreur inattendue est survenue.');
      setIsSubmitting(false);
    }
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

        {submitError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-gray-700">Prénom *</label>
                {touched.firstName && !errors.firstName && firstName.trim().length >= 2 && (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Valide
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (touched.firstName) {
                    setErrors((prev) => ({
                      ...prev,
                      firstName: !e.target.value.trim() ? 'Le prénom est obligatoire.' :
                        e.target.value.trim().length < 2 ? 'Au moins 2 caractères.' : undefined,
                    }));
                  }
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, firstName: true }))}
                placeholder="ex: Alexandre"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                  errors.firstName
                    ? 'bg-rose-50/50 border-2 border-rose-400 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-400/30'
                    : 'bg-white/90 border border-teal-900/10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00818c]/30'
                }`}
              />
              {errors.firstName && (
                <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{errors.firstName}</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-gray-700">Nom *</label>
                {touched.lastName && !errors.lastName && lastName.trim().length >= 2 && (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Valide
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (touched.lastName) {
                    setErrors((prev) => ({
                      ...prev,
                      lastName: !e.target.value.trim() ? 'Le nom est obligatoire.' :
                        e.target.value.trim().length < 2 ? 'Au moins 2 caractères.' : undefined,
                    }));
                  }
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, lastName: true }))}
                placeholder="ex: Dupont"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                  errors.lastName
                    ? 'bg-rose-50/50 border-2 border-rose-400 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-400/30'
                    : 'bg-white/90 border border-teal-900/10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00818c]/30'
                }`}
              />
              {errors.lastName && (
                <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{errors.lastName}</span>
                </div>
              )}
            </div>
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
                <option value="">— Choisir une classe —</option>
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
                      ? "Format d'adresse email invalide."
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
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#00818c] hover:bg-[#006e77] text-white font-bold rounded-xl shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enregistrement...' : studentToEdit ? 'Enregistrer' : 'Inscrire'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
