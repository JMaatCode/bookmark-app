import type { Bookmark } from '@/types/bookmark'

const BOOKMARKS_KEY = 'bookmarks'
const TAGS_KEY = 'tags'

export const storage = {
  getBookmarks(): Bookmark[] {
    const data = localStorage.getItem(BOOKMARKS_KEY)
    return data ? JSON.parse(data) : []
  },

  saveBookmarks(bookmarks: Bookmark[]) {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks))
  },

  getTags(): string[] {
    const data = localStorage.getItem(TAGS_KEY)
    return data ? JSON.parse(data) : []
  },

  saveTags(tags: string[]) {
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags))
  }
} 