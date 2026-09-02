import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Printer, Download, Award, Sparkles, CheckCircle2, ShieldCheck, User } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ReportCardsView: React.FC = () => {
  const { students, classes, subjects, grades, selectedStudentId, setSelectedStudentId } = useSchool();

  const [selectedTerm, setSelectedTerm] = useState<string>('Trimestre 2');

  // Active student for report card (default to selected or first student)
  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const studentClass = classes.find((c) => c.id === currentStudent?.classId);

  // Student grades for this term
  const studentGrades = currentStudent
    ? grades.filter((g) => g.studentId === currentStudent.id && (g.term === selectedTerm || !g.term))
    : [];

  // Group grades by subject to compute subject averages
  const subjectRows = subjects.map((subj) => {
    const gradesForSubj = studentGrades.filter((g) => g.subjectId === subj.id);
    let avg = 0;
    if (gradesForSubj.length > 0) {
      const sum = gradesForSubj.reduce((acc, g) => acc + (g.score / g.maxScore) * 20, 0);
      avg = parseFloat((sum / gradesForSubj.length).toFixed(1));
    } else {
      // simulate realistic standard grade if not directly entered
      avg = Math.max(10, Math.min(19.5, parseFloat((currentStudent.averageGrade + (subj.coefficient % 3) - 1).toFixed(1))));
    }

    // Class average simulation for comparison
    const classAvg = 13.8;
    const minGrade = 9.5;
    const maxGrade = 19.5;

    let appreciation = 'Très bon investissement et régularité exemplaire.';
    if (avg >= 17) appreciation = 'Excellents résultats, rigueur et pertinence dans les analyses.';
    else if (avg >= 14) appreciation = 'Bon travail d’ensemble, participation active et constante.';
    else if (avg >= 11) appreciation = 'Ensemble convenable, persévérer pour consolider les acquis.';
    else appreciation = 'Résultats insuffisants, un travail plus approfondi est nécessaire.';

    return {
      subject: subj,
      grade: avg,
      coeff: subj.coefficient,
      weighted: parseFloat((avg * subj.coefficient).toFixed(1)),
      classAvg,
      minGrade,
      maxGrade,
      teacherName: subj.teacherName,
      appreciation,
    };
  });

  // Calculate student overall weighted average
  const totalWeighted = subjectRows.reduce((acc, r) => acc + r.weighted, 0);
  const totalCoeffs = subjectRows.reduce((acc, r) => acc + r.coeff, 0);
  const generalAverage = totalCoeffs > 0 ? (totalWeighted / totalCoeffs).toFixed(2) : '16.50';

  // Honors decision
  const numAvg = parseFloat(generalAverage);
  let honors = "Tableau d'Honneur";
  if (numAvg >= 16) honors = "Félicitations du Conseil de Classe";
  else if (numAvg >= 14) honors = "Compliments du Conseil de Classe";
  else if (numAvg >= 12) honors = "Encouragements";
  else honors = "Avertissement de travail";

  const handlePrint = () => {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
    window.print();
  };

  if (!currentStudent) {
    return <div className="p-8 text-center text-gray-500">Aucun élève trouvé.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Toolbar (No-Print) */}
      <div className="no-print glass-card rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Select Student */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Sélectionner l'Élève :
            </label>
            <select
              value={currentStudent.id}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3.5 py-2 bg-white/80 border border-teal-900/10 rounded-xl text-sm text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#00818c]/30"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.className})
                </option>
              ))}
            </select>
          </div>

          {/* Select Term */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Période :
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="px-3.5 py-2 bg-white/80 border border-teal-900/10 rounded-xl text-sm text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#00818c]/30"
            >
              <option value="Trimestre 1">Trimestre 1</option>
              <option value="Trimestre 2">Trimestre 2</option>
              <option value="Trimestre 3">Trimestre 3</option>
              <option value="Semestre 1">Semestre 1</option>
              <option value="Semestre 2">Semestre 2</option>
            </select>
          </div>
        </div>

        {/* Print & Download Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00818c] to-[#005f66] hover:from-[#006e77] hover:to-[#004e54] text-white rounded-xl font-bold text-sm shadow-md shadow-teal-800/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer le Bulletin (PDF)</span>
          </button>
        </div>
      </div>

      {/* Official Printable Academic Bulletin Document */}
      <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-lg border border-gray-200 text-gray-900 max-w-4xl mx-auto space-y-6">
        {/* School Header & Republic Emblem */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-5 border-b-2 border-teal-800 gap-4">
          <div className="text-center sm:text-left">
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
              RÉPUBLIQUE FRANÇAISE • MINISTÈRE DE L'ÉDUCATION NATIONALE
            </p>
            <h1 className="text-2xl font-extrabold text-[#0f2d30] font-heading tracking-tight mt-1">
              LYCÉE VICTOR HUGO
            </h1>
            <p className="text-xs text-gray-600">
              15 Boulevard des Invalides, 75007 Paris • Tél: +33 1 44 55 66 77
            </p>
          </div>

          <div className="text-center sm:text-right shrink-0">
            <span className="inline-block px-3 py-1 bg-teal-50 text-[#00818c] border border-teal-200 text-xs font-extrabold rounded-lg uppercase tracking-wider">
              {selectedTerm} • 2024-2025
            </span>
            <p className="text-[11px] font-semibold text-gray-500 mt-1">
              BULLETIN SCOLAIRE OFFICIEL
            </p>
          </div>
        </div>

        {/* Student Information Card in Bulletin */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
          <div className="flex items-center justify-center sm:justify-start">
            <img
              src={currentStudent.avatar}
              alt={currentStudent.name}
              className="w-20 h-20 rounded-xl object-cover ring-2 ring-teal-700/30 shadow-xs"
            />
          </div>
          <div className="sm:col-span-2 space-y-1 text-xs">
            <p className="text-base font-bold text-gray-900">{currentStudent.name}</p>
            <p className="text-gray-600">
              <strong>Matricule :</strong> {currentStudent.rollNumber}
            </p>
            <p className="text-gray-600">
              <strong>Né(e) le :</strong> {currentStudent.dateOfBirth}
            </p>
            <p className="text-gray-600">
              <strong>Classe :</strong> {currentStudent.className}
            </p>
          </div>
          <div className="space-y-1 text-xs text-right sm:border-l sm:border-gray-200 sm:pl-4">
            <p className="text-gray-500">Prof. Principal :</p>
            <p className="font-bold text-gray-900">{studentClass?.mainTeacherName}</p>
            <p className="text-gray-500 mt-2">Assiduité :</p>
            <p className="font-bold text-emerald-700">{currentStudent.attendanceRate}% (0 absence injustifiée)</p>
          </div>
        </div>

        {/* Grades Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-gray-800 font-bold border-b border-gray-300">
                <th className="border border-gray-300 p-2.5">Matières & Enseignants</th>
                <th className="border border-gray-300 p-2.5 text-center w-16">Coeff.</th>
                <th className="border border-gray-300 p-2.5 text-center w-24 bg-teal-50 text-[#00818c]">
                  Note Élève
                </th>
                <th className="border border-gray-300 p-2.5 text-center w-20 text-gray-600">Moy. Classe</th>
                <th className="border border-gray-300 p-2.5 text-center w-20 text-gray-600">Min / Max</th>
                <th className="border border-gray-300 p-2.5">Appréciations des Professeurs</th>
              </tr>
            </thead>
            <tbody>
              {subjectRows.map((row) => (
                <tr key={row.subject.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2.5">
                    <p className="font-bold text-gray-900">{row.subject.name}</p>
                    <p className="text-[10px] text-gray-500">{row.teacherName}</p>
                  </td>
                  <td className="border border-gray-300 p-2.5 text-center font-bold">
                    {row.coeff}
                  </td>
                  <td className="border border-gray-300 p-2.5 text-center font-black text-sm text-[#00818c] bg-teal-50/50">
                    {row.grade.toFixed(1)}
                  </td>
                  <td className="border border-gray-300 p-2.5 text-center text-gray-600">
                    {row.classAvg}
                  </td>
                  <td className="border border-gray-300 p-2.5 text-center text-[11px] text-gray-500">
                    {row.minGrade} / {row.maxGrade}
                  </td>
                  <td className="border border-gray-300 p-2.5 italic text-gray-700">
                    {row.appreciation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Council Summary, Average, Honors and Signatures */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* General Average & Total Points */}
          <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 text-center space-y-1">
            <p className="text-xs font-bold text-gray-600 uppercase">Moyenne Générale</p>
            <p className="text-3xl font-black text-[#00818c] font-heading">{generalAverage} <span className="text-sm font-normal text-gray-500">/ 20</span></p>
            <p className="text-[11px] text-gray-500">
              Total points : <strong>{totalWeighted.toFixed(1)}</strong> (Coeffs: {totalCoeffs})
            </p>
          </div>

          {/* Honors & Council decision */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 text-center space-y-1">
            <p className="text-xs font-bold text-gray-600 uppercase">Distinction du Conseil</p>
            <div className="inline-flex items-center gap-1 text-sm font-extrabold text-amber-800 mt-1">
              <Award className="w-4 h-4 text-amber-600" />
              <span>{honors}</span>
            </div>
            <p className="text-[11px] text-amber-900/80 italic mt-1">
              "Félicitations unanimes de l'équipe pédagogique pour la qualité du travail."
            </p>
          </div>

          {/* Official Signature Stamp */}
          <div className="p-4 rounded-xl border border-gray-300 text-center flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-600 uppercase">Le Proviseur</p>
              <p className="text-[10px] text-gray-400">Cachet & Signature officielle</p>
            </div>
            <div className="my-2 py-1 font-serif italic text-sm text-teal-900 border-b border-dashed border-gray-400">
              Dr. Claire Vasseur
            </div>
            <p className="text-[9px] text-gray-400">Fait à Paris, le {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
