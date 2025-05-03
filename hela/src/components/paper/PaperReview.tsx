import React from 'react';

interface Topic {
  id: string;
  title: string;
  selected: boolean;
  weight: number;
}

interface Chapter {
  id: string;
  title: string;
  selected: boolean;
  topics?: Topic[];
}

interface QuestionType {
  id: string;
  title: string;
  selected: boolean;
  percentage: number;
}

interface QuestionBank {
  id: string;
  name: string;
  standard_id: string;
  subject_id: string;
}

interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

interface PaperReviewProps {
  paperTitle: string;
  totalMarks: number;
  totalTime: number;
  standardName: string;
  subjectName: string;
  paperType: 'custom' | 'random';
  selectedChapters: Chapter[];
  selectedQuestionTypes: QuestionType[];
  difficultyDistribution: DifficultyDistribution;
  questionBanks: QuestionBank[];
  selectedQuestionBanks: string[];
  onQuestionBanksChange: (bankIds: string[]) => void;
}

const PaperReview: React.FC<PaperReviewProps> = ({
  paperTitle,
  totalMarks,
  totalTime,
  standardName,
  subjectName,
  paperType,
  selectedChapters,
  selectedQuestionTypes,
  difficultyDistribution,
  questionBanks,
  selectedQuestionBanks,
  onQuestionBanksChange
}) => {
  // Handle question bank selection
  const handleBankSelection = (bankId: string) => {
    if (selectedQuestionBanks.includes(bankId)) {
      // Remove from selection
      onQuestionBanksChange(selectedQuestionBanks.filter(id => id !== bankId));
    } else {
      // Add to selection
      onQuestionBanksChange([...selectedQuestionBanks, bankId]);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Review Paper Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Please review all your selections before generating the question paper.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-base font-medium text-gray-900">Basic Information</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Title:</span>
              <span className="text-sm text-gray-900">{paperTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Standard/Class:</span>
              <span className="text-sm text-gray-900">{standardName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Subject:</span>
              <span className="text-sm text-gray-900">{subjectName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Total Marks:</span>
              <span className="text-sm text-gray-900">{totalMarks} marks</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Duration:</span>
              <span className="text-sm text-gray-900">{totalTime} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Generation Method:</span>
              <span className="text-sm text-gray-900">{paperType === 'custom' ? 'Custom' : 'Random'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-base font-medium text-gray-900">Difficulty Distribution</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="space-y-4">
              {/* Difficulty level chart visualization */}
              <div className="h-8 flex items-center rounded-md overflow-hidden">
                <div
                  style={{ width: `${difficultyDistribution.easy}%` }}
                  className="h-full bg-green-500 flex items-center justify-center text-xs text-white"
                >
                  {difficultyDistribution.easy}%
                </div>
                <div
                  style={{ width: `${difficultyDistribution.medium}%` }}
                  className="h-full bg-yellow-500 flex items-center justify-center text-xs text-white"
                >
                  {difficultyDistribution.medium}%
                </div>
                <div
                  style={{ width: `${difficultyDistribution.hard}%` }}
                  className="h-full bg-red-500 flex items-center justify-center text-xs text-white"
                >
                  {difficultyDistribution.hard}%
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="inline-flex items-center">
                  <div className="h-3 w-3 bg-green-500 mr-1 rounded-sm"></div>
                  <span className="text-sm text-gray-600">Easy: {difficultyDistribution.easy}%</span>
                </span>
                <span className="inline-flex items-center">
                  <div className="h-3 w-3 bg-yellow-500 mr-1 rounded-sm"></div>
                  <span className="text-sm text-gray-600">Medium: {difficultyDistribution.medium}%</span>
                </span>
                <span className="inline-flex items-center">
                  <div className="h-3 w-3 bg-red-500 mr-1 rounded-sm"></div>
                  <span className="text-sm text-gray-600">Hard: {difficultyDistribution.hard}%</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {paperType === 'custom' && selectedChapters.length > 0 && (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-base font-medium text-gray-900">Selected Chapters & Topics</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedChapters.map((chapter) => (
                <div key={chapter.id} className="border border-gray-200 rounded-md p-3">
                  <h4 className="font-medium text-gray-700">{chapter.title}</h4>
                  {chapter.topics && chapter.topics.filter(t => t.selected).length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-1">Selected Topics:</p>
                      <ul className="space-y-1">
                        {chapter.topics.filter(t => t.selected).map((topic) => (
                          <li key={topic.id} className="text-sm text-gray-700 flex items-center justify-between">
                            <span>{topic.title}</span>
                            {topic.weight !== 1 && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                Weight: {topic.weight.toFixed(1)}x
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-base font-medium text-gray-900">Question Types</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          {selectedQuestionTypes.length > 0 ? (
            <div>
              {/* Question type chart visualization */}
              <div className="h-8 w-full flex rounded-md overflow-hidden mb-4">
                {selectedQuestionTypes.map((type, index) => {
                  // Generate a color based on index
                  const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-red-500', 'bg-orange-500'];
                  const bgColor = colors[index % colors.length];
                  
                  return (
                    <div
                      key={type.id}
                      style={{ width: `${type.percentage}%` }}
                      className={`h-full ${bgColor} flex items-center justify-center text-xs text-white`}
                    >
                      {type.percentage > 8 ? `${type.percentage.toFixed(0)}%` : ''}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {selectedQuestionTypes.map((type, index) => {
                  const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-red-500', 'bg-orange-500'];
                  const bgColor = colors[index % colors.length];
                  
                  return (
                    <div key={type.id} className="flex items-center">
                      <div className={`h-3 w-3 ${bgColor} mr-2 rounded-sm`}></div>
                      <span className="text-sm text-gray-700">{type.title}: {type.percentage.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No question types selected.</p>
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center">
          <h3 className="text-base font-medium text-gray-900">Select Question Banks</h3>
          <span className="text-sm text-gray-500">
            {selectedQuestionBanks.length} of {questionBanks.length} selected
          </span>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          {questionBanks.length > 0 ? (
            <div className="space-y-2">
              {questionBanks.map(bank => (
                <div key={bank.id} className="flex items-center">
                  <input
                    id={`bank-${bank.id}`}
                    name={`bank-${bank.id}`}
                    type="checkbox"
                    checked={selectedQuestionBanks.includes(bank.id)}
                    onChange={() => handleBankSelection(bank.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`bank-${bank.id}`} className="ml-3 text-sm font-medium text-gray-700">
                    {bank.name}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded">
              No question banks available for the selected subject and standard.
            </div>
          )}
          {questionBanks.length > 0 && selectedQuestionBanks.length === 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                You must select at least one question bank to generate a paper.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaperReview;