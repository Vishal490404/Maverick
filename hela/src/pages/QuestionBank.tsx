import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Select } from '../components/ui';
import { API_URL } from '../utils/api/utils';

// Interfaces
interface QuestionBank {
  id: string;
  name: string;
  description?: string;
  standard_id: string;
  subject_id: string;
  question_count: number;
  standard_name: string;
  subject_name: string;
  created_at: string;
  updated_at: string;
}

export const QuestionBanks: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // State
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [standards, setStandards] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [filterStandard, setFilterStandard] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch curriculum metadata
  useEffect(() => {
    const fetchCurriculum = async () => {
      if (!token) return;
      try {
        const [sRes, subjRes] = await Promise.all([
          fetch(`${API_URL}/curriculum/standards`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/curriculum/subjects`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (sRes.ok && subjRes.ok) {
          setStandards(await sRes.json());
          setSubjects(await subjRes.json());
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchCurriculum();
  }, [token]);

  // Fetch question banks with optional filters
  const fetchBanks = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterStandard) params.append('standard_id', filterStandard);
      if (filterSubject) params.append('subject_id', filterSubject);
      const res = await fetch(`${API_URL}/question-banks?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load');
      const data: QuestionBank[] = await res.json();
      setBanks(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBanks(); }, [filterStandard, filterSubject]);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Question Banks</h1>
          <Link to="/question-banks/add" className="px-4 py-2 bg-indigo-600 text-white rounded-md">New Bank</Link>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="standard-filter" className="block text-sm font-medium text-gray-700">Standard</label>
            <Select
              id="standard-filter"
              value={filterStandard}
              onChange={(e) => setFilterStandard(e.target.value)}
              options={[{ value: '', label: 'All' }, ...standards.map(s => ({ value: s.id, label: s.name }))]}
            />
          </div>
          <div>
            <label htmlFor="subject-filter" className="block text-sm font-medium text-gray-700">Subject</label>
            <Select
              id="subject-filter"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              options={[{ value: '', label: 'All' }, ...subjects.map(s => ({ value: s.id, label: s.name }))]}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Standard</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Questions</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {banks.map(bank => (
                  <tr key={bank.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bank.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bank.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bank.standard_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bank.subject_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">{bank.question_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button onClick={() => navigate(`/question-banks/${bank.id}`)} className="text-indigo-600 hover:text-indigo-900">View</button>
                      <button onClick={() => navigate(`/question-banks/${bank.id}/edit`)} className="text-yellow-600 hover:text-yellow-900">Edit</button>
                      <button onClick={async () => {
                        if (confirm('Delete this bank?')) {
                          await fetch(`${API_URL}/question-banks/${bank.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                          fetchBanks();
                        }
                      }} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
                {!banks.length && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No question banks found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {error && <div className="mt-4 text-red-600">{error}</div>}
      </div>
    </div>
  );
};
export default QuestionBanks;