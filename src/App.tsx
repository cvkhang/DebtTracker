import React, { useState, useEffect } from 'react';
import { Person, PaymentRecord } from './types';
import { getPeople, addPerson, getTransactions, addTransaction, updatePerson, deletePerson, deleteTransaction, testSupabaseConnection, insertTestPerson, updateTransaction } from './services/supabase';
import PersonList from './components/PersonList';
import TransactionForm from './components/TransactionForm';
import TransactionHistory from './components/TransactionHistory';

function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [transactions, setTransactions] = useState<PaymentRecord[]>([]);
  const [allTransactions, setAllTransactions] = useState<PaymentRecord[]>([]);
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [isEditingPerson, setIsEditingPerson] = useState(false);
  const [editingPersonName, setEditingPersonName] = useState('');
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);  
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load people and all transactions on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing app...');
        const testResult = await testSupabaseConnection();
        console.log('Connection test result:', testResult);
        
        await loadPeople();
        await loadAllTransactions();
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize app');
      }
    };
    
    initialize();
  }, []);

  // Load transactions when selected person changes
  useEffect(() => {
    if (selectedPerson) {
      loadTransactions(selectedPerson.id);
    } else {
      setTransactions([]);
    }
  }, [selectedPerson]);

  const loadPeople = async () => {
    try {
      console.log('Loading people in App component...');
      const data = await getPeople();
      console.log('Received people data:', data);
      
      if (data.length === 0) {
        console.log('No people found, inserting test person...');
        const { data: testPerson, error: insertError } = await insertTestPerson();
        if (insertError) {
          console.error('Error inserting test person:', insertError);
          throw insertError;
        }
        if (testPerson) {
          console.log('Test person inserted:', testPerson);
          // Reload people after inserting test person
          const updatedData = await getPeople();
          setPeople(updatedData.map(p => ({
            id: p.id,
            name: p.name,
            totalDebt: p.total_debt
          })));
          return;
        }
      }
      
      setPeople(data.map(p => ({
        id: p.id,
        name: p.name,
        totalDebt: p.total_debt
      })));
      console.log('Updated people state:', people);
    } catch (err) {
      console.error('Error in loadPeople:', err);
      setError('Failed to load people');
    }
  };

  const loadAllTransactions = async () => {
    try {
      const data = await getTransactions();
      setAllTransactions(data.map(t => ({
        id: t.id,
        personId: t.person_id,
        amount: t.amount,
        type: t.type,
        description: t.description,
        date: new Date(t.date).toISOString().split('T')[0]
      })));
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    }
  };

  const loadTransactions = async (personId: string) => {
    try {
      const data = await getTransactions(personId);
      setTransactions(data.map(t => ({
        id: t.id,
        personId: t.person_id,
        amount: t.amount,
        type: t.type,
        description: t.description,
        date: new Date(t.date).toISOString().split('T')[0]
      })));
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    }
  };

  const handleAddPerson = async () => {
    if (!newPersonName.trim()) return;
    try {
      const newPerson = await addPerson(newPersonName.trim());
      setPeople([...people, {
        id: newPerson.id,
        name: newPerson.name,
        totalDebt: newPerson.total_debt
      }]);
      setNewPersonName('');
      setIsAddingPerson(false);
    } catch (err) {
      setError('Failed to add person');
      console.error(err);
    }
  };

  const handleTransaction = async (transaction: Omit<PaymentRecord, 'id'>) => {
    if (!selectedPerson) return;
    try {
      const newTransaction = await addTransaction({
        person_id: selectedPerson.id,
        amount: transaction.amount,
        type: transaction.type,
        description: transaction.description,
        date: new Date(transaction.date).toISOString()
      });
      
      setTransactions([...transactions, {
        id: newTransaction.id,
        personId: newTransaction.person_id,
        amount: newTransaction.amount,
        type: newTransaction.type,
        description: newTransaction.description,
        date: new Date(newTransaction.date).toISOString().split('T')[0]
      }]);

      // Reload the person to get updated total_debt
      const updatedPerson = await getPeople().then(people => 
        people.find(p => p.id === selectedPerson.id)
      );
      if (updatedPerson) {
        setSelectedPerson({
          ...selectedPerson,
          totalDebt: updatedPerson.total_debt
        });
        setPeople(people.map(p => p.id === selectedPerson.id ? {
          ...p,
          totalDebt: updatedPerson.total_debt
        } : p));
      }
      
      setIsAddingTransaction(false);
    } catch (err) {
      setError('Failed to add transaction');
      console.error(err);
    }
  };

  const handleEditPerson = async () => {
    if (!selectedPerson || !editingPersonName.trim()) return;
    try {
      const updatedPerson = await updatePerson(selectedPerson.id, editingPersonName.trim());
      setPeople(people.map(p => p.id === selectedPerson.id ? {
        ...p,
        name: updatedPerson.name
      } : p));
      setSelectedPerson({
        ...selectedPerson,
        name: updatedPerson.name
      });
      setIsEditingPerson(false);
    } catch (err) {
      setError('Failed to update person');
      console.error(err);
    }
  };

  const handleDeletePerson = async () => {
    if (!selectedPerson) return;
    if (!window.confirm('Are you sure you want to delete this person?')) return;
    try {
      await deletePerson(selectedPerson.id);
      setPeople(people.filter(p => p.id !== selectedPerson.id));
      setSelectedPerson(null);
    } catch (err) {
      setError('Failed to delete person');
      console.error(err);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await deleteTransaction(transactionId);
      setTransactions(transactions.filter(t => t.id !== transactionId));
    } catch (err) {
      setError('Failed to delete transaction');
      console.error(err);
    }
  };

  const handleEditTransaction = async (updated: PaymentRecord) => {
    try {
      const newTx = await updateTransaction(updated.id, {
        amount: updated.amount,
        description: updated.description,
        date: updated.date,
        type: updated.type
      });
      setTransactions(transactions.map(t => t.id === newTx.id ? {
        ...t,
        amount: newTx.amount,
        description: newTx.description,
        date: new Date(newTx.date).toISOString().split('T')[0],
        type: newTx.type
      } : t));
      // Optionally reload people to update totalDebt
      const updatedPeople = await getPeople();
      setPeople(updatedPeople.map(p => ({ id: p.id, name: p.name, totalDebt: p.total_debt })));
    } catch (err) {
      setError('Failed to edit transaction');
      console.error(err);
    }
  };

  const handleEnterEditMode = () => {
    const pin = prompt('Enter secret PIN:');
    if (pin === '290529') {
      setIsEditMode(true);
    } else {
      alert('Incorrect PIN');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h1 className="text-3xl font-bold text-white">Sổ Nợ</h1>
            </div>
            <div className="flex items-center gap-4">
              {!isEditMode ? (
                <button 
                  onClick={handleEnterEditMode} 
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit Mode
                </button>
              ) : (
                <span className="bg-green-500/20 text-green-100 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Edit Mode Enabled
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button 
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-3 xl:col-span-1 card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Overview</h2>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Total Debt</p>
                <p className="text-2xl font-bold text-red-600">
                  {people.reduce((sum, p) => sum + (p.totalDebt || 0), 0).toLocaleString('vi-VN')}₫
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">People with Debt</p>
                <p className="text-2xl font-bold text-gray-900">
                  {people.filter(p => p.totalDebt > 0).length}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Average Debt</p>
                <p className="text-2xl font-bold text-gray-900">
                  {people.length > 0 
                    ? (people.reduce((sum, p) => sum + (p.totalDebt || 0), 0) / people.length).toLocaleString('vi-VN')
                    : '0'}₫
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Highest Debt</p>
                <p className="text-2xl font-bold text-red-600">
                  {people.length > 0 
                    ? Math.max(...people.map(p => p.totalDebt || 0)).toLocaleString('vi-VN')
                    : '0'}₫
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 xl:col-span-1 card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">BXH</h2>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="space-y-3 max-h-[144px] overflow-y-auto pr-2">
              {people
                .slice()
                .sort((a, b) => (b.totalDebt || 0) - (a.totalDebt || 0))
                .map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500">#{idx + 1}</span>
                      <span className="font-medium text-gray-800">{p.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-red-600">{p.totalDebt.toLocaleString('vi-VN')}₫</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Recent Transactions Card */}
          <div className="lg:col-span-3 xl:col-span-1 card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4 pr-4">
              <h2 className="text-lg font-semibold text-gray-700">Recent</h2>
              <span className="flex-shrink-0 z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7v5l3 3" />
                </svg>
              </span>
            </div>
            <div className="space-y-3 max-h-[144px] overflow-y-auto pr-2">
              {(() => {
                // Get all transactions with person names
                const transactionsWithNames = allTransactions.map(tx => {
                  const person = people.find(p => p.id === tx.personId);
                  return {
                    ...tx,
                    personName: person?.name || 'Unknown'
                  };
                });

                // Sort by date descending
                const sortedTransactions = transactionsWithNames.sort((a, b) => 
                  new Date(b.date).getTime() - new Date(a.date).getTime()
                );

                // Take top 5
                const recentTransactions = sortedTransactions.slice(0, 5);

                if (recentTransactions.length === 0) {
                  return (
                    <div className="text-center text-gray-500 py-4">
                      No recent transactions
                    </div>
                  );
                }

                return recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div>
                      <div className="font-medium text-gray-800">{tx.personName}</div>
                      <div className="text-xs text-gray-500">{tx.date}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${tx.type === 'debt' ? 'text-red-600' : 'text-green-600'}`}>
                        {tx.amount.toLocaleString('vi-VN')}₫
                      </div>
                      <div className="text-xs text-gray-500">{tx.type === 'debt' ? 'Debt' : 'Payment'}</div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">People</h2>
              {isEditMode && (
                <button
                  onClick={() => setIsAddingPerson(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Person
                </button>
              )}
            </div>

            {isEditMode && isAddingPerson && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in">
                <input
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="Enter name"
                  className="input-field mb-4"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsAddingPerson(false);
                      setNewPersonName('');
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPerson}
                    className="btn-primary"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <PersonList
              people={people}
              selectedPerson={selectedPerson}
              onSelectPerson={setSelectedPerson}
            />
          </div>

          {selectedPerson && (
            <div className="card p-6 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{selectedPerson.name}</h2>
                  <p className="text-sm text-gray-500">Total Debt: {selectedPerson.totalDebt.toLocaleString('vi-VN')}₫</p>
                </div>
                {isEditMode && (
                  <button
                    onClick={() => setIsAddingTransaction(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Transaction
                  </button>
                )}
              </div>

              {isEditMode && isAddingTransaction && (
                <div className="mb-6">
                  <TransactionForm
                    onSubmit={handleTransaction}
                    onCancel={() => setIsAddingTransaction(false)}
                    personName={selectedPerson.name}
                    currentDebt={selectedPerson.totalDebt}
                    personId={selectedPerson.id}
                  />
                </div>
              )}

              <TransactionHistory
                transactions={transactions}
                onDeleteTransaction={isEditMode ? handleDeleteTransaction : undefined}
                onEditTransaction={isEditMode ? handleEditTransaction : undefined}
                isEditMode={isEditMode}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
