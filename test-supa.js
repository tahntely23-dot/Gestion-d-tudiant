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

async function testInsert() {
  const testId = '16e4fb00-4f97-43a0-87b4-3a29627368b7'; // The user id created earlier in auth.users
  const { data, error } = await supabase.from('profiles').insert({
    id: testId,
    full_name: 'Professeur Test',
    email: 'prof.test.1788418424712@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    role: 'user',
  }).select();

  console.log('Insert profile test:', { data, error });
}

testInsert();
