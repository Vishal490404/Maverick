import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Components
import PaperTypeSelector from '../components/paper/PaperTypeSelector';
import BasicInfoForm from '../components/paper/BasicInfoForm';
import ChapterSelector from '../components/paper/ChapterSelector';
import QuestionTypeSelector from '../components/paper/QuestionTypeSelector';
import DifficultyDistributionSelector from '../components/paper/DifficultyDistributionSelector';
import PaperReview from '../components/paper/PaperReview';
import StepProgress from '../components/paper/StepProgress';

// Types
interface Standard {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

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

type Step = 'selection' | 'basicInfo' | 'chapters' | 'questions' | 'difficulty' | 'review';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const PaperCreation: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  // UI state
  const [currentStep, setCurrentStep] = useState<Step>('selection');
  const [paperType, setPaperType] = useState<'custom' | 'random' | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  
  // Paper data
  const [paperTitle, setPaperTitle] = useState<string>('');
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [totalTime, setTotalTime] = useState<number>(180);
  const [selectedStandard, setSelectedStandard] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedQuestionBanks, setSelectedQuestionBanks] = useState<string[]>([]);
  const [difficultyDistribution, setDifficultyDistribution] = useState<DifficultyDistribution>({
    easy: 30,
    medium: 50,
    hard: 20
  });

  // API data
  const [standards, setStandards] = useState<Standard[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);

  useEffect(() => {
    if (token) {
      fetchStandards();
    }
  }, [token]);

  useEffect(() => {
    if (token && selectedStandard) {
      fetchSubjects(selectedStandard);
    }
  }, [selectedStandard, token]);

  useEffect(() => {
    if (token && selectedStandard && selectedSubject) {
      fetchChapters(selectedStandard, selectedSubject);
      fetchQuestionBanks(selectedStandard, selectedSubject);
    }
  }, [selectedStandard, selectedSubject, token]);

  useEffect(() => {
    if (token) {
      fetchQuestionTypes();
    }
  }, [token]);

  const fetchStandards = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/curriculum/standards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStandards(response.data);
    } catch (err) {
      setError('Failed to fetch standards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (standardId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/curriculum/standards/${standardId}/subjects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(response.data);
    } catch (err) {
      setError('Failed to fetch subjects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async (standardId: string, subjectId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/curriculum/subjects/${subjectId}/chapters`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Transform chapters to include selected property
      const transformedChapters = response.data.map((chapter: any) => ({
        ...chapter,
        selected: false,
        topics: chapter.topics ? chapter.topics.map((topic: any) => ({
          ...topic,
          selected: false,
          weight: 1.0
        })) : []
      }));
      
      setChapters(transformedChapters);
    } catch (err) {
      setError('Failed to fetch chapters');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/curriculum/question-types`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Transform question types to include selected and percentage properties
      const transformedTypes = response.data.map((type: any) => ({
        ...type,
        selected: false,
        percentage: 0
      }));
      
      setQuestionTypes(transformedTypes);
    } catch (err) {
      setError('Failed to fetch question types');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionBanks = async (standardId: string, subjectId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/question-banks`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { standard_id: standardId, subject_id: subjectId }
      });
      setQuestionBanks(response.data);
    } catch (err) {
      setError('Failed to fetch question banks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const updateTopicWeight = (chapterId: string, topicId: string, weight: number) => {
    setChapters(chapters.map(chapter => {
      if (chapter.id === chapterId) {
        const updatedTopics = chapter.topics?.map(topic => 
          topic.id === topicId 
            ? { ...topic, weight } 
            : topic
        );
        
        return { 
          ...chapter, 
          topics: updatedTopics
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
    
    // Redistribute percentages when selection changes
    updateQuestionTypePercentages();
  };

  const updateQuestionTypePercentages = () => {
    const selectedTypes = questionTypes.filter(type => type.selected);
    
    if (selectedTypes.length === 0) return;
    
    // Distribute evenly
    const evenPercentage = 100 / selectedTypes.length;
    
    setQuestionTypes(questionTypes.map(type => ({
      ...type,
      percentage: type.selected ? evenPercentage : 0
    })));
  };

  const setQuestionTypePercentage = (typeId: string, percentage: number) => {
    // Update the specific question type's percentage
    setQuestionTypes(prev => {
      const newTypes = prev.map(type => 
        type.id === typeId 
          ? { ...type, percentage } 
          : type
      );
      
      // Calculate remaining percentage
      const selectedTypes = newTypes.filter(t => t.selected && t.id !== typeId);
      const totalOtherPercentage = 100 - percentage;
      
      if (selectedTypes.length === 0) return newTypes;
      
      // Redistribute remaining percentage
      const percentPerType = totalOtherPercentage / selectedTypes.length;
      
      return newTypes.map(type => 
        type.selected && type.id !== typeId 
          ? { ...type, percentage: percentPerType } 
          : type
      );
    });
  };

  // Difficulty distribution
  const updateDifficultyDistribution = (easy: number, medium: number, hard: number) => {
    // Ensure they sum to 100%
    const total = easy + medium + hard;
    if (total !== 100) {
      // Adjust to make sure they sum to 100
      const factor = 100 / total;
      setDifficultyDistribution({
        easy: Math.round(easy * factor),
        medium: Math.round(medium * factor),
        hard: Math.round(hard * factor)
      });
    } else {
      setDifficultyDistribution({ easy, medium, hard });
    }
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
        setCurrentStep('difficulty');
      }
    } else if (currentStep === 'difficulty') {
      if (validateDifficulty()) {
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
    } else if (currentStep === 'difficulty') {
      setCurrentStep('questions');
    } else if (currentStep === 'review') {
      setCurrentStep('difficulty');
    }
  };

  // Validation functions
  const validateBasicInfo = () => {
    if (!paperTitle.trim()) {
      setError('Paper title is required');
      return false;
    }
    
    if (!totalMarks || totalMarks <= 0) {
      setError('Please enter a valid number for total marks');
      return false;
    }
    
    if (!totalTime || totalTime <= 0) {
      setError('Please enter a valid duration in minutes');
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
    if (paperType === 'custom' && !chapters.some(chapter => chapter.selected)) {
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
    
    // Ensure percentages sum to 100
    const totalPercentage = questionTypes
      .filter(type => type.selected)
      .reduce((sum, type) => sum + type.percentage, 0);
      
    if (Math.abs(totalPercentage - 100) > 0.01) {
      // Auto-adjust percentages
      updateQuestionTypePercentages();
    }
    
    setError(null);
    return true;
  };

  const validateDifficulty = () => {
    const { easy, medium, hard } = difficultyDistribution;
    const total = easy + medium + hard;
    
    if (Math.abs(total - 100) > 0.01) {
      setError('Difficulty distribution must sum to 100%');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (selectedQuestionBanks.length === 0) {
        setError('Please select at least one question bank');
        setLoading(false);
        return;
      }

      // Prepare selected chapters with topics data
      const selectedChapters = chapters
        .filter(ch => ch.selected)
        .map(ch => ({
          id: ch.id,
          topics: ch.topics
            ? ch.topics
                .filter(t => t.selected)
                .map(t => ({
                  id: t.id,
                  weight: t.weight
                }))
            : []
        }));

      // Prepare question type distribution
      const questionTypeDistribution = questionTypes
        .filter(qt => qt.selected)
        .map(qt => ({
          question_type_id: qt.id,
          marks_percentage: qt.percentage
        }));

      // Build request payload based on API requirements
      const payload = {
        title: paperTitle,
        question_bank_ids: selectedQuestionBanks,
        total_marks: totalMarks,
        selected_chapters: paperType === 'custom' ? selectedChapters : [],
        question_type_distribution: questionTypeDistribution,
        difficulty_distribution: difficultyDistribution
      };

      // Send API request
      const response = await axios.post(
        `${API_URL}/papers/generate`,
        payload,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      // Handle success
      navigate(`/papers/${response.data.id}`);
    } catch (err: any) {
      console.error('Paper generation error:', err);
      setError(err.response?.data?.detail || 'Failed to generate paper');
    } finally {
      setLoading(false);
    }
  };

  // Get all steps for the current paper type
  const getSteps = () => {
    const baseSteps = [
      { key: 'selection', label: 'Method' },
      { key: 'basicInfo', label: 'Basic Info' }
    ];
    
    if (paperType === 'custom') {
      baseSteps.push({ key: 'chapters', label: 'Chapters' });
    }
    
    return [
      ...baseSteps,
      { key: 'questions', label: 'Question Types' },
      { key: 'difficulty', label: 'Difficulty' },
      { key: 'review', label: 'Review' }
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Generate Question Paper</h1>
          <p className="mt-2 text-gray-600">
            Create a question paper by customizing topics, question types, and difficulty levels.
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            {/* Step progress indicator */}
            <StepProgress 
              steps={getSteps()} 
              currentStep={currentStep} 
            />

            {/* Error display */}
            {error && (
              <div className="my-4 p-4 rounded-md bg-red-50 border border-red-200">
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

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {/* Step content */}
            <div className={loading ? 'hidden' : 'mt-6'}>
              {currentStep === 'selection' && (
                <PaperTypeSelector
                  paperType={paperType}
                  onTypeSelect={setPaperType}
                />
              )}

              {currentStep === 'basicInfo' && (
                <BasicInfoForm
                  paperTitle={paperTitle}
                  totalMarks={totalMarks}
                  totalTime={totalTime}
                  selectedStandard={selectedStandard}
                  selectedSubject={selectedSubject}
                  standards={standards}
                  subjects={subjects}
                  onTitleChange={setPaperTitle}
                  onMarksChange={setTotalMarks}
                  onTimeChange={setTotalTime}
                  onStandardChange={setSelectedStandard}
                  onSubjectChange={setSelectedSubject}
                />
              )}

              {currentStep === 'chapters' && (
                <ChapterSelector
                  chapters={chapters}
                  expandedChapters={expandedChapters}
                  onToggleChapter={toggleChapterSelection}
                  onToggleTopic={toggleTopicSelection}
                  onUpdateTopicWeight={updateTopicWeight}
                  onToggleExpansion={toggleChapterExpansion}
                />
              )}

              {currentStep === 'questions' && (
                <QuestionTypeSelector
                  questionTypes={questionTypes}
                  onToggleType={toggleQuestionTypeSelection}
                  onUpdatePercentage={setQuestionTypePercentage}
                />
              )}

              {currentStep === 'difficulty' && (
                <DifficultyDistributionSelector
                  distribution={difficultyDistribution}
                  onDistributionChange={updateDifficultyDistribution}
                />
              )}

              {currentStep === 'review' && (
                <PaperReview
                  paperTitle={paperTitle}
                  totalMarks={totalMarks}
                  totalTime={totalTime}
                  standardName={standards.find(s => s.id === selectedStandard)?.name || ''}
                  subjectName={subjects.find(s => s.id === selectedSubject)?.name || ''}
                  paperType={paperType!}
                  selectedChapters={chapters.filter(ch => ch.selected)}
                  selectedQuestionTypes={questionTypes.filter(qt => qt.selected)}
                  difficultyDistribution={difficultyDistribution}
                  questionBanks={questionBanks}
                  selectedQuestionBanks={selectedQuestionBanks}
                  onQuestionBanksChange={setSelectedQuestionBanks}
                />
              )}
            </div>

            {/* Navigation buttons */}
            <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between">
              {currentStep !== 'selection' ? (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              )}

              {currentStep !== 'review' ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={loading || (currentStep === 'selection' && !paperType)}
                  className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                    loading || (currentStep === 'selection' && !paperType)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
                >
                  Generate Paper
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperCreation;