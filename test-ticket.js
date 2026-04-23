import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yahzlakgcdxdbkcdmpes.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaHpsYWtnY2R4ZGJrY2RtcGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MDgyMzMsImV4cCI6MjA5MTM4NDIzM30.dH3VSd1UsgeLSRItNYrfQc-q4_8JcmOvpcOOmnNiIBU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTicketInsert() {
  const ticket = {
    title: 'Test Ticket',
    description: 'This is a test ticket',
    priority: 'medium',
    status: 'pending',
    assigned_to: null
  };

  console.log('Inserting ticket with status pending...');
  const res = await supabase.from('tickets').insert(ticket).select().single();
  console.log('Result:', JSON.stringify(res, null, 2));
}

testTicketInsert();