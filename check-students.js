import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const getEnv = (k) => {
  const match = env.match(new RegExp(k + '=(.*)'));
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : '';
};
const url = getEnv('VITE_SUPABASE_URL');
const key = getEnv('VITE_SUPABASE_ANON_KEY');

const supabase = createClient(url, key);

async function testAuthInsert() {
  const email = `test.student.manager.${Date.now()}@gmail.com`;
  const password = 'Password123!';

  console.log('1. Trying to sign in or sign up...');
  // Let's see if we have an existing authenticated session or create one
  const signUpRes = await supabase.auth.signUp({
    email,
    password,
  });

  console.log('signUp result:', { hasUser: !!signUpRes.data?.user, hasSession: !!signUpRes.data?.session });

  // If session is null due to email confirmation, let's test what policy exists on students table
  const testStudent = {
    matricule: `ETU-2025-${Math.floor(Math.random() * 900 + 100)}`,
    first_name: 'Lucas',
    last_name: 'Bernard',
    birth_date: '2007-04-12',
    birth_place: 'Paris',
    gender: 'M',
    email: 'lucas.bernard@example.com',
    phone: '0612345678',
    address: '12 Rue de Paris',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    class_name: 'Terminale S1',
    academic_year: '2024-2025',
    enrollment_date: '2024-09-01',
    status: 'active',
  };

  if (signUpRes.data?.session) {
    const { data, error } = await supabase.from('students').insert(testStudent).select();
    console.log('Authenticated insert result:', { data, error });
  } else {
    console.log('No direct session (email confirmation required). Let us check read permissions:');
    const { data, error } = await supabase.from('students').select('*');
    console.log('Read students result:', { count: data?.length, error });
  }
}

testAuthInsert();
