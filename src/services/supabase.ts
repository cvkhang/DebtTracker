import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umrktjqjukjfuqumnjzg.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtcmt0anFqdWtqZnVxdW1uanpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1Nzk1ODAsImV4cCI6MjA2NDE1NTU4MH0.3pxrttnrtZtIefsFrIRVaQFQupRDy0iLm2M3BE89cn4';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for our database tables
export type Person = {
  id: string;
  name: string;
  total_debt: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  person_id: string;
  amount: number;
  type: 'debt' | 'payment';
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
};

// Helper functions for database operations
export const getPeople = async () => {
  console.log('Fetching people from Supabase...');
  try {
    const { data, error, status, statusText } = await supabase
      .from('people')
      .select('*')
      .order('name');
    
    console.log('Supabase response:', { status, statusText, error, data });
    
    if (error) {
      console.error('Error fetching people:', error);
      throw error;
    }
    
    if (!data) {
      console.log('No data returned from Supabase');
      return [];
    }
    
    console.log('Fetched people:', data);
    return data as Person[];
  } catch (err) {
    console.error('Exception in getPeople:', err);
    throw err;
  }
};

export const addPerson = async (name: string) => {
  const { data, error } = await supabase
    .from('people')
    .insert([{ 
      name,
      total_debt: 0
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data as Person;
};

export const updatePerson = async (id: string, name: string) => {
  const { data, error } = await supabase
    .from('people')
    .update({ name })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Person;
};

export const deletePerson = async (id: string) => {
  const { error } = await supabase
    .from('people')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const getTransactions = async (personId?: string) => {
  let query = supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });
  
  if (personId) {
    query = query.eq('person_id', personId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data as Transaction[];
};

export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      ...transaction,
      date: new Date().toISOString() // Use current timestamp for new transactions
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data as Transaction;
};

export const deleteTransaction = async (id: string) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const updateTransaction = async (id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>) => {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Transaction;
};

export const testSupabaseConnection = async () => {
  console.log('Testing Supabase connection...');
  try {
    // Test 1: Check if we can access the database
    const { data: testData, error: testError } = await supabase
      .from('people')
      .select('count')
      .limit(1);
    
    console.log('Test query result:', { testData, testError });

    // Test 2: Try to get table information
    const { data: tableInfo, error: tableError } = await supabase
      .from('people')
      .select('*')
      .limit(1);
    
    console.log('Table info:', { tableInfo, tableError });

    return { testData, testError, tableInfo, tableError };
  } catch (err) {
    console.error('Test connection error:', err);
    throw err;
  }
};

export const insertTestPerson = async () => {
  console.log('Inserting test person...');
  try {
    const { data, error } = await supabase
      .from('people')
      .insert([
        {
          name: 'Test Person',
          total_debt: 0
        }
      ])
      .select();
    
    console.log('Insert result:', { data, error });
    return { data, error };
  } catch (err) {
    console.error('Insert test error:', err);
    throw err;
  }
}; 