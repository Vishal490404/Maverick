import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionApi, curriculumApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Standard, Subject } from '../utils/api/types';

const AddQuestionBank: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [standardId, setStandardId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const navigate = useNavigate();
  const { token } = useAuth();

  // Load standards on component mount
  useEffect(() => {
    if (token) {
      fetchStandards();
    }
  }, [token]);

  // Load subjects when standard changes
  useEffect(() => {
    if (standardId && token) {
      fetchSubjects(standardId);
      setSubjectId('');
    }
  }, [standardId, token]);

  // Fetch standards
  const fetchStandards = async () => {
    setIsLoading(true);
    try {
      const response = await curriculumApi.getStandards(token!);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setStandards(response.data);
      }
    } catch (err) {
      console.error('Error fetching standards:', err);
      setError('Failed to load standards');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch subjects for a standard
  const fetchSubjects = async (stdId: string) => {
    setIsLoading(true);
    try {
      const response = await curriculumApi.getSubjects(stdId, token!);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setSubjects(response.data);
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to load subjects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await questionApi.createQuestionBank({ 
        name, 
        description, 
        standard_id: standardId,
        subject_id: subjectId 
      });
      
      if (response.error) {
        setError(response.error);
      } else {
        // Navigate to QuestionBanks page instead of showing alert
        navigate('/question-banks');
      }
    } catch (err) {
      console.error('Error creating question bank:', err);
      setError('An error occurred while creating the question bank.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-6 pb-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Question Bank</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="standard" className="block text-sm font-medium text-gray-700 required">
                Standard
              </label>
              <select
                id="standard"
                name="standard"
                value={standardId}
                onChange={(e) => setStandardId(e.target.value)}
                required
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 required">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
                disabled={!standardId}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 text-sm text-red-600">{error}</div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuestionBank;