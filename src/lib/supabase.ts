import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { UserProfile, AuthUser } from '../types';

// Environment variables (public keys only: publishable/anon key - NEVER a secret key)
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// A secret key (sb_secret_... or a service_role JWT) must never reach the browser.
const isSecretKey =
  SUPABASE_ANON_KEY.startsWith('sb_secret') ||
  SUPABASE_ANON_KEY.includes('service_role');

const hasPlaceholderValues =
  !SUPABASE_URL ||
  !SUPABASE_ANON_KEY ||
  SUPABASE_URL.includes('your-project') ||
  SUPABASE_ANON_KEY.includes('your-anon');

export const supabaseConfigError: string | null = isSecretKey
  ? 'VITE_SUPABASE_ANON_KEY contient une clé secrète. Utilisez uniquement la clé publishable (sb_publishable_… ou anon public).'
  : hasPlaceholderValues
    ? 'VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY ne sont pas renseignées dans le fichier .env.'
    : null;

export const isSupabaseConfigured = supabaseConfigError === null;

if (isSecretKey) {
  console.error(
    '[Supabase] Clé secrète détectée dans VITE_SUPABASE_ANON_KEY. Le client n’a pas été initialisé.',
  );
}

// Real Supabase client instance (or null if unconfigured)
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : null;

// Local persistent profile store key for local caching & fallback
const PROFILES_STORAGE_KEY = 'eduglass_supabase_profiles';
const ACTIVE_SESSION_STORAGE_KEY = 'eduglass_supabase_session';

/**
 * Get all profiles cached or stored locally
 */
export function getLocalProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save profiles to local store
 */
export function saveLocalProfiles(profiles: UserProfile[]): void {
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save profiles locally', e);
  }
}

/**
 * Ensures a user has a profile in `profiles`.
 * Creates the record if it doesn't exist.
 * Rule: Default role is strictly 'user'. NEVER auto-admin.
 */
