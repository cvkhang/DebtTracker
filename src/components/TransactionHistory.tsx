import React from 'react';
import { PaymentRecord } from '../types';

interface TransactionHistoryProps {
  transactions: PaymentRecord[];
  onDeleteTransaction?: (id: string) => void;
  onEditTransaction?: (transaction: PaymentRecord) => void;
  isEditMode: boolean;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  onDeleteTransaction,
  onEditTransaction,
  isEditMode,
}) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-gray-500">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((transaction) => (
          <div
            key={transaction.id}
            className={`p-4 rounded-lg transition-all duration-200 ${
              transaction.type === 'debt'
                ? 'bg-red-50 border border-red-200'
                : 'bg-green-50 border border-green-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    transaction.type === 'debt'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {transaction.type === 'debt' ? 'Debt' : 'Payment'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="text-gray-900 font-medium mb-1">{transaction.description}</p>
                <p className={`text-lg font-semibold ${
                  transaction.type === 'debt' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {transaction.type === 'debt' ? '-' : '+'}
                  {transaction.amount.toLocaleString('vi-VN')}₫
                </p>
              </div>
              {isEditMode && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditTransaction?.(transaction)}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDeleteTransaction?.(transaction.id)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default TransactionHistory; 