// filepath: c:\Users\desai\OneDrive\Desktop\Maverick\hela\src\components\curriculum\AddQuestionsToBank.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { questionApi } from '../../utils/api';
import { Question, QuestionBank } from '../../utils/api/types';

interface AddQuestionsToBankProps {
  isOpen: boolean;
  bankId: string;
  bankName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AddQuestionsToBank: React.FC<AddQuestionsToBankProps> = ({
  isOpen,
  bankId,
  bankName,
  onClose,
  onSuccess
}) => {
  const { token } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // States
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bankQuestionIds, setBankQuestionIds] = useState<string[]>([]);
  const [addingQuestions, setAddingQuestions] = useState(false);
  
  // Filters
  const [filterType, setFilterType] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');
  const [filterMarks, setFilterMarks] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [selectedQuestionDetails, setSelectedQuestionDetails] = useState<Question | null>(null);

  // Handle modal outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleCloseModal();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Controlled modal closing - ensures we clean up state properly
  const handleCloseModal = () => {
    if (!addingQuestions) {
      setSelectedQuestions([]);
      setSelectedQuestionDetails(null);
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  // Load questions when modal opens
  useEffect(() => {
    if (isOpen && token) {
      fetchQuestions();
      fetchQuestionsInBank();
    }
  }, [isOpen, token, bankId]);
  
  // Fetch all available questions
  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await questionApi.getQuestions(token!);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setQuestions(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching questions:', err);
      setError(err?.message || 'An error occurred while fetching questions');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch questions already in the bank
  const fetchQuestionsInBank = async () => {
    try {
      const response = await questionApi.getQuestionsInBank(bankId, token!);
      if (response.error) {
        console.error('Error fetching bank questions:', response.error);
      } else if (response.data) {
        const ids = response.data.map(q => q.id);
        setBankQuestionIds(ids);
      }
    } catch (err) {
      console.error('Error fetching bank questions:', err);
    }
  };

  // Handle question selection
  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
    
    // Clear selected question details when toggling selection
    setSelectedQuestionDetails(null);
  };

  // View question details
  const viewQuestionDetails = (question: Question) => {
    setSelectedQuestionDetails(question);
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterDifficulty('');
    setFilterMarks('');
    setSortOrder('newest');
  };
  
  // Filter questions based on search term and filters
  const filteredQuestions = questions.filter(question => {
    // First eliminate questions already in the bank
    if (bankQuestionIds.includes(question.id)) return false;
    
    // Apply text search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      question.question_text.toLowerCase().includes(searchLower) ||
      question.question_type_name.toLowerCase().includes(searchLower) ||
      question.difficulty_level.toLowerCase().includes(searchLower);
    
    // Apply dropdown filters
    const matchesType = !filterType || question.question_type_id === filterType;
    const matchesDifficulty = !filterDifficulty || question.difficulty_level === filterDifficulty;
    const matchesMarks = !filterMarks || question.marks === parseInt(filterMarks);
    
    return matchesSearch && matchesType && matchesDifficulty && matchesMarks;
  }).sort((a, b) => {
    // Apply sorting
    switch (sortOrder) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'difficulty-asc':
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return difficultyOrder[a.difficulty_level as keyof typeof difficultyOrder] - 
               difficultyOrder[b.difficulty_level as keyof typeof difficultyOrder];
      case 'difficulty-desc':
        const difficultyOrderDesc = { easy: 3, medium: 2, hard: 1 };
        return difficultyOrderDesc[a.difficulty_level as keyof typeof difficultyOrderDesc] - 
               difficultyOrderDesc[b.difficulty_level as keyof typeof difficultyOrderDesc];
      case 'marks-asc':
        return a.marks - b.marks;
      case 'marks-desc':
        return b.marks - a.marks;
      default:
        return 0;
    }
  });

  // Get unique question types from the questions array
  const questionTypes = Array.from(new Set(questions.map(q => q.question_type_id)))
    .filter(Boolean)
    .map(typeId => {
      const question = questions.find(q => q.question_type_id === typeId);
      return { id: typeId, name: question?.question_type_name || 'Unknown' };
    });

  // Get unique marks values from the questions array
  const uniqueMarks = Array.from(new Set(questions.map(q => q.marks)))
    .filter(Boolean)
    .sort((a, b) => a - b);
  
  // Add selected questions to the bank
  const handleAddQuestions = async () => {
    if (!selectedQuestions.length) {
      setError("Please select at least one question to add");
      return;
    }
    
    setAddingQuestions(true);
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Add each selected question to the bank
      const promises = selectedQuestions.map(questionId => 
        questionApi.addQuestionToBank(bankId, questionId, token!)
      );
      
      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      
      if (errors.length) {
        if (errors.length === selectedQuestions.length) {
          setError(`Failed to add all questions to the bank. Please try again.`);
        } else {
          setSuccess(`Added ${selectedQuestions.length - errors.length} questions successfully.`);
          setError(`Failed to add ${errors.length} questions to the bank.`);
        }
      } else {
        setSuccess(`Successfully added ${selectedQuestions.length} questions to the bank.`);
        setSelectedQuestions([]);
        
        // Refresh questions in bank
        fetchQuestionsInBank();
        
        // Notify parent of success
        setTimeout(() => {
          onSuccess();
          handleCloseModal();
        }, 1500);
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred while adding questions to bank');
    } finally {
      setIsLoading(false);
      setAddingQuestions(false);
    }
  };

  // Select all filtered questions
  const selectAllFilteredQuestions = () => {
    if (filteredQuestions.length === 0) return;
    
    const filteredIds = filteredQuestions.map(q => q.id);
    setSelectedQuestions(filteredIds);
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedQuestions([]);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm overflow-y-auto">
      <div ref={modalRef} className="bg-white rounded-xl shadow-xl w-full max-w-4xl m-4 p-6 relative animate-fadeIn max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2">Add Questions to Bank:</span>
            <span className="text-indigo-600">{bankName || 'Question Bank'}</span>
          </h2>
          <button 
            onClick={handleCloseModal} 
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Close"
            disabled={addingQuestions}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Status messages */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </div>
        )}

        {selectedQuestionDetails ? (
          // Question details view
          <div className="flex-1 overflow-y-auto mb-4">
            <div className="bg-white border rounded-md shadow-sm p-4">
              <div className="flex justify-between mb-4">
                <h3 className="font-medium text-lg text-gray-900">Question Details</h3>
                <button
                  onClick={() => setSelectedQuestionDetails(null)}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Back to List
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Question Text</h4>
                  <div 
                    className="p-3 bg-gray-50 rounded-md border" 
                    dangerouslySetInnerHTML={{ __html: selectedQuestionDetails.question_text }}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Question Type</h4>
                    <p className="text-gray-900">{selectedQuestionDetails.question_type_name}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Difficulty</h4>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedQuestionDetails.difficulty_level === 'easy' ? 'bg-green-100 text-green-800' :
                      selectedQuestionDetails.difficulty_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedQuestionDetails.difficulty_level.charAt(0).toUpperCase() + selectedQuestionDetails.difficulty_level.slice(1)}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Marks</h4>
                    <p className="text-gray-900">{selectedQuestionDetails.marks}</p>
                  </div>
                </div>
                
                {/* Add any other relevant question details here */}
                
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => {
                      toggleQuestionSelection(selectedQuestionDetails.id);
                      setSelectedQuestionDetails(null);
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                      selectedQuestions.includes(selectedQuestionDetails.id)
                        ? 'bg-red-50 text-red-700 hover:bg-red-100'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    }`}
                  >
                    {selectedQuestions.includes(selectedQuestionDetails.id) 
                      ? 'Remove from Selection' 
                      : 'Add to Selection'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Search and Filter */}
            <div className="mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                {/* Search input */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search questions..."
                    className="w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Sort order */}
                <div>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full py-2 pl-3 pr-10 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="difficulty-asc">Difficulty: Easy to Hard</option>
                    <option value="difficulty-desc">Difficulty: Hard to Easy</option>
                    <option value="marks-asc">Marks: Low to High</option>
                    <option value="marks-desc">Marks: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Additional filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                {/* Question Type filter */}
                <div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full py-2 pl-3 pr-10 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Question Types</option>
                    {questionTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty filter */}
                <div>
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="w-full py-2 pl-3 pr-10 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Difficulty Levels</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {/* Marks filter */}
                <div>
                  <select
                    value={filterMarks}
                    onChange={(e) => setFilterMarks(e.target.value)}
                    className="w-full py-2 pl-3 pr-10 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Marks</option>
                    {uniqueMarks.map(mark => (
                      <option key={mark} value={mark.toString()}>{mark} Mark{mark !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter actions */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={resetFilters}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  Reset Filters
                </button>
                <button
                  onClick={selectAllFilteredQuestions}
                  className="px-3 py-1.5 text-sm border border-indigo-300 rounded-md shadow-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                  disabled={filteredQuestions.length === 0}
                >
                  Select All Filtered
                </button>
                <button
                  onClick={clearAllSelections}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                  disabled={selectedQuestions.length === 0}
                >
                  Clear Selection
                </button>
              </div>
            </div>
            
            {/* Questions list */}
            <div className="flex-1 overflow-y-auto mb-4">
              {isLoading && questions.length === 0 ? (
                <div className="py-8 text-center">
                  <svg className="animate-spin h-8 w-8 mx-auto text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-2 text-gray-500">Loading questions...</p>
                </div>
              ) : filteredQuestions.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                          <span className="sr-only">Select</span>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Question
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                          Difficulty
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                          Marks
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredQuestions.map(question => (
                        <tr 
                          key={question.id} 
                          className={selectedQuestions.includes(question.id) ? 'bg-indigo-50' : 'hover:bg-gray-50'}
                          onClick={() => toggleQuestionSelection(question.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedQuestions.includes(question.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleQuestionSelection(question.id);
                              }}
                              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 truncate max-w-md" dangerouslySetInnerHTML={{ __html: question.question_text }} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{question.question_type_name}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              question.difficulty_level === 'easy' ? 'bg-green-100 text-green-800' :
                              question.difficulty_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {question.difficulty_level.charAt(0).toUpperCase() + question.difficulty_level.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            {question.marks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                viewQuestionDetails(question);
                              }} 
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-500">
                    {searchTerm || filterType || filterDifficulty || filterMarks ? 
                      "No questions match your search criteria" : 
                      "No available questions found"}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Footer with action buttons */}
        <div className="border-t pt-4 flex justify-end gap-3">
          <div className="mr-auto text-sm text-gray-500">
            {selectedQuestions.length > 0 ? 
              `${selectedQuestions.length} question${selectedQuestions.length > 1 ? 's' : ''} selected` : 
              'Select questions to add to this bank'}
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            disabled={addingQuestions}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddQuestions}
            disabled={isLoading || selectedQuestions.length === 0 || addingQuestions}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              selectedQuestions.length === 0 || addingQuestions ? 
                'bg-indigo-300 cursor-not-allowed' : 
                'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding Questions...
              </div>
            ) : 'Add to Bank'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddQuestionsToBank;