import React from 'react';

interface QuestionType {
  id: string;
  title: string;
  selected: boolean;
  percentage: number;
}

interface QuestionTypeSelectorProps {
  questionTypes: QuestionType[];
  onToggleType: (typeId: string) => void;
  onUpdatePercentage: (typeId: string, percentage: number) => void;
}

const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = ({
  questionTypes,
  onToggleType,
  onUpdatePercentage
}) => {
  const selectedQuestionTypes = questionTypes.filter(type => type.selected);
  const totalPercentage = selectedQuestionTypes.reduce((sum, type) => sum + type.percentage, 0);
  const percentageDifference = Math.abs(100 - totalPercentage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Question Type Distribution</h2>
          <p className="mt-1 text-sm text-gray-500">
            Select the types of questions to include and define their distribution by percentage.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {selectedQuestionTypes.length} of {questionTypes.length} types selected
        </div>
      </div>

      {questionTypes.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
          No question types available.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Question type selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questionTypes.map(type => (
              <div key={type.id} className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id={`question-type-${type.id}`}
                    name={`question-type-${type.id}`}
                    type="checkbox"
                    checked={type.selected}
                    onChange={() => onToggleType(type.id)}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor={`question-type-${type.id}`} className="font-medium text-gray-700">
                    {type.title}
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Distribution section */}
          {selectedQuestionTypes.length > 0 && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900">Mark Distribution</h3>
              <p className="mt-1 text-sm text-gray-500">
                Adjust the percentage of marks for each question type. The total should sum to 100%.
              </p>

              {percentageDifference > 1 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-700">
                    {totalPercentage > 100 ? 
                      `Your distribution exceeds 100% by ${(totalPercentage - 100).toFixed(1)}%.` : 
                      `Your distribution is short of 100% by ${(100 - totalPercentage).toFixed(1)}%.`}
                    {' '}Please adjust your percentages to total 100%.
                  </p>
                </div>
              )}

              <div className="mt-4 space-y-4">
                {selectedQuestionTypes.map(type => (
                  <div key={type.id} className="flex items-center">
                    <span className="w-32 text-sm font-medium text-gray-700">{type.title}:</span>
                    <div className="flex-1 flex items-center space-x-4">
                      <input
                        type="range"
                        id={`percentage-${type.id}`}
                        min="0"
                        max="100"
                        step="1"
                        value={type.percentage}
                        onChange={(e) => onUpdatePercentage(type.id, parseInt(e.target.value, 10))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="w-16 flex items-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={type.percentage}
                          onChange={(e) => onUpdatePercentage(type.id, parseInt(e.target.value, 10) || 0)}
                          className="w-12 py-1 px-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <span className="ml-1 text-sm text-gray-500">%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between items-center border-t border-gray-200 pt-4">
                <span className="font-medium text-gray-900">Total:</span>
                <span className={`font-medium ${
                  Math.abs(totalPercentage - 100) > 1
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  {totalPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionTypeSelector;