import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { Person, PairRating, Constraint, AppStep, Group } from './types';
import { DataInput } from './components/DataInput';
import { PairRating as PairRatingComponent } from './components/PairRating';
import { GroupConfiguration } from './components/GroupConfiguration';
import { Results } from './components/Results';

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('input');
  const [groupingName, setGroupingName] = useState('');
  const [people, setPeople] = useState<Person[]>([]);
  const [ratings, setRatings] = useState<PairRating[]>([]);
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [groupSize, setGroupSize] = useState(4);

  const handleRatingChange = (person1Id: string, person2Id: string, rating: number) => {
    const existingRatingIndex = ratings.findIndex(r => 
      (r.person1Id === person1Id && r.person2Id === person2Id) ||
      (r.person1Id === person2Id && r.person2Id === person1Id)
    );

    if (existingRatingIndex >= 0) {
      const updatedRatings = [...ratings];
      updatedRatings[existingRatingIndex] = { person1Id, person2Id, rating };
      setRatings(updatedRatings);
    } else {
      setRatings([...ratings, { person1Id, person2Id, rating }]);
    }
  };

  const handleConstraintChange = (person1Id: string, person2Id: string, type: 'must-pair' | 'cannot-pair' | null) => {
    const existingConstraintIndex = constraints.findIndex(c => 
      (c.person1Id === person1Id && c.person2Id === person2Id) ||
      (c.person1Id === person2Id && c.person2Id === person1Id)
    );

    if (existingConstraintIndex >= 0) {
      if (type === null) {
        // Remove constraint
        setConstraints(constraints.filter((_, index) => index !== existingConstraintIndex));
      } else {
        // Update constraint
        const updatedConstraints = [...constraints];
        updatedConstraints[existingConstraintIndex] = {
          ...updatedConstraints[existingConstraintIndex],
          type
        };
        setConstraints(updatedConstraints);
      }
    } else if (type !== null) {
      // Add new constraint
      const newConstraint: Constraint = {
        id: `constraint-${Date.now()}`,
        person1Id,
        person2Id,
        type
      };
      setConstraints([...constraints, newConstraint]);
    }
  };
  const resetApp = () => {
    setCurrentStep('input');
    setPeople([]);
    setRatings([]);
    setConstraints([]);
    setGroupSize(4);
  };

  const stepTitles = {
    input: 'Data Input',
    rating: 'Rate & Constrain',
    configuration: 'Configure Groups',
    results: 'Results'
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="text-blue-600" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Group Matcher</h1>
                <p className="text-sm text-gray-600">Optimal group formation tool</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {Object.entries(stepTitles).map(([step, title], index) => (
                <div
                  key={step}
                  className={`flex items-center ${index < Object.keys(stepTitles).length - 1 ? 'mr-2' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step === currentStep
                        ? 'bg-blue-600 text-white'
                        : Object.keys(stepTitles).indexOf(currentStep) > Object.keys(stepTitles).indexOf(step)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < Object.keys(stepTitles).length - 1 && (
                    <div className="w-8 h-0.5 bg-gray-200 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        {currentStep === 'input' && (
          <DataInput
            people={people}
            onPeopleChange={setPeople}
            onNext={() => setCurrentStep('rating')}
            groupingName={groupingName}
            onGroupingNameChange={setGroupingName}
          />
        )}

        {currentStep === 'rating' && (
          <PairRatingComponent
            people={people}
            ratings={ratings}
            constraints={constraints}
            onRatingChange={handleRatingChange}
            onConstraintChange={handleConstraintChange}
            onNext={() => setCurrentStep('configuration')}
            onBack={() => setCurrentStep('input')}
          />
        )}


        {currentStep === 'configuration' && (
          <GroupConfiguration
            people={people}
            onNext={(size) => {
              setGroupSize(size);
              setCurrentStep('results');
            }}
            onBack={() => setCurrentStep('rating')}
          />
        )}

        {currentStep === 'results' && (
          <Results
            people={people}
            ratings={ratings}
            constraints={constraints}
            initialGroupSize={groupSize}
            onBack={() => setCurrentStep('configuration')}
            onStartOver={resetApp}
            groupingName={groupingName}
          />
        )}
      </main>
    </div>
  );
}

export default App;