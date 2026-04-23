import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yahzlakgcdxdbkcdmpes.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaHpsYWtnY2R4ZGJrY2RtcGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MDgyMzMsImV4cCI6MjA5MTM4NDIzM30.dH3VSd1UsgeLSRItNYrfQc-q4_8JcmOvpcOOmnNiIBU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  console.log('Checking tickets table schema...');
  const res = await supabase.from('tickets').select('*').limit(1);
  console.log('Select result:', JSON.stringify(res, null, 2));
}

checkSchema();