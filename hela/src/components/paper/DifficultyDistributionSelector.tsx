import React, { useState, useEffect } from 'react';

interface DifficultyDistributionSelectorProps {
  distribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  onDistributionChange: (easy: number, medium: number, hard: number) => void;
}

const DifficultyDistributionSelector: React.FC<DifficultyDistributionSelectorProps> = ({
  distribution,
  onDistributionChange
}) => {
  const [easy, setEasy] = useState(distribution.easy);
  const [medium, setMedium] = useState(distribution.medium);
  const [hard, setHard] = useState(distribution.hard);
  const [isAutoAdjusting, setIsAutoAdjusting] = useState(false);

  // Total percentage
  const totalPercentage = easy + medium + hard;
  const percentageDifference = Math.abs(100 - totalPercentage);

  // Update local state when props change
  useEffect(() => {
    if (!isAutoAdjusting) {
      setEasy(distribution.easy);
      setMedium(distribution.medium);
      setHard(distribution.hard);
    }
  }, [distribution, isAutoAdjusting]);

  // Auto-balance to ensure total is 100%
  const autoBalance = () => {
    setIsAutoAdjusting(true);
    
    // Calculate even distribution
    const evenValue = Math.floor(100 / 3);
    let newEasy = evenValue;
    let newMedium = evenValue;
    let newHard = evenValue;
    
    // Add any remainder to medium (most balanced option)
    const remainder = 100 - (evenValue * 3);
    newMedium += remainder;
    
    setEasy(newEasy);
    setMedium(newMedium);
    setHard(newHard);
    
    onDistributionChange(newEasy, newMedium, newHard);
    setIsAutoAdjusting(false);
  };

  // Apply changes when user updates sliders
  const applyChanges = () => {
    if (totalPercentage !== 100) {
      // Normalize to 100%
      const factor = 100 / totalPercentage;
      const newEasy = Math.round(easy * factor);
      const newMedium = Math.round(medium * factor);
      // Ensure the total is exactly 100 by calculating hard as remainder
      const newHard = 100 - (newEasy + newMedium);
      
      setEasy(newEasy);
      setMedium(newMedium);
      setHard(newHard);
      
      onDistributionChange(newEasy, newMedium, newHard);
    } else {
      // Already totals 100, just apply
      onDistributionChange(easy, medium, hard);
    }
  };

  // Handle individual slider changes
  const handleEasyChange = (value: number) => {
    const newEasy = value;
    const remaining = 100 - newEasy;
    
    // Maintain ratio between medium and hard if possible
    const currentTotal = medium + hard;
    if (currentTotal > 0) {
      const mediumRatio = medium / currentTotal;
      const newMedium = Math.round(remaining * mediumRatio);
      const newHard = 100 - newEasy - newMedium;
      
      setEasy(newEasy);
      setMedium(newMedium);
      setHard(newHard);
    } else {
      // Split remaining evenly
      setEasy(newEasy);
      setMedium(Math.round(remaining / 2));
      setHard(Math.round(remaining / 2));
    }
  };

  const handleMediumChange = (value: number) => {
    const newMedium = value;
    const remaining = 100 - newMedium;
    
    // Maintain ratio between easy and hard if possible
    const currentTotal = easy + hard;
    if (currentTotal > 0) {
      const easyRatio = easy / currentTotal;
      const newEasy = Math.round(remaining * easyRatio);
      const newHard = 100 - newMedium - newEasy;
      
      setEasy(newEasy);
      setMedium(newMedium);
      setHard(newHard);
    } else {
      // Split remaining evenly
      setEasy(Math.round(remaining / 2));
      setMedium(newMedium);
      setHard(Math.round(remaining / 2));
    }
  };

  const handleHardChange = (value: number) => {
    const newHard = value;
    const remaining = 100 - newHard;
    
    // Maintain ratio between easy and medium if possible
    const currentTotal = easy + medium;
    if (currentTotal > 0) {
      const easyRatio = easy / currentTotal;
      const newEasy = Math.round(remaining * easyRatio);
      const newMedium = 100 - newHard - newEasy;
      
      setEasy(newEasy);
      setMedium(newMedium);
      setHard(newHard);
    } else {
      // Split remaining evenly
      setEasy(Math.round(remaining / 2));
      setMedium(Math.round(remaining / 2));
      setHard(newHard);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Difficulty Distribution</h2>
        <p className="mt-1 text-sm text-gray-500">
          Set the distribution of questions by difficulty level. The total should sum to 100%.
        </p>
      </div>

      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm space-y-6">
        {percentageDifference > 1 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-700">
              {totalPercentage > 100 ? 
                `Your distribution exceeds 100% by ${(totalPercentage - 100).toFixed(1)}%.` : 
                `Your distribution is short of 100% by ${(100 - totalPercentage).toFixed(1)}%.`}
              {' '}This will be automatically adjusted when you continue.
            </p>
          </div>
        )}

        <div className="space-y-5">
          {/* Easy Questions */}
          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="easy-slider" className="block text-sm font-medium text-gray-700">
                Easy Questions
              </label>
              <span className="text-sm text-gray-500">{easy}%</span>
            </div>
            <div className="mt-1 flex items-center">
              <input
                id="easy-slider"
                type="range"
                min={0}
                max={100}
                value={easy}
                onChange={(e) => handleEasyChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Medium Questions */}
          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="medium-slider" className="block text-sm font-medium text-gray-700">
                Medium Questions
              </label>
              <span className="text-sm text-gray-500">{medium}%</span>
            </div>
            <div className="mt-1">
              <input
                id="medium-slider"
                type="range"
                min={0}
                max={100}
                value={medium}
                onChange={(e) => handleMediumChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Hard Questions */}
          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="hard-slider" className="block text-sm font-medium text-gray-700">
                Hard Questions
              </label>
              <span className="text-sm text-gray-500">{hard}%</span>
            </div>
            <div className="mt-1">
              <input
                id="hard-slider"
                type="range"
                min={0}
                max={100}
                value={hard}
                onChange={(e) => handleHardChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Total percentage display */}
          <div className="flex justify-between items-center border-t border-gray-200 pt-4">
            <span className="text-base font-medium text-gray-900">Total:</span>
            <span className={`text-base font-medium ${
              percentageDifference > 1 ? 'text-red-600' : 'text-green-600'
            }`}>
              {totalPercentage}%
            </span>
          </div>

          {/* Balance button */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={autoBalance}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" />
              </svg>
              Balance Evenly
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DifficultyDistributionSelector;