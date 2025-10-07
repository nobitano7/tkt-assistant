import { useState, useEffect, useCallback } from 'react';
import { type Bookmark } from '../types';

const BOOKMARK_STORAGE_KEY = 'TKT_ASSISTANT_BOOKMARKS';

const defaultBookmarks: Bookmark[] = [
    { id: 1, name: 'Abtrip.vn', url: 'https://abtrip.vn' },
    { id: 2, name: 'Quy định BSP (1Gindo)', url: 'https://1gindo.com/bsp/index.htm' },
];

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    try {
      const storedBookmarks = localStorage.getItem(BOOKMARK_STORAGE_KEY);
      if (storedBookmarks) {
        setBookmarks(JSON.parse(storedBookmarks));
      } else {
        setBookmarks(defaultBookmarks);
      }
    } catch (error) {
      console.error("Failed to load bookmarks from localStorage", error);
      setBookmarks(defaultBookmarks);
    }
  }, []);

  useEffect(() => {
     if (bookmarks.length > 0 || localStorage.getItem(BOOKMARK_STORAGE_KEY)) {
        try {
            localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarks));
        } catch (error) {
            console.error("Failed to save bookmarks to localStorage", error);
        }
     }
  }, [bookmarks]);

  const addBookmark = useCallback((name: string, url: string) => {
    // Basic URL validation
    let validUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      validUrl = `https://${url}`;
    }

    const newBookmark: Bookmark = {
      id: Date.now(),
      name: name.trim(),
      url: validUrl,
    };
    setBookmarks(prev => [newBookmark, ...prev]);
  }, []);

  const deleteBookmark = useCallback((id: number) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
  }, []);

  return { bookmarks, addBookmark, deleteBookmark };
};