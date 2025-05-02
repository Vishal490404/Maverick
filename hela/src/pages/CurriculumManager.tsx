import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { curriculumApi, Standard, Subject, Chapter, Topic, QuestionType, Tag } from '../utils/api';

// Import our new components
import {
  TabNavigation,
  ItemCardGrid,
  ParentSelector,
  FormModal,
  DeleteConfirmationModal,
  Notification
} from '../components/curriculum';

// Form data interface
interface FormData {
  name: string;
  description: string;
  color: string;
  showDescription: boolean;
}

// Generic item interface for consistent handling
interface CurriculumItem {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  color?: string;
  usage_count?: number;
}

const CurriculumManager: React.FC = () => {
  const { token } = useAuth();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'standards' | 'subjects' | 'chapters' | 'topics' | 'questionTypes' | 'tags'>('standards');
  
  // Data states
  const [standards, setStandards] = useState<Standard[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  // Selected item states
  const [selectedStandard, setSelectedStandard] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [itemToEdit, setItemToEdit] = useState<string>('');
  const [itemToDelete, setItemToDelete] = useState<string>('');
  
  // Form states
  const [formData, setFormData] = useState<FormData>({ name: '', description: '', color: '#3498db', showDescription: true });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [forceDelete, setForceDelete] = useState<boolean>(false);
  const [deleteItemName, setDeleteItemName] = useState<string>('');
  const [deleteItemUsageCount, setDeleteItemUsageCount] = useState<number>(0);
  
  // Fetch data when tab or hierarchy selection changes
  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [activeTab, selectedStandard, selectedSubject, selectedChapter, token]);
  
  // Fetch data based on active tab
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      switch (activeTab) {
        case 'standards': {
          const standardsResponse = await curriculumApi.getStandards(token!);
          if (standardsResponse.error) {
            setError(standardsResponse.error);
          } else if (standardsResponse.data) {
            setStandards(standardsResponse.data);
          }
          break;
        }
          
        case 'subjects': {
          if (selectedStandard) {
            const subjectsResponse = await curriculumApi.getSubjects(selectedStandard, token!);
            if (subjectsResponse.error) {
              setError(subjectsResponse.error);
            } else if (subjectsResponse.data) {
              setSubjects(subjectsResponse.data);
            }
          } else {
            setSubjects([]);
          }
          break;
        }
          
        case 'chapters': {
          if (selectedSubject) {
            const chaptersResponse = await curriculumApi.getChapters(selectedSubject, token!);
            if (chaptersResponse.error) {
              setError(chaptersResponse.error);
            } else if (chaptersResponse.data) {
              setChapters(chaptersResponse.data);
            }
          } else {
            setChapters([]);
          }
          break;
        }
          
        case 'topics': {
          if (selectedChapter) {
            const topicsResponse = await curriculumApi.getTopics(selectedChapter, token!);
            if (topicsResponse.error) {
              setError(topicsResponse.error);
            } else if (topicsResponse.data) {
              setTopics(topicsResponse.data);
            }
          } else {
            setTopics([]);
          }
          break;
        }
          
        case 'questionTypes': {
          const questionTypesResponse = await curriculumApi.getQuestionTypes(token!);
          if (questionTypesResponse.error) {
            setError(questionTypesResponse.error);
          } else if (questionTypesResponse.data) {
            setQuestionTypes(questionTypesResponse.data);
          }
          break;
        }
          
        case 'tags': {
          const tagsResponse = await curriculumApi.getTags(token!);
          if (tagsResponse.error) {
            setError(tagsResponse.error);
          } else if (tagsResponse.data) {
            setTags(tagsResponse.data);
          }
          break;
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle tab switching
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setShowForm(false); 
    resetForm();
    setSelectedStandard('');
    setSelectedSubject('');
    setSelectedChapter('');
  };
  
  // Reset form fields
  const resetForm = () => {
    setFormData({ name: '', description: '', color: '#3498db', showDescription: true });
    setIsEditing(false);
    setItemToEdit('');
    setError(null);
    setSuccess(null);
    setForceDelete(false);
  };
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    if (!formData.name.trim()) {
      setError('Name is required');
      setIsLoading(false);
      return;
    }
    
    try {
      // Different handling based on whether it's a create or update operation
      if (isEditing) {
        await handleUpdateOperation();
      } else {
        await handleCreateOperation();
      }
      
      // Close form after successful operation
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Form submission error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle create operations for all entity types
  const handleCreateOperation = async () => {
    switch (activeTab) {
      case 'standards': {
        const createStandardResponse = await curriculumApi.createStandard(
          { name: formData.name, description: formData.showDescription ? formData.description : "" },
          token!
        );
        if (createStandardResponse.error) {
          setError(createStandardResponse.error);
        } else {
          setSuccess('Standard created successfully');
        }
        break;
      }
        
      case 'subjects': {
        if (!selectedStandard) {
          setError('Please select a standard first');
          return;
        }
        const createSubjectResponse = await curriculumApi.createSubject(
          selectedStandard,
          { name: formData.name, description: formData.showDescription ? formData.description : "" },
          token!
        );
        if (createSubjectResponse.error) {
          setError(createSubjectResponse.error);
        } else {
          setSuccess('Subject created successfully');
        }
        break;
      }
        
      case 'chapters': {
        if (!selectedSubject) {
          setError('Please select a subject first');
          return;
        }
        const createChapterResponse = await curriculumApi.createChapter(
          selectedSubject,
          { name: formData.name, description: formData.showDescription ? formData.description : "" },
          token!
        );
        if (createChapterResponse.error) {
          setError(createChapterResponse.error);
        } else {
          setSuccess('Chapter created successfully');
        }
        break;
      }
        
      case 'topics': {
        if (!selectedChapter) {
          setError('Please select a chapter first');
          return;
        }
        const createTopicResponse = await curriculumApi.createTopic(
          selectedChapter,
          { name: formData.name, description: formData.showDescription ? formData.description : "" },
          token!
        );
        if (createTopicResponse.error) {
          setError(createTopicResponse.error);
        } else {
          setSuccess('Topic created successfully');
        }
        break;
      }
        
      case 'questionTypes': {
        const createQuestionTypeResponse = await curriculumApi.createQuestionType(
          { name: formData.name, description: formData.showDescription ? formData.description : "" },
          token!
        );
        if (createQuestionTypeResponse.error) {
          setError(createQuestionTypeResponse.error);
        } else {
          setSuccess('Question type created successfully');
        }
        break;
      }
        
      case 'tags': {
        const createTagResponse = await curriculumApi.createTag(
          { 
            name: formData.name, 
            description: formData.showDescription ? formData.description : "", 
            color: formData.color 
          },
          token!
        );
        if (createTagResponse.error) {
          setError(createTagResponse.error);
        } else {
          setSuccess('Tag created successfully');
        }
        break;
      }
    }
  };
  
  // Handle update operations for all entity types
  const handleUpdateOperation = async () => {
    switch (activeTab) {
      case 'standards': {
        const updateStandardResponse = await curriculumApi.updateStandard(
          itemToEdit,
          { name: formData.name, description: formData.showDescription ? formData.description : "" },
          token!
        );
        if (updateStandardResponse.error) {
          setError(updateStandardResponse.error);
        } else {
          setSuccess('Standard updated successfully');
        }
        break;
      }
        
      case 'subjects': {
        const updateSubjectResponse = await curriculumApi.updateSubject(
          itemToEdit,
          { name: formData.name, description: formData.showDescription ? formData.description : "" },
          token!
        );
        if (updateSubjectResponse.error) {
          setError(updateSubjectResponse.error);
        } else {
          setSuccess('Subject updated successfully');
        }
        break;
      }
        
      case 'chapters': {
        const updateChapterResponse = await curriculumApi.updateChapter(
          itemToEdit,
          { name: formData.name, description: formData.showDescription ? formData.description : "" },
          token!
        );
        if (updateChapterResponse.error) {
          setError(updateChapterResponse.error);
        } else {
          setSuccess('Chapter updated successfully');
        }
        break;
      }
        
      case 'topics': {
        const updateTopicResponse = await curriculumApi.updateTopic(
          itemToEdit,
          { name: formData.name, description: formData.showDescription ? formData.description : "" },
          token!
        );
        if (updateTopicResponse.error) {
          setError(updateTopicResponse.error);
        } else {
          setSuccess('Topic updated successfully');
        }
        break;
      }
        
      case 'questionTypes': {
        const updateQuestionTypeResponse = await curriculumApi.updateQuestionType(
          itemToEdit,
          { name: formData.name, description: formData.showDescription ? formData.description : "" },
          token!
        );
        if (updateQuestionTypeResponse.error) {
          setError(updateQuestionTypeResponse.error);
        } else {
          setSuccess('Question type updated successfully');
        }
        break;
      }
        
      case 'tags': {
        const updateTagResponse = await curriculumApi.updateTag(
          itemToEdit,
          { 
            name: formData.name, 
            description: formData.showDescription ? formData.description : "", 
            color: formData.color 
          },
          token!
        );
        if (updateTagResponse.error) {
          setError(updateTagResponse.error);
        } else {
          setSuccess('Tag updated successfully');
        }
        break;
      }
    }
  };
  
  // Set up form for editing an item
  const handleEditClick = (item: CurriculumItem) => {
    const itemName = item.name || (item as Record<string, any>).title || '';
    setIsEditing(true);
    setItemToEdit(item.id);
    setFormData({
      name: itemName,
      description: item.description || '',
      color: (item as Record<string, any>).color || '#3498db',
      showDescription: !!item.description
    });
    setShowForm(true);
  };
  
  // Set up delete confirmation modal
  const handleDeleteClick = (item: CurriculumItem) => {
    const itemName = item.name || (item as Record<string, any>).title || '';
    setItemToDelete(item.id);
    setDeleteItemName(itemName);
    setDeleteItemUsageCount((item as Record<string, any>).usage_count || 0);
    setShowDeleteModal(true);
    setForceDelete(false);
  };
  
  // Handle delete confirmation
  const confirmDelete = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      switch (activeTab) {
        case 'standards': {
          const deleteStandardResponse = await curriculumApi.deleteStandard(itemToDelete, token!);
          if (deleteStandardResponse.error) {
            setError(deleteStandardResponse.error);
          } else {
            setSuccess('Standard deleted successfully');
          }
          break;
        }
          
        case 'subjects': {
          const deleteSubjectResponse = await curriculumApi.deleteSubject(itemToDelete, token!);
          if (deleteSubjectResponse.error) {
            setError(deleteSubjectResponse.error);
          } else {
            setSuccess('Subject deleted successfully');
          }
          break;
        }
          
        case 'chapters': {
          const deleteChapterResponse = await curriculumApi.deleteChapter(itemToDelete, token!);
          if (deleteChapterResponse.error) {
            setError(deleteChapterResponse.error);
          } else {
            setSuccess('Chapter deleted successfully');
          }
          break;
        }
          
        case 'topics': {
          const deleteTopicResponse = await curriculumApi.deleteTopic(itemToDelete, token!);
          if (deleteTopicResponse.error) {
            setError(deleteTopicResponse.error);
          } else {
            setSuccess('Topic deleted successfully');
          }
          break;
        }
          
        case 'questionTypes': {
          const deleteQuestionTypeResponse = await curriculumApi.deleteQuestionType(itemToDelete, token!);
          if (deleteQuestionTypeResponse.error) {
            setError(deleteQuestionTypeResponse.error);
          } else {
            setSuccess('Question type deleted successfully');
          }
          break;
        }
          
        case 'tags': {
          const deleteTagResponse = await curriculumApi.deleteTag(itemToDelete, forceDelete, token!);
          if (deleteTagResponse.error) {
            setError(deleteTagResponse.error);
          } else {
            setSuccess('Tag deleted successfully');
          }
          break;
        }
      }
      
      // Close modal after successful operation
      setShowDeleteModal(false);
      fetchData();
    } catch (err) {
      console.error('Delete error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get current items based on active tab
  const getCurrentItems = (): CurriculumItem[] => {
    switch (activeTab) {
      case 'standards': 
        return standards as CurriculumItem[];
      case 'subjects': 
        return subjects as CurriculumItem[];
      case 'chapters': 
        return chapters as CurriculumItem[];
      case 'topics': 
        return topics as CurriculumItem[];
      case 'questionTypes': 
        return questionTypes as CurriculumItem[];
      case 'tags': 
        return tags as CurriculumItem[];
      default: 
        return [];
    }
  };
  
  // Determine hierarchy information for display
  const getHierarchyInfo = () => {
    switch (activeTab) {
      case 'subjects': {
        if (!selectedStandard) return null;
        const standard = standards.find(s => s.id === selectedStandard);
        return standard && { type: 'Standard', name: standard.name };
      }
      case 'chapters': {
        if (!selectedSubject) return null;
        const subject = subjects.find(s => s.id === selectedSubject);
        return subject && { type: 'Subject', name: subject.name };
      }
      case 'topics': {
        if (!selectedChapter) return null;
        const chapter = chapters.find(c => c.id === selectedChapter);
        return chapter && { type: 'Chapter', name: chapter.name || chapter.title || '' };
      }
      default:
        return null;
    }
  };
  
  // Get entity name for UI display
  const getEntityName = (singular: boolean = true): string => {
    switch (activeTab) {
      case 'standards': return singular ? 'Standard' : 'Standards';
      case 'subjects': return singular ? 'Subject' : 'Subjects';
      case 'chapters': return singular ? 'Chapter' : 'Chapters';
      case 'topics': return singular ? 'Topic' : 'Topics';
      case 'questionTypes': return singular ? 'Question Type' : 'Question Types';
      case 'tags': return singular ? 'Tag' : 'Tags';
      default: return '';
    }
  };
  
  // Check if parent selection is required
  const isParentSelectionRequired = (): boolean => {
    return ['subjects', 'chapters', 'topics'].includes(activeTab);
  };
  
  // Handle parent selection change
  const handleParentSelectionChange = (id: string) => {
    switch (activeTab) {
      case 'subjects':
        setSelectedStandard(id);
        break;
      case 'chapters':
        setSelectedSubject(id);
        break;
      case 'topics':
        setSelectedChapter(id);
        break;
      default:
        break;
    }
  };
  
  // Get parent selection options
  const getParentSelectionOptions = () => {
    switch (activeTab) {
      case 'subjects':
        return standards.map(item => ({ id: item.id, name: item.name }));
      case 'chapters':
        return subjects.map(item => ({ id: item.id, name: item.name }));
      case 'topics':
        return chapters.map(item => ({ id: item.id, name: item.name || item.title || '' }));
      default:
        return [];
    }
  };
  
  // Get current parent selection
  const getCurrentParentSelection = (): string => {
    switch (activeTab) {
      case 'subjects': return selectedStandard;
      case 'chapters': return selectedSubject;
      case 'topics': return selectedChapter;
      default: return '';
    }
  };
  
  // Get parent selection label
  const getParentSelectionLabel = (): string => {
    switch (activeTab) {
      case 'subjects': return 'Select Standard';
      case 'chapters': return 'Select Subject';
      case 'topics': return 'Select Chapter';
      default: return '';
    }
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setSuccess(null);
    setError(null);
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen pb-20">
      {/* Hero header section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold leading-tight">
                Curriculum Manager
              </h1>
              <p className="mt-2 text-indigo-100 max-w-3xl">
                Create, organize, and manage your entire curriculum hierarchy in one central location.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex-shrink-0">
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add {getEntityName()}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
          
          <div className="px-6 py-6">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
              {/* Section Header */}
              <div className="mb-4 md:mb-0">
                <div className="flex items-center">
                  <h2 className="text-xl font-medium text-gray-900 flex items-center">
                    {getEntityName(false)}
                  </h2>
                  <span className="ml-3 bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full">
                    {getCurrentItems().length}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1.5 max-w-2xl">
                  {isParentSelectionRequired() 
                    ? `Manage ${getEntityName(false).toLowerCase()} within your curriculum hierarchy` 
                    : activeTab === 'questionTypes'
                      ? 'Define question formats for assessments and tests'
                      : activeTab === 'tags'
                        ? 'Organize content with customizable tags for better organization'
                        : `Configure ${getEntityName(false).toLowerCase()} for your curriculum structure`
                  }
                </p>
              </div>
              
              {/* Quick Actions */}
              <div className="flex space-x-3 flex-shrink-0">
                <button
                  onClick={() => { resetForm(); setShowForm(true); }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add {getEntityName()}
                </button>
              </div>
            </div>
            
            {/* Parent Selector */}
            <ParentSelector 
              label={getParentSelectionLabel()}
              options={getParentSelectionOptions()}
              value={getCurrentParentSelection()}
              onChange={handleParentSelectionChange}
              required={isParentSelectionRequired()}
            />
            
            {/* Item Cards Grid */}
            <ItemCardGrid 
              items={getCurrentItems()}
              entityName={getEntityName()}
              isLoading={isLoading}
              hierarchyInfo={getHierarchyInfo()}
              parentSelectionRequired={isParentSelectionRequired()}
              hasParentSelected={!!getCurrentParentSelection()}
              onAddClick={() => { resetForm(); setShowForm(true); }}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              activeTab={activeTab}
            />
          </div>
        </div>
      </div>
        
      {/* Form Modal */}
      <FormModal
        isOpen={showForm}
        isEditing={isEditing}
        formData={formData}
        entityName={getEntityName()}
        isLoading={isLoading}
        error={error}
        showColorPicker={activeTab === 'tags'}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        onChange={handleInputChange}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        itemName={deleteItemName}
        entityName={getEntityName()}
        usageCount={deleteItemUsageCount}
        isTag={activeTab === 'tags'}
        isLoading={isLoading}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
      
      <Notification 
        type={success ? 'success' : error ? 'error' : null} 
        message={success || error} 
        onClose={handleNotificationClose}
      />
    </div>
  );
};

export default CurriculumManager;