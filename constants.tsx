
import type { Announcement, Complaint, Note, Contact, Shop } from './types';
import { AnnouncementCategory, NoteType, ComplaintCategory } from './types';

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: '1', category: AnnouncementCategory.Academics, title: 'Mid-Term Exam Schedule', content: 'The mid-term exam schedule for all branches has been released. Please check the notice board.', date: '2024-07-20' },
  { id: '2', category: AnnouncementCategory.Events, title: 'Hackathon 2024 Registration', content: 'Registrations for the annual Hackathon are now open. Last date to apply is July 30th.', date: '2024-07-19' },
  { id: '3', category: AnnouncementCategory.MyClasses, title: 'CS-101 Lecture Cancelled', content: 'Dr. Sharma\'s lecture for CS-101 scheduled for 22nd July is cancelled.', date: '2024-07-21' },
  { id: '4', category: AnnouncementCategory.Academics, title: 'Library Timings Extended', content: 'Library will be open till 10 PM during exam season.', date: '2024-07-18' },
];

export const MOCK_COMPLAINTS: Complaint[] = [
  { id: '1', studentName: 'Rohan Sharma', title: 'Wi-Fi not working in Hostel Block C', description: 'The Wi-Fi has been down for the past 2 days. We are unable to study for our exams.', likes: 15, date: '2024-07-21', category: ComplaintCategory.Hostel },
  { id: '2', studentName: 'Priya Verma', title: 'Water cooler on 3rd floor is broken', description: 'The only water cooler on our floor is not working. Please get it repaired.', likes: 25, date: '2024-07-20', category: ComplaintCategory.Hostel },
  { id: '3', studentName: 'Amit Singh', title: 'Request for more books in library', description: 'The library needs more copies of the latest edition of the Data Structures textbook.', likes: 8, date: '2024-07-19', category: ComplaintCategory.Academic },
];

export const MOCK_NOTES: Note[] = [
    { id: '1', type: NoteType.Notes, subject: 'Computer Networks', topic: 'OSI Model Detailed', fileUrl: '#', fileName: 'osi-model.pdf', imageUrl: 'https://placehold.co/600x400/1E1E1E/FFFFFF/png?text=OSI+Model' },
    { id: '2', type: NoteType.ShortNotes, subject: 'Database Management', topic: 'Normalization Quick Revision', fileUrl: '#', fileName: 'dbms-normalization.pdf', imageUrl: 'https://placehold.co/600x400/1E1E1E/FFFFFF/png?text=DBMS' },
    { id: '3', type: NoteType.Notes, subject: 'Operating Systems', topic: 'Process Scheduling Algorithms', fileUrl: '#', fileName: 'os-scheduling.pdf', imageUrl: 'https://placehold.co/600x400/1E1E1E/FFFFFF/png?text=OS' },
];

export const MOCK_CONTACTS: Contact[] = [
    { id: '1', name: 'Admin Block', department: 'Administration', phone: '123-456-7890', email: 'admin@cu.ac.in' },
    { id: '2', name: 'Security Office', department: 'Campus Security', phone: '098-765-4321', email: 'security@cu.ac.in' },
    { id: '3', name: 'Hostel Warden (Boys)', department: 'Hostel', phone: '111-222-3333', email: 'warden.boys@cu.ac.in' },
];

export const MOCK_SHOPS: Shop[] = [
    { 
        id: '1', 
        name: 'Zaika Nonveg Shop', 
        cuisine: 'North Indian, Mughlai',
        image: 'https://placehold.co/600x400/D22B2B/FFFFFF/png?text=Zaika',
        menu: [
            {id:'m1', name: 'Chicken Biryani', description: 'Aromatic basmati rice cooked with succulent chicken pieces and a blend of exotic spices.', price: 250}, 
            {id:'m2', name: 'Chicken Lollipop', description: 'Frenched chicken winglets, marinated and then batter fried until crisp.', price: 180},
            {id:'m3', name: 'Mutton Korma', description: 'Tender mutton pieces simmered in a rich, creamy gravy with a hint of cardamom.', price: 320},
            {id:'m4', name: 'Tandoori Roti', description: 'Whole wheat bread baked in a traditional clay oven.', price: 20}
        ] 
    },
    { 
        id: '2', 
        name: 'Shiva Vegetarian Dhaba', 
        cuisine: 'Vegetarian, Punjabi',
        image: 'https://placehold.co/600x400/228B22/FFFFFF/png?text=Shiva+Dhaba',
        menu: [
            {id:'m5', name: 'Paneer Butter Masala', description: 'Soft paneer cubes cooked in a rich and creamy tomato-based gravy.', price: 220}, 
            {id:'m6', name: 'Dal Makhani', description: 'A classic Punjabi dish made with black lentils, red kidney beans, butter, and cream.', price: 180},
            {id:'m7', name: 'Aloo Paratha', description: 'Whole wheat flatbread stuffed with a spiced potato filling, served with curd.', price: 80}
        ] 
    },
    { 
        id: '3', 
        name: 'Campus Bakery & Shakes', 
        cuisine: 'Bakery, Desserts, Beverages',
        image: 'https://placehold.co/600x400/8B4513/FFFFFF/png?text=Campus+Bakery',
        menu: [
            {id:'m8', name: 'Chocolate Truffle Pastry', description: 'A decadent and moist chocolate pastry with a rich ganache.', price: 120}, 
            {id:'m9', name: 'Oreo Milkshake', description: 'A thick and creamy milkshake blended with Oreo cookies.', price: 150},
            {id:'m10', name: 'Veggie Puff', description: 'A flaky pastry filled with a savory mix of spiced vegetables.', price: 40}
        ] 
    },
];


export const ADMIN_KEY = '122448';

// SVG Icons
export const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
);
export const ComplaintIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><path d="M9 9h.01"></path><path d="M15 9h.01"></path></svg>
);
export const LibraryIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v2H6.5A2.5 2.5 0 0 1 4 19.5zM4 5h16v12H4V5z"/></svg>
);
export const ContactIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);
export const AiIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect x="4" y="12" width="16" height="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M12 12v-2a2 2 0 0 1 2-2h2.5a2.5 2.5 0 1 1 0 5H14"/></svg>
);
export const PracticeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
export const CourierIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16,8 20,8 23,11 23,16 16,16 16,8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
);
export const ThumbsUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a2 2 0 0 1 3 1.88Z"/></svg>
);
export const PlusCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
);
export const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);
export const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);
export const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);
