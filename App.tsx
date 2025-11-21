import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import NoteList from './components/NoteList';
import Editor from './components/Editor';
import Auth from './components/Auth';
import { Note, User, ViewMode, SortOption } from './types';
import { getNotes, saveNotes, getUser, getTheme, saveTheme } from './services/storageService';
import { Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.ALL);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.DATE_DESC);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Init load
    const loadedUser = getUser();
    if (loadedUser) setUser(loadedUser);

    const loadedNotes = getNotes();
    setNotes(loadedNotes);

    const loadedTheme = getTheme();
    setTheme(loadedTheme);
    if (loadedTheme === 'dark') document.documentElement.classList.add('dark');
  }, []);

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, ...updates } : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const handleAddNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: '',
      content: '',
      tags: [],
      isFavorite: false,
      isDeleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setSelectedNoteId(newNote.id);
    // Reset view to find this note
    if (viewMode === ViewMode.TRASH) setViewMode(ViewMode.ALL);
  };

  const handleDeleteNote = (id: string) => {
    let updatedNotes;
    const noteToDelete = notes.find(n => n.id === id);
    
    if (noteToDelete?.isDeleted) {
        // Permanent Delete
        updatedNotes = notes.filter(n => n.id !== id);
        if (selectedNoteId === id) setSelectedNoteId(null);
    } else {
        // Soft Delete (Move to Trash)
        updatedNotes = notes.map(n => n.id === id ? { ...n, isDeleted: true, updatedAt: Date.now() } : n);
    }
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const handleRestoreNote = (id: string) => {
    const updatedNotes = notes.map(n => n.id === id ? { ...n, isDeleted: false } : n);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  // Filter & Sort Logic
  const filteredNotes = useMemo(() => {
    let filtered = notes.filter(note => {
        // Filter by view mode
        if (viewMode === ViewMode.TRASH) return note.isDeleted;
        if (note.isDeleted) return false; // Hide deleted notes in other views

        if (viewMode === ViewMode.FAVORITES) return note.isFavorite;
        if (viewMode === ViewMode.TAG && selectedTag) return note.tags.includes(selectedTag);
        
        return true;
    });

    // Filter by search
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(n => 
            n.title.toLowerCase().includes(lowerTerm) || 
            n.content.toLowerCase().includes(lowerTerm) ||
            n.tags.some(t => t.toLowerCase().includes(lowerTerm))
        );
    }

    // Sort
    filtered.sort((a, b) => {
        switch (sortOption) {
            case SortOption.DATE_DESC: return b.updatedAt - a.updatedAt;
            case SortOption.DATE_ASC: return a.updatedAt - b.updatedAt;
            case SortOption.TITLE_ASC: return a.title.localeCompare(b.title);
            case SortOption.TITLE_DESC: return b.title.localeCompare(a.title);
            default: return 0;
        }
    });

    return filtered;
  }, [notes, viewMode, selectedTag, searchTerm, sortOption]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(note => {
        if (!note.isDeleted) note.tags.forEach(t => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [notes]);

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-200">
      <Sidebar 
        currentView={viewMode}
        selectedTag={selectedTag}
        onViewChange={(view, tag) => {
            setViewMode(view);
            if (tag) setSelectedTag(tag);
            else setSelectedTag(null);
            // Clear selection if changing views logic implies it? keeping it simple.
        }}
        allTags={allTags}
        onLogout={() => {
            localStorage.removeItem('smartnote_user');
            setUser(null);
        }}
        userInitial={user.username.charAt(0)}
      />
      
      <div className="flex flex-1 h-full overflow-hidden">
        <NoteList 
            notes={filteredNotes}
            selectedNoteId={selectedNoteId}
            onSelectNote={setSelectedNoteId}
            onAddNote={handleAddNote}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortOption={sortOption}
            onSortChange={setSortOption}
        />
        
        {selectedNote ? (
            <Editor 
                note={selectedNote} 
                onUpdate={handleUpdateNote}
                onDelete={handleDeleteNote}
                isTrash={selectedNote.isDeleted}
                onRestore={handleRestoreNote}
            />
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-900 text-slate-400">
                <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <img src="https://picsum.photos/200/200?grayscale" className="w-full h-full object-cover rounded-full opacity-50" alt="Placeholder" />
                </div>
                <p className="text-lg font-medium">Select a note to view or edit</p>
            </div>
        )}
      </div>

      {/* Theme Toggle Absolute */}
      <button 
        onClick={handleThemeToggle}
        className="absolute bottom-6 left-6 z-50 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-yellow-400 hover:scale-110 transition-transform"
        title="Toggle Theme"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    </div>
  );
};

export default App;