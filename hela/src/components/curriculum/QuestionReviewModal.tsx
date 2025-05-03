import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { curriculumApi } from '../../utils/api';

interface ExtractedQuestion {
  question_text: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  marks: number;
  image_required: boolean;
  standard_id?: string;
  subject_id?: string;
  chapter_id?: string;
  topic_id?: string;
  question_type_id?: string;
  tags?: string[];
}

interface QuestionType {
  id: string;
  name: string;
}

interface Chapter {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  name: string;
  chapter_id: string;
}

interface Tag {
  id: string;
  name: string;
  color?: string;
  usage_count?: number;
}

interface Props {
  questions: ExtractedQuestion[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (questions: ExtractedQuestion[]) => void;
  bankId?: string;
}

const QuestionReviewModal: React.FC<Props> = ({
  questions,
  isOpen,
  onClose,
  onSave,
  bankId
}) => {
  const { token } = useAuth();
  const [reviewedQuestions, setReviewedQuestions] = useState<ExtractedQuestion[]>(questions);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState({
    questionTypes: false,
    chapters: false,
    topics: false,
    tags: false
  });
  const [searchQuery, setSearchQuery] = useState({
    questionTypes: '',
    chapters: '',
    topics: '',
    tags: ''
  });

  const questionsPerPage = 1;
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = reviewedQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(reviewedQuestions.length / questionsPerPage);
  
  // Fetch question types from the API
  const fetchQuestionTypes = useCallback(async (query: string = '') => {
    if (!token) return;
    
    setLoading(prev => ({ ...prev, questionTypes: true }));
    
    try {
      const response = await curriculumApi.getQuestionTypes(token);
      if (response.data) {
        // Filter by search query if provided
        const filtered = query 
          ? response.data.filter(type => type.name.toLowerCase().includes(query.toLowerCase()))
          : response.data;
        
        setQuestionTypes(filtered);
      }
    } catch (error) {
      console.error('Error fetching question types:', error);
    } finally {
      setLoading(prev => ({ ...prev, questionTypes: false }));
    }
  }, [token]);

  // Fetch chapters from the API (if subject_id is available in the first question)
  const fetchChapters = useCallback(async (query: string = '') => {
    if (!token) return;
    
    const subjectId = reviewedQuestions[0]?.subject_id;
    if (!subjectId) return;
    
    setLoading(prev => ({ ...prev, chapters: true }));
    
    try {
      const response = await curriculumApi.getChapters(subjectId, token);
      if (response.data) {
        // Filter by search query if provided
        const filtered = query 
          ? response.data.filter(chapter => chapter.name.toLowerCase().includes(query.toLowerCase()))
          : response.data;
        
        setChapters(filtered);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
    } finally {
      setLoading(prev => ({ ...prev, chapters: false }));
    }
  }, [token, reviewedQuestions]);

  // Fetch topics from the API based on chapter_id
  const fetchTopics = useCallback(async (chapterId: string, query: string = '') => {
    if (!token || !chapterId) return;
    
    setLoading(prev => ({ ...prev, topics: true }));
    
    try {
      const response = await curriculumApi.getTopics(chapterId, token);
      if (response.data) {
        // Filter by search query if provided
        const filtered = query 
          ? response.data.filter(topic => (topic.name || topic.title).toLowerCase().includes(query.toLowerCase()))
          : response.data;
        
        // Map API response to our interface (handling both name and title fields)
        const mappedTopics: Topic[] = filtered.map(topic => ({
          id: topic.id,
          name: topic.name || topic.title || '',
          chapter_id: chapterId
        }));
        
        setTopics(mappedTopics);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(prev => ({ ...prev, topics: false }));
    }
  }, [token]);

  // Fetch tags from the API
  const fetchTags = useCallback(async (query: string = '') => {
    if (!token) return;
    
    setLoading(prev => ({ ...prev, tags: true }));
    
    try {
      const response = await curriculumApi.getTags(token);
      if (response.data) {
        // Filter by search query if provided
        const filtered = query 
          ? response.data.filter(tag => tag.name.toLowerCase().includes(query.toLowerCase()))
          : response.data;
        
        setTags(filtered);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(prev => ({ ...prev, tags: false }));
    }
  }, [token]);

  useEffect(() => {
    // Initial data loading
    if (isOpen && token) {
      fetchQuestionTypes('');
      fetchTags('');
      fetchChapters('');
      
      // If the first question has a chapter_id, fetch its topics
      if (reviewedQuestions[0]?.chapter_id) {
        fetchTopics(reviewedQuestions[0].chapter_id, '');
      }
    }
  }, [fetchQuestionTypes, fetchChapters, fetchTopics, fetchTags, isOpen, token, reviewedQuestions]);

  if (!isOpen) return null;

  const handleQuestionChange = (index: number, field: keyof ExtractedQuestion, value: any) => {
    const updatedQuestions = [...reviewedQuestions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setReviewedQuestions(updatedQuestions);

    // If chapter_id changes, reset topic_id and fetch new topics
    if (field === 'chapter_id') {
      updatedQuestions[index].topic_id = '';
      if (value) {
        fetchTopics(value, '');
      } else {
        setTopics([]); // Clear topics if no chapter is selected
      }
    }
  };

  const handleTagAdd = (index: number, tag: string) => {
    const updatedQuestions = [...reviewedQuestions];
    const currentTags = updatedQuestions[index].tags || [];
    
    if (tag.trim() !== '' && !currentTags.includes(tag.trim())) {
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        tags: [...currentTags, tag.trim()]
      };
      setReviewedQuestions(updatedQuestions);
    }
  };

  const handleTagRemove = (questionIndex: number, tagIndex: number) => {
    const updatedQuestions = [...reviewedQuestions];
    const currentTags = updatedQuestions[questionIndex].tags || [];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      tags: currentTags.filter((_, i) => i !== tagIndex)
    };
    setReviewedQuestions(updatedQuestions);
  };

  const renderPagination = () => {
    return (
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Question {currentPage} of {totalPages}
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Logic to show current page and some pages around it
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else {
                  const offset = Math.min(Math.max(currentPage - 3, 0), totalPages - 5);
                  pageNum = i + 1 + offset;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === pageNum
                        ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay with increased opacity and blur */}
        <div className="fixed inset-0 transition-opacity bg-gray-800 bg-opacity-80 backdrop-blur-sm" aria-hidden="true"></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block w-full px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-4xl sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Review Extracted Questions {bankId && '(Will be added to selected bank)'}
                </h3>
                <button
                  onClick={onClose}
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {renderPagination()}

              <div className="mt-4">
                {currentQuestions.map((question, relativeIndex) => {
                  const absoluteIndex = indexOfFirstQuestion + relativeIndex;
                  
                  return (
                    <div key={absoluteIndex} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <div className="mb-4">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800 text-sm font-medium">
                          Question {absoluteIndex + 1} of {reviewedQuestions.length}
                        </span>
                      </div>
                      
                      <div className="space-y-5">
                        {/* Question Text */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Question Text</label>
                          <textarea
                            value={question.question_text}
                            onChange={(e) => handleQuestionChange(absoluteIndex, 'question_text', e.target.value)}
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>

                        {/* Question Type with Search */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Question Type</label>
                          <div className="relative mt-1">
                            <input
                              type="text"
                              placeholder="Search question types..."
                              value={searchQuery.questionTypes}
                              onChange={(e) => {
                                setSearchQuery(prev => ({...prev, questionTypes: e.target.value}));
                                fetchQuestionTypes(e.target.value);
                              }}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            {loading.questionTypes && (
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {questionTypes.length > 0 && (
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                              {questionTypes.map(type => (
                                <div
                                  key={type.id}
                                  onClick={() => handleQuestionChange(absoluteIndex, 'question_type_id', type.id)}
                                  className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                                    question.question_type_id === type.id
                                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                  }`}
                                >
                                  {type.name}
                                </div>
                              ))}
                            </div>
                          )}
                          {questionTypes.length === 0 && !loading.questionTypes && (
                            <p className="mt-2 text-sm text-gray-500">No matching question types found</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          {/* Chapter with Search */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Chapter</label>
                            <div className="relative mt-1">
                              <input
                                type="text"
                                placeholder="Search chapters..."
                                value={searchQuery.chapters}
                                onChange={(e) => {
                                  setSearchQuery(prev => ({...prev, chapters: e.target.value}));
                                  fetchChapters(e.target.value);
                                }}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              {loading.chapters && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                  <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                </div>
                              )}
                            </div>
                            
                            {chapters.length > 0 && (
                              <div className="mt-2 max-h-40 overflow-y-auto">
                                {chapters.map(chapter => (
                                  <div
                                    key={chapter.id}
                                    onClick={() => {
                                      handleQuestionChange(absoluteIndex, 'chapter_id', chapter.id);
                                      // When a chapter is selected, fetch its topics
                                      fetchTopics(chapter.id, '');
                                      // Reset topic search query
                                      setSearchQuery(prev => ({...prev, topics: ''}));
                                    }}
                                    className={`px-3 py-2 mb-1 rounded-lg text-sm cursor-pointer transition-colors ${
                                      question.chapter_id === chapter.id
                                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                  >
                                    {chapter.name}
                                  </div>
                                ))}
                              </div>
                            )}
                            {chapters.length === 0 && !loading.chapters && (
                              <p className="mt-2 text-sm text-gray-500">No matching chapters found</p>
                            )}
                          </div>

                          {/* Topic with Search (filtered by chapter) */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Topic</label>
                            <div className="relative mt-1">
                              <input
                                type="text"
                                placeholder={question.chapter_id ? "Search topics..." : "Select a chapter first"}
                                value={searchQuery.topics}
                                onChange={(e) => {
                                  setSearchQuery(prev => ({...prev, topics: e.target.value}));
                                  if (question.chapter_id) {
                                    fetchTopics(question.chapter_id, e.target.value);
                                  }
                                }}
                                disabled={!question.chapter_id}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
                              />
                              {loading.topics && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                  <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                </div>
                              )}
                            </div>
                            
                            {topics.length > 0 && question.chapter_id && (
                              <div className="mt-2 max-h-40 overflow-y-auto">
                                {topics.map(topic => (
                                  <div
                                    key={topic.id}
                                    onClick={() => handleQuestionChange(absoluteIndex, 'topic_id', topic.id)}
                                    className={`px-3 py-2 mb-1 rounded-lg text-sm cursor-pointer transition-colors ${
                                      question.topic_id === topic.id
                                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                  >
                                    {topic.name}
                                  </div>
                                ))}
                              </div>
                            )}
                            {topics.length === 0 && question.chapter_id && !loading.topics && (
                              <p className="mt-2 text-sm text-gray-500">No matching topics found</p>
                            )}
                            {!question.chapter_id && (
                              <p className="mt-2 text-sm text-gray-500">Please select a chapter first</p>
                            )}
                          </div>
                        </div>

                        {/* Tags */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {question.tags && question.tags.map((tag, tagIndex) => (
                              <span 
                                key={tagIndex} 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800"
                              >
                                {tag}
                                <button 
                                  type="button"
                                  onClick={() => handleTagRemove(absoluteIndex, tagIndex)}
                                  className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-600 focus:outline-none"
                                >
                                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </span>
                            ))}
                          </div>
                          
                          <div className="relative">
                            <input
                              type="text"
                              id={`tag-input-${absoluteIndex}`}
                              placeholder="Type tag and press Enter"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.target as HTMLInputElement;
                                  handleTagAdd(absoluteIndex, input.value);
                                  input.value = '';
                                }
                              }}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.getElementById(`tag-input-${absoluteIndex}`) as HTMLInputElement;
                                  handleTagAdd(absoluteIndex, input.value);
                                  input.value = '';
                                }}
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">Press Enter or click + to add a tag</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {/* Difficulty Level */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Difficulty Level</label>
                            <select
                              value={question.difficulty_level}
                              onChange={(e) => handleQuestionChange(absoluteIndex, 'difficulty_level', e.target.value as 'easy' | 'medium' | 'hard')}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>

                          {/* Marks */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Marks</label>
                            <input
                              type="number"
                              min="1"
                              value={question.marks}
                              onChange={(e) => handleQuestionChange(absoluteIndex, 'marks', parseInt(e.target.value) || 1)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                          </div>

                          {/* Image Required */}
                          <div className="flex items-center pt-6">
                            <input
                              type="checkbox"
                              checked={question.image_required}
                              onChange={(e) => handleQuestionChange(absoluteIndex, 'image_required', e.target.checked)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-700">Image Required</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {renderPagination()}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onSave(reviewedQuestions)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Save Questions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionReviewModal;