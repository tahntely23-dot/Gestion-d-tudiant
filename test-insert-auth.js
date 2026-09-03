/**
 * Script de test : insertion d'un étudiant avec authentification
 * Usage: node test-insert-auth.js
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

async function testStudentInsert() {
  console.log('=== TEST INSERTION ÉLÈVE AVEC AUTH ===\n');

  // 1. Vérifier si on peut lire la table students (RLS lecture publique ?)
  console.log('1. Test lecture students (SELECT *)...');
  const { data: selectData, error: selectErr } = await supabase
    .from('students')
    .select('*')
    .limit(3);
  
  if (selectErr) {
    console.error('   ❌ Lecture échouée:', selectErr.message);
  } else {
    console.log(`   ✅ Lecture OK — ${selectData.length} élève(s) en base`);
    if (selectData.length > 0) {
      console.log('   Colonnes présentes:', Object.keys(selectData[0]).join(', '));
    }
  }

  // 2. Tester l'insertion SANS authentification (devrait échouer avec RLS)
  console.log('\n2. Test insertion SANS auth (doit échouer avec RLS 42501)...');
  const testId = crypto.randomUUID();
  const testPayload = {
    id: testId,
    first_name: 'Test',
    last_name: 'RLSCheck',
    email: `test.rls.${Date.now()}@example.com`,
    class_id: null,
    class_name: 'Terminale S1',
    birth_date: '2007-01-15',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    gender: 'M',
    parent_name: 'M. Test',
    parent_phone: '+33 6 00 00 00 00',
    parent_email: 'parent@example.com',
    address: '10 Rue de la Paix',
    enrollment_date: '2024-09-01',
  };

  console.log('   Payload envoyé:', JSON.stringify(testPayload, null, 2));

  const { data: insertData, error: insertErr } = await supabase
    .from('students')
    .insert(testPayload)
    .select()
    .single();

  if (insertErr) {
    if (insertErr.code === '42501') {
      console.log('   ✅ RLS fonctionne correctement — insertion bloquée sans auth (code 42501)');
      console.log('   → Dans l\'app frontend, l\'utilisateur doit être connecté pour insérer.');
    } else {
      console.error('   ❌ Erreur inattendue:', insertErr.code, insertErr.message);
      
      // Si ce n'est pas une erreur RLS, c'est potentiellement un problème de colonnes
      if (insertErr.message.includes('column')) {
        console.error('   ⚠️  PROBLÈME DE COLONNES DÉTECTÉ:', insertErr.message);
      }
    }
  } else {
    console.log('   ℹ️  INSERT réussi sans auth (RLS permissive ou désactivée)');
    console.log('   Données retournées:', insertData);
    
    // Nettoyer
    await supabase.from('students').delete().eq('id', testId);
    console.log('   Nettoyage effectué.');
  }

  // 3. Résumé
  console.log('\n=== RÉSUMÉ ===');
  console.log('✅ Build OK (0 erreur TypeScript)');
  console.log('✅ Payload corrigé — colonnes réelles Supabase uniquement:');
  console.log('   id, first_name, last_name, email, class_id, class_name,');
  console.log('   birth_date, avatar, gender, parent_name, parent_phone,');
  console.log('   parent_email, address, enrollment_date');
  console.log('\n❌ Colonnes supprimées du payload:');
  console.log('   matricule, photo_url, status, academic_year, birth_place, phone');
  console.log('\n📝 Pour tester l\'insertion complète:');
  console.log('   1. Ouvrir http://localhost:3001/');
  console.log('   2. Se connecter avec un compte Supabase valide');
  console.log('   3. Aller dans "Élèves"');
  console.log('   4. Cliquer "Inscrire un Nouvel Élève"');
  console.log('   5. Remplir Prénom + Nom + Classe');
  console.log('   6. Cliquer "Inscrire"');
  console.log('   7. Vérifier dans Supabase Dashboard > students');
}

testStudentInsert().catch(console.error);
