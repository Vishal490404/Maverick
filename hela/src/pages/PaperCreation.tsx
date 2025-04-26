import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paperApi, Chapter, Subject, Standard, QuestionType, QuestionBank } from '../utils/api';

// Steps for the paper creation wizard
type Step = 'selection' | 'basicInfo' | 'chapters' | 'questions' | 'review';

const PaperCreation = () => {
  const navigate = useNavigate();
  const { token } = useAuth(); // Removed unused 'user' variable
  
  // UI state
  const [currentStep, setCurrentStep] = useState<Step>('selection');
  const [paperType, setPaperType] = useState<'custom' | 'random' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  
  // Paper data
  const [paperTitle, setPaperTitle] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [totalTime, setTotalTime] = useState('');
  const [selectedStandard, setSelectedStandard] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedQuestionBank, setSelectedQuestionBank] = useState('');
  
  // Data from API
  const [standards, setStandards] = useState<Standard[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  
  // Fetch standards on component mount
  useEffect(() => {
    const fetchStandards = async () => {
      if (token) {
        setIsLoading(true);
        const response = await paperApi.getStandards(token);
        setIsLoading(false);
        
        if (response.error) {
          setError(response.error);
          return;
        }
        
        if (response.data) {
          setStandards(response.data);
        }
      }
    };
    
    fetchStandards();
  }, [token]);
  
  // Fetch subjects when standard is selected
  useEffect(() => {
    const fetchSubjects = async () => {
      if (token && selectedStandard) {
        setIsLoading(true);
        const response = await paperApi.getSubjects(selectedStandard, token);
        setIsLoading(false);
        
        if (response.error) {
          setError(response.error);
          return;
        }
        
        if (response.data) {
          setSubjects(response.data);
        }
      }
    };
    
    if (selectedStandard) {
      fetchSubjects();
    } else {
      setSubjects([]);
    }
  }, [selectedStandard, token]);
  
  // Fetch chapters when subject is selected
  useEffect(() => {
    const fetchChapters = async () => {
      if (token && selectedStandard && selectedSubject) {
        setIsLoading(true);
        const response = await paperApi.getChapters(selectedStandard, selectedSubject, token);
        setIsLoading(false);
        
        if (response.error) {
          setError(response.error);
          return;
        }
        
        if (response.data) {
          setChapters(response.data);
        }
      }
    };
    
    if (selectedStandard && selectedSubject) {
      fetchChapters();
    } else {
      setChapters([]);
    }
  }, [selectedStandard, selectedSubject, token]);
  
  // Fetch question types
  useEffect(() => {
    const fetchQuestionTypes = async () => {
      if (token && (currentStep === 'questions' || currentStep === 'review')) {
        setIsLoading(true);
        const response = await paperApi.getQuestionTypes(token);
        setIsLoading(false);
        
        if (response.error) {
          setError(response.error);
          return;
        }
        
        if (response.data) {
          setQuestionTypes(response.data);
        }
      }
    };
    
    if (currentStep === 'questions' || currentStep === 'review') {
      fetchQuestionTypes();
    }
  }, [currentStep, token]);
  
  // Fetch question banks
  useEffect(() => {
    const fetchQuestionBanks = async () => {
      if (token && currentStep === 'review') {
        setIsLoading(true);
        const response = await paperApi.getQuestionBanks(token);
        setIsLoading(false);
        
        if (response.error) {
          setError(response.error);
          return;
        }
        
        if (response.data) {
          setQuestionBanks(response.data);
        }
      }
    };
    
    if (currentStep === 'review') {
      fetchQuestionBanks();
    }
  }, [currentStep, token]);

  // Chapter selection handlers
  const toggleChapterSelection = (chapterId: string) => {
    setChapters(chapters.map(chapter => {
      if (chapter.id === chapterId) {
        const newSelectedState = !chapter.selected;
        
        // If the chapter has topics, update all topics to match the chapter's selection state
        const updatedTopics = chapter.topics?.map(topic => ({
          ...topic,
          selected: newSelectedState
        }));
        
        return { 
          ...chapter, 
          selected: newSelectedState,
          topics: updatedTopics || chapter.topics
        };
      }
      return chapter;
    }));
  };

  const toggleTopicSelection = (chapterId: string, topicId: string) => {
    setChapters(chapters.map(chapter => {
      if (chapter.id === chapterId) {
        // Update the specific topic
        const updatedTopics = chapter.topics?.map(topic => 
          topic.id === topicId 
            ? { ...topic, selected: !topic.selected } 
            : topic
        );
        
        // Determine if the chapter should be selected based on topics
        const anyTopicSelected = updatedTopics?.some(topic => topic.selected) || false;
        
        return { 
          ...chapter, 
          topics: updatedTopics,
          selected: anyTopicSelected
        };
      }
      return chapter;
    }));
  };

  const selectAllTopicsInChapter = (chapterId: string, selectAll: boolean) => {
    setChapters(chapters.map(chapter => {
      if (chapter.id === chapterId && chapter.topics) {
        return {
          ...chapter,
          selected: selectAll,
          topics: chapter.topics.map(topic => ({
            ...topic,
            selected: selectAll
          }))
        };
      }
      return chapter;
    }));
  };

  const toggleChapterExpansion = (chapterId: string) => {
    setExpandedChapters(prev => 
      prev.includes(chapterId)
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  // Question type selection
  const toggleQuestionTypeSelection = (typeId: string) => {
    setQuestionTypes(questionTypes.map(type => 
      type.id === typeId 
        ? { ...type, selected: !type.selected } 
        : type
    ));
  };

  // Navigation between steps
  const nextStep = () => {
    if (currentStep === 'selection' && paperType) {
      setCurrentStep('basicInfo');
    } else if (currentStep === 'basicInfo') {
      if (validateBasicInfo()) {
        setCurrentStep(paperType === 'custom' ? 'chapters' : 'questions');
      }
    } else if (currentStep === 'chapters') {
      if (validateChapters()) {
        setCurrentStep('questions');
      }
    } else if (currentStep === 'questions') {
      if (validateQuestionTypes()) {
        setCurrentStep('review');
      }
    }
  };

  const prevStep = () => {
    if (currentStep === 'basicInfo') {
      setCurrentStep('selection');
    } else if (currentStep === 'chapters') {
      setCurrentStep('basicInfo');
    } else if (currentStep === 'questions') {
      setCurrentStep(paperType === 'custom' ? 'chapters' : 'basicInfo');
    } else if (currentStep === 'review') {
      setCurrentStep('questions');
    }
  };

  // Validation functions
  const validateBasicInfo = () => {
    if (!paperTitle.trim()) {
      setError('Paper title is required');
      return false;
    }
    
    if (!totalMarks || isNaN(Number(totalMarks)) || Number(totalMarks) <= 0) {
      setError('Please enter a valid number for total marks');
      return false;
    }
    
    if (!totalTime || isNaN(Number(totalTime)) || Number(totalTime) <= 0) {
      setError('Please enter a valid number for total time in minutes');
      return false;
    }
    
    if (!selectedStandard) {
      setError('Please select a standard/class');
      return false;
    }
    
    if (!selectedSubject) {
      setError('Please select a subject');
      return false;
    }
    
    setError(null);
    return true;
  };

  const validateChapters = () => {
    if (!chapters.some(chapter => chapter.selected)) {
      setError('Please select at least one chapter');
      return false;
    }
    
    setError(null);
    return true;
  };

  const validateQuestionTypes = () => {
    if (!questionTypes.some(type => type.selected)) {
      setError('Please select at least one question type');
      return false;
    }
    
    setError(null);
    return true;
  };

  // Form submission
  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);
    
    const paperData = {
      title: paperTitle,
      total_marks: Number(totalMarks),
      total_time: Number(totalTime),
      standard_id: selectedStandard,
      subject_id: selectedSubject,
      question_bank_id: selectedQuestionBank,
      generation_type: paperType,
      selected_chapters: chapters
        .filter(ch => ch.selected)
        .map(ch => ({
          id: ch.id,
          topics: ch.topics 
            ? ch.topics.filter(t => t.selected).map(t => t.id)
            : []
        })),
      selected_question_types: questionTypes
        .filter(type => type.selected)
        .map(type => type.id)
    };
    
    try {
      if (token) {
        const response = await paperApi.generatePaper(paperData, token);
        
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          // Navigate to paper view or show success message
          alert('Paper created successfully! Redirecting to dashboard...');
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError('An error occurred while generating the paper');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle navigation to dashboard without full page reload
  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  // Render the paper type selection step
  const renderSelectionStep = () => (
    <div className="mt-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Select Paper Generation Method</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Custom Paper Option */}
        <div 
          className={`p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
            paperType === 'custom' 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
          }`}
          onClick={() => setPaperType('custom')}
        >
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-indigo-100 p-3 mr-4">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900">Custom Paper</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Design your paper by selecting subjects, chapters, difficulty levels, and question types.
          </p>
          <ul className="space-y-2 text-sm text-gray-500 mb-4">
            <li className="flex items-center">
              <svg className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Choose specific topics
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Control difficulty distribution
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Set exact marks distribution
            </li>
          </ul>
        </div>

        {/* Random Paper Option */}
        <div 
          className={`p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
            paperType === 'random' 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
          }`}
          onClick={() => setPaperType('random')}
        >
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-indigo-100 p-3 mr-4">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900">Random Paper</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Generate a balanced question paper automatically with minimal inputs based on available question banks.
          </p>
          <ul className="space-y-2 text-sm text-gray-500 mb-4">
            <li className="flex items-center">
              <svg className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Quick one-click generation
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Automatic difficulty balance
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Diverse question selection
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={nextStep}
          disabled={!paperType}
          className={`px-4 py-2 rounded-md text-white ${
            paperType ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          Continue
        </button>
      </div>
    </div>
  );

  // Render the basic info step
  const renderBasicInfoStep = () => (
    <div className="mt-6 space-y-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Paper Title */}
        <div>
          <label htmlFor="paperTitle" className="block text-sm font-medium text-gray-700">Paper Title</label>
          <input
            type="text"
            id="paperTitle"
            name="paperTitle"
            value={paperTitle}
            onChange={(e) => setPaperTitle(e.target.value)}
            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            placeholder="e.g. Mathematics Exam Paper"
          />
        </div>

        {/* Standard/Class Selection */}
        <div>
          <label htmlFor="standard-select" className="block text-sm font-medium text-gray-700">Standard/Class</label>
          <select 
            id="standard-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedStandard}
            onChange={(e) => {
              setSelectedStandard(e.target.value);
              setSelectedSubject(''); // Reset subject when standard changes
            }}
            aria-label="Select standard or class"
          >
            <option value="" disabled>Select standard</option>
            {standards.map(standard => (
              <option key={standard.id} value={standard.id}>{standard.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Total Marks */}
        <div>
          <label htmlFor="totalMarks" className="block text-sm font-medium text-gray-700">Total Marks</label>
          <input
            type="number"
            id="totalMarks"
            name="totalMarks"
            min="10"
            max="100"
            value={totalMarks}
            onChange={(e) => setTotalMarks(e.target.value)}
            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            placeholder="e.g., 50"
          />
        </div>

        {/* Subject Selection */}
        <div>
          <label htmlFor="subject-select" className="block text-sm font-medium text-gray-700">Subject</label>
          <select
            id="subject-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            aria-label="Select subject"
            disabled={!selectedStandard}
          >
            <option value="" disabled>Select a subject</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Total Time */}
      <div>
        <label htmlFor="totalTime" className="block text-sm font-medium text-gray-700">Total Time (minutes)</label>
        <input
          type="number"
          id="totalTime"
          name="totalTime"
          min="10"
          value={totalTime}
          onChange={(e) => setTotalTime(e.target.value)}
          className="mt-1 block w-full sm:w-1/2 pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          placeholder="e.g., 120"
        />
      </div>
      
      <div className="pt-4 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Continue
        </button>
      </div>
    </div>
  );

  // Render the chapters selection step
  const renderChaptersStep = () => (
    <div className="mt-6 space-y-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Select Chapters & Topics</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Select Chapters/Topics</label>
            <div className="text-sm text-gray-500">
              {chapters.filter(ch => ch.selected).length} of {chapters.length} chapters selected
            </div>
          </div>

          {chapters.length > 0 ? (
            <div className="border rounded-md border-gray-200 divide-y divide-gray-200">
              {chapters.map(chapter => (
                <div key={chapter.id} className={`py-3 px-4 ${chapter.selected ? 'bg-indigo-50' : ''}`}>
                  <div className="flex items-center">
                    <div className="flex items-center h-5">
                      <input
                        id={`chapter-${chapter.id}`}
                        name="chapters"
                        type="checkbox"
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        checked={chapter.selected || false}
                        onChange={() => toggleChapterSelection(chapter.id)}
                      />
                    </div>
                    <div className="ml-3 flex-grow">
                      <label htmlFor={`chapter-${chapter.id}`} className="text-sm font-medium text-gray-700">
                        {chapter.title}
                      </label>
                    </div>
                    {chapter.topics && chapter.topics.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleChapterExpansion(chapter.id)}
                        className="ml-2 text-indigo-600 hover:text-indigo-800 focus:outline-none"
                        aria-label={expandedChapters.includes(chapter.id) ? "Collapse topics" : "Expand topics"}
                      >
                        {expandedChapters.includes(chapter.id) ? (
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Display topics if chapter is expanded */}
                  {chapter.topics && chapter.topics.length > 0 && expandedChapters.includes(chapter.id) && (
                    <div className="mt-3 space-y-3">
                      <div className="pl-7 flex items-center justify-between border-t border-b border-gray-100 py-2">
                        <span className="text-xs text-gray-500">
                          {chapter.topics.filter(t => t.selected).length} of {chapter.topics.length} topics selected
                        </span>
                        <div className="space-x-2">
                          <button
                            type="button"
                            onClick={() => selectAllTopicsInChapter(chapter.id, true)}
                            className="text-xs text-indigo-600 hover:text-indigo-800"
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={() => selectAllTopicsInChapter(chapter.id, false)}
                            className="text-xs text-gray-600 hover:text-gray-800"
                          >
                            Deselect All
                          </button>
                        </div>
                      </div>
                      <div className="pl-7 space-y-3">
                        {chapter.topics.map(topic => (
                          <div key={topic.id} className={`flex items-center p-1 rounded ${topic.selected ? 'bg-indigo-50' : ''}`}>
                            <div className="flex items-center h-5">
                              <input
                                id={`topic-${topic.id}`}
                                name="topics"
                                type="checkbox"
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                checked={topic.selected || false}
                                onChange={() => toggleTopicSelection(chapter.id, topic.id)}
                              />
                            </div>
                            <div className="ml-3">
                              <label htmlFor={`topic-${topic.id}`} className="text-sm text-gray-600">
                                {topic.title}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              {selectedSubject ? 
                "No chapters available for the selected subject and standard." :
                "Please select a subject to view available chapters."
              }
            </div>
          )}
        </div>
      )}
      
      <div className="pt-4 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Continue
        </button>
      </div>
    </div>
  );

  // Render the question types selection step
  const renderQuestionsStep = () => (
    <div className="mt-6 space-y-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Select Question Types</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Type of Questions</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {questionTypes.map(type => (
              <div key={type.id} className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id={`question-type-${type.id}`}
                    name="questionTypes"
                    type="checkbox"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    checked={type.selected || false}
                    onChange={() => toggleQuestionTypeSelection(type.id)}
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
        </div>
      )}
      
      <div className="pt-4 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Continue
        </button>
      </div>
    </div>
  );

  // Render the review step
  const renderReviewStep = () => (
    <div className="mt-6 space-y-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Review and Generate Paper</h2>
      
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-gray-900">Paper Details</h3>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Title</p>
              <p className="mt-1 text-sm text-gray-900">{paperTitle}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Standard</p>
              <p className="mt-1 text-sm text-gray-900">
                {standards.find(s => s.id === selectedStandard)?.name || ''}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Subject</p>
              <p className="mt-1 text-sm text-gray-900">
                {subjects.find(s => s.id === selectedSubject)?.name || ''}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Marks</p>
              <p className="mt-1 text-sm text-gray-900">{totalMarks}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Duration</p>
              <p className="mt-1 text-sm text-gray-900">{totalTime} minutes</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Generation Method</p>
              <p className="mt-1 text-sm text-gray-900">{paperType === 'custom' ? 'Custom Paper' : 'Random Generation'}</p>
            </div>
          </div>
        </div>
        
        {paperType === 'custom' && (
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium text-gray-900">Selected Chapters</h3>
            <div className="mt-2">
              {chapters.filter(ch => ch.selected).length > 0 ? (
                <ul className="space-y-1">
                  {chapters.filter(ch => ch.selected).map(ch => (
                    <li key={ch.id} className="text-sm text-gray-600">
                      • {ch.title}
                      {ch.topics && ch.topics.some(t => t.selected) && (
                        <ul className="ml-5 mt-1 space-y-1">
                          {ch.topics.filter(t => t.selected).map(t => (
                            <li key={t.id} className="text-xs text-gray-500">- {t.title}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No chapters selected.</p>
              )}
            </div>
          </div>
        )}
        
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-gray-900">Selected Question Types</h3>
          <div className="mt-2">
            {questionTypes.filter(t => t.selected).length > 0 ? (
              <ul className="space-y-1">
                {questionTypes.filter(t => t.selected).map(t => (
                  <li key={t.id} className="text-sm text-gray-600">• {t.title}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No question types selected.</p>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900">Question Bank</h3>
          <div className="mt-2">
            <select
              id="questionBank"
              name="questionBank"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedQuestionBank}
              onChange={(e) => setSelectedQuestionBank(e.target.value)}
              required
              aria-label="Select question bank" // Added aria-label for accessibility
            >
              <option value="" disabled>Select question bank</option>
              {questionBanks.map(bank => (
                <option key={bank.id} value={bank.id}>{bank.name}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">A question bank must be selected to generate the paper.</p>
          </div>
        </div>
      </div>
      
      <div className="pt-4 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !selectedQuestionBank}
          className={`px-4 py-2 rounded-md text-white ${
            isLoading || !selectedQuestionBank ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          {isLoading ? 'Generating...' : 'Generate Paper'}
        </button>
      </div>
    </div>
  );

  // Progress steps indicator
  const renderProgressSteps = () => {
    const steps = [
      { key: 'selection', label: 'Method' },
      { key: 'basicInfo', label: 'Basic Info' },
      ...(paperType === 'custom' ? [{ key: 'chapters', label: 'Chapters' }] : []),
      { key: 'questions', label: 'Questions' },
      { key: 'review', label: 'Review' }
    ];
    
    return (
      <div className="py-6 overflow-hidden">
        {/* Mobile Stepper */}
        <div className="sm:hidden flex justify-center">
          <nav aria-label="Progress">
            <ol className="flex items-center space-x-5">
              {steps.map((step) => (
                <li key={step.key}>
                  <div
                    className={`h-3 w-3 rounded-full ${
                      currentStep === step.key 
                        ? 'bg-indigo-600' 
                        : steps.findIndex(s => s.key === currentStep) > steps.findIndex(s => s.key === step.key) 
                          ? 'bg-indigo-600' 
                          : 'bg-gray-300'
                    }`}
                  />
                  <span className="sr-only">{step.label}</span>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Desktop Stepper */}
        <div className="hidden sm:block">
          <nav aria-label="Progress" className="overflow-hidden">
            <ol className="flex items-center justify-center">
              {steps.map((step) => (
                <li key={step.key} className="flex-1">
                  <div className="relative flex items-center justify-center">
                    {steps.findIndex(s => s.key === currentStep) > steps.findIndex(s => s.key === step.key) && (
                      <div className="absolute top-5 w-full" aria-hidden="true">
                        <div className={`h-0.5 relative ${
                          steps.findIndex(s => s.key === currentStep) > steps.findIndex(s => s.key === step.key) 
                            ? 'bg-indigo-600' 
                            : 'bg-gray-200'
                        }`}>
                          <div className="w-full h-0.5" />
                        </div>
                      </div>
                    )}
                    
                    <div className="relative flex flex-col items-center">
                      <div 
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          currentStep === step.key 
                            ? 'bg-indigo-600 text-white' 
                            : steps.findIndex(s => s.key === currentStep) > steps.findIndex(s => s.key === step.key) 
                              ? 'bg-indigo-600 text-white'  
                              : 'bg-white border-2 border-gray-300 text-gray-500'
                        }`}
                      >
                        {steps.findIndex(s => s.key === currentStep) > steps.findIndex(s => s.key === step.key) ? (
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span>{steps.findIndex(s => s.key === step.key) + 1}</span>
                        )}
                      </div>
                      <div className="mt-2 text-xs font-medium text-gray-600 whitespace-nowrap">
                        {step.label}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="mb-6 sm:mb-10">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Generate Question Paper</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Create your perfect question paper by selecting custom options or generating randomly.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow mb-6">
              <div className="px-4 py-5 sm:p-6">
                {renderProgressSteps()}
                
                {/* Loading Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                      <p className="mt-2 text-sm text-gray-600">Loading...</p>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step content */}
                <div className="relative">
                  {currentStep === 'selection' && renderSelectionStep()}
                  {currentStep === 'basicInfo' && renderBasicInfoStep()}
                  {currentStep === 'chapters' && renderChaptersStep()}
                  {currentStep === 'questions' && renderQuestionsStep()}
                  {currentStep === 'review' && renderReviewStep()}
                </div>
                
                {/* Action footer */}
                <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between items-center">
                  <a
                    href="/dashboard"
                    onClick={handleDashboardClick}
                    className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    Back to Dashboard
                  </a>
                  
                  <Link
                    to="#"
                    className="text-sm text-gray-600 hover:text-indigo-500 font-medium flex items-center"
                  >
                    <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    View Paper Templates
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperCreation;