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

async function inspectTable() {
  console.log('--- TEST 1: SELECT students table ---');
  const { data: selectData, error: selectErr } = await supabase.from('students').select('*').limit(1);
  console.log('Select result:', { data: selectData, error: selectErr });

  console.log('\n--- TEST 2: CHECK AUTH USER ---');
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Current user in client:', user ? user.id : 'No active session in node client');

  console.log('\n--- TEST 3: CHECK WHAT COLUMNS EXIST IN public.students ---');
  // Let's test with minimal payload first
  const minimalStudent = {
    first_name: 'Jean',
    last_name: 'Test',
    email: 'jean.test@example.com',
  };
  const { data: minData, error: minErr } = await supabase.from('students').insert(minimalStudent).select();
  console.log('Insert minimal student error:', minErr);

  // Let's check with all columns
  const fullStudent = {
    matricule: 'MAT-001',
    first_name: 'Jean',
    last_name: 'Dupont',
    birth_date: '2007-01-15',
    birth_place: 'Paris',
    gender: 'M',
    email: 'jean.dupont@example.com',
    phone: '0611223344',
    address: '10 Rue de la Paix',
    photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    class_name: 'Terminale S1',
    academic_year: '2024-2025',
    enrollment_date: '2024-09-01',
    status: 'active',
  };
  const { data: fullData, error: fullErr } = await supabase.from('students').insert(fullStudent).select();
  console.log('Insert full student error:', fullErr);
}

inspectTable();
