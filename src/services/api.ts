import { Person, PaymentRecord } from '../types';

const API_URL = 'http://localhost:3001/api';

export const api = {
  // People
  getPeople: async (): Promise<Person[]> => {
    const response = await fetch(`${API_URL}/people`);
    if (!response.ok) throw new Error('Failed to fetch people');
    return response.json();
  },

  createPerson: async (name: string): Promise<Person> => {
    const response = await fetch(`${API_URL}/people`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to create person');
    return response.json();
  },

  updatePerson: async (id: string, name: string): Promise<Person> => {
    const response = await fetch(`${API_URL}/people/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to update person');
    return response.json();
  },

  deletePerson: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/people/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete person');
  },

  // Transactions
  getPersonTransactions: async (personId: string): Promise<PaymentRecord[]> => {
    const response = await fetch(`${API_URL}/transactions/person/${personId}`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  createTransaction: async (transaction: Omit<PaymentRecord, 'id'>): Promise<PaymentRecord> => {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    if (!response.ok) throw new Error('Failed to create transaction');
    return response.json();
  },

  deleteTransaction: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
  },

  // Rankings
  getDebtRanking: async () => {
    const response = await fetch(`${API_URL}/people/ranking/debt`);
    if (!response.ok) throw new Error('Failed to fetch debt ranking');
    return response.json();
  },
}; 