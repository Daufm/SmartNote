import React from 'react';
import { ViewMode } from '../types';
import { 
  LayoutGrid, 
  Star, 
  Trash2, 
  Tag, 
  Plus, 
  LogOut,
  Search,
  Settings
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  selectedTag: string | null;
  onViewChange: (view: ViewMode, tag?: string) => void;
  allTags: string[];
  onLogout: () => void;
  userInitial: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  selectedTag, 
  onViewChange, 
  allTags,
  onLogout,
  userInitial
}) => {
  
  const navItemClass = (isActive: boolean) => `
    flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
    ${isActive 
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
  `;

  return (
    <div className="w-64 h-full flex flex-col bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex-shrink-0">
      {/* Header */}
      <div className="p-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
          {userInitial.toUpperCase()}
        </div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">SmartNote</h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2 mt-2">Menu</div>
        
        <div 
          onClick={() => onViewChange(ViewMode.ALL)}
          className={navItemClass(currentView === ViewMode.ALL)}
        >
          <LayoutGrid size={18} />
          <span>All Notes</span>
        </div>

        <div 
          onClick={() => onViewChange(ViewMode.FAVORITES)}
          className={navItemClass(currentView === ViewMode.FAVORITES)}
        >
          <Star size={18} />
          <span>Favorites</span>
        </div>

        <div 
          onClick={() => onViewChange(ViewMode.TRASH)}
          className={navItemClass(currentView === ViewMode.TRASH)}
        >
          <Trash2 size={18} />
          <span>Trash</span>
        </div>

        {/* Tags Section */}
        <div className="mt-8 mb-2 px-4 flex items-center justify-between group">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tags</span>
        </div>

        <div className="space-y-1">
          {allTags.length === 0 && (
            <div className="px-4 py-2 text-sm text-slate-400 italic">No tags yet</div>
          )}
          {allTags.map(tag => (
            <div
              key={tag}
              onClick={() => onViewChange(ViewMode.TAG, tag)}
              className={navItemClass(currentView === ViewMode.TAG && selectedTag === tag)}
            >
              <Tag size={16} className={currentView === ViewMode.TAG && selectedTag === tag ? 'fill-blue-700 dark:fill-blue-300' : ''} />
              <span className="truncate">#{tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-800">
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-2 w-full text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;