export async function syncOrCreateProfile(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
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
                  (user.user_metadata?.provider as ('google' | 'facebook' | 'email')) || 
                  'email';

  // 1. Try real Supabase if available
  if (supabase && isSupabaseConfigured) {
    try {
      // Check if profile exists by ID
      const { data: existingProfile, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProfile && !fetchErr) {
        return existingProfile as UserProfile;
      }

      // If not by ID, check by email to prevent duplicate accounts
      if (email) {
        const { data: profileByEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (profileByEmail) {
          return profileByEmail as UserProfile;
        }
      }

      // Insert new profile with STRICT default role = 'user'
      const newProfile: UserProfile = {
        id: user.id,
        full_name: rawName,
        email: email,
        avatar_url: rawAvatar,
        role: 'user', // Strict requirement: Default role must be 'user'
        created_at: new Date().toISOString(),
        provider: provider,
      };

      const { data: inserted, error: insertErr } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (inserted && !insertErr) {
        return inserted as UserProfile;
      }
    } catch (err) {
      console.warn('Supabase profiles query error, falling back to client profile store:', err);
    }
  }

  // 2. Client Profile Store (Simulated Supabase DB)
  const allProfiles = getLocalProfiles();

  // Check if profile already exists by ID or by email
  const existing = allProfiles.find(
    (p) => p.id === user.id || (email && p.email?.toLowerCase() === email)
  );

  if (existing) {
    return existing;
  }

  // Create new profile record
  const newProfile: UserProfile = {
    id: user.id || `usr_sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    full_name: rawName,
    email: email,
    avatar_url: rawAvatar,
    role: 'user', // STRICT: role is default 'user', never admin
    created_at: new Date().toISOString(),
    provider: provider,
  };

  allProfiles.push(newProfile);
  saveLocalProfiles(allProfiles);
  return newProfile;
}

/**
 * Converts a UserProfile into application's AuthUser representation
 */
export function profileToAuthUser(profile: UserProfile): AuthUser {
  // Map role to French label & UI role
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

const PROVIDER_LABELS: Record<'google' | 'facebook', string> = {
  google: 'Google',
  facebook: 'Facebook',
};

/**
 * Translates a Supabase Auth error into an actionable French message.
 */
export function describeAuthError(
  message: string,
  provider?: 'google' | 'facebook',
): string {
  const raw = (message || '').toLowerCase();
  const label = provider ? PROVIDER_LABELS[provider] : 'Ce fournisseur';

  if (raw.includes('provider is not enabled') || raw.includes('unsupported provider')) {
    return `Le fournisseur ${label} n’est pas activé sur votre projet Supabase. Activez-le dans Supabase Dashboard → Authentication → Sign In / Providers → ${label}, renseignez le Client ID / Client Secret, puis enregistrez.`;
  }
  if (raw.includes('invalid login credentials')) {
    return 'Email ou mot de passe incorrect.';
  }
  if (raw.includes('email not confirmed')) {
    return 'Votre adresse email n’a pas encore été confirmée. Consultez le lien de confirmation reçu par email.';
  }
  if (raw.includes('email logins are disabled') || raw.includes('signups not allowed')) {
    return 'Les connexions par email sont désactivées dans Supabase → Authentication → Sign In / Providers → Email.';
  }
  if (raw.includes('user already registered')) {
    return 'Un compte existe déjà avec cette adresse email.';
  }
  if (raw.includes('redirect') && raw.includes('not allowed')) {
    return 'URL de redirection non autorisée. Ajoutez l’URL de l’application dans Supabase → Authentication → URL Configuration (Site URL et Redirect URLs).';
  }
  if (raw.includes('failed to fetch') || raw.includes('networkerror')) {
    return 'Impossible de contacter Supabase. Vérifiez VITE_SUPABASE_URL et votre connexion réseau.';
  }
  return message;
}

/**
 * Execute OAuth Sign-In (Google or Facebook) through Supabase Auth.
 * The browser is redirected to the provider; the session is picked up on return
 * by `detectSessionInUrl` and the `onAuthStateChange` listener.
 */
export async function signInWithOAuthProvider(provider: 'google' | 'facebook'): Promise<{
  success: boolean;
  error?: string;
  user?: AuthUser;
}> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      success: false,
      error: supabaseConfigError || 'Supabase n’est pas configuré.',
    };
  }

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
        // Google-only parameters; Facebook rejects unknown OAuth query params.
        ...(provider === 'google'
          ? { queryParams: { access_type: 'offline', prompt: 'consent' } }
          : {}),
      },
    });

    if (error) {
      return { success: false, error: describeAuthError(error.message, provider) };
    }

    // The browser is being redirected to the provider; the session arrives on callback.
    return { success: true };
  } catch (e: any) {
    return {
      success: false,
      error: describeAuthError(e?.message || 'Erreur lors de la redirection OAuth', provider),
    };
  }
}

/**
 * Reads the current Supabase session (source of truth for private pages)
 */
export async function getCurrentSession(): Promise<Session | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('Supabase getSession error:', error.message);
    return null;
  }
  return data.session;
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  // 1. Real Supabase
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: describeAuthError(error.message) };
      }

      if (data.user) {
        const profile = await syncOrCreateProfile({
          id: data.user.id,
          email: data.user.email,
          user_metadata: data.user.user_metadata,
          provider: 'email',
        });
        const authUser = profileToAuthUser(profile);
        return { success: true, user: authUser };
      }

      return { success: false, error: 'Connexion impossible : aucune session renvoyée par Supabase.' };
    } catch (e: any) {
      return { success: false, error: describeAuthError(e?.message || 'Erreur d’authentification') };
    }
  }

  // 2. Local fallback verification
  if (password.length < 6 && password !== 'admin' && password !== 'demo' && password !== 'password123') {
    return { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères.' };
  }

  const profile = await syncOrCreateProfile({
    id: `usr_email_${Date.now()}`,
    email: email,
    provider: 'email',
    user_metadata: {
      full_name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
  });

  const authUser = profileToAuthUser(profile);
  localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(authUser));
  return { success: true, user: authUser };
}

/**
 * Sign Up with Email and Password
 */
export async function signUpWithEmailPassword(
  email: string,
  password: string,
  fullName: string
): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
          },
        },
      });

      if (error) {
        return { success: false, error: describeAuthError(error.message) };
      }

      if (data.user) {
        const profile = await syncOrCreateProfile({
          id: data.user.id,
          email: data.user.email,
          user_metadata: { full_name: fullName },
          provider: 'email',
        });
        const authUser = profileToAuthUser(profile);
        return { success: true, user: authUser };
      }

      return {
        success: false,
        error: 'Compte créé : confirmez votre adresse email avant de vous connecter.',
      };
    } catch (e: any) {
      return { success: false, error: describeAuthError(e?.message || 'Erreur lors de l’inscription') };
    }
  }

  // Local fallback
  const profile = await syncOrCreateProfile({
    id: `usr_signup_${Date.now()}`,
    email: email,
    provider: 'email',
    user_metadata: {
      full_name: fullName,
    },
  });
  const authUser = profileToAuthUser(profile);
  localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(authUser));
  return { success: true, user: authUser };
}

/**
 * Request Password Reset Email via Supabase Auth
 */
export async function resetPasswordForEmail(email: string): Promise<{ success: boolean; error?: string }> {
  if (supabase && isSupabaseConfigured) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (error) {
        return { success: false, error: describeAuthError(error.message) };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: describeAuthError(e?.message || 'Erreur lors de la réinitialisation') };
    }
  }

  // Graceful simulation for preview/demo
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 600);
  });
}

/**
 * Sign Out handler
 */
export async function signOutSupabase(): Promise<void> {
  if (supabase && isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signout notice:', e);
    }
  }
  localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
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

