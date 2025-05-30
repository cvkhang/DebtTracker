import React from 'react';
import { Person } from '../types';

interface PersonListProps {
  people: Person[];
  selectedPerson: Person | null;
  onSelectPerson: (person: Person) => void;
}

const PersonList: React.FC<PersonListProps> = ({
  people,
  selectedPerson,
  onSelectPerson,
}) => {
  return (
    <div className="space-y-2">
      {people.length === 0 ? (
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-gray-500">No people added yet</p>
        </div>
      ) : (
        people.map((person) => (
          <div
            key={person.id}
            className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedPerson?.id === person.id 
                ? 'bg-blue-50 border-2 border-blue-500' 
                : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm'
            }`}
            onClick={() => onSelectPerson(person)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedPerson?.id === person.id ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <span className="text-lg font-medium text-gray-600">
                    {person.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{person.name}</h3>
                  <p className="text-sm text-gray-500">
                    Total Debt: {person.totalDebt.toLocaleString('vi-VN')}₫
                  </p>
                </div>
              </div>
              {selectedPerson?.id === person.id && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PersonList; 