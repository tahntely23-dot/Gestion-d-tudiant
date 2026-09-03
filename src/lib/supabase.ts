
import { createClient, User, Session, AuthError } from '@supabase/supabase-js';

import { UserProfile, AuthUser, Student } from '../types';



// Environment variables (Safe public keys only - NO service_role on frontend)

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;



if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {

  console.error('[Supabase Config] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment variables.');

}



export const supabase = createClient(

  SUPABASE_URL || '',

  SUPABASE_ANON_KEY || ''

);



export const isSupabaseConfigured = Boolean(

  SUPABASE_URL &&

  SUPABASE_ANON_KEY &&

  !SUPABASE_URL.includes('your-project') &&

  !SUPABASE_ANON_KEY.includes('your-anon')

);



/**

 * Format and translate Supabase Auth errors into clear, human-friendly French messages

 */

export function formatSupabaseAuthError(error: any): string {

  if (!error) return 'Une erreur inconnue est survenue.';



  const message = error.message || error.error_description || String(error);

  const code = error.code || '';



  if (

    code === 'invalid_credentials' ||

    message.includes('Invalid login credentials') ||

    message.includes('invalid login credentials') ||

    message.includes('invalid_grant')

  ) {

    return 'Adresse email ou mot de passe incorrect.';

  }



  if (

    code === 'email_not_confirmed' ||

    message.includes('Email not confirmed') ||

    message.includes('email_not_confirmed')

  ) {

    return "Adresse email non confirmée. Un email de confirmation vous a été envoyé lors de l'inscription. Veuillez vérifier votre boîte de réception avant de vous connecter.";

  }



  if (

    code === 'user_already_exists' ||

    message.includes('User already registered') ||

    message.includes('already registered') ||

    message.includes('already exists')

  ) {

    return 'Cette adresse email est déjà enregistrée. Veuillez vous connecter ou réinitialiser votre mot de passe.';

  }



  if (

    code === 'weak_password' ||

    message.includes('Password should be at least') ||

    message.includes('password is too short')

  ) {

    return 'Le mot de passe doit comporter au moins 6 caractères.';

  }



  if (

    code === 'email_address_invalid' ||

    message.includes('Email address') && message.includes('is invalid')

  ) {

    return "Format d'adresse email invalide ou domaine non autorisé.";

  }



  if (

    code === 'over_email_send_rate_limit' ||

    code === 'over_request_rate_limit' ||

    error.status === 429 ||

    message.includes('rate limit') ||

    message.includes('Too many requests')

  ) {

    return 'Limite d’envoi d’emails atteinte par le serveur Supabase. Veuillez patienter quelques minutes avant de réessayer.';

  }



  return message;

}



/**

 * Converts a UserProfile into application's AuthUser representation

 */

export function profileToAuthUser(profile: UserProfile): AuthUser {

  const role = (profile.role === 'admin' || profile.role === 'direction' || profile.role === 'teacher' || profile.role === 'student' || profile.role === 'staff')

    ? profile.role

    : 'user';



  const roleLabelMap: Record<string, string> = {

    user: 'Utilisateur / Élève',

    admin: 'Administrateur',

    direction: 'Proviseure / Direction',

    teacher: 'Enseignant',

    student: 'Élève / Étudiant',

    staff: 'Vie Scolaire / Personnel',

  };



  return {

    id: profile.id,

    name: profile.full_name,

    email: profile.email,

    role: role,

    roleLabel: roleLabelMap[profile.role] || 'Utilisateur',

    avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',

    title: profile.role === 'user' ? 'Compte Membre' : 'Personnel Établissement',

    department: 'Lycée Victor Hugo',

    provider: profile.provider,

  };

}



/**

 * Ensures a user has a profile in `profiles`.

 * Creates the record if it doesn't exist.

 * Rule: Default role is strictly 'user'. NEVER auto-admin or auto-teacher on signup.

 */

export async function syncOrCreateProfile(user: {

  id: string;

  email?: string;

  user_metadata?: Record<string, any>;

  app_metadata?: Record<string, any>;

  provider?: 'google' | 'facebook' | 'email';

}): Promise<UserProfile> {

  const email = (user.email || '').toLowerCase().trim();

  const rawName = user.user_metadata?.full_name ||

    user.user_metadata?.name ||

    user.user_metadata?.given_name ||

    (email ? email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Utilisateur');



  const rawAvatar = user.user_metadata?.avatar_url ||

    user.user_metadata?.picture ||

    `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`;



  const provider = user.provider ||

    (user.app_metadata?.provider as ('google' | 'facebook' | 'email')) ||

    (user.user_metadata?.provider as ('google' | 'facebook' | 'email')) ||

    'email';



  const defaultProfile: UserProfile = {

    id: user.id,

    full_name: rawName,

    email: email,

    avatar_url: rawAvatar,

    role: 'user', // STRICT: Default role must always be 'user'

    created_at: new Date().toISOString(),

    provider: provider,

  };



  if (!supabase || !isSupabaseConfigured) {

    return defaultProfile;

  }



  try {

    // 1. Check if profile exists by ID in Supabase

    const { data: existingProfile, error: fetchErr } = await supabase

      .from('profiles')

      .select('*')

      .eq('id', user.id)

      .maybeSingle();



    if (existingProfile && !fetchErr) {

      return existingProfile as UserProfile;

    }



    // 2. If not found, insert/upsert new profile with role = 'user'

    const { data: inserted, error: insertErr } = await supabase

      .from('profiles')

      .upsert(defaultProfile)

      .select()

      .maybeSingle();



    if (inserted && !insertErr) {

      console.log('[Supabase Profiles] Profil synchronisé avec succès pour user:', user.id);

      return inserted as UserProfile;

    }



    if (insertErr) {

      console.warn('[Supabase Profiles] Notice upsert profil:', insertErr.message);

    }

  } catch (err: any) {

    console.warn('[Supabase Profiles] Exception synchronisation profil:', err.message || err);

  }



  return defaultProfile;

}



/**

 * Execute OAuth Sign-In (Google or Facebook) with Supabase Auth

 */

export async function signInWithOAuthProvider(provider: 'google' | 'facebook'): Promise<{

  success: boolean;

  error?: string;

}> {

  if (!supabase || !isSupabaseConfigured) {

    return { success: false, error: 'Client Supabase non configuré.' };

  }



  try {

    console.log(`[Supabase Auth] Démarrage OAuth ${provider}...`);

    const { error } = await supabase.auth.signInWithOAuth({

      provider: provider,

      options: {

        redirectTo: window.location.origin,

      },

    });



    if (error) {

      console.error(`[Supabase Auth] Erreur OAuth ${provider}:`, error.message);

      return { success: false, error: formatSupabaseAuthError(error) };

    }



    return { success: true };

  } catch (e: any) {

    console.error(`[Supabase Auth] Exception OAuth ${provider}:`, e);

    return { success: false, error: formatSupabaseAuthError(e) };

  }

}



/**

 * Sign in with Email and Password using Supabase Auth

 */

export async function signInWithEmailPassword(

  email: string,

  password: string

): Promise<{ success: boolean; error?: string; user?: AuthUser }> {

  const cleanEmail = email.trim().toLowerCase();



  if (!supabase || !isSupabaseConfigured) {

    return { success: false, error: 'Client Supabase non configuré.' };

  }



  try {

    console.log('[Supabase Auth] signInWithPassword appelé pour:', cleanEmail);

    const { data, error } = await supabase.auth.signInWithPassword({

      email: cleanEmail,

      password: password,

    });



    if (error) {

      console.error('[Supabase Auth] Échec signInWithPassword:', error.message, error.status);

      return { success: false, error: formatSupabaseAuthError(error) };

    }



    if (data?.user && data?.session) {

      console.log('[Supabase Auth] Connexion réussie, session active reçue pour user:', data.user.id);

      const profile = await syncOrCreateProfile(data.user);

      const authUser = profileToAuthUser(profile);

      return { success: true, user: authUser };

    }



    return { success: false, error: 'Session non obtenue. Veuillez vérifier vos identifiants.' };

  } catch (e: any) {

    console.error('[Supabase Auth] Exception signInWithPassword:', e);

    return { success: false, error: formatSupabaseAuthError(e) };

  }

}



/**

 * Sign Up with Email and Password using Supabase Auth

 */

export async function signUpWithEmailPassword(

  email: string,

  password: string,

  fullName: string

): Promise<{ success: boolean; error?: string; needsConfirmation?: boolean; user?: AuthUser }> {

  const cleanEmail = email.trim().toLowerCase();

  const cleanName = fullName.trim();



  if (!supabase || !isSupabaseConfigured) {

    return { success: false, error: 'Client Supabase non configuré.' };

  }



  try {

    console.log('[Supabase Auth] signUp appelé pour:', cleanEmail);

    const { data, error } = await supabase.auth.signUp({

      email: cleanEmail,

      password: password,

      options: {

        data: {

          full_name: cleanName,

          avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,

        },

      },

    });



    if (error) {

      console.error('[Supabase Auth] Échec signUp:', error.message, error.status);

      return { success: false, error: formatSupabaseAuthError(error) };

    }



    console.log('[Supabase Auth] Réponse signUp:', {

      userId: data?.user?.id,

      hasSession: Boolean(data?.session),

      identitiesCount: data?.user?.identities?.length,

      confirmationSentAt: data?.user?.confirmation_sent_at,

    });



    // Check if user already exists (Supabase sometimes returns user with empty identities when user already registered)

    if (data?.user && data?.user?.identities && data.user.identities.length === 0) {

      return {

        success: false,

        error: 'Cette adresse email est déjà enregistrée. Veuillez vous connecter ou réinitialiser votre mot de passe.',

      };

    }



    if (data?.user) {

      // Case 1: Session is null -> Email confirmation is required by Supabase project

      if (!data.session) {

        console.log('[Supabase Auth] Inscription réussie : Confirmation email requise.');

        return {

          success: true,

          needsConfirmation: true,

        };

      }



      // Case 2: Session is returned immediately -> User is authenticated

      console.log('[Supabase Auth] Inscription réussie : Session immédiate pour user:', data.user.id);

      const profile = await syncOrCreateProfile(data.user);

      const authUser = profileToAuthUser(profile);

      return {

        success: true,

        needsConfirmation: false,

        user: authUser,

      };

    }



    return { success: false, error: 'Erreur inattendue lors de la création du compte.' };

  } catch (e: any) {

    console.error('[Supabase Auth] Exception signUp:', e);

    return { success: false, error: formatSupabaseAuthError(e) };

  }

}



/**

 * Request Password Reset Email via Supabase Auth

 */

export async function resetPasswordForEmail(email: string): Promise<{ success: boolean; error?: string }> {

  const cleanEmail = email.trim().toLowerCase();



  if (!supabase || !isSupabaseConfigured) {

    return { success: false, error: 'Client Supabase non configuré.' };

  }



  try {

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {

      redirectTo: window.location.origin,

    });

    if (error) {

      return { success: false, error: formatSupabaseAuthError(error) };

    }

    return { success: true };

  } catch (e: any) {

    return { success: false, error: formatSupabaseAuthError(e) };

  }

}



/**

 * Sign Out handler using Supabase Auth

 */

export async function signOutSupabase(): Promise<void> {

  if (supabase && isSupabaseConfigured) {

    try {

      console.log('[Supabase Auth] Déconnexion en cours...');

      await supabase.auth.signOut();

      console.log('[Supabase Auth] Déconnexion effectuée.');

    } catch (e) {

      console.warn('[Supabase Auth] Erreur lors de la déconnexion :', e);

    }

  }

}



/**

 * Maps a raw Supabase PostgreSQL row from public.students to the frontend Student model

 */

export function mapSupabaseToStudent(row: any): Student {

  const firstName = row.first_name || '';

  const lastName = row.last_name || '';

  const fullName = (firstName || lastName)

    ? `${firstName} ${lastName}`.trim()

    : (row.name || 'Élève');



  // La colonne réelle dans public.students est "avatar" (pas photo_url)

  const avatarUrl = row.avatar || row.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';

  // matricule n'est pas une colonne de students — on le reconstruit pour la compatibilité UI

  const matricule = row.matricule || row.rollNumber || `MAT-${row.id ? String(row.id).slice(0, 6).toUpperCase() : '001'}`;

  const className = row.class_name || row.className || 'Non assigné';

  const birthDate = row.birth_date || row.dateOfBirth || null;



  return {

    id: String(row.id),

    matricule: matricule,

    first_name: firstName,

    last_name: lastName,

    name: fullName,

    birth_date: birthDate,

    birth_place: row.birth_place || '',

    gender: (row.gender === 'F' ? 'F' : row.gender === 'Autre' ? 'Autre' : 'M'),

    email: row.email || '',

    phone: row.phone || row.parent_phone || '',

    address: row.address || '',

    // photo_url est un alias UI — pointe vers la colonne "avatar" de Supabase

    photo_url: avatarUrl,

    class_name: className,

    academic_year: row.academic_year || '2024-2025',

    enrollment_date: row.enrollment_date || row.admissionDate || new Date().toISOString().slice(0, 10),

    status: (row.status === 'inactive' || row.status === 'graduated' || row.status === 'suspended') ? row.status : 'active',

    created_at: row.created_at || new Date().toISOString(),

    updated_at: row.updated_at || new Date().toISOString(),



    // Backward-compatibility aliases for existing UI components

    className: className,

    avatar: avatarUrl,

    rollNumber: matricule,

    dateOfBirth: birthDate || '2007-05-15',

    classId: row.class_id || row.classId || '',

    parentName: row.parent_name || row.parentName || '',

    parentPhone: row.parent_phone || row.parentPhone || '',

    parentEmail: row.parent_email || row.parentEmail || '',

    admissionDate: row.enrollment_date || row.admissionDate || '2024-09-01',

    attendanceRate: typeof row.attendance_rate === 'number' ? row.attendance_rate : (typeof row.attendanceRate === 'number' ? row.attendanceRate : 96),

    averageGrade: typeof row.average_grade === 'number' ? row.average_grade : (typeof row.averageGrade === 'number' ? row.averageGrade : 15.0),

    notes: row.notes || '',

  };

}



/**

 * Prepares a Student object for insertion or update into public.students

 *

 * Colonnes réelles confirmées de public.students (par introspection) :

 *   id, first_name, last_name, email, class_name, birth_date, birth_place,

 *   gender, phone, photo_url, address, enrollment_date, academic_year,

 *   status, matricule, created_at

 *

 * Colonnes ABSENTES (ne jamais envoyer) :

 *   class_id, avatar, parent_name, parent_phone, parent_email, rollNumber, notes

 */

export function mapStudentToSupabasePayload(student: Partial<Student>): Record<string, any> {

  let firstName = student.first_name || '';

  let lastName = student.last_name || '';



  // Fallback : extraire prénom/nom depuis le champ name

  if (!firstName && !lastName && student.name) {

    const parts = student.name.trim().split(/\s+/);

    firstName = parts[0] || '';

    lastName = parts.slice(1).join(' ') || '';

  }



  // Payload contenant UNIQUEMENT les colonnes existantes dans public.students

  const payload: Record<string, any> = {

    matricule: student.matricule || student.rollNumber || `MAT-${Date.now().toString().slice(-6)}`,

    first_name: firstName || 'Élève',

    last_name: lastName || '',

    birth_date: student.birth_date || student.dateOfBirth || null,

    birth_place: student.birth_place || null,

    gender: student.gender || 'M',

    email: student.email ? student.email.trim().toLowerCase() : null,

    // La colonne photo de la vraie table s'appelle "photo_url"

    photo_url: student.photo_url || student.avatar || null,

    // La colonne téléphone s'appelle "phone" (pas parent_phone)

    phone: student.phone || student.parentPhone || student.parent_phone || null,

    class_name: student.class_name || student.className || null,

    academic_year: student.academic_year || '2024-2025',

    enrollment_date: student.enrollment_date || student.admissionDate || new Date().toISOString().slice(0, 10),

    status: student.status || 'active',

    address: student.address || null,

  };



  return payload;

}



/**

 * Fetch all students from Supabase PostgreSQL (public.students)

 */

export async function fetchStudentsFromSupabase(): Promise<{

  success: boolean;

  data: Student[];

  error?: string;

}> {

  if (!supabase || !isSupabaseConfigured) {

    return { success: false, data: [], error: 'Client Supabase non configuré.' };

  }



  try {

    const { data, error } = await supabase

      .from('students')

      .select('*')

      .order('created_at', { ascending: false });



    if (error) {

      console.error('[STUDENT FETCH ERROR]', error);

      return { success: false, data: [], error: formatSupabaseAuthError(error) };

    }



    const students = (data || []).map(mapSupabaseToStudent);

    return { success: true, data: students };

  } catch (err: any) {

    console.error('[STUDENT FETCH EXCEPTION]', err);

    return { success: false, data: [], error: err?.message || 'Erreur lors du chargement des élèves.' };

  }

}



/**

 * Create a new student in Supabase PostgreSQL (public.students)

 */

export async function createStudentInSupabase(studentData: Partial<Student>): Promise<{

  success: boolean;

  data?: Student;

  error?: string;

}> {

  if (!supabase || !isSupabaseConfigured) {

    return { success: false, error: 'Client Supabase non configuré.' };

  }



  try {

    // Vérification de l'authentification (RLS exige auth.role() = 'authenticated')

    const { data: { user }, error: authError } = await supabase.auth.getUser();



    if (authError || !user) {

      console.warn('[STUDENT INSERT] Aucun utilisateur authentifié', authError);

      return {

        success: false,

        error: 'Vous devez être connecté pour ajouter un élève.',

      };

    }



    // Extraire prénom et nom depuis les données du formulaire

    let firstName = (studentData.first_name || '').trim();

    let lastName = (studentData.last_name || '').trim();



    // Si le formulaire a passé un champ "name" combiné, on le découpe

    if (!firstName && !lastName && studentData.name) {

      const parts = studentData.name.trim().split(/\s+/);

      firstName = parts[0] || '';

      lastName = parts.slice(1).join(' ') || '';

    }



    if (!firstName) {

      return { success: false, error: 'Le prénom de l’élève est obligatoire.' };

    }



    if (!lastName) {

      return { success: false, error: 'Le nom de famille de l’élève est obligatoire.' };

    }



    // Payload contenant UNIQUEMENT les colonnes réelles de public.students

    // Confirmé par introspection du schéma Supabase :

    // PRESENT : id, first_name, last_name, email, class_name, birth_date, birth_place,

    //           gender, phone, photo_url, address, enrollment_date, academic_year,

    //           status, matricule, created_at

    // ABSENT  : class_id, avatar, parent_name, parent_phone, parent_email, rollNumber, notes

    const databasePayload: Record<string, string | null> = {

      id: studentData.id || crypto.randomUUID(),

      matricule: studentData.matricule || studentData.rollNumber || `MAT-${Date.now().toString().slice(-6)}`,

      first_name: firstName,

      last_name: lastName,

      email: studentData.email ? studentData.email.trim().toLowerCase() : null,

      class_name: studentData.class_name || studentData.className || null,

      birth_date: studentData.birth_date || studentData.dateOfBirth || null,

      birth_place: studentData.birth_place || null,

      gender: studentData.gender || 'M',

      // "phone" dans Supabase = téléphone du parent

      phone: studentData.phone || studentData.parentPhone || studentData.parent_phone || null,

      // La colonne photo s'appelle "photo_url" dans la vraie table

      photo_url: studentData.photo_url || studentData.avatar || null,

      address: studentData.address || null,

      enrollment_date: studentData.enrollment_date || studentData.admissionDate || new Date().toISOString().slice(0, 10),

      academic_year: studentData.academic_year || '2024-2025',

      status: studentData.status || 'active',

    };



    console.log('[STUDENT] Payload envoyé à Supabase:', databasePayload);



    const { data, error } = await supabase

      .from('students')

      .insert(databasePayload)

      .select('*')

      .single();



    if (error) {

      console.error('[STUDENT INSERT ERROR] Code:', error.code, '| Message:', error.message, '| Details:', error.details);



      if (error.code === '23505') {

        return {

          success: false,

          error: 'Un élève avec cet identifiant existe déjà.',

        };

      }



      if (error.code === '42501' || error.message?.toLowerCase().includes('row-level security')) {

        return {

          success: false,

          error: 'Permission refusée (RLS). Vérifiez que vous êtes bien connecté et que la politique d’insertion est active.',

        };

      }



      return {

        success: false,

        error: `Supabase error [${error.code}]: ${error.message}`,

      };

    }



    if (!data) {

      return {

        success: false,

        error: 'L’élève a peut-être été enregistré, mais aucune donnée n’a été retournée.',

      };

    }



    console.log('[STUDENT INSERT SUCCESS] ID:', data.id, '| Nom:', data.first_name, data.last_name);

    return { success: true, data: mapSupabaseToStudent(data) };

  } catch (err: any) {

    console.error('[STUDENT INSERT EXCEPTION]', err);

    return {

      success: false,

      error: err?.message || "Erreur lors de l'enregistrement de l'élève.",

    };

  }

}



/**

 * Update an existing student in Supabase PostgreSQL (public.students)

 */

export async function updateStudentInSupabase(

  id: string,

  studentData: Partial<Student>

): Promise<{

  success: boolean;

  data?: Student;

  error?: string;

}> {

  if (!supabase || !isSupabaseConfigured) {

    return { success: false, error: 'Client Supabase non configuré.' };

  }



  try {

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {

      return { success: false, error: 'Vous devez être connecté pour modifier un étudiant.' };

    }



    const payload = mapStudentToSupabasePayload(studentData);

    payload.updated_at = new Date().toISOString();



    console.log('[STUDENT] UPDATE START', { id, matricule: payload.matricule });



    const { data, error } = await supabase

      .from('students')

      .update(payload)

      .eq('id', id)

      .select()

      .single();



    if (error) {

      console.error('[STUDENT UPDATE ERROR]', error);

      return { success: false, error: error.message };

    }



    console.log('[STUDENT UPDATE SUCCESS]', data);

    return { success: true, data: mapSupabaseToStudent(data) };

  } catch (err: any) {

    console.error('[STUDENT UPDATE EXCEPTION]', err);

    return { success: false, error: err?.message || 'Erreur lors de la modification de l’élève.' };

  }

}



/**

 * Delete a student from Supabase PostgreSQL (public.students)

 */

export async function deleteStudentInSupabase(id: string): Promise<{

  success: boolean;

  error?: string;

}> {

  if (!supabase || !isSupabaseConfigured) {

    return { success: false, error: 'Client Supabase non configuré.' };

  }



  try {

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {

      return { success: false, error: 'Vous devez être connecté pour supprimer un étudiant.' };

    }



    console.log('[STUDENT] DELETE START', { id });



    const { error } = await supabase

      .from('students')

      .delete()

      .eq('id', id);



    if (error) {

      console.error('[STUDENT DELETE ERROR]', error);

      return { success: false, error: error.message };

    }



    console.log('[STUDENT DELETE SUCCESS]', { id });

    return { success: true };

  } catch (err: any) {

    console.error('[STUDENT DELETE EXCEPTION]', err);

    return { success: false, error: err?.message || 'Erreur lors de la suppression de l’élève.' };

  }

}



/**

 * Fetch a single student by ID from Supabase PostgreSQL

 */

export async function fetchStudentByIdFromSupabase(id: string): Promise<{

  success: boolean;

  data?: Student;

  error?: string;

}> {

  if (!supabase || !isSupabaseConfigured) {

    return { success: false, error: 'Client Supabase non configuré.' };

  }



  try {

    const { data, error } = await supabase

      .from('students')

      .select('*')

      .eq('id', id)

      .single();



    if (error) {

      console.error('[STUDENT FETCH BY ID ERROR]', error);

      return { success: false, error: error.message };

    }



    return { success: true, data: mapSupabaseToStudent(data) };

  } catch (err: any) {

    console.error('[STUDENT FETCH BY ID EXCEPTION]', err);

    return { success: false, error: err?.message || 'Élève introuvable.' };

  }

}



/**

 * SQL Generator helper for creating the complete EduGlass schema in Supabase

 */

export const SUPABASE_PROFILES_SQL = `-- 1. Create table 'profiles'

create table if not exists public.profiles (

  id uuid references auth.users on delete cascade primary key,

  full_name text,

  email text,

  avatar_url text,

  role text default 'user' not null,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  updated_at timestamp with time zone default timezone('utc'::text, now())

);



-- 2. Enable Row Level Security (RLS)

alter table public.profiles enable row level security;



-- 3. RLS Policies

create policy "Public profiles are viewable by authenticated users." 

  on public.profiles for select using (auth.role() = 'authenticated');



create policy "Users can insert their own profile." 

  on public.profiles for insert with check (auth.uid() = id);



create policy "Users can update own profile (excluding role)." 

  on public.profiles for update using (auth.uid() = id) 

  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));



-- 4. Trigger to automatically create profile on Auth Signup

create or replace function public.handle_new_user()

returns trigger as $$

begin

  insert into public.profiles (id, full_name, email, avatar_url, role)

  values (

    new.id,

    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),

    new.email,

    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', null),

    'user' -- STRICT: Default role is always 'user'

  )

  on conflict (id) do nothing;

  return new;

end;

$$ language plpgsql security definer;



drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created

  after insert on auth.users

  for each row execute procedure public.handle_new_user();

`;



export const SUPABASE_FULL_SCHEMA_SQL = `-- ==========================================================

-- SCRIPT COMPLET DE BASE DE DONNÉES SUPABASE POUR EDUGLASS

-- À exécuter dans : Supabase Dashboard > SQL Editor > New Query

-- ==========================================================



-- 1. Table des profils utilisateurs

create table if not exists public.profiles (

  id uuid references auth.users on delete cascade primary key,

  full_name text,

  email text,

  avatar_url text,

  role text default 'user' not null,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  updated_at timestamp with time zone default timezone('utc'::text, now())

);



alter table public.profiles enable row level security;



create policy "Lecture des profils pour utilisateurs authentifiés" 

  on public.profiles for select using (auth.role() = 'authenticated');



create policy "Insertion de son propre profil" 

  on public.profiles for insert with check (auth.uid() = id);



create policy "Mise à jour de son profil" 

  on public.profiles for update using (auth.uid() = id);



-- Trigger de création automatique de profil

create or replace function public.handle_new_user()

returns trigger as $$

begin

  insert into public.profiles (id, full_name, email, avatar_url, role)

  values (

    new.id,

    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),

    new.email,

    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', null),

    'user'

  )

  on conflict (id) do nothing;

  return new;

end;

$$ language plpgsql security definer;



drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created

  after insert on auth.users

  for each row execute procedure public.handle_new_user();



-- 2. Table des classes

create table if not exists public.classes (

  id text primary key,

  name text not null,

  grade_level text not null,

  room text,

  main_teacher_id text,

  student_count integer default 0,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null

);



alter table public.classes enable row level security;

create policy "Lecture des classes" on public.classes for select using (true);

create policy "Gestion des classes" on public.classes for all using (auth.role() = 'authenticated');



-- 3. Table des élèves

create table if not exists public.students (

  id text primary key,

  first_name text not null,

  last_name text not null,

  email text,

  class_id text references public.classes(id) on delete set null,

  class_name text,

  birth_date text,

  avatar text,

  gender text,

  parent_name text,

  parent_phone text,

  parent_email text,

  address text,

  enrollment_date text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null

);



alter table public.students enable row level security;

create policy "Lecture des élèves" on public.students for select using (true);

create policy "Gestion des élèves" on public.students for all using (auth.role() = 'authenticated');



-- 4. Table des matières (Subjects)

create table if not exists public.subjects (

  id text primary key,

  name text not null,

  code text not null,

  coefficient numeric default 1.0,

  color text,

  icon text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null

);



alter table public.subjects enable row level security;

create policy "Lecture des matières" on public.subjects for select using (true);

create policy "Gestion des matières" on public.subjects for all using (auth.role() = 'authenticated');



-- 5. Table des notes (Grades)

create table if not exists public.grades (

  id text primary key,

  student_id text references public.students(id) on delete cascade,

  subject_id text references public.subjects(id) on delete cascade,

  value numeric not null,

  max_value numeric default 20.0 not null,

  coefficient numeric default 1.0 not null,

  date text not null,

  type text not null,

  comment text,

  period text not null,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null

);



alter table public.grades enable row level security;

create policy "Lecture des notes" on public.grades for select using (true);

create policy "Gestion des notes" on public.grades for all using (auth.role() = 'authenticated');



-- 6. Table des enseignants (Teachers)

create table if not exists public.teachers (

  id text primary key,

  first_name text not null,

  last_name text not null,

  email text not null,

  phone text,

  avatar text,

  subject_id text references public.subjects(id) on delete set null,

  subject_name text,

  classes text[],

  is_main_teacher boolean default false,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null

);



alter table public.teachers enable row level security;

create policy "Lecture des enseignants" on public.teachers for select using (true);

create policy "Gestion des enseignants" on public.teachers for all using (auth.role() = 'authenticated');



-- 7. Table des présences / retards (Attendance)

create table if not exists public.attendance (

  id text primary key,

  student_id text references public.students(id) on delete cascade,

  student_name text not null,

  class_id text references public.classes(id) on delete cascade,

  class_name text not null,

  date text not null,

  time_slot text not null,

  subject_id text references public.subjects(id) on delete set null,

  subject_name text not null,

  status text not null, -- 'present', 'absent', 'late', 'excused'

  justification text,

  reported_by text not null,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null

);



alter table public.attendance enable row level security;

create policy "Lecture des présences" on public.attendance for select using (true);

create policy "Gestion des présences" on public.attendance for all using (auth.role() = 'authenticated');

`;



/**

 * Health check & diagnostic tool for Supabase connection

 */

export async function testSupabaseDatabaseConnection(): Promise<{

  configured: boolean;

  connected: boolean;

  latencyMs?: number;

  url?: string;

  tablesAvailable?: string[];

  error?: string;

}> {

  const url = import.meta.env.VITE_SUPABASE_URL || '';

  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';



  if (!isSupabaseConfigured || !supabase) {

    return {

      configured: false,

      connected: false,

      url: url || 'Non configuré',

      error: 'Variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY manquantes ou par défaut.',

    };

  }



  const start = performance.now();

  try {

    // Ping Supabase by checking 'profiles' or executing a light select

    const { data, error } = await supabase.from('profiles').select('id').limit(1);

    const latencyMs = Math.round(performance.now() - start);



    if (error && !error.message.includes('permission denied')) {

      return {

        configured: true,

        connected: false,

        latencyMs,

        url,

        error: error.message,

      };

    }



    return {

      configured: true,

      connected: true,

      latencyMs,

      url,

      tablesAvailable: ['profiles', 'students', 'classes', 'grades', 'attendance'],

    };

  } catch (err: any) {

    return {

      configured: true,

      connected: false,

      url,

      error: err?.message || 'Impossible de contacter le serveur Supabase.',

    };

  }

}




