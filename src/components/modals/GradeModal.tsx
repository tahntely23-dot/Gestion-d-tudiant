import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { GradeType, TermPeriod } from '../../types';
import confetti from 'canvas-confetti';
import { AlertCircle } from 'lucide-react';

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GradeModal: React.FC<GradeModalProps> = ({ isOpen, onClose }) => {
  const { students, subjects, classes, addGrade } = useSchool();

  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [type, setType] = useState<GradeType>('Exam');
  const [score, setScore] = useState<string>('16');
  const [maxScore, setMaxScore] = useState<string>('20');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [term, setTerm] = useState<TermPeriod>('Trimestre 2');
  const [comment, setComment] = useState('');

  // Field alert state
  const [errors, setErrors] = useState<{ score?: string; student?: string; subject?: string }>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === studentId);
    const subject = subjects.find((s) => s.id === subjectId);

    const numScore = parseFloat(score);
    const numMax = parseFloat(maxScore) || 20;

    const newErrors: { score?: string; student?: string; subject?: string } = {};

    if (!student) {
      newErrors.student = 'Veuillez sélectionner un élève.';
    }
    if (!subject) {
      newErrors.subject = 'Veuillez sélectionner une matière.';
    }
    if (isNaN(numScore) || numScore < 0 || numScore > numMax) {
      newErrors.score = `La note doit être comprise entre 0 et ${numMax}.`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!student || !subject) return;

    addGrade({
      studentId,
      studentName: student.name,
      subjectId,
      subjectName: subject.name,
      classId: student.classId,
      type,
      score: numScore,
      maxScore: numMax,
      date,
      term,
      comment,
    });

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg font-heading">
            Saisir une Nouvelle Note
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
            <label className="block font-semibold text-gray-700 mb-1">Élève *</label>
            <select
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                setErrors((prev) => ({ ...prev, student: undefined }));
              }}
              className="w-full px-3.5 py-2.5 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30 text-gray-900"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.className})
                </option>
              ))}
            </select>
            {errors.student && (
              <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{errors.student}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Matière *</label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setErrors((prev) => ({ ...prev, subject: undefined }));
              }}
              className="w-full px-3.5 py-2.5 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30 text-gray-900"
            >
              {subjects.map((subj) => (
                <option key={subj.id} value={subj.id}>
                  {subj.name} (Coeff {subj.coefficient})
                </option>
              ))}
            </select>
            {errors.subject && (
              <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{errors.subject}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Type d'Évaluation</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as GradeType)}
                className="w-full px-3.5 py-2.5 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30 text-gray-900"
              >
                <option value="Exam">Examen / DS</option>
                <option value="Devoir">Devoir Maison</option>
                <option value="Quiz">Interrogation / Quiz</option>
                <option value="Projet">Projet Pratique</option>
                <option value="Contrôle Continu">Contrôle Continu</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Période</label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value as TermPeriod)}
                className="w-full px-3.5 py-2.5 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30 text-gray-900"
              >
                <option value="Trimestre 1">Trimestre 1</option>
                <option value="Trimestre 2">Trimestre 2</option>
                <option value="Trimestre 3">Trimestre 3</option>
                <option value="Semestre 1">Semestre 1</option>
                <option value="Semestre 2">Semestre 2</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">Note Obtenue *</label>
              <input
                type="number"
                step="0.25"
                min="0"
                max={maxScore}
                required
                value={score}
                onChange={(e) => {
                  setScore(e.target.value);
                  const val = parseFloat(e.target.value);
                  const maxVal = parseFloat(maxScore) || 20;
                  if (isNaN(val) || val < 0 || val > maxVal) {
                    setErrors((prev) => ({
                      ...prev,
                      score: `Note entre 0 et ${maxVal} requise.`,
                    }));
                  } else {
                    setErrors((prev) => ({ ...prev, score: undefined }));
                  }
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  errors.score
                    ? 'bg-rose-50/50 border-2 border-rose-400 text-rose-900'
                    : 'bg-white/90 border border-teal-900/10 text-[#00818c] focus:ring-2 focus:ring-[#00818c]/30'
                }`}
              />
              {errors.score && (
                <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{errors.score}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Barème</label>
              <input
                type="number"
                min="5"
                max="100"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30 text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Date de l'évaluation</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30 text-gray-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Appréciation / Commentaire</label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="ex: Excellent travail de démonstration, très rigoureux..."
              className="w-full px-3.5 py-2.5 bg-white/90 border border-teal-900/10 rounded-xl text-sm focus:ring-2 focus:ring-[#00818c]/30 text-gray-900"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#00818c] hover:bg-[#006e77] text-white font-bold rounded-xl shadow-md cursor-pointer"
            >
              Enregistrer la note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
