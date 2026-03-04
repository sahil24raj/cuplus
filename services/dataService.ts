import type { Announcement, Complaint, Note, Contact, AnnouncementCategory, ComplaintCategory, NoteType } from '../types';
import { MOCK_ANNOUNCEMENTS, MOCK_COMPLAINTS, MOCK_NOTES, MOCK_CONTACTS } from '../constants';

const FAKE_LATENCY = 250;
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Generic helper to manage a localStorage "table"
const createStorage = <T extends { id: string }>(storageKey: string, mockData: T[]) => {
  return {
    async getAll(): Promise<T[]> {
      await delay(FAKE_LATENCY);
      const data = localStorage.getItem(storageKey);
      if (!data) {
        localStorage.setItem(storageKey, JSON.stringify(mockData));
        return mockData;
      }
      return JSON.parse(data);
    },
    async saveAll(data: T[]): Promise<void> {
      await delay(FAKE_LATENCY);
      localStorage.setItem(storageKey, JSON.stringify(data));
    },
  };
};

const announcementStorage = createStorage<Announcement>('cu-announcements', MOCK_ANNOUNCEMENTS);
const complaintStorage = createStorage<Complaint>('cu-complaints', MOCK_COMPLAINTS);
const noteStorage = createStorage<Note>('cu-notes', MOCK_NOTES);
const contactStorage = createStorage<Contact>('cu-contacts', MOCK_CONTACTS);

// Special case for liked complaints (simple array of strings)
const LIKED_COMPLAINTS_KEY = 'cu-liked-complaints';
const likedComplaintsStorageManager = {
  async get(): Promise<string[]> {
    await delay(FAKE_LATENCY);
    const data = localStorage.getItem(LIKED_COMPLAINTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  async set(ids: string[]): Promise<void> {
    await delay(FAKE_LATENCY);
    localStorage.setItem(LIKED_COMPLAINTS_KEY, JSON.stringify(ids));
  }
};


// --- Service Layer ---
// This layer exposes business logic and knows how to create/update objects.

export const announcementService = {
  async getAll() { return announcementStorage.getAll(); },
  async add(data: Omit<Announcement, 'id' | 'date'>) {
    const items = await announcementStorage.getAll();
    const newItem: Announcement = { ...data, id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0] };
    await announcementStorage.saveAll([newItem, ...items]);
    return newItem;
  },
  async update(updatedItem: Announcement) {
    let items = await announcementStorage.getAll();
    items = items.map(i => (i.id === updatedItem.id ? updatedItem : i));
    await announcementStorage.saveAll(items);
    return updatedItem;
  },
  async remove(id: string) {
    let items = await announcementStorage.getAll();
    await announcementStorage.saveAll(items.filter(item => item.id !== id));
  },
};

export const complaintService = {
  async getAll() { return complaintStorage.getAll(); },
  async add(data: { title: string; description: string; studentName: string; category: ComplaintCategory }) {
    const items = await complaintStorage.getAll();
    const newItem: Complaint = { ...data, id: crypto.randomUUID(), likes: 0, date: new Date().toISOString().split('T')[0] };
    await complaintStorage.saveAll([newItem, ...items]);
    return newItem;
  },
  async update(updatedItem: Complaint) {
    let items = await complaintStorage.getAll();
    items = items.map(i => (i.id === updatedItem.id ? updatedItem : i));
    await complaintStorage.saveAll(items);
    return updatedItem;
  },
  async remove(id: string) {
    let items = await complaintStorage.getAll();
    await complaintStorage.saveAll(items.filter(item => item.id !== id));
  },
};

export const noteService = {
    async getAll() { return noteStorage.getAll(); },
    async add(data: Omit<Note, 'id'>) {
        const items = await noteStorage.getAll();
        const newItem: Note = { ...data, id: crypto.randomUUID() };
        await noteStorage.saveAll([newItem, ...items]);
        return newItem;
    },
    async update(updatedItem: Note) {
        let items = await noteStorage.getAll();
        items = items.map(i => (i.id === updatedItem.id ? updatedItem : i));
        await noteStorage.saveAll(items);
        return updatedItem;
    },
    async remove(id: string) {
        let items = await noteStorage.getAll();
        await noteStorage.saveAll(items.filter(item => item.id !== id));
    },
};

export const contactService = {
    async getAll() { return contactStorage.getAll(); },
    async add(data: Omit<Contact, 'id'>) {
        const items = await contactStorage.getAll();
        const newItem: Contact = { ...data, id: crypto.randomUUID() };
        await contactStorage.saveAll([newItem, ...items]);
        return newItem;
    },
    async update(updatedItem: Contact) {
        let items = await contactStorage.getAll();
        items = items.map(i => (i.id === updatedItem.id ? updatedItem : i));
        await contactStorage.saveAll(items);
        return updatedItem;
    },
    async remove(id: string) {
        let items = await contactStorage.getAll();
        await contactStorage.saveAll(items.filter(item => item.id !== id));
    },
};

export const likedComplaintsService = {
  async get() { return likedComplaintsStorageManager.get(); },
  async set(ids: string[]) { return likedComplaintsStorageManager.set(ids); }
};
