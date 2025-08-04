import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Person } from '../types';

interface GroupConfigurationProps {
  people: Person[];
  onNext: (groupSize: number) => void;
  onBack: () => void;
}

export const GroupConfiguration: React.FC<GroupConfigurationProps> = ({
  people,
  onNext,
  onBack
}) => {
  const [configType, setConfigType] = useState<'group-size' | 'num-groups'>('group-size');
  const [groupSize, setGroupSize] = useState(4);
  const [numGroups, setNumGroups] = useState(Math.ceil(people.length / 4));

  const handleNext = () => {
    if (configType === 'group-size') {
      onNext(groupSize);
    } else {
      const calculatedGroupSize = Math.ceil(people.length / numGroups);
      onNext(calculatedGroupSize);
    }
  };

  const calculatedGroups = configType === 'group-size' 
    ? Math.ceil(people.length / groupSize)
    : numGroups;

  const calculatedGroupSize = configType === 'num-groups'
    ? Math.ceil(people.length / numGroups)
    : groupSize;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Configure Groups</h2>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2 text-blue-800">
            <Calculator size={20} />
            <span className="font-medium">Total People: {people.length}</span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-4">Configuration Method</label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="configType"
                  value="group-size"
                  checked={configType === 'group-size'}
                  onChange={(e) => setConfigType(e.target.value as 'group-size' | 'num-groups')}
                  className="mr-3 text-blue-600"
                />
                <span className="text-gray-700">Set people per group</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="configType"
                  value="num-groups" 
                  checked={configType === 'num-groups'}
                  onChange={(e) => setConfigType(e.target.value as 'group-size' | 'num-groups')}
                  className="mr-3 text-blue-600"
                />
                <span className="text-gray-700">Set number of groups</span>
              </label>
            </div>
          </div>

          {configType === 'group-size' ? (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                People per group
              </label>
              <input
                type="number"
                min="2"
                max={people.length}
                value={groupSize}
                onChange={(e) => setGroupSize(parseInt(e.target.value) || 2)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Number of groups
              </label>
              <input
                type="number"
                min="1"
                max={Math.floor(people.length / 2)}
                value={numGroups}
                onChange={(e) => setNumGroups(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Preview</h3>
            <div className="text-gray-600 space-y-1">
              <p>• Number of groups: <span className="font-medium">{calculatedGroups}</span></p>
              <p>• People per group: <span className="font-medium">~{calculatedGroupSize}</span></p>
              <p className="text-sm text-gray-500 mt-2">
                Some groups may have ±1 person to distribute everyone evenly
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={onBack}
            className="bg-gray-600 text-white py-3 px-8 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700 transition-colors"
          >
            Calculate Optimal Groups
          </button>
        </div>
      </div>
    </div>
  );
};