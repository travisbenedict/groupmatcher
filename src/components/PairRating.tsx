import React from 'react';
import { Star, Heart, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { Person, PairRating as PairRatingType, Constraint } from '../types';

interface PairRatingProps {
  people: Person[];
  ratings: PairRatingType[];
  constraints: Constraint[];
  onRatingChange: (person1Id: string, person2Id: string, rating: number) => void;
  onConstraintChange: (person1Id: string, person2Id: string, type: 'must-pair' | 'cannot-pair' | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PairRating: React.FC<PairRatingProps> = ({
  people,
  ratings,
  constraints,
  onRatingChange,
  onConstraintChange,
  onNext,
  onBack
}) => {
  const [currentPairIndex, setCurrentPairIndex] = React.useState(0);

  const pairs = [];
  for (let i = 0; i < people.length; i++) {
    for (let j = i + 1; j < people.length; j++) {
      pairs.push({ person1: people[i], person2: people[j] });
    }
  }

  const currentPair = pairs[currentPairIndex];
  const totalPairs = pairs.length;

  const getRating = (person1Id: string, person2Id: string): number => {
    const rating = ratings.find(r => 
      (r.person1Id === person1Id && r.person2Id === person2Id) ||
      (r.person1Id === person2Id && r.person2Id === person1Id)
    );
    return rating?.rating || 3;
  };

  const getConstraint = (person1Id: string, person2Id: string): 'must-pair' | 'cannot-pair' | null => {
    const constraint = constraints.find(c => 
      (c.person1Id === person1Id && c.person2Id === person2Id) ||
      (c.person1Id === person2Id && c.person2Id === person1Id)
    );
    return constraint?.type || null;
  };

  const handleNext = () => {
    if (currentPairIndex < totalPairs - 1) {
      setCurrentPairIndex(currentPairIndex + 1);
    } else {
      onNext();
    }
  };

  const handlePrevious = () => {
    if (currentPairIndex > 0) {
      setCurrentPairIndex(currentPairIndex - 1);
    }
  };

  const handleRatingClick = (rating: number) => {
    const currentConstraint = getConstraint(currentPair.person1.id, currentPair.person2.id);
    // Only set rating if no constraint is active
    if (!currentConstraint) {
      onRatingChange(currentPair.person1.id, currentPair.person2.id, rating);
      // Auto-advance to next pair
      setTimeout(() => {
        handleNext();
      }, 300); // Small delay for visual feedback
    }
  };

  const handleConstraintClick = (type: 'must-pair' | 'cannot-pair') => {
    const currentConstraint = getConstraint(currentPair.person1.id, currentPair.person2.id);
    const newConstraint = currentConstraint === type ? null : type;
    onConstraintChange(currentPair.person1.id, currentPair.person2.id, newConstraint);
    
    // Auto-advance to next pair after setting/removing constraint
    setTimeout(() => {
      handleNext();
    }, 300); // Small delay for visual feedback
  };

  if (!currentPair) return null;

  const currentRating = getRating(currentPair.person1.id, currentPair.person2.id);
  const currentConstraint = getConstraint(currentPair.person1.id, currentPair.person2.id);
  const ratedPairs = ratings.length + constraints.length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 min-h-[600px] flex flex-col">
        {/* Header with progress */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Rate This Pairing</h2>
          <div className="text-right">
            <p className="text-lg font-medium text-gray-700">
              {currentPairIndex + 1} of {totalPairs}
            </p>
            <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentPairIndex + 1) / totalPairs) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col justify-center">
          {/* People cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                {currentPair.person1.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {currentPair.person1.name}
              </h3>
              {currentPair.person1.description && (
                <p className="text-gray-600">{currentPair.person1.description}</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-xl text-center">
              <div className="w-20 h-20 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                {currentPair.person2.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {currentPair.person2.name}
              </h3>
              {currentPair.person2.description && (
                <p className="text-gray-600">{currentPair.person2.description}</p>
              )}
            </div>
          </div>

          {/* Rating section */}
          <div className="text-center mb-8">
            <h4 className="text-xl font-semibold text-gray-700 mb-4">
              How well would these two work together?
            </h4>
            <div className="flex justify-center space-x-3 mb-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingClick(rating)}
                  disabled={!!currentConstraint}
                  className={`p-3 rounded-full transition-all transform hover:scale-110 ${
                    currentConstraint 
                      ? 'text-gray-300 cursor-not-allowed opacity-50'
                      : currentRating >= rating
                      ? 'text-yellow-500 bg-yellow-100 shadow-lg'
                      : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-50'
                  }`}
                >
                  <Star 
                    size={32} 
                    fill={!currentConstraint && currentRating >= rating ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
            </div>
            <div className="text-center">
              {currentConstraint ? (
                <span className="text-lg font-medium text-gray-500">
                  Rating disabled - constraint active
                </span>
              ) : (
                <span className={`text-lg font-medium ${
                  currentRating === 1 ? 'text-red-600' :
                  currentRating === 2 ? 'text-orange-600' :
                  currentRating === 3 ? 'text-gray-600' :
                  currentRating === 4 ? 'text-blue-600' :
                  'text-green-600'
                }`}>
                  {currentRating === 1 ? 'Bad Match' :
                   currentRating === 2 ? 'Poor Match' :
                   currentRating === 3 ? 'Neutral' :
                   currentRating === 4 ? 'Good Match' :
                   'Excellent Match'}
                </span>
              )}
            </div>
          </div>

          {/* Constraint buttons */}
          <div className="text-center mb-8">
            <h4 className="text-lg font-medium text-gray-700 mb-4">Special Requirements</h4>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleConstraintClick('must-pair')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  currentConstraint === 'must-pair'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                <Heart size={20} fill={currentConstraint === 'must-pair' ? 'currentColor' : 'none'} />
                Must Pair
              </button>
              <button
                onClick={() => handleConstraintClick('cannot-pair')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  currentConstraint === 'cannot-pair'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                <X size={20} />
                Cannot Pair
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            onClick={currentPairIndex === 0 ? onBack : handlePrevious}
            className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            {currentPairIndex === 0 ? 'Back to People' : 'Previous Pair'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {ratedPairs} of {totalPairs} pairs completed
            </p>
          </div>

          {currentPairIndex === totalPairs - 1 && (currentRating > 0 || currentConstraint) ? (
            <button
              onClick={handleNext}
              className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              Continue to Configuration
              <ArrowRight size={20} />
            </button>
          ) : (
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {currentRating > 0 || currentConstraint ? 'Auto-advancing...' : 'Rate this pair or set a constraint'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};