import React, { useState } from 'react';
import { Upload, Plus, Trash2 } from 'lucide-react';
import { Person } from '../types';
import { parseCsv } from '../utils/optimization';

interface DataInputProps {
  people: Person[];
  onPeopleChange: (people: Person[]) => void;
  onNext: () => void;
  groupingName: string;
  onGroupingNameChange: (name: string) => void;
}

export const DataInput: React.FC<DataInputProps> = ({ people, onPeopleChange, onNext, groupingName, onGroupingNameChange }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const addPerson = () => {
    if (!name.trim()) return;
    
    const newPerson: Person = {
      id: `person-${Date.now()}`,
      name: name.trim(),
      description: description.trim()
    };
    
    onPeopleChange([...people, newPerson]);
    setName('');
    setDescription('');
  };

  const removePerson = (id: string) => {
    onPeopleChange(people.filter(p => p.id !== id));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      try {
        const parsedPeople = parseCsv(csvText);
        onPeopleChange([...people, ...parsedPeople]);
      } catch (error) {
        alert('Error parsing CSV file. Please ensure it has Name and Description columns.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Add People</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">Grouping Name</label>
          <input
            type="text"
            value={groupingName}
            onChange={(e) => onGroupingNameChange(e.target.value)}
            placeholder="Enter a name for this grouping (e.g., Project Alpha Team)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Manual Entry</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter person's name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && addPerson()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description or notes"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && addPerson()}
                />
              </div>
              <button
                onClick={addPerson}
                disabled={!name.trim()}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Person
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">CSV Upload</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <Upload className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 mb-4">Upload a CSV file with Name and Description columns</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 cursor-pointer transition-colors inline-block"
              >
                Choose CSV File
              </label>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>CSV format example:</p>
              <code className="bg-gray-100 p-2 rounded block mt-1">
                Name,Description<br/>
                John Smith,Team lead<br/>
                Jane Doe,Designer
              </code>
            </div>
          </div>
        </div>

        {people.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              People Added ({people.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
              {people.map((person) => (
                <div key={person.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{person.name}</h4>
                    {person.description && (
                      <p className="text-sm text-gray-600 mt-1">{person.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removePerson(person.id)}
                    className="text-red-500 hover:text-red-700 ml-2 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={onNext}
            disabled={people.length < 2}
            className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-medium"
          >
            Continue to Rating ({people.length} people)
          </button>
        </div>
      </div>
    </div>
  );
};