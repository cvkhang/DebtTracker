import React, { useState } from 'react';
import { DebtEntry, Person } from '../types';

interface DebtFormProps {
  onSubmit: (debt: Omit<DebtEntry, 'id' | 'paymentHistory'>) => void;
  initialValues?: Partial<DebtEntry>;
  onCancel: () => void;
  people: Person[];
  selectedPerson?: Person | null;
}

const DebtForm: React.FC<DebtFormProps> = ({
  onSubmit,
  initialValues,
  onCancel,
  people,
  selectedPerson,
}) => {
  const [formData, setFormData] = useState({
    person: initialValues?.person || selectedPerson?.name || '',
    amount: initialValues?.amount || 0,
    description: initialValues?.description || '',
    date: initialValues?.date || new Date().toISOString().split('T')[0],
    status: initialValues?.status || 'active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!selectedPerson && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Person</label>
          <select
            value={formData.person}
            onChange={(e) => setFormData({ ...formData, person: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select a person</option>
            {people.map((person) => (
              <option key={person.id} value={person.name}>
                {person.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Amount (VND)</label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          min="0"
          step="1000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
          placeholder="Enter debt description..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'paid' | 'partial' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="active">Active</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {initialValues ? 'Update' : 'Add'} Debt
        </button>
      </div>
    </form>
  );
};

export default DebtForm; 