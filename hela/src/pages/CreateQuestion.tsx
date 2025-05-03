import React, { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { questionApi } from '../utils/api';
import QuestionReviewModal from '../components/curriculum/QuestionReviewModal';

interface ExtractedQuestion {
  id?: string;
  question_text: string;
  question_type_id?: string;
  difficulty_level: "easy" | "medium" | "hard";
  marks: number;
  image_required: boolean;
  topic_id?: string;
  chapter_id?: string;
  subject_id?: string;
  standard_id?: string;
  tags?: string[];
}

interface Props {
  bankId?: string;
  standardId?: string;
  subjectId?: string;
  onQuestionsAdded?: () => void;
}

const CreateQuestion: React.FC<Props> = ({ bankId, standardId, subjectId, onQuestionsAdded }) => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !token) return;

    const file = files[0];
    await processFile(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Process the file whether uploaded by input or drag-and-drop
  const processFile = useCallback(async (file: File) => {
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
      let result;
      if (file.type === 'application/pdf') {
        result = await questionApi.scanPdf(file, token);
      } else if (file.type.includes('excel') || file.type.includes('spreadsheet') || file.type.includes('csv')) {
        result = await questionApi.scanExcel(file, token);
      } else if (file.type.startsWith('image/')) {
        result = await questionApi.scanImage(file, token);
      }

      if (result?.error) {
        setError(result.error);
      } else if (result?.data) {
        const extractedQuestions = result.data.questions.map((q) => {
          // Ensure difficulty level is always one of the allowed values
          let difficulty: "easy" | "medium" | "hard" = "medium";
          if (q.difficulty_level === "easy" || q.difficulty_level === "hard") {
            difficulty = q.difficulty_level;
          }
          
          return {
            question_text: q.question_text || '',
            difficulty_level: difficulty,
            marks: q.marks || 1,
            image_required: q.image_required || false,
            question_type_id: '', // Default empty string for question_type_id
            chapter_id: '', // Default empty string for chapter_id
            topic_id: '', // Default empty string for topic_id
            tags: [], // Default empty array for tags
            ...(standardId && { standard_id: standardId }),
            ...(subjectId && { subject_id: subjectId }),
          };
        });
        
        setExtractedQuestions(extractedQuestions);
        setShowReviewModal(true);
      }
    } catch (err) {
      console.error('Error processing file:', err);
      setError('An error occurred while processing the file');
    } finally {
      setIsLoading(false);
    }
  }, [token, standardId, subjectId]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  // Handle saving the reviewed questions
  const handleSaveQuestions = async (questions: ExtractedQuestion[]) => {
    setIsLoading(true);
    setError(null);

    try {
      if (token) {
        const results = await Promise.all(
          questions.map(async (question) => {
            const result = await questionApi.createQuestion(question, token);
            if (result.error) return result;

            if (bankId && result.data) {
              const addToBankResult = await questionApi.addQuestionToBank(bankId, result.data.id, token);
              if (addToBankResult.error) return addToBankResult;
            }

            return result;
          })
        );

        const successCount = results.filter((r) => !r.error).length;
        if (successCount > 0) {
          alert(`Successfully saved ${successCount} questions${bankId ? ' and added them to the bank' : ''}!`);
          if (onQuestionsAdded) {
            onQuestionsAdded();
          }
        }

        const errors = results.filter((r) => r.error);
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
      // Reset file input when modal is closed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Questions</h1>
          <p className="text-gray-600">
            {bankId 
              ? "Questions will be automatically added to the selected question bank." 
              : "Upload a file or enter questions manually to create a question bank."}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Questions</h2>
            <p className="text-sm text-gray-500 mb-6">
              Upload your questions from a file. We support PDF, Excel, CSV, or image files.
            </p>
          </div>
          
          <div className="p-6">
            <div 
              className={`border-2 border-dashed rounded-lg ${
                isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
              } transition-all duration-200 p-8 flex flex-col items-center justify-center cursor-pointer`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Drag & drop your file here</h3>
              <p className="text-gray-500 text-sm text-center mb-6">
                or
              </p>
              <label
                htmlFor="fileUpload"
                className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-3 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 shadow-sm"
              >
                Select File
              </label>
              <input
                id="fileUpload"
                type="file"
                accept=".pdf,.xls,.xlsx,.csv,image/*"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
                disabled={isLoading}
              />
              <p className="mt-4 text-xs text-gray-500">
                Supports PDF, Excel, CSV, or image files (max. 10MB)
              </p>
            </div>

          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="bg-white shadow-sm rounded-xl p-8 text-center">
            <svg
              className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-base font-medium text-gray-700">Processing your document...</p>
            <p className="mt-2 text-sm text-gray-500">This may take a few moments depending on file size.</p>
          </div>
        )}

        {/* Help Card */}
        {!isLoading && !error && (
          <div className="bg-blue-50 rounded-xl p-6 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-blue-800">Tips for better question extraction</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Make sure your document is clear and properly formatted</li>
                    <li>For best results, each question should be on its own line or in its own cell</li>
                    <li>Images should be clear and properly sized</li>
                    <li>After upload, you'll have a chance to review and edit the extracted questions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {showReviewModal && (
          <QuestionReviewModal
            questions={extractedQuestions}
            isOpen={showReviewModal}
            onClose={() => {
              setShowReviewModal(false);
              // Reset file input when modal is closed
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            onSave={handleSaveQuestions}
            bankId={bankId}
          />
        )}
      </div>
    </div>
  );
};

export default CreateQuestion;