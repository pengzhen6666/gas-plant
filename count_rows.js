import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

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

async function count() {
  const { count: txCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true });
  const { count: salesCount } = await supabase.from('sales').select('*', { count: 'exact', head: true });
  const { count: catalogCount } = await supabase.from('equipment_catalog').select('*', { count: 'exact', head: true });
  console.log(`Transactions: ${txCount}, Sales: ${salesCount}, Catalog: ${catalogCount}`);
}

count();
