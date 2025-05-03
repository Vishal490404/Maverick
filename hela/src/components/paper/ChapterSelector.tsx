import React from 'react';

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

interface ChapterSelectorProps {
  chapters: Chapter[];
  expandedChapters: string[];
  onToggleChapter: (chapterId: string) => void;
  onToggleTopic: (chapterId: string, topicId: string) => void;
  onUpdateTopicWeight: (chapterId: string, topicId: string, weight: number) => void;
  onToggleExpansion: (chapterId: string) => void;
}

const ChapterSelector: React.FC<ChapterSelectorProps> = ({
  chapters,
  expandedChapters,
  onToggleChapter,
  onToggleTopic,
  onUpdateTopicWeight,
  onToggleExpansion
}) => {
  const handleSelectAllTopics = (chapterId: string, select: boolean) => {
    const chapter = chapters.find(ch => ch.id === chapterId);
    
    if (chapter && chapter.topics) {
      chapter.topics.forEach(topic => {
        onToggleTopic(chapterId, topic.id);
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Select Chapters & Topics</h2>
          <p className="mt-1 text-sm text-gray-500">
            Choose the chapters and specific topics to include in your question paper.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {chapters.filter(ch => ch.selected).length} of {chapters.length} chapters selected
        </div>
      </div>

      {chapters.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
          No chapters available for the selected subject and standard.
        </div>
      ) : (
        <div className="mt-4 border rounded-md border-gray-300 divide-y divide-gray-300">
          {chapters.map(chapter => (
            <div key={chapter.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id={`chapter-${chapter.id}`}
                    name={`chapter-${chapter.id}`}
                    type="checkbox"
                    checked={chapter.selected}
                    onChange={() => onToggleChapter(chapter.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label 
                    htmlFor={`chapter-${chapter.id}`} 
                    className="ml-3 font-medium text-gray-700"
                  >
                    {chapter.title}
                  </label>
                </div>
                <div>
                  {chapter.topics && chapter.topics.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onToggleExpansion(chapter.id)}
                      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {expandedChapters.includes(chapter.id) ? (
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {chapter.topics && chapter.topics.length > 0 && expandedChapters.includes(chapter.id) && (
                <div className="mt-4 ml-7 space-y-4">
                  <div className="flex justify-between items-center border-t border-b border-gray-100 py-2">
                    <span className="text-xs text-gray-500">
                      {chapter.topics.filter(t => t.selected).length} of {chapter.topics.length} topics selected
                    </span>
                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={() => handleSelectAllTopics(chapter.id, true)}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectAllTopics(chapter.id, false)}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {chapter.topics.map(topic => (
                      <div key={topic.id} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`topic-${topic.id}`}
                            name={`topic-${topic.id}`}
                            type="checkbox"
                            checked={topic.selected}
                            onChange={() => onToggleTopic(chapter.id, topic.id)}
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 flex-grow">
                          <label htmlFor={`topic-${topic.id}`} className="text-sm font-medium text-gray-700">
                            {topic.title}
                          </label>
                          {topic.selected && (
                            <div className="mt-1">
                              <label htmlFor={`weight-${topic.id}`} className="block text-xs text-gray-500">
                                Topic Weight:
                              </label>
                              <div className="flex items-center mt-1">
                                <input
                                  type="range"
                                  id={`weight-${topic.id}`}
                                  min="0.1"
                                  max="5"
                                  step="0.1"
                                  value={topic.weight}
                                  onChange={(e) => onUpdateTopicWeight(chapter.id, topic.id, parseFloat(e.target.value))}
                                  className="mr-2 w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-xs text-gray-500">
                                  {topic.weight.toFixed(1)}x
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChapterSelector;