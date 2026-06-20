import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Parse .env manually
const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);


async function check() {
  console.log('Checking Supabase tables...');
  try {
    const { data: tx, error: txErr } = await supabase.from('transactions').select('*').limit(5);
    console.log('transactions count/error:', tx ? tx.length : 'none', txErr ? txErr.message : 'ok');
    if (tx) console.log('tx sample:', tx.slice(0, 2));

    const { data: sales, error: salesErr } = await supabase.from('sales').select('*').limit(5);
    console.log('sales count/error:', sales ? sales.length : 'none', salesErr ? salesErr.message : 'ok');
    if (sales) console.log('sales sample:', sales.slice(0, 2));

    const { data: catalog, error: catalogErr } = await supabase.from('equipment_catalog').select('*').limit(5);
    console.log('equipment_catalog count/error:', catalog ? catalog.length : 'none', catalogErr ? catalogErr.message : 'ok');
    if (catalog) console.log('catalog sample:', catalog);
  } catch (e) {
    console.error('Error querying:', e);
  }
}

check();
