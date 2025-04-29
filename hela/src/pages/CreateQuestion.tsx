import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { questionApi, ScanResult } from '../utils/api';

interface ExtractedQuestion {
  id?: string;
  question_text: string;
  question_type_id?: string; // Changed from question_type to question_type_id to match backend
  difficulty_level: string;
  marks?: number;
  image_required: boolean;
  topic_id?: string;
  chapter_id?: string;
  subject_id?: string;
  standard_id?: string;
  tags?: string[]; // Added to match backend model
}

interface QuestionReviewModalProps {
  questions: ExtractedQuestion[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (questions: ExtractedQuestion[]) => void;
}

const CreateQuestion: React.FC = () => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !token) return;

    const file = files[0];
    await processFile(file);
  };

  // Process the file whether uploaded by input or drag-and-drop
  const processFile = async (file: File) => {
    if (!token) return;

    if (
      file.type !== 'application/pdf' && 
      !file.type.includes('excel') && 
      !file.type.includes('spreadsheet') &&
      !file.type.includes('csv') &&
      !file.type.startsWith('image/')
    ) {
      setError('Please upload a PDF, Excel, CSV or image file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (file.type === 'application/pdf') {
        const result = await questionApi.scanPdf(file, token);
        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setScanResult(result.data);
          setExtractedQuestions(
            result.data.questions.map(q => ({
              question_text: q.question_text || '',
              difficulty_level: q.difficulty_level || 'medium',
              marks: q.marks || 1,
              image_required: q.image_required || false
            }))
          );
          setShowReviewModal(true);
        }
      } else if (file.type.includes('excel') || file.type.includes('spreadsheet') || file.type.includes('csv')) {
        const result = await questionApi.scanExcel(file, token);
        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setScanResult(result.data);
          setExtractedQuestions(
            result.data.questions.map(q => ({
              question_text: q.question_text || '',
              difficulty_level: q.difficulty_level || 'medium',
              marks: q.marks || 1,
              image_required: q.image_required || false
            }))
          );
          setShowReviewModal(true);
        }
      } else if (file.type.startsWith('image/')) {
        const result = await questionApi.scanImage(file, token);
        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setScanResult(result.data);
          setExtractedQuestions(
            result.data.questions.map(q => ({
              question_text: q.question_text || '',
              difficulty_level: q.difficulty_level || 'medium',
              marks: q.marks || 1,
              image_required: q.image_required || false
            }))
          );
          setShowReviewModal(true);
        }
      }
    } catch (err) {
      console.error('Error processing file:', err);
      setError('An error occurred while processing the file');
    } finally {
      setIsLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [token]);

  // Handle saving the reviewed questions
  const handleSaveQuestions = async (questions: ExtractedQuestion[]) => {
    setIsLoading(true);
    setError(null);

    try {
      // Save all questions to the database
      if (token) {
        const results = await Promise.all(
          questions.map(question => questionApi.createQuestion(question, token))
        );
        
        const successCount = results.filter(r => !r.error).length;
        if (successCount > 0) {
          alert(`Successfully saved ${successCount} questions!`);
        }
        
        const errors = results.filter(r => r.error);
        if (errors.length > 0) {
          setError(`${errors.length} questions failed to save.`);
        }
      }
    } catch (err) {
      console.error('Error saving questions:', err);
      setError('An error occurred while saving the questions');
    } finally {
      setIsLoading(false);
      setShowReviewModal(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-6 pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create New Question</h1>
        </div>

        {/* Main content area */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Document Box */}
            <div 
              className={`bg-white rounded-lg border-2 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} p-6 flex flex-col items-center justify-center transition-colors duration-200 h-64`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Upload Document</h3>
              <p className="text-gray-500 text-sm text-center mb-6">
                Drag & drop or upload Excel, PDF, CSV or image files
              </p>
              <label htmlFor="fileUpload" className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all duration-200">
                Select File
              </label>
              <input 
                id="fileUpload" 
                type="file" 
                accept=".pdf,.xls,.xlsx,.csv,image/*" 
                onChange={handleFileUpload} 
                className="hidden"
                disabled={isLoading}
              />
            </div>

            {/* Manual Entry Box */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Manual Entry</h3>
              <p className="text-gray-500 text-sm text-center mb-6">
                Manually create and enter questions
              </p>
              <Link 
                to="/questions/create/manual" 
                className="bg-purple-100 text-purple-600 hover:bg-purple-200 px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all duration-200"
              >
                Create New
              </Link>
            </div>
          </div>

          {/* Pro Tip Section */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Pro Tip</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>For best results when scanning files, ensure the document is clear and well-structured. You can review and edit all extracted questions before saving them.</p>
                </div>
                <div className="mt-3">
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    View Scanning Guide <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="text-center py-4">
            <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-sm font-medium text-gray-700">Processing your document...</p>
          </div>
        )}

        {/* Edit Questions/Question Banks Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <svg className="h-6 w-6 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900">Edit Questions/Question Banks</h2>
          </div>
          <p className="text-gray-600 mb-4">Manage your existing questions and question banks</p>
          <Link
            to="/question-banks"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            View Question Banks
          </Link>
        </div>
      </div>

      {/* Question Review Modal */}
      {showReviewModal && (
        <QuestionReviewModal 
          questions={extractedQuestions}
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSave={handleSaveQuestions}
        />
      )}
    </div>
  );
};

// Question Review Modal component
const QuestionReviewModal: React.FC<QuestionReviewModalProps> = ({
  questions: initialQuestions,
  isOpen,
  onClose,
  onSave
}) => {
  const [questions, setQuestions] = useState<ExtractedQuestion[]>(initialQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { token } = useAuth();

  // Fetch metadata for categorizing the question
  const [standards, setStandards] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [questionTypes, setQuestionTypes] = useState<any[]>([]);

  // Fetch metadata when modal opens
  React.useEffect(() => {
    if (isOpen && token) {
      const fetchMetadata = async () => {
        try {
          // These API calls would need to be implemented in your API util
          const standardsRes = await fetch('/api/curriculum/standards', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const subjectsRes = await fetch('/api/curriculum/subjects', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const questionTypesRes = await fetch('/api/curriculum/question-types', {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (standardsRes.ok) setStandards(await standardsRes.json());
          if (subjectsRes.ok) setSubjects(await subjectsRes.json());
          if (questionTypesRes.ok) setQuestionTypes(await questionTypesRes.json());
        } catch (error) {
          console.error('Error fetching metadata:', error);
        }
      };

      fetchMetadata();
    }
  }, [isOpen, token]);

  // Update filtered chapters when subject changes
  const handleSubjectChange = async (subjectId: string, questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].subject_id = subjectId;
    setQuestions(newQuestions);

    if (token) {
      try {
        const chaptersRes = await fetch(`/api/curriculum/subjects/${subjectId}/chapters`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (chaptersRes.ok) setChapters(await chaptersRes.json());
      } catch (error) {
        console.error('Error fetching chapters:', error);
      }
    }
  };

  // Update filtered topics when chapter changes
  const handleChapterChange = async (chapterId: string, questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].chapter_id = chapterId;
    setQuestions(newQuestions);

    if (token) {
      try {
        const topicsRes = await fetch(`/api/curriculum/chapters/${chapterId}/topics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (topicsRes.ok) setTopics(await topicsRes.json());
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    }
  };

  // Handle updating a question field
  const handleQuestionChange = (field: keyof ExtractedQuestion, value: any) => {
    const newQuestions = [...questions];
    newQuestions[currentQuestionIndex] = {
      ...newQuestions[currentQuestionIndex],
      [field]: value
    };
    setQuestions(newQuestions);
  };

  // Navigate to next or previous question
  const handleNavigate = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Review Extracted Questions ({currentQuestionIndex + 1} of {questions.length})
                </h3>
                <div className="mt-6 space-y-6 w-full">
                  {/* Question text */}
                  <div>
                    <label htmlFor="question-text" className="block text-sm font-medium text-gray-700">
                      Question Text
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="question-text"
                        name="question-text"
                        rows={4}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={currentQuestion.question_text}
                        onChange={(e) => handleQuestionChange('question_text', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Standard, Subject, Chapter, Topic selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="standard" className="block text-sm font-medium text-gray-700">
                        Standard
                      </label>
                      <select
                        id="standard"
                        name="standard"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={currentQuestion.standard_id || ''}
                        onChange={(e) => handleQuestionChange('standard_id', e.target.value)}
                      >
                        <option value="">Select Standard</option>
                        {standards.map((standard) => (
                          <option key={standard.id} value={standard.id}>
                            {standard.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={currentQuestion.subject_id || ''}
                        onChange={(e) => handleSubjectChange(e.target.value, currentQuestionIndex)}
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="chapter" className="block text-sm font-medium text-gray-700">
                        Chapter
                      </label>
                      <select
                        id="chapter"
                        name="chapter"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={currentQuestion.chapter_id || ''}
                        onChange={(e) => handleChapterChange(e.target.value, currentQuestionIndex)}
                        disabled={!currentQuestion.subject_id}
                      >
                        <option value="">Select Chapter</option>
                        {chapters.map((chapter) => (
                          <option key={chapter.id} value={chapter.id}>
                            {chapter.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                        Topic
                      </label>
                      <select
                        id="topic"
                        name="topic"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={currentQuestion.topic_id || ''}
                        onChange={(e) => handleQuestionChange('topic_id', e.target.value)}
                        disabled={!currentQuestion.chapter_id}
                      >
                        <option value="">Select Topic</option>
                        {topics.map((topic) => (
                          <option key={topic.id} value={topic.id}>
                            {topic.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Question type, difficulty and marks */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="question-type" className="block text-sm font-medium text-gray-700">
                        Question Type
                      </label>
                      <select
                        id="question-type"
                        name="question-type"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={currentQuestion.question_type_id || ''}
                        onChange={(e) => handleQuestionChange('question_type_id', e.target.value)}
                      >
                        <option value="">Select Type</option>
                        {questionTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                        Difficulty Level
                      </label>
                      <select
                        id="difficulty"
                        name="difficulty"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={currentQuestion.difficulty_level || 'medium'}
                        onChange={(e) => handleQuestionChange('difficulty_level', e.target.value)}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="marks" className="block text-sm font-medium text-gray-700">
                        Marks
                      </label>
                      <input
                        type="number"
                        id="marks"
                        name="marks"
                        min="1"
                        max="100"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={currentQuestion.marks || 1}
                        onChange={(e) => handleQuestionChange('marks', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Image required toggle */}
                  <div className="flex items-center">
                    <input
                      id="image-required"
                      name="image-required"
                      type="checkbox"
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      checked={currentQuestion.image_required}
                      onChange={(e) => handleQuestionChange('image_required', e.target.checked)}
                    />
                    <label htmlFor="image-required" className="ml-2 block text-sm text-gray-700">
                      This question requires an image/diagram
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Modal footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-indigo-400"
              onClick={() => onSave(questions)}
              disabled={loading || !questions.every(q => q.topic_id && q.question_type_id)}
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Save All Questions'}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>

            {/* Navigation buttons */}
            <div className="flex items-center mr-auto">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm disabled:opacity-50"
                onClick={() => handleNavigate('prev')}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              <span className="mx-4 text-sm text-gray-500">
                {currentQuestionIndex + 1} of {questions.length}
              </span>
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm disabled:opacity-50"
                onClick={() => handleNavigate('next')}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestion;