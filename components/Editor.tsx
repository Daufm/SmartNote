import React, { useState, useEffect, useRef } from 'react';
import { Note, Attachment } from '../types';
import { generateTags, summarizeNote, enhanceContent } from '../services/geminiService';
import { 
  Save, 
  Sparkles, 
  Trash2, 
  MoreVertical, 
  Image as ImageIcon, 
  Clock, 
  Tag as TagIcon,
  Bold,
  Italic,
  List,
  CheckSquare,
  Star,
  Eye
} from 'lucide-react';

interface EditorProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  isTrash: boolean;
  onRestore: (id: string) => void;
}

const Editor: React.FC<EditorProps> = ({ note, onUpdate, onDelete, isTrash, onRestore }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState<string[]>(note.tags);
  const [newTag, setNewTag] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMode, setAiMode] = useState<'none' | 'tags' | 'summary' | 'rewrite'>('none');
  const [summary, setSummary] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags);
    setSummary('');
    setAiMode('none');
  }, [note.id]);

  // Auto-save debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== note.title || content !== note.content || JSON.stringify(tags) !== JSON.stringify(note.tags)) {
        onUpdate(note.id, { title, content, tags, updatedAt: Date.now() });
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [title, content, tags]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAIAction = async (action: 'tags' | 'summary' | 'rewrite') => {
    if (!content) return;
    setIsGenerating(true);
    setAiMode(action);

    if (action === 'tags') {
      const generatedTags = await generateTags(content);
      const uniqueNewTags = generatedTags.filter(t => !tags.includes(t));
      setTags(prev => [...prev, ...uniqueNewTags]);
      setIsGenerating(false);
    } else if (action === 'summary') {
      const sum = await summarizeNote(content);
      setSummary(sum);
      setIsGenerating(false);
    } else if (action === 'rewrite') {
        // A generic polish
        const polished = await enhanceContent(content, "Rewrite this to be more professional and clear");
        setContent(polished);
        setIsGenerating(false);
    }
  };

  const insertMarkdown = (syntax: string) => {
    const textarea = document.getElementById('note-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    let newText = '';
    let newCursorPos = 0;

    if (syntax === 'bold') {
        newText = `${before}**${selection}**${after}`;
        newCursorPos = end + 4;
    } else if (syntax === 'italic') {
        newText = `${before}_${selection}_${after}`;
        newCursorPos = end + 2;
    } else if (syntax === 'list') {
        newText = `${before}\n- ${selection}${after}`;
        newCursorPos = end + 3;
    }

    setContent(newText);
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            const newAttachment: Attachment = {
                id: Date.now().toString(),
                type: file.type.startsWith('image') ? 'image' : 'file',
                url: base64,
                name: file.name
            };
            const currentAttachments = note.attachments || [];
            onUpdate(note.id, { 
                attachments: [...currentAttachments, newAttachment],
                updatedAt: Date.now()
            });
        };
        reader.readAsDataURL(file);
    }
  };

  if (isTrash) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 text-slate-500">
        <Trash2 size={48} className="mb-4 text-red-400" />
        <h2 className="text-xl font-bold mb-2">Note in Trash</h2>
        <p className="mb-6">This note is currently in the trash bin.</p>
        <div className="flex gap-4">
           <button 
            onClick={() => onRestore(note.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
           >
             Restore Note
           </button>
           <button 
             onClick={() => onDelete(note.id)} // Permanent delete
             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
           >
             Delete Permanently
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Toolbar */}
      <div className="px-8 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="flex items-center gap-2 text-slate-400">
            <Clock size={14} />
            <span className="text-xs">Last edited {new Date(note.updatedAt).toLocaleString()}</span>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={() => onUpdate(note.id, { isFavorite: !note.isFavorite })}
                className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${note.isFavorite ? 'text-yellow-500' : 'text-slate-400'}`}
                title="Toggle Favorite"
            >
                <Star size={18} className={note.isFavorite ? 'fill-yellow-500' : ''} />
            </button>
            
            <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>

            <button onClick={() => setShowPreview(!showPreview)} className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${showPreview ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`} title="Toggle Preview">
                <Eye size={18} />
            </button>
            
            <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>

            <button onClick={() => onDelete(note.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete Note">
                <Trash2 size={18} />
            </button>
        </div>
      </div>

      {/* Main Edit Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="w-full text-4xl font-bold text-slate-900 dark:text-white placeholder-slate-300 border-none outline-none bg-transparent mb-6"
        />

        {/* AI & Formatting Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 pb-3 border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                <button onClick={() => insertMarkdown('bold')} className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-white dark:hover:bg-slate-700"><Bold size={16}/></button>
                <button onClick={() => insertMarkdown('italic')} className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-white dark:hover:bg-slate-700"><Italic size={16}/></button>
                <button onClick={() => insertMarkdown('list')} className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-white dark:hover:bg-slate-700"><List size={16}/></button>
            </div>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
                <ImageIcon size={14} />
                <span>Add Image</span>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

            <div className="flex-1"></div>

            {/* AI Tools */}
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => handleAIAction('tags')}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-full hover:bg-purple-100 transition-colors disabled:opacity-50"
                >
                    <Sparkles size={12} />
                    {isGenerating && aiMode === 'tags' ? 'Thinking...' : 'Auto-Tag'}
                </button>

                <button 
                    onClick={() => handleAIAction('summary')}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-600 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-full hover:bg-teal-100 transition-colors disabled:opacity-50"
                >
                    <Sparkles size={12} />
                    {isGenerating && aiMode === 'summary' ? 'Summarizing...' : 'Summarize'}
                </button>
                <button 
                    onClick={() => handleAIAction('rewrite')}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-50"
                >
                    <Sparkles size={12} />
                    {isGenerating && aiMode === 'rewrite' ? 'Polishing...' : 'Polish'}
                </button>
            </div>
        </div>

        {/* Summary Box */}
        {summary && (
            <div className="mb-6 p-4 bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800 rounded-xl">
                <div className="flex items-center gap-2 mb-2 text-teal-700 dark:text-teal-400 font-medium text-sm">
                    <Sparkles size={14} />
                    <span>AI Summary</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{summary}</p>
                <button onClick={() => setSummary('')} className="mt-2 text-xs text-teal-600 underline">Dismiss</button>
            </div>
        )}

        {/* Editor / Preview */}
        {showPreview ? (
             <div className="prose dark:prose-invert max-w-none min-h-[300px] whitespace-pre-wrap">
                {content}
                {/* Note: In a real app, use a markdown parser library like react-markdown here. 
                    For this implementation, we simply display whitespace-preserved text to be safe. */}
             </div>
        ) : (
            <textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing..."
              className="w-full min-h-[400px] text-lg text-slate-700 dark:text-slate-300 bg-transparent border-none outline-none resize-none leading-relaxed font-mono"
            />
        )}

        {/* Attachments Grid */}
        {note.attachments && note.attachments.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
                <h4 className="text-sm font-medium text-slate-500 mb-4">Attachments</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {note.attachments.map(att => (
                        <div key={att.id} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
                            {att.type === 'image' ? (
                                <img src={att.url} alt="Attachment" className="w-full h-32 object-cover" />
                            ) : (
                                <div className="w-full h-32 bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                    FILE
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                    onClick={() => {
                                        const newAtts = note.attachments?.filter(a => a.id !== att.id);
                                        onUpdate(note.id, { attachments: newAtts, updatedAt: Date.now() });
                                    }}
                                    className="text-white p-1 bg-red-500 rounded-full"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Tags Input */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <TagIcon size={16} className="text-slate-400" />
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm group">
              #{tag}
              <button onClick={() => removeTag(tag)} className="hidden group-hover:block text-slate-400 hover:text-red-500">×</button>
            </span>
          ))}
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add tag..."
            className="bg-transparent outline-none text-sm min-w-[80px] text-slate-600 dark:text-slate-400 placeholder-slate-400"
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;