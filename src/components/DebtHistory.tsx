import React from 'react';
import { DebtEntry } from '../types';

interface DebtHistoryProps {
  debts: DebtEntry[];
  onAddPayment: (debtId: string) => void;
  onViewDetails: (debt: DebtEntry) => void;
}

const DebtHistory: React.FC<DebtHistoryProps> = ({
  debts,
  onAddPayment,
  onViewDetails,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Debt History</h2>
      <div className="space-y-4">
        {debts.map((debt) => (
          <div key={debt.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{debt.person}</h3>
                <div className="text-sm text-gray-500">
                  <p>Amount: {debt.amount.toLocaleString()} VND</p>
                  <p>Status: {debt.status}</p>
                  <p>Date: {new Date(debt.date).toLocaleDateString()}</p>
                  {debt.description && <p>Description: {debt.description}</p>}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onAddPayment(debt.id)}
                  className="text-green-500 hover:text-green-600"
                >
                  Add Payment
                </button>
                <button
                  onClick={() => onViewDetails(debt)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  View Details
                </button>
              </div>
            </div>
            {debt.paymentHistory.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Payment History</h4>
                <div className="space-y-2">
                  {debt.paymentHistory.map((payment) => (
                    <div
                      key={payment.id}
                      className="bg-gray-50 rounded p-2 text-sm"
                    >
                      <div className="flex justify-between">
                        <span>{payment.amount.toLocaleString()} VND</span>
                        <span>{new Date(payment.date).toLocaleDateString()}</span>
                      </div>
                      {payment.description && (
                        <p className="text-gray-500">{payment.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebtHistory; 