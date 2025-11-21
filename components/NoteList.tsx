import React from 'react';
import { Note, SortOption } from '../types';
import { Search, SortDesc, Plus } from 'lucide-react';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onAddNote: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

const NoteList: React.FC<NoteListProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onAddNote,
  searchTerm,
  onSearchChange,
  sortOption,
  onSortChange
}) => {
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Strip HTML/Markdown for preview
  const getPreview = (content: string) => {
    return content.slice(0, 100) + (content.length > 100 ? '...' : '');
  };

  return (
    <div className="w-80 h-full flex flex-col bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex-shrink-0">
      {/* Search & Header */}
      <div className="p-4 space-y-3 border-b border-gray-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-slate-900 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="relative group">
            <button className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
              <SortDesc size={14} />
              <span>Sort</span>
            </button>
            {/* Simple custom dropdown for sort */}
            <select 
              value={sortOption} 
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            >
              <option value={SortOption.DATE_DESC}>Newest First</option>
              <option value={SortOption.DATE_ASC}>Oldest First</option>
              <option value={SortOption.TITLE_ASC}>Title A-Z</option>
            </select>
          </div>
          
          <button 
            onClick={onAddNote}
            className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-md transition-colors shadow-sm"
            aria-label="Create Note"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm p-4 text-center">
            <p>No notes found.</p>
          </div>
        ) : (
          notes.map(note => (
            <div
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={`
                p-4 border-b border-gray-100 dark:border-slate-700 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50
                ${selectedNoteId === note.id ? 'bg-blue-50 dark:bg-slate-700 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}
              `}
            >
              <h3 className={`font-semibold mb-1 truncate ${selectedNoteId === note.id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-slate-100'}`}>
                {note.title || 'Untitled Note'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate h-4">
                 {getPreview(note.content)}
              </p>
              
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1 flex-wrap">
                  {note.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-200 dark:bg-slate-600 rounded-full text-slate-600 dark:text-slate-300">
                      #{tag}
                    </span>
                  ))}
                  {note.tags.length > 2 && (
                    <span className="text-[10px] text-slate-400">+{note.tags.length - 2}</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {formatDate(note.updatedAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NoteList;