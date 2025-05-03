import React from 'react';

interface Standard {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface BasicInfoFormProps {
  paperTitle: string;
  totalMarks: number;
  totalTime: number;
  selectedStandard: string;
  selectedSubject: string;
  standards: Standard[];
  subjects: Subject[];
  onTitleChange: (title: string) => void;
  onMarksChange: (marks: number) => void;
  onTimeChange: (time: number) => void;
  onStandardChange: (standardId: string) => void;
  onSubjectChange: (subjectId: string) => void;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  paperTitle,
  totalMarks,
  totalTime,
  selectedStandard,
  selectedSubject,
  standards,
  subjects,
  onTitleChange,
  onMarksChange,
  onTimeChange,
  onStandardChange,
  onSubjectChange
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Paper Basic Information</h2>
      <p className="text-sm text-gray-500">
        Enter the essential details about your question paper.
      </p>

      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 gap-x-4">
        {/* Paper Title */}
        <div className="sm:col-span-6">
          <label htmlFor="paperTitle" className="block text-sm font-medium text-gray-700">
            Paper Title
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="paperTitle"
              name="paperTitle"
              value={paperTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="e.g., Mathematics Final Exam Paper"
              required
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            A descriptive title for your question paper
          </p>
        </div>

        {/* Standard/Class */}
        <div className="sm:col-span-3">
          <label htmlFor="standard" className="block text-sm font-medium text-gray-700">
            Standard/Class
          </label>
          <div className="mt-1">
            <select
              id="standard"
              name="standard"
              value={selectedStandard}
              onChange={(e) => {
                onStandardChange(e.target.value);
                onSubjectChange(''); // Reset subject when standard changes
              }}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              required
            >
              <option value="" disabled>
                Select a standard/class
              </option>
              {standards.map((standard) => (
                <option key={standard.id} value={standard.id}>
                  {standard.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject */}
        <div className="sm:col-span-3">
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <div className="mt-1">
            <select
              id="subject"
              name="subject"
              value={selectedSubject}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              disabled={!selectedStandard}
              required
            >
              <option value="" disabled>
                {selectedStandard ? 'Select a subject' : 'Please select a standard first'}
              </option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Total Marks */}
        <div className="sm:col-span-3">
          <label htmlFor="totalMarks" className="block text-sm font-medium text-gray-700">
            Total Marks
          </label>
          <div className="mt-1">
            <input
              type="number"
              id="totalMarks"
              name="totalMarks"
              min="1"
              max="500"
              value={totalMarks}
              onChange={(e) => onMarksChange(parseInt(e.target.value) || 0)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              required
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">Maximum marks for the paper (1-500)</p>
        </div>

        {/* Total Time */}
        <div className="sm:col-span-3">
          <label htmlFor="totalTime" className="block text-sm font-medium text-gray-700">
            Duration (minutes)
          </label>
          <div className="mt-1">
            <input
              type="number"
              id="totalTime"
              name="totalTime"
              min="1"
              value={totalTime}
              onChange={(e) => onTimeChange(parseInt(e.target.value) || 0)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              required
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">Time allowed for the exam in minutes</p>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;