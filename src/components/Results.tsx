import React, { useState, useEffect } from 'react';
import { Users, RotateCcw, Star, Settings, Download } from 'lucide-react';
import { Group, Person, PairRating, Constraint } from '../types';
import { optimizeGroups, calculateGroupScore } from '../utils/optimization';

interface ResultsProps {
  people: Person[];
  ratings: PairRating[];
  constraints: Constraint[];
  initialGroupSize: number;
  onBack: () => void;
  onStartOver: () => void;
  groupingName: string;
}

export const Results: React.FC<ResultsProps> = ({
  people,
  ratings,
  constraints,
  initialGroupSize,
  onBack,
  onStartOver,
  groupingName
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupSize, setGroupSize] = useState(initialGroupSize);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

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

  const exportToCsv = (withRankings: boolean) => {
    let csvRows = [];
    if (withRankings) {
      const header = ['Person', ...people.map(p => p.name)];
      csvRows.push(header.join(','));

      people.forEach(p1 => {
        const row = [p1.name];
        people.forEach(p2 => {
          if (p1.id === p2.id) {
            row.push('N/A');
            return;
          }

          const constraint = constraints.find(c => 
            (c.person1Id === p1.id && c.person2Id === p2.id) ||
            (c.person1Id === p2.id && c.person2Id === p1.id)
          );

          if (constraint) {
            row.push(constraint.type === 'must-pair' ? '100' : '-1');
            return;
          }

          const rating = ratings.find(r => 
            (r.person1Id === p1.id && r.person2Id === p2.id) ||
            (r.person1Id === p2.id && r.person2Id === p1.id)
          );
          row.push(rating ? rating.rating.toString() : 'N/A');
        });
        csvRows.push(row.join(','));
      });
    } else {
      csvRows.push('Group,Person');
      groups.forEach((group, index) => {
        group.members.forEach(person => {
          csvRows.push(`${index + 1},${person.name}`);
        });
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${groupingName || 'groups'}${withRankings ? '_with_rankings' : ''}.csv`);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  }

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
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{groupingName || 'Optimal Groups'}</h2>
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
            <div className="relative inline-block text-left">
              <div>
                <button type="button" onClick={() => setShowExportMenu(!showExportMenu)} className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500" id="options-menu" aria-haspopup="true" aria-expanded="true">
                  <Download size={16} className="-ml-1 mr-2 h-5 w-5" />
                  Export
                </button>
              </div>
              {showExportMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <button type="button" onClick={() => { exportToCsv(false); setShowExportMenu(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">Export Groups</button>
                    <button type="button" onClick={() => { exportToCsv(true); setShowExportMenu(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-ray-100 hover:text-gray-900" role="menuitem">Export with Rankings</button>
                  </div>
                </div>
              )}
            </div>
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