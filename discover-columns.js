/**
 * Script de découverte : trouve la vraie structure de la table students
 */
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

// Liste de tous les champs possibles à tester un par un
const columnsToTest = [
  'id', 'first_name', 'last_name', 'email', 'class_id', 'class_name',
  'birth_date', 'birth_place', 'gender', 'phone',
  'avatar', 'photo_url',  // Lequel existe ?
  'parent_name', 'parent_phone', 'parent_email',
  'address', 'enrollment_date', 'academic_year',
  'status', 'matricule', 'rollNumber',
  'created_at', 'updated_at', 'notes'
];

async function discoverColumns() {
  console.log('=== DÉCOUVERTE DES COLONNES RÉELLES DE public.students ===\n');
  
  const baseId = crypto.randomUUID();
  
  // Test chaque colonne individuellement
  const validColumns = [];
  const invalidColumns = [];
  
  for (const col of columnsToTest) {
    if (col === 'id' || col === 'created_at' || col === 'updated_at') {
      // Ces colonnes sont toujours présentes ou auto
      continue;
    }
    
    const testPayload = { id: baseId, first_name: 'Test', last_name: 'Col', [col]: 'test_value' };
    const { error } = await supabase.from('students').insert(testPayload).select();
    
    if (error) {
      if (error.code === 'PGRST204' || error.message.includes(`'${col}'`)) {
        invalidColumns.push(`  ❌ "${col}" — ABSENT (${error.message})`);
      } else if (error.code === '42501') {
        console.log(`  🔒 "${col}" — Colonne potentiellement valide (bloquée par RLS, pas d'erreur de colonne)`);
        validColumns.push(`  ✅ "${col}" — présent (RLS bloque l'insert, pas erreur de schéma)`);
      } else if (error.code === '23505') {
        validColumns.push(`  ✅ "${col}" — présent (conflit de clé, colonne valide)`);
      } else {
        console.log(`  ⚠️  "${col}" — Erreur: [${error.code}] ${error.message}`);
        if (!error.message.includes('column')) {
          validColumns.push(`  ✅ "${col}" — probablement présent`);
        }
      }
    } else {
      validColumns.push(`  ✅ "${col}" — présent et inséré sans auth !`);
      // Nettoyer
      await supabase.from('students').delete().eq('id', baseId);
    }
  }
  
  console.log('COLONNES PRÉSENTES:');
  validColumns.forEach(c => console.log(c));
  console.log('\nCOLONNES ABSENTES:');
  invalidColumns.forEach(c => console.log(c));
  
  // Test plus ciblé : essayer un insert minimal avec first_name + last_name
  console.log('\n=== TEST INSERT MINIMAL (first_name + last_name seulement) ===');
  const minId = crypto.randomUUID();
  const { data, error } = await supabase
    .from('students')
    .insert({ id: minId, first_name: 'Jean', last_name: 'Minimal' })
    .select();
  
  if (error) {
    console.log('Erreur insert minimal:', error.code, error.message);
  } else {
    console.log('✅ Insert minimal réussi ! Données retournées:', JSON.stringify(data, null, 2));
    // Nettoyer
    await supabase.from('students').delete().eq('id', minId);
  }
}

discoverColumns().catch(console.error);
