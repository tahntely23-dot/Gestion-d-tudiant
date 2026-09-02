import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  isSupabaseConfigured,
  testSupabaseDatabaseConnection,
  SUPABASE_FULL_SCHEMA_SQL,
  SUPABASE_PROFILES_SQL,
  supabase,
} from '../../lib/supabase';
import {
  Settings,
  Save,
  RotateCcw,
  Download,
  Sparkles,
  Shield,
  Building2,
  Bell,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Server,
  Layers,
  Code2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SettingsView: React.FC = () => {
  const { resetToDefaults, students, classes, subjects, grades, teachers } = useSchool();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [schoolName, setSchoolName] = useState('Lycée Victor Hugo');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [currentTerm, setCurrentTerm] = useState('Trimestre 2');
  const [headmaster, setHeadmaster] = useState('Dr. Claire Vasseur');
  const [address, setAddress] = useState('15 Boulevard des Invalides, 75007 Paris');
  const [phone, setPhone] = useState('+33 1 44 55 66 77');
  const [email, setEmail] = useState('direction@lycee-victorhugo.fr');

  // Supabase Connection States
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{
    tested: boolean;
    success: boolean;
    latency?: number;
    error?: string;
    details?: string;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncingData, setIsSyncingData] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    confetti({ particleCount: 30, spread: 50 });
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = () => {
    const backup = {
      schoolName,
      academicYear,
      currentTerm,
      headmaster,
      address,
      phone,
      email,
      exportedAt: new Date().toISOString(),
      students,
      classes,
      subjects,
      grades,
      teachers,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `eduglass_school_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleReset = () => {
    if (confirm('Attention : Cela va réinitialiser toutes les données par défaut. Continuer ?')) {
      resetToDefaults();
      window.location.reload();
    }
  };

  // Test real-time Supabase connection
  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    setSupabaseTestResult(null);

    const result = await testSupabaseDatabaseConnection();
    setIsTestingSupabase(false);

    if (result.connected) {
      setSupabaseTestResult({
        tested: true,
        success: true,
        latency: result.latencyMs,
        details: `Connecté à ${result.url}. Tables disponibles avec accès RLS validé.`,
      });
      confetti({ particleCount: 40, spread: 60 });
    } else {
      setSupabaseTestResult({
        tested: true,
        success: false,
        latency: result.latencyMs,
        error: result.error || 'Connexion non établie.',
      });
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_FULL_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Sync data to Supabase
  const handleSyncToSupabase = async () => {
    if (!isSupabaseConfigured || !supabase) {
      alert("Veuillez d'abord configurer vos variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.");
      return;
    }

    setIsSyncingData(true);
    setSyncStatus('Synchronisation des classes et élèves...');

    try {
      // 1. Sync Classes
      for (const cls of classes) {
        await supabase.from('classes').upsert({
          id: cls.id,
          name: cls.name,
          grade_level: cls.gradeLevel,
          room: cls.room,
          main_teacher_id: cls.mainTeacherId,
          student_count: cls.studentCount,
          created_at: new Date().toISOString(),
        });
      }

      // 2. Sync Students
      setSyncStatus('Synchronisation des fiches élèves...');
      for (const st of students) {
        await supabase.from('students').upsert({
          id: st.id,
          first_name: st.firstName,
          last_name: st.lastName,
          email: st.email,
          class_id: st.classId,
          class_name: st.className,
          birth_date: st.birthDate,
          avatar: st.avatar,
          gender: st.gender,
          parent_name: st.parentName,
          parent_phone: st.parentPhone,
          parent_email: st.parentEmail,
          address: st.address,
          enrollment_date: st.enrollmentDate,
          created_at: new Date().toISOString(),
        });
      }

      // 3. Sync Grades
      setSyncStatus('Synchronisation du carnet de notes...');
      for (const gr of grades) {
        await supabase.from('grades').upsert({
          id: gr.id,
          student_id: gr.studentId,
          subject_id: gr.subjectId,
          value: gr.value,
          max_value: gr.maxValue,
          coefficient: gr.coefficient,
          date: gr.date,
          type: gr.type,
          comment: gr.comment,
          period: gr.period,
          created_at: new Date().toISOString(),
        });
      }

      setSyncStatus('Synchronisation terminée avec succès !');
      confetti({ particleCount: 50, spread: 70 });
      setTimeout(() => setSyncStatus(null), 3500);
    } catch (e: any) {
      setSyncStatus(`Erreur de synchronisation : ${e?.message || 'Vérifiez vos tables Supabase'}`);
    } finally {
      setIsSyncingData(false);
    }
  };

  const configuredUrl = import.meta.env.VITE_SUPABASE_URL || 'https://votre-projet.supabase.co';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-heading">
            Paramètres & Connexion Base de Données
          </h2>
          <p className="text-xs text-gray-500">
            Personnalisation de l'établissement et configuration de Supabase Database
          </p>
        </div>
      </div>

      {/* SUPABASE DATABASE CARD */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/90 shadow-xl space-y-5 bg-gradient-to-br from-white/90 via-teal-50/20 to-emerald-50/30">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00818c] to-emerald-400 flex items-center justify-center text-white shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-gray-900 text-sm font-heading">
                  Connexion Base de Données Supabase (PostgreSQL)
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                    isSupabaseConfigured
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  {isSupabaseConfigured ? 'Supabase Connecté' : 'Mode Sandbox / Non Configuré'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                URL active : <code className="text-xs font-mono text-[#00818c]">{configuredUrl}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestSupabase}
              disabled={isTestingSupabase}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 shadow-2xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#00818c] ${isTestingSupabase ? 'animate-spin' : ''}`} />
              <span>{isTestingSupabase ? 'Test en cours...' : 'Tester la connexion'}</span>
            </button>
          </div>
        </div>

        {/* Diagnostic Test Result */}
        {supabaseTestResult && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
              supabaseTestResult.success
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}
          >
            {supabaseTestResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <p className="font-bold">
                {supabaseTestResult.success
                  ? `Connexion réussie (${supabaseTestResult.latency} ms)`
                  : 'Diagnostic de connexion'}
              </p>
              <p className="text-[11px] text-gray-700">
                {supabaseTestResult.details || supabaseTestResult.error}
              </p>
            </div>
          </div>
        )}

        {/* 3 Step Guide */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Comment connecter votre projet Supabase en 3 étapes :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/80 border border-gray-200/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#00818c] text-white text-[11px] font-black flex items-center justify-center">
                  1
                </span>
                <span className="text-xs font-bold text-gray-900">Créer le projet</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Rendez-vous sur <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#00818c] font-bold underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-2.5 h-2.5" /></a> et créez une nouvelle base PostgreSQL gratuite.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 border border-gray-200/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#00818c] text-white text-[11px] font-black flex items-center justify-center">
                  2
                </span>
                <span className="text-xs font-bold text-gray-900">Copier les Clés</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Dans <strong>Project Settings &gt; API</strong>, copiez <code>Project URL</code> et <code>anon public key</code> dans vos variables d'environnement.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 border border-gray-200/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#00818c] text-white text-[11px] font-black flex items-center justify-center">
                  3
                </span>
                <span className="text-xs font-bold text-gray-900">Exécuter le SQL</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Dans <strong>SQL Editor</strong>, collez et exécutez le script ci-dessous pour créer les tables et les règles RLS.
              </p>
            </div>
          </div>
        </div>

        {/* SQL Script & Actions */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-[#00818c]" />
              Schéma SQL complet (Profiles, Élèves, Classes, Notes, RLS)
            </span>
            <button
              type="button"
              onClick={handleCopySql}
              className="px-3 py-1.5 bg-[#00818c] hover:bg-[#006e77] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copié dans le presse-papier !' : 'Copier le script SQL'}</span>
            </button>
          </div>

          <pre className="p-3.5 rounded-2xl bg-slate-900 text-teal-300 font-mono text-[11px] overflow-x-auto border border-slate-800 max-h-48 leading-relaxed">
            {SUPABASE_FULL_SCHEMA_SQL}
          </pre>
        </div>

        {/* Sync Data to Supabase Button */}
        {isSupabaseConfigured && (
          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs text-gray-600">
              {syncStatus && <span className="text-[#00818c] font-bold">{syncStatus}</span>}
            </div>
            <button
              type="button"
              onClick={handleSyncToSupabase}
              disabled={isSyncingData}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingData ? 'animate-spin' : ''}`} />
              <span>{isSyncingData ? 'Synchronisation...' : 'Synchroniser les données vers Supabase'}</span>
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* School Profile Card */}
        <div className="glass-card rounded-2xl p-6 border border-white/80 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Building2 className="w-5 h-5 text-[#00818c]" />
            <h3 className="font-bold text-gray-900 text-sm">Informations de l'Établissement</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Nom de l'Établissement</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3.5 py-2 bg-white/80 border border-teal-900/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00818c]/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Proviseur / Chef d'établissement</label>
              <input
                type="text"
                value={headmaster}
                onChange={(e) => setHeadmaster(e.target.value)}
                className="w-full px-3.5 py-2 bg-white/80 border border-teal-900/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00818c]/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Année Académique</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2 bg-white/80 border border-teal-900/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00818c]/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Période Active</label>
              <select
                value={currentTerm}
                onChange={(e) => setCurrentTerm(e.target.value)}
                className="w-full px-3.5 py-2 bg-white/80 border border-teal-900/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00818c]/30"
              >
                <option value="Trimestre 1">Trimestre 1</option>
                <option value="Trimestre 2">Trimestre 2</option>
                <option value="Trimestre 3">Trimestre 3</option>
                <option value="Semestre 1">Semestre 1</option>
                <option value="Semestre 2">Semestre 2</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Adresse</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 bg-white/80 border border-teal-900/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00818c]/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email Direction</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-white/80 border border-teal-900/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00818c]/30"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#00818c] hover:bg-[#006e77] text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{savedSuccess ? 'Modifications enregistrées !' : 'Enregistrer les paramètres'}</span>
          </button>
        </div>
      </form>

      {/* Database Management & Backups */}
      <div className="glass-card rounded-2xl p-6 border border-white/80 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Shield className="w-5 h-5 text-[#00818c]" />
          <h3 className="font-bold text-gray-900 text-sm">Gestion des Données & Sauvegardes</h3>
        </div>

        <p className="text-xs text-gray-600">
          Vous pouvez exporter l'intégralité de la base de données (élèves, classes, notes, enseignants, emplois du temps) au format JSON ou réinitialiser le système.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-[#00818c] text-xs font-bold rounded-xl transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Exporter la Sauvegarde JSON</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Réinitialiser les données d'exemple</span>
          </button>
        </div>
      </div>
    </div>
  );
};

