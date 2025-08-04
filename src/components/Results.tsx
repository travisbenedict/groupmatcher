import React, { useState, useEffect } from 'react';
import { Users, RotateCcw, Star, Settings } from 'lucide-react';
import { Group, Person, PairRating, Constraint } from '../types';
import { optimizeGroups, calculateGroupScore } from '../utils/optimization';

interface ResultsProps {
  people: Person[];
  ratings: PairRating[];
  constraints: Constraint[];
  initialGroupSize: number;
  onBack: () => void;
  onStartOver: () => void;
}

export const Results: React.FC<ResultsProps> = ({
  people,
  ratings,
  constraints,
  initialGroupSize,
  onBack,
  onStartOver
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupSize, setGroupSize] = useState(initialGroupSize);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const calculateGroups = (size: number) => {
    setIsCalculating(true);
    // Add small delay to show loading state
    setTimeout(() => {
      const optimizedGroups = optimizeGroups(people, ratings, constraints, size);
      setGroups(optimizedGroups);
      setIsCalculating(false);
    }, 500);
  };

  useEffect(() => {
    calculateGroups(initialGroupSize);
  }, []);

  const handleRecalculate = () => {
    calculateGroups(groupSize);
    setShowConfig(false);
  };

  const totalScore = groups.reduce((sum, group) => sum + group.totalScore, 0);
  const maxPossibleScore = groups.reduce((sum, group) => 
    sum + (group.members.length * (group.members.length - 1) / 2) * 5, 0
  );
  const efficiencyPercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

  if (isCalculating) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin mx-auto mb-4 text-blue-600">
            <Users size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Calculating Optimal Groups</h2>
          <p className="text-gray-600">Finding the best arrangement based on your ratings and constraints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Optimal Groups</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Total Score: <strong className="text-blue-600">{totalScore.toFixed(1)}</strong></span>
              <span>Efficiency: <strong className="text-green-600">{efficiencyPercentage.toFixed(1)}%</strong></span>
              <span>{groups.length} groups created</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Settings size={16} />
              Adjust
            </button>
            <button
              onClick={onStartOver}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Start Over
            </button>
          </div>
        </div>

        {showConfig && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-blue-800">People per group:</label>
              <input
                type="number"
                min="2"
                max={people.length}
                value={groupSize}
                onChange={(e) => setGroupSize(parseInt(e.target.value) || 2)}
                className="px-3 py-1 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleRecalculate}
                className="bg-blue-600 text-white py-1 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Recalculate
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group, index) => (
            <div key={group.id} className="bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Group {index + 1}
                </h3>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star size={16} fill="currentColor" />
                  <span className="text-sm font-medium text-gray-700">
                    {group.totalScore.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {group.members.map((member) => (
                  <div key={member.id} className="bg-white p-3 rounded-lg">
                    <h4 className="font-medium text-gray-800">{member.name}</h4>
                    {member.description && (
                      <p className="text-sm text-gray-600 mt-1">{member.description}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  {group.members.length} members • Avg rating: {
                    group.members.length > 1 
                      ? (group.totalScore / (group.members.length * (group.members.length - 1) / 2)).toFixed(1)
                      : 'N/A'
                  }
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{people.length}</div>
              <div className="text-sm text-gray-600">Total People</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{groups.length}</div>
              <div className="text-sm text-gray-600">Groups Created</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{constraints.length}</div>
              <div className="text-sm text-gray-600">Constraints Applied</div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={onBack}
            className="bg-gray-600 text-white py-3 px-8 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Configuration
          </button>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-2">
              Groups optimized based on {ratings.length} ratings and {constraints.length} constraints
            </p>
            <p className="text-lg font-medium text-green-600">
              ✓ Optimization Complete
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};