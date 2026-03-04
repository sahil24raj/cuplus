
export enum Page {
  Announcements = 'Announcements',
  Complaints = 'Complaints',
  DigitalLibrary = 'Digital Library',
  ImportantContacts = 'Important Contacts',
  AIDoubtSolver = 'AI Doubt Solver',
  AIPractice = 'AI Practice',
  CourierService = 'Courier Service',
}

export enum AnnouncementCategory {
  Academics = 'Academics',
  Events = 'Events & Competitions',
  MyClasses = 'My Classes',
}

export interface Announcement {
  id: string;
  category: AnnouncementCategory;
  title: string;
  content: string;
  date: string;
}

export enum ComplaintCategory {
    Academic = 'Academic',
    Hostel = 'Hostel',
}

export interface Complaint {
  id: string;
  studentName: string;
  title: string;
  description: string;
  likes: number;
  date: string;
  category: ComplaintCategory;
}

export enum NoteType {
  Notes = 'Notes',
  ShortNotes = 'Short Notes',
}

export interface Note {
  id: string;
  type: NoteType;
  subject: string;
  topic: string;
  fileUrl: string; // Base64 data URL
  fileName: string; // e.g., "lecture1.pdf"
  imageUrl?: string; // Optional Base64 data URL for image preview
}

export interface Contact {
  id: string;
  name: string;
  department: string;
  phone: string;
  email: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface Shop {
  id: string;
  name: string;
  cuisine: string;
  image: string;
  menu: MenuItem[];
}

export interface CartItem extends MenuItem {
    quantity: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface AnswerEvaluation {
    rating: number;
    feedback: string;
    suggestions: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}
