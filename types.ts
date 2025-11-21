export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  isDeleted: boolean; // Soft delete for Trash
  createdAt: number;
  updatedAt: number;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  url: string; // Base64 or URL
  name: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export enum SortOption {
  DATE_DESC = 'DATE_DESC',
  DATE_ASC = 'DATE_ASC',
  TITLE_ASC = 'TITLE_ASC',
  TITLE_DESC = 'TITLE_DESC',
}

export enum ViewMode {
  ALL = 'ALL',
  FAVORITES = 'FAVORITES',
  TRASH = 'TRASH',
  TAG = 'TAG',
}