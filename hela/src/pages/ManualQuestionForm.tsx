import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { questionApi, curriculumApi } from '../utils/api';
import { QuestionType, Chapter, Topic, Tag } from '../utils/api';
import { API_URL } from '../utils/api/utils';
import 'katex/dist/katex.min.css';
import katex from 'katex';

interface Props {
  bankId?: string;
  standardId?: string;
  subjectId?: string;
  onQuestionCreated?: () => void;
}

const ManualQuestionForm: React.FC<Props> = ({ bankId, standardId, subjectId, onQuestionCreated }) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  // Form states
  const [questionText, setQuestionText] = useState<string>('');
  const [questionTypeId, setQuestionTypeId] = useState<string>('');
  const [difficultyLevel, setDifficultyLevel] = useState<string>('medium');
  const [marks, setMarks] = useState<number>(1);
  const [imageRequired, setImageRequired] = useState<boolean>(false);
  const [topicId, setTopicId] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [latexError, setLatexError] = useState<string | null>(null);

  // Selection states
  const [chapterId, setChapterId] = useState<string>('');
  
  // Data states
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // UI states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleError = (err: unknown) => {
    console.error('Error:', err);
    setError(err instanceof Error ? err.message : 'An unexpected error occurred');
  };

  const fetchQuestionTypes = useCallback(async () => {
    try {
      const response = await curriculumApi.getQuestionTypes(token!);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setQuestionTypes(response.data);
      }
    } catch (err) {
      handleError(err);
    }
  }, [token]);

  const fetchTags = useCallback(async () => {
    try {
      const response = await curriculumApi.getTags(token!);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setAvailableTags(response.data);
      }
    } catch (err) {
      handleError(err);
    }
  }, [token]);

  const fetchChapters = useCallback(async (subjectId: string) => {
    try {
      const response = await curriculumApi.getChapters(subjectId, token!);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setChapters(response.data);
      }
    } catch (err) {
      handleError(err);
    }
  }, [token]);

  const fetchTopics = useCallback(async (chaptId: string) => {
    setIsLoading(true);
    try {
      const response = await curriculumApi.getTopics(chaptId, token!);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setTopics(response.data);
      }
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError('Failed to load topics');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Initial data loading
  useEffect(() => {
    if (bankId && token) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Fetch bank details
          const bankResponse = await fetch(`${API_URL}/question-banks/${bankId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (bankResponse.ok) {
            const bank = await bankResponse.json();
            if (bank.subject_id) {
              await fetchChapters(bank.subject_id);
            }
          }

          // Fetch other required data
          await Promise.all([
            fetchQuestionTypes(),
            fetchTags()
          ]);
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Failed to load required data');
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [bankId, token, fetchChapters, fetchQuestionTypes, fetchTags]);

  // Load topics when chapter changes
  useEffect(() => {
    if (chapterId && token) {
      fetchTopics(chapterId);
      setTopicId('');
    }
  }, [chapterId, token, fetchTopics]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setImage(selectedFile);
    setError(null);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  // Handle tag selection/deselection
  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  // Update tags string when selectedTagIds changes
  useEffect(() => {
    const selectedTags = availableTags
      .filter(tag => selectedTagIds.includes(tag.id))
      .map(tag => tag.name);
    setTags(selectedTags.join(', '));
  }, [selectedTagIds, availableTags]);

  // Handle successful question creation
  const handleSuccess = () => {
    // Reset form
    setQuestionText('');
    setDifficultyLevel('medium');
    setMarks(1);
    setImageRequired(false);
    setImage(null);
    setImagePreview(null);
    setTags('');
    setTopicId('');

    // Redirect
    handleRedirect();
  };

  // Redirect handler
  const handleRedirect = () => {
    if (onQuestionCreated) {
      onQuestionCreated();
    } else {
      if (bankId) {
        navigate(`/question-banks/${bankId}`);
      } else {
        navigate('/questions/create');
      }
    }
  };

  // Form submission handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isLoading) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    // Validate required fields
    if (!questionText || !questionTypeId || !difficultyLevel || !topicId || (imageRequired && !image)) {
      setError('Please fill in all required fields and upload an image if required');
      setIsLoading(false);
      return;
    }
    
    try {
      // Create question data
      const questionData = {
        question_text: questionText,
        question_type_id: questionTypeId,
        difficulty_level: difficultyLevel,
        marks: marks,
        image_required: imageRequired,
        topic_id: topicId,
        tags: tags.trim() ? tags : undefined,
        image: image && imageRequired ? image : undefined,
        question_bank_id: bankId || undefined
      };
      
      // Create the question
      const response = await questionApi.createQuestion(questionData, token!);
      
      if (response.error) {
        setError(response.error);
      } else {
        // No need for a separate call to add the question to the bank - it's already handled by the backend
        setSuccess('Question created successfully!');
        handleSuccess();
      }
    } catch (err: unknown) {
      console.error('Error creating question:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the question');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear selected image
  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  // Add proper type for renderLatex function
  const renderLatex = useCallback((content: string): string => {
    if (!content) return '';
    
    try {
      // Replace LaTeX patterns with rendered HTML
      let rendered = content;
      
      // Match inline LaTeX: $...$
      const inlineRegex = /\$(.*?)\$/g;
      rendered = rendered.replace(inlineRegex, (match, latex) => {
        try {
          // Remove any unnecessary escaping that might prevent proper rendering
          const cleanLatex = latex.replace(/\\+/g, '\\');
          return katex.renderToString(cleanLatex, { 
            throwOnError: false,
            output: 'html'
          });
        } catch (err) {
          console.error('LaTeX rendering error:', err);
          return match; // Keep the original if rendering fails
        }
      });
      
      // Match block LaTeX: $$...$$
      const blockRegex = /\$\$(.*?)\$\$/g;
      rendered = rendered.replace(blockRegex, (match, latex) => {
        try {
          // Remove any unnecessary escaping that might prevent proper rendering
          const cleanLatex = latex.replace(/\\+/g, '\\');
          return `<div class="text-center my-2">${katex.renderToString(cleanLatex, { 
            throwOnError: false,
            displayMode: true,
            output: 'html'
          })}</div>`;
        } catch (err) {
          console.error('LaTeX rendering error:', err);
          return match; // Keep the original if rendering fails
        }
      });
      
      return rendered;
    } catch (err: unknown) {
      console.error('LaTeX rendering error:', err);
      return content;
    }
  }, []);

  // Replace the LaTeX preview effect with direct rendering in the component
  const previewContent = questionText ? renderLatex(questionText) : '<p class="text-gray-400">Preview will appear here...</p>';

  return (
    <div className="bg-gray-50 min-h-screen pt-6 pb-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create New Question</h1>
          {bankId && <p className="mt-1 text-sm text-gray-600">The question will be automatically added to the selected question bank.</p>}
        </div>

        {/* Success message */}
        {success && (
          <div className="rounded-md bg-green-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
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

        <form onSubmit={handleSubmit}>
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Curriculum Hierarchy Selection */}
                <div className="sm:col-span-3">
                  <label htmlFor="chapter" className="block text-sm font-medium text-gray-700 required">Chapter</label>
                  <select
                    id="chapter"
                    name="chapter"
                    value={chapterId}
                    onChange={(e) => setChapterId(e.target.value)}
                    required
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map((chapter) => (
                      <option key={chapter.id} value={chapter.id}>
                        {chapter.name || chapter.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="topic" className="block text-sm font-medium text-gray-700 required">Topic</label>
                  <select
                    id="topic"
                    name="topic"
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    required
                    disabled={!chapterId}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Topic</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name || topic.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Question Type */}
                <div className="sm:col-span-3">
                  <label htmlFor="questionType" className="block text-sm font-medium text-gray-700 required">Question Type</label>
                  <select
                    id="questionType"
                    name="questionType"
                    value={questionTypeId}
                    onChange={(e) => setQuestionTypeId(e.target.value)}
                    required
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Question Type</option>
                    {questionTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Level */}
                <div className="sm:col-span-3">
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 required">Difficulty Level</label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(e.target.value)}
                    required
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {/* Marks */}
                <div className="sm:col-span-2">
                  <label htmlFor="marks" className="block text-sm font-medium text-gray-700 required">Marks</label>
                  <input
                    type="number"
                    name="marks"
                    id="marks"
                    min="1"
                    max="100"
                    value={marks}
                    onChange={(e) => setMarks(parseInt(e.target.value) || 1)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                {/* Tags */}
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  
                  {/* Selected Tags Display */}
                  {selectedTagIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {availableTags
                        .filter(tag => selectedTagIds.includes(tag.id))
                        .map(tag => (
                          <div 
                            key={tag.id}
                            className="inline-flex items-center bg-white border rounded-full px-3 py-1 text-sm"
                            style={{ backgroundColor: tag.color + '20', borderColor: tag.color }}
                          >
                            <span className="text-gray-800">{tag.name}</span>
                            <button
                              type="button"
                              onClick={() => toggleTag(tag.id)}
                              className="ml-1.5 text-gray-600 hover:text-gray-900 focus:outline-none"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))
                      }
                    </div>
                  )}
                  
                  {/* Available Tags */}
                  <div className="border border-gray-300 rounded-md p-3 bg-white">
                    <p className="text-xs text-gray-500 mb-2">Select tags to categorize the question:</p>
                    <div className="flex flex-wrap gap-2">
                      {isLoading && availableTags.length === 0 ? (
                        <div className="text-sm text-gray-500">Loading tags...</div>
                      ) : availableTags.length === 0 ? (
                        <div className="text-sm text-gray-500">No tags available. Create tags in Curriculum Manager.</div>
                      ) : (
                        availableTags.map(tag => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className={`inline-flex items-center rounded-full px-3 py-1 text-sm transition-colors ${
                              selectedTagIds.includes(tag.id) 
                                ? 'border-2 font-medium' 
                                : 'border hover:border-2'
                            }`}
                            style={{ 
                              backgroundColor: tag.color + '20', 
                              borderColor: tag.color,
                            }}
                          >
                            <span className="text-gray-800">{tag.name}</span>
                            {selectedTagIds.includes(tag.id) && (
                              <svg className="ml-1.5 h-3.5 w-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                  
                  {/* Hidden input to maintain form compatibility */}
                  <input type="hidden" name="tags" value={tags} />
                </div>

                {/* Image Required Checkbox */}
                <div className="sm:col-span-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="imageRequired"
                        name="imageRequired"
                        type="checkbox"
                        checked={imageRequired}
                        onChange={(e) => setImageRequired(e.target.checked)}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="imageRequired" className="font-medium text-gray-700">This question requires an image/diagram</label>
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                {imageRequired && (
                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700 required">Question Image</label>
                    <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      {!imagePreview ? (
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                            >
                              <span>Upload an image</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="sr-only"
                                required={imageRequired && !image}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Question preview"
                            className="max-h-64 mx-auto"
                          />
                          <button
                            type="button"
                            onClick={clearImage}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Question Text */}
                <div className="sm:col-span-6">
                  <div className="mb-4">
                    <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 required">
                      Question Text
                    </label>
                    <div className="mt-1 flex justify-between items-center">
                      <div className="text-xs text-gray-500 flex items-center space-x-2">
                        <span className="bg-gray-100 px-2 py-1 rounded">$...$</span>
                        <span>for inline math</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* LaTeX Editor and Preview Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Editor */}
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500 font-medium">Editor</div>
                      <div className="rounded-md shadow-sm h-[300px]">
                        <textarea
                          id="questionText"
                          name="questionText"
                          rows={12}
                          value={questionText}
                          onChange={(e) => {
                            setQuestionText(e.target.value);
                          }}
                          required
                          className="block w-full h-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm font-mono bg-white resize-none"
                          placeholder="Enter your question here..."
                        />
                      </div>
                    </div>
                    
                    {/* Preview */}
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500 font-medium">Preview</div>
                      <div 
                        className="h-[300px] border border-gray-200 rounded-lg bg-gray-50 p-4 overflow-auto"
                      >
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: previewContent
                          }}
                        />
                        {latexError && (
                          <div className="mt-2 text-sm text-red-500 bg-red-50 p-2 rounded">{latexError}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* LaTeX Quick Reference */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">LaTeX Quick Reference:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-white/80 rounded p-2 text-sm">
                        <code className="block bg-blue-50 px-2 py-1 rounded text-xs mb-1">{`$x^2 + y^2 = z^2$`}</code>
                        <span className="text-xs text-gray-600">Basic equation</span>
                      </div>
                      <div className="bg-white/80 rounded p-2 text-sm">
                        <code className="block bg-blue-50 px-2 py-1 rounded text-xs mb-1">{`$\\frac{1}{2}$`}</code>
                        <span className="text-xs text-gray-600">Fractions</span>
                      </div>
                      <div className="bg-white/80 rounded p-2 text-sm">
                        <code className="block bg-blue-50 px-2 py-1 rounded text-xs mb-1">{`$\\sqrt{x^2+y^2}$`}</code>
                        <span className="text-xs text-gray-600">Square root</span>
                      </div>
                      <div className="bg-white/80 rounded p-2 text-sm">
                        <code className="block bg-blue-50 px-2 py-1 rounded text-xs mb-1">{`$\\int_{a}^{b} f(x) dx$`}</code>
                        <span className="text-xs text-gray-600">Integral</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-between">
              <button
                type="button"
                onClick={() => navigate('/questions/create')}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Question'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualQuestionForm;