import React, { useState, useMemo, useEffect } from 'react';
import type { Announcement, Complaint, Note, Contact, Shop, ChatMessage, QuizQuestion, MenuItem, CartItem, AnswerEvaluation } from './types';
import { Page, AnnouncementCategory, NoteType, ComplaintCategory } from './types';
import { MOCK_SHOPS, HomeIcon, ComplaintIcon, LibraryIcon, ContactIcon, AiIcon, PracticeIcon, CourierIcon, ThumbsUpIcon, PlusCircleIcon, EditIcon, TrashIcon, MenuIcon } from './constants';
import { solveDoubt, generateQuiz, generateSubjectiveTest, evaluateAnswer } from './services/geminiService';
import { announcementService, complaintService, noteService, contactService, likedComplaintsService } from './services/dataService';


// Helper to convert file to Base64 for storage
const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
});


// Main App Component
export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Announcements);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [likedComplaints, setLikedComplaints] = useState<string[]>([]);

  // Admin Modal State
  const [showAdminFormModal, setShowAdminFormModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ type: string; item: any | null } | null>(null);
  
  // Load data on initial render
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [announcementsData, complaintsData, notesData, contactsData, likedData] = await Promise.all([
          announcementService.getAll(),
          complaintService.getAll(),
          noteService.getAll(),
          contactService.getAll(),
          likedComplaintsService.get(),
        ]);
        setAnnouncements(announcementsData);
        setComplaints(complaintsData);
        setNotes(notesData);
        setContacts(contactsData);
        setLikedComplaints(likedData);
      } catch (error) {
        console.error("Failed to load application data:", error);
        // In a real app, you might want to show an error toast
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  
  const handleUpvote = async (id: string) => {
    if (likedComplaints.includes(id)) {
        return; // Already liked, do nothing.
    }

    const originalComplaints = complaints;
    const originalLiked = likedComplaints;
    
    // Optimistic UI update
    const updatedComplaints = complaints.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c);
    const updatedLikedIds = [...likedComplaints, id];
    setComplaints(updatedComplaints);
    setLikedComplaints(updatedLikedIds);

    try {
        const complaintToUpdate = updatedComplaints.find(c => c.id === id);
        if (complaintToUpdate) {
            await Promise.all([
                complaintService.update(complaintToUpdate),
                likedComplaintsService.set(updatedLikedIds)
            ]);
        }
    } catch (error) {
        console.error("Failed to save upvote:", error);
        // Revert on failure
        setComplaints(originalComplaints);
        setLikedComplaints(originalLiked);
        alert("Failed to save your upvote. Please try again.");
    }
  };
  
  const sortedComplaints = useMemo(() => {
      return [...complaints].sort((a, b) => b.likes - a.likes);
  }, [complaints]);

  const handleAddNewComplaint = async (data: { title: string; description: string; studentName: string; category: ComplaintCategory }) => {
    try {
        const newComplaint = await complaintService.add(data);
        setComplaints(prev => [newComplaint, ...prev]);
        setShowComplaintModal(false);
    } catch(e) {
        console.error("Failed to add complaint", e);
        alert("There was an error submitting your complaint. Please try again.");
    }
  };


  // --- ADMIN CRUD FUNCTIONS ---

    const openAdminModal = (type: string, item: any | null = null) => {
        setModalConfig({ type, item });
        setShowAdminFormModal(true);
    };

    const closeAdminModal = () => {
        setShowAdminFormModal(false);
        setModalConfig(null);
    };

    const handleSave = async (item: any) => {
        if (!modalConfig) return;
        const { type, item: originalItem } = modalConfig;
        const isEditing = !!originalItem;

        let processedItem = { ...item };

        if (type === 'note') {
             if (processedItem.fileInput instanceof File) {
                 try {
                    processedItem.fileUrl = await toBase64(processedItem.fileInput);
                    processedItem.fileName = processedItem.fileInput.name;
                } catch (error) {
                    console.error("Error converting PDF file to Base64", error);
                    alert("Failed to upload PDF."); return;
                }
            }
            if (processedItem.imageInput instanceof File) {
                 try {
                    processedItem.imageUrl = await toBase64(processedItem.imageInput);
                } catch (error) {
                    console.error("Error converting image file to Base64", error);
                    alert("Failed to upload image preview."); return;
                }
            }
        }
        delete processedItem.fileInput;
        delete processedItem.imageInput;


        try {
            switch (type) {
                case 'announcement':
                    if (isEditing) {
                        const updated = await announcementService.update(processedItem);
                        setAnnouncements(prev => prev.map(i => i.id === updated.id ? updated : i));
                    } else {
                        const newAnnouncement = await announcementService.add({ ...processedItem, content: processedItem.content || '' });
                        setAnnouncements(prev => [newAnnouncement, ...prev]);
                    }
                    break;
                case 'note':
                    if (!isEditing && !processedItem.fileUrl) {
                        processedItem.fileUrl = '#'; processedItem.fileName = 'note.pdf';
                    }
                     if (isEditing) {
                        const updated = await noteService.update(processedItem);
                        setNotes(prev => prev.map(i => i.id === updated.id ? updated : i));
                    } else {
                        const newNote = await noteService.add(processedItem);
                        setNotes(prev => [newNote, ...prev]);
                    }
                    break;
                case 'contact':
                    if (isEditing) {
                        const updated = await contactService.update(processedItem);
                        setContacts(prev => prev.map(i => i.id === updated.id ? updated : i));
                    } else {
                        const newContact = await contactService.add(processedItem);
                        setContacts(prev => [newContact, ...prev]);
                    }
                    break;
            }
        } catch(e) {
            console.error(`Failed to save ${type}`, e);
            alert(`Failed to save ${type}. Please try again.`);
        }
        closeAdminModal();
    };

    const handleDelete = async (id: string, type: string) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;

        // Optimistic UI Update
        const originalStateMap: { [key: string]: [any[], React.Dispatch<React.SetStateAction<any[]>>] } = {
            'announcement': [announcements, setAnnouncements],
            'complaint': [complaints, setComplaints],
            'note': [notes, setNotes],
            'contact': [contacts, setContacts],
        };
        const [originalState, setter] = originalStateMap[type];
        setter((prev: any[]) => prev.filter(item => item.id !== id));

        try {
            switch (type) {
                case 'announcement': await announcementService.remove(id); break;
                case 'complaint': await complaintService.remove(id); break;
                case 'note': await noteService.remove(id); break;
                case 'contact': await contactService.remove(id); break;
            }
        } catch (error) {
            console.error(`Failed to delete ${type}:`, error);
            setter(originalState); // Revert on failure
            alert(`Failed to delete ${type}. Please try again.`);
        }
    };


  return (
    <div className="flex flex-col lg:flex-row h-screen bg-cu-black text-cu-text font-sans">
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" aria-hidden="true"></div>}
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-cu-gray">
            {isLoading ? (
                <div className="flex justify-center items-center h-full">
                    <p className="text-2xl font-semibold animate-pulse">Loading CU+...</p>
                </div>
            ) : (
                <>
                    {currentPage === Page.Announcements && <AnnouncementsPage announcements={announcements} onAdd={() => openAdminModal('announcement')} onEdit={(item) => openAdminModal('announcement', item)} onDelete={(id) => handleDelete(id, 'announcement')} />}
                    {currentPage === Page.Complaints && <ComplaintsPage complaints={sortedComplaints} onUpvote={handleUpvote} likedComplaints={likedComplaints} onDelete={(id) => handleDelete(id, 'complaint')} onSubmitNew={() => setShowComplaintModal(true)}/>}
                    {currentPage === Page.DigitalLibrary && <DigitalLibraryPage notes={notes} onAdd={() => openAdminModal('note')} onEdit={(item) => openAdminModal('note', item)} onDelete={(id) => handleDelete(id, 'note')} />}
                    {currentPage === Page.ImportantContacts && <ImportantContactsPage contacts={contacts} onAdd={() => openAdminModal('contact')} onEdit={(item) => openAdminModal('contact', item)} onDelete={(id) => handleDelete(id, 'contact')} />}
                    {currentPage === Page.AIDoubtSolver && <AIDoubtSolverPage />}
                    {currentPage === Page.AIPractice && <AIPracticePage />}
                    {currentPage === Page.CourierService && <CourierServicePage />}
                </>
            )}
        </main>
      </div>
      {showAdminFormModal && modalConfig && <AdminFormModal config={modalConfig} onClose={closeAdminModal} onSave={handleSave} />}
      {showComplaintModal && <ComplaintModal onClose={() => setShowComplaintModal(false)} onSubmit={handleAddNewComplaint} />}
    </div>
  );
}

// Sub-components defined in the same file to keep file count low

// LAYOUT COMPONENTS
const Sidebar: React.FC<{ currentPage: Page; setCurrentPage: (page: Page) => void; isOpen: boolean; setIsOpen: (isOpen: boolean) => void; }> = ({ currentPage, setCurrentPage, isOpen, setIsOpen }) => {
    const navItems = [
        { name: Page.Announcements, icon: HomeIcon },
        { name: Page.Complaints, icon: ComplaintIcon },
        { name: Page.DigitalLibrary, icon: LibraryIcon },
        { name: Page.ImportantContacts, icon: ContactIcon },
        { name: Page.AIDoubtSolver, icon: AiIcon },
        { name: Page.AIPractice, icon: PracticeIcon },
        { name: Page.CourierService, icon: CourierIcon },
    ];
    
    const handleNavigation = (page: Page) => {
        setCurrentPage(page);
        setIsOpen(false); // Close sidebar on navigation
    };

    return (
        <nav className={`w-64 bg-cu-black p-4 flex flex-col border-r border-cu-light-gray fixed lg:relative inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
            <div className="text-cu-red text-3xl font-bold mb-8 text-center">CU+</div>
            <ul>
                {navItems.map(item => (
                    <li key={item.name} className="mb-2">
                        <button
                            onClick={() => handleNavigation(item.name)}
                            className={`w-full flex items-center p-3 rounded-lg transition-colors ${currentPage === item.name ? 'bg-cu-red text-white' : 'hover:bg-cu-light-gray'}`}>
                            <item.icon className="h-5 w-5 mr-3" />
                            <span>{item.name}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

const Header: React.FC<{ onMenuClick: () => void; }> = ({ onMenuClick }) => (
    <header className="bg-cu-black p-4 flex justify-between items-center border-b border-cu-light-gray">
        <div className="flex items-center gap-4">
            <button onClick={onMenuClick} className="lg:hidden text-cu-white" aria-label="Open menu">
                <MenuIcon className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-cu-white">Chandigarh University</h1>
        </div>
    </header>
);

const AdminLoginModal: React.FC<{ onLogin: (key: string) => void; onClose: () => void; }> = ({ onLogin, onClose }) => {
    const [key, setKey] = useState('');
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-cu-gray p-8 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-2xl font-bold text-white mb-4">Admin Login</h2>
                <p className="text-cu-text mb-6">Enter the admin key to access management features.</p>
                <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="w-full bg-cu-light-gray border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cu-red"
                    placeholder="Admin Key"
                />
                <div className="mt-6 flex justify-end space-x-4">
                    <button onClick={onClose} className="py-2 px-4 rounded-lg bg-cu-light-gray hover:bg-gray-600 transition">Cancel</button>
                    <button onClick={() => onLogin(key)} className="py-2 px-4 rounded-lg bg-cu-red hover:bg-opacity-80 transition text-white">Login</button>
                </div>
            </div>
        </div>
    );
};

// --- ADMIN FORM MODAL ---
interface FieldConfig {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'file';
    options?: string[];
}
interface ModalConfig {
    title: string;
    fields: FieldConfig[];
    initialData: any;
}

const AdminFormModal: React.FC<{ config: {type: string; item: any | null}, onClose: () => void, onSave: (data: any) => void }> = ({ config, onClose, onSave }) => {
    
    const getModalDetails = (): ModalConfig | null => {
        const { type, item } = config;
        switch (type) {
            case 'announcement':
                return {
                    title: item ? 'Edit Announcement' : 'Add Announcement',
                    fields: [
                        { name: 'title', label: 'Title', type: 'text' },
                        { name: 'content', label: 'Content', type: 'textarea' },
                        { name: 'category', label: 'Category', type: 'select', options: Object.values(AnnouncementCategory) },
                    ],
                    initialData: item || { title: '', content: '', category: AnnouncementCategory.Academics }
                };
            case 'note':
                 return {
                    title: item ? 'Edit Note' : 'Add Note',
                    fields: [
                        { name: 'topic', label: 'Topic', type: 'text' },
                        { name: 'subject', label: 'Subject', type: 'text' },
                        { name: 'type', label: 'Note Type', type: 'select', options: Object.values(NoteType) },
                        { name: 'fileInput', label: 'PDF File', type: 'file' },
                        { name: 'imageInput', label: 'Image Preview (Optional)', type: 'file' },
                    ],
                    initialData: item || { topic: '', subject: '', type: NoteType.Notes }
                };
            case 'contact':
                 return {
                    title: item ? 'Edit Contact' : 'Add Contact',
                    fields: [
                        { name: 'name', label: 'Name', type: 'text' },
                        { name: 'department', label: 'Department', type: 'text' },
                        { name: 'phone', label: 'Phone', type: 'text' },
                        { name: 'email', label: 'Email', type: 'text' },
                    ],
                    initialData: item || { name: '', department: '', phone: '', email: '' }
                };
            default:
                return null;
        }
    };

    const modalDetails = getModalDetails();
    const [formData, setFormData] = useState(modalDetails?.initialData || {});

    useEffect(() => {
        setFormData(modalDetails?.initialData || {});
    }, [config]);


    if (!modalDetails) return null;

    const { title, fields } = modalDetails;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'file') {
            const files = (e.target as HTMLInputElement).files;
            setFormData({ ...formData, [name]: files ? files[0] : null });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const renderField = (field: FieldConfig) => {
        const commonProps = {
            id: field.name,
            name: field.name,
            onChange: handleChange,
            className: "w-full bg-cu-light-gray border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cu-red mt-1",
        };

        if (field.type === 'textarea') {
            return <textarea {...commonProps} value={formData[field.name] || ''} rows={4} required />;
        }
        if (field.type === 'select') {
            return (
                <select {...commonProps} value={formData[field.name] || ''} required>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            );
        }
        if (field.type === 'file') {
            const acceptType = field.name === 'fileInput' ? '.pdf' : 'image/*';
            const isRequired = field.name === 'fileInput' && !config.item; 
            return <input type="file" {...commonProps} accept={acceptType} required={isRequired} />;
        }
        return <input type="text" {...commonProps} value={formData[field.name] || ''} required />;
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-cu-gray p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {fields.map(field => (
                            <div key={field.name}>
                                <label htmlFor={field.name} className="block text-sm font-medium text-cu-text">{field.label}</label>
                                {renderField(field)}
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-cu-light-gray hover:bg-gray-600 transition">Cancel</button>
                        <button type="submit" className="py-2 px-4 rounded-lg bg-cu-red hover:bg-opacity-80 transition text-white">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ComplaintModal: React.FC<{ onClose: () => void; onSubmit: (data: { title: string; description: string; studentName: string; category: ComplaintCategory }) => void; }> = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({ title: '', description: '', studentName: '', category: ComplaintCategory.Academic });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.title && formData.description && formData.studentName && !isSubmitting) {
            setIsSubmitting(true);
            await onSubmit(formData as { title: string; description: string; studentName: string; category: ComplaintCategory });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-cu-gray p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-6">Submit a Complaint</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="studentName" className="block text-sm font-medium text-cu-text">Your Name</label>
                        <input type="text" name="studentName" id="studentName" value={formData.studentName} onChange={handleChange} required className="w-full bg-cu-light-gray border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cu-red mt-1" />
                    </div>
                     <div>
                        <label htmlFor="category" className="block text-sm font-medium text-cu-text">Category</label>
                        <select name="category" id="category" value={formData.category} onChange={handleChange} required className="w-full bg-cu-light-gray border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cu-red mt-1">
                            {Object.values(ComplaintCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-cu-text">Complaint Title</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="w-full bg-cu-light-gray border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cu-red mt-1" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-cu-text">Description</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} required rows={4} className="w-full bg-cu-light-gray border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cu-red mt-1"></textarea>
                    </div>
                    <div className="mt-8 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-cu-light-gray hover:bg-gray-600 transition">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="py-2 px-4 rounded-lg bg-cu-red hover:bg-opacity-80 transition text-white disabled:bg-opacity-50">{isSubmitting ? 'Submitting...' : 'Submit'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const PageHeader: React.FC<{ title: string; subtitle: string; children?: React.ReactNode }> = ({ title, subtitle, children }) => (
    <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
            <h2 className="text-3xl font-bold text-white">{title}</h2>
            <p className="text-gray-400">{subtitle}</p>
        </div>
        <div>{children}</div>
    </div>
);

// PAGE COMPONENTS
interface AdminProps {
    onAdd?: () => void;
    onEdit?: (item: any) => void;
    onDelete: (id: string) => void;
}

const AnnouncementsPage: React.FC<{ announcements: Announcement[] } & Pick<AdminProps, 'onAdd' | 'onEdit' | 'onDelete'>> = ({ announcements, onAdd, onEdit, onDelete }) => {
    const [activeTab, setActiveTab] = useState<AnnouncementCategory>(AnnouncementCategory.Academics);
    const filteredAnnouncements = announcements.filter(a => a.category === activeTab);
    return (
        <div>
            <PageHeader title="Announcements" subtitle="Latest news and updates from the campus." >
                <button onClick={onAdd} className="bg-cu-red text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-opacity-80"><PlusCircleIcon className="w-5 h-5"/> Add New</button>
            </PageHeader>
            <div className="flex space-x-2 mb-4 border-b border-cu-light-gray">
                {Object.values(AnnouncementCategory).map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => setActiveTab(cat)}
                        className={`py-2 px-4 font-semibold transition-colors ${activeTab === cat ? 'text-cu-red border-b-2 border-cu-red' : 'text-gray-400 hover:text-white'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="grid gap-4">
                {filteredAnnouncements.length > 0 ? filteredAnnouncements.map(a => (
                    <div key={a.id} className="bg-cu-light-gray p-4 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-start">
                           <div>
                            <h3 className="text-lg font-semibold text-white">{a.title}</h3>
                            <p className="text-sm text-gray-400 mb-2">{new Date(a.date).toLocaleDateString()}</p>
                            <p className="text-cu-text">{a.content}</p>
                           </div>
                           <div className="flex gap-2"><button onClick={() => onEdit?.(a)} className="text-gray-400 hover:text-white"><EditIcon className="w-5 h-5"/></button><button onClick={() => onDelete(a.id)} className="text-gray-400 hover:text-cu-red"><TrashIcon className="w-5 h-5"/></button></div>
                        </div>
                    </div>
                )) : <p>No announcements in this category.</p>}
            </div>
        </div>
    );
};

const ComplaintsPage: React.FC<{ complaints: Complaint[], onUpvote: (id: string) => void, likedComplaints: string[], onSubmitNew: () => void } & Pick<AdminProps, 'onDelete'>> = ({ complaints, onUpvote, likedComplaints, onDelete, onSubmitNew }) => {
    const [activeTab, setActiveTab] = useState<ComplaintCategory>(ComplaintCategory.Hostel);
    const filteredComplaints = complaints.filter(c => c.category === activeTab);

    return (
         <div>
            <PageHeader title="Student Complaints" subtitle="Voice your concerns and upvote important issues.">
                <button onClick={onSubmitNew} className="bg-cu-red text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-opacity-80"><PlusCircleIcon className="w-5 h-5"/> Submit Complaint</button>
            </PageHeader>
             <div className="flex space-x-2 mb-4 border-b border-cu-light-gray">
                {Object.values(ComplaintCategory).map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => setActiveTab(cat)}
                        className={`py-2 px-4 font-semibold transition-colors ${activeTab === cat ? 'text-cu-red border-b-2 border-cu-red' : 'text-gray-400 hover:text-white'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="space-y-4">
                {filteredComplaints.length > 0 ? filteredComplaints.map(c => {
                    const isLiked = likedComplaints.includes(c.id);
                    return (
                        <div key={c.id} className="bg-cu-light-gray p-4 rounded-lg border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white">{c.title}</h3>
                                <p className="text-sm text-gray-400 mb-2">By {c.studentName} on {new Date(c.date).toLocaleDateString()}</p>
                                <p className="text-cu-text">{c.description}</p>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                                <button
                                    onClick={() => onUpvote(c.id)}
                                    disabled={isLiked}
                                    aria-label={`Upvote complaint: ${c.title}`}
                                    className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-cu-red cursor-not-allowed' : 'text-gray-300 hover:text-cu-red'}`}
                                >
                                    <ThumbsUpIcon className="w-5 h-5" />
                                    <span className="font-bold text-lg">{c.likes}</span>
                                </button>
                                <button onClick={() => onDelete(c.id)} aria-label={`Delete complaint: ${c.title}`} className="text-gray-400 hover:text-cu-red"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    );
                }) : <p>No complaints in this category.</p>}
            </div>
        </div>
    );
};

const DigitalLibraryPage: React.FC<{ notes: Note[] } & Pick<AdminProps, 'onAdd' | 'onEdit' | 'onDelete'>> = ({ notes, onAdd, onEdit, onDelete }) => {
    const [activeTab, setActiveTab] = useState<NoteType>(NoteType.Notes);
    const filteredNotes = notes.filter(n => n.type === activeTab);

    return (
        <div>
            <PageHeader title="Digital Library" subtitle="Access notes, resources, and study materials." >
                 <button onClick={onAdd} className="bg-cu-red text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-opacity-80"><PlusCircleIcon className="w-5 h-5"/> Add Note</button>
            </PageHeader>
             <div className="flex space-x-2 mb-4 border-b border-cu-light-gray">
                {Object.values(NoteType).map(type => (
                    <button 
                        key={type} 
                        onClick={() => setActiveTab(type)}
                        className={`py-2 px-4 font-semibold transition-colors ${activeTab === type ? 'text-cu-red border-b-2 border-cu-red' : 'text-gray-400 hover:text-white'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotes.map(note => (
                    <div key={note.id} className="bg-cu-light-gray rounded-lg border border-gray-700 flex flex-col overflow-hidden">
                       {note.imageUrl ? (
                            <img src={note.imageUrl} alt={note.topic} className="w-full h-40 object-cover" />
                       ) : (
                            <div className="w-full h-40 bg-cu-gray flex items-center justify-center">
                                <LibraryIcon className="w-16 h-16 text-gray-600" />
                            </div>
                       )}
                       <div className="p-4 flex flex-col flex-grow">
                            <h3 className="text-lg font-semibold text-white">{note.topic}</h3>
                            <p className="text-sm text-gray-400 mb-4 flex-grow">{note.subject}</p>
                            <div className="flex justify-between items-center mt-auto">
                                <a 
                                    href={note.fileUrl} 
                                    download={note.fileName}
                                    onClick={(e) => note.fileUrl === '#' && e.preventDefault()}
                                    className={`text-cu-red hover:underline ${note.fileUrl === '#' ? 'cursor-not-allowed text-gray-500' : ''}`}
                                >
                                    Download
                                </a>
                                <div className="flex gap-2"><button onClick={() => onEdit?.(note)} className="text-gray-400 hover:text-white"><EditIcon className="w-5 h-5"/></button><button onClick={() => onDelete(note.id)} className="text-gray-400 hover:text-cu-red"><TrashIcon className="w-5 h-5"/></button></div>
                            </div>
                       </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ImportantContactsPage: React.FC<{ contacts: Contact[] } & Pick<AdminProps, 'onAdd' | 'onEdit' | 'onDelete'>> = ({ contacts, onAdd, onEdit, onDelete }) => {
    return (
        <div>
             <PageHeader title="Important Contacts" subtitle="Quick access to essential campus contacts.">
                <button onClick={onAdd} className="bg-cu-red text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-opacity-80"><PlusCircleIcon className="w-5 h-5"/> Add Contact</button>
            </PageHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contacts.map(c => (
                    <div key={c.id} className="bg-cu-light-gray p-4 rounded-lg border border-gray-700 relative group">
                        <h3 className="text-lg font-semibold text-white">{c.name} - <span className="text-gray-300 font-normal">{c.department}</span></h3>
                        <p className="text-cu-text">Phone: <a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a></p>
                        <p className="text-cu-text">Email: <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a></p>
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => onEdit?.(c)} className="text-gray-400 hover:text-white"><EditIcon className="w-5 h-5"/></button><button onClick={() => onDelete(c.id)} className="text-gray-400 hover:text-cu-red"><TrashIcon className="w-5 h-5"/></button></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AIDoubtSolverPage: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const chatHistoryRef = React.useRef<HTMLDivElement>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
        try {
            const stored = localStorage.getItem('cu-doubt-solver-chat');
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        chatHistoryRef.current?.scrollTo(0, chatHistoryRef.current.scrollHeight);
    }, [chatHistory]);

    useEffect(() => {
        try {
            localStorage.setItem('cu-doubt-solver-chat', JSON.stringify(chatHistory));
        } catch (e) { console.error("Failed to save chat history", e); }
    }, [chatHistory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        const userMessage: ChatMessage = { sender: 'user', text: prompt };
        setChatHistory(prev => [...prev, userMessage]);
        const currentPrompt = prompt;
        setPrompt('');
        setIsLoading(true);

        const aiResponse = await solveDoubt(currentPrompt);
        const aiMessage: ChatMessage = { sender: 'ai', text: aiResponse };
        setChatHistory(prev => [...prev, aiMessage]);
        setIsLoading(false);
    };

    return (
        <div>
            <PageHeader title="AI Doubt Solver" subtitle="Get instant answers to your academic questions." />
            <div className="bg-cu-light-gray rounded-lg border border-gray-700 p-4 h-[70vh] flex flex-col">
                <div ref={chatHistoryRef} className="flex-1 overflow-y-auto mb-4 pr-2">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                            <div className={`max-w-xl p-3 rounded-lg ${msg.sender === 'user' ? 'bg-cu-red text-white' : 'bg-cu-gray text-cu-text'}`}>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="flex justify-start"><div className="p-3 rounded-lg bg-cu-gray text-cu-text">AI is thinking...</div></div>}
                </div>
                <form onSubmit={handleSubmit} className="flex gap-4">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="flex-1 bg-cu-gray border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cu-red"
                        placeholder="Ask your doubt here..."
                    />
                    <button type="submit" disabled={isLoading} className="bg-cu-red text-white py-3 px-6 rounded-lg hover:bg-opacity-80 disabled:bg-opacity-50 transition">Send</button>
                </form>
            </div>
        </div>
    );
};

const EvaluationResult: React.FC<{ userAnswer: string; evaluation: AnswerEvaluation; }> = ({ userAnswer, evaluation }) => (
    <div className="space-y-6 animate-fade-in">
        <div>
            <h4 className="text-lg font-semibold text-gray-300 mb-2">Your Answer</h4>
            <div className="bg-cu-gray p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{userAnswer}</p>
            </div>
        </div>
        <div>
            <h4 className="text-lg font-semibold text-gray-300 mb-2">AI Evaluation</h4>
            <div className="bg-cu-gray p-4 rounded-lg space-y-4 border border-gray-700">
                 <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">Rating:</span>
                    <span className="text-2xl font-bold text-cu-red">{evaluation.rating}/10</span>
                </div>
                <div>
                    <h5 className="font-semibold text-cu-white">Feedback:</h5>
                    <p className="text-gray-300 whitespace-pre-wrap">{evaluation.feedback}</p>
                </div>
                 <div>
                    <h5 className="font-semibold text-cu-white">Suggestions for Improvement:</h5>
                    <p className="text-gray-300 whitespace-pre-wrap">{evaluation.suggestions}</p>
                </div>
            </div>
        </div>
    </div>
);


const AIPracticePage: React.FC = () => {
    const [practiceType, setPracticeType] = useState<'quiz' | 'test'>('quiz');
    const [topic, setTopic] = useState('');
    const [questions, setQuestions] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    interface PracticeState {
        active: boolean;
        currentQ: number;
        answers: { [key: number]: string };
        feedback: { [key: number]: AnswerEvaluation };
        status: { [key: number]: 'answering' | 'loading' | 'evaluated' };
        finished: boolean;
    }
    
    const initialPracticeState: PracticeState = {
        active: false,
        currentQ: 0,
        answers: {},
        feedback: {},
        status: {},
        finished: false,
    };
    
    const [practiceState, setPracticeState] = useState<PracticeState>(initialPracticeState);
    const [currentAnswer, setCurrentAnswer] = useState('');

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic.');
            return;
        }
        setError('');
        setIsLoading(true);
        setQuestions([]);
        setPracticeState(initialPracticeState);
        
        let result;
        if (practiceType === 'quiz') {
            result = await generateQuiz(topic);
        } else {
            result = await generateSubjectiveTest(topic);
        }

        if (typeof result === 'string') {
            setError(result);
        } else if (result.length > 0) {
            setQuestions(result);
             const initialStatus: { [key: number]: 'answering' | 'loading' | 'evaluated' } = {};
            if(practiceType === 'test') {
                 result.forEach((_, index) => {
                    initialStatus[index] = 'answering';
                });
            }
            setPracticeState(prev => ({...prev, active: true, status: initialStatus }));
        } else {
            setError("The AI couldn't generate questions for this topic. Please try another one.")
        }
        setIsLoading(false);
    };

    const handleAnswerSelect = (qIndex: number, option: string) => {
        setPracticeState(prev => ({
            ...prev,
            answers: { ...prev.answers, [qIndex]: option }
        }));
    };
    
    const handleAnswerSubmit = async () => {
        if (!currentAnswer.trim()) return;
        const qIndex = practiceState.currentQ;

        setPracticeState(prev => ({
            ...prev,
            answers: { ...prev.answers, [qIndex]: currentAnswer },
            status: { ...prev.status, [qIndex]: 'loading' }
        }));
        
        const result = await evaluateAnswer(questions[qIndex], currentAnswer);
        
        if (typeof result === 'string') {
            setError(result);
            setPracticeState(prev => ({ ...prev, status: { ...prev.status, [qIndex]: 'answering' }}));
        } else {
            setPracticeState(prev => ({
                ...prev,
                feedback: { ...prev.feedback, [qIndex]: result },
                status: { ...prev.status, [qIndex]: 'evaluated' }
            }));
            setError('');
        }
    };


    const handleNextQuestion = () => {
        if (practiceState.currentQ < questions.length - 1) {
            setPracticeState(prev => ({ ...prev, currentQ: prev.currentQ + 1 }));
            setCurrentAnswer('');
        } else {
            setPracticeState(prev => ({ ...prev, finished: true }));
        }
    };
    
    const resetPractice = () => {
        setQuestions([]);
        setPracticeState(initialPracticeState);
        setTopic('');
        setCurrentAnswer('');
        setError('');
    };

    const score = useMemo(() => {
        if (practiceType !== 'quiz' || !practiceState.finished) return 0;
        return questions.reduce((acc, q, index) => {
            return practiceState.answers[index] === q.correctAnswer ? acc + 1 : acc;
        }, 0);
    }, [practiceState.finished, questions, practiceState.answers, practiceType]);
    
    return (
        <div>
            <PageHeader title="AI Practice Section" subtitle="Generate quizzes and tests on any topic." />
            
            {!practiceState.active ? (
                 <div className="bg-cu-light-gray p-4 rounded-lg border border-gray-700 mb-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
                        <select onChange={(e) => setPracticeType(e.target.value as 'quiz' | 'test')} className="bg-cu-gray border border-gray-600 rounded-lg p-2 text-white focus:outline-none">
                            <option value="quiz">Objective Quiz</option>
                            <option value="test">Subjective Test</option>
                        </select>
                       <input
                           type="text"
                           value={topic}
                           onChange={(e) => setTopic(e.target.value)}
                           className="flex-1 bg-cu-gray border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cu-red"
                           placeholder="Enter topic (e.g., 'Newton's Laws of Motion')"
                       />
                       <button onClick={handleGenerate} disabled={isLoading} className="bg-cu-red text-white py-2 px-4 rounded-lg hover:bg-opacity-80 disabled:bg-opacity-50 transition">
                           {isLoading ? 'Generating...' : 'Generate'}
                       </button>
                   </div>
                    {error && <p className="text-red-500">{error}</p>}
               </div>
            ) : (
                <div className="bg-cu-light-gray p-4 sm:p-6 rounded-lg border border-gray-700">
                    <h2 className="text-2xl font-bold text-white mb-4">Topic: {topic}</h2>
                    
                    {practiceType === 'quiz' && !practiceState.finished && (
                        <div>
                            <p className="text-gray-400 mb-4">Question {practiceState.currentQ + 1} of {questions.length}</p>
                            <p className="text-xl font-semibold mb-6">{questions[practiceState.currentQ].question}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {questions[practiceState.currentQ].options.map((option: string, index: number) => {
                                    const isSelected = practiceState.answers[practiceState.currentQ] === option;
                                    const showResult = practiceState.answers[practiceState.currentQ];
                                    const isCorrect = option === questions[practiceState.currentQ].correctAnswer;

                                    let buttonClass = 'bg-cu-gray hover:bg-gray-700';
                                    if(showResult && isSelected) {
                                        buttonClass = isCorrect ? 'bg-green-700' : 'bg-red-700';
                                    } else if (showResult && isCorrect) {
                                        buttonClass = 'bg-green-700';
                                    }

                                    return (
                                        <button 
                                            key={index}
                                            onClick={() => !showResult && handleAnswerSelect(practiceState.currentQ, option)}
                                            className={`p-4 rounded-lg text-left transition-colors w-full ${buttonClass}`}
                                            disabled={!!showResult}
                                        >
                                            {option}
                                        </button>
                                    )
                                })}
                            </div>
                            {practiceState.answers[practiceState.currentQ] && (
                                <button onClick={handleNextQuestion} className="bg-cu-red text-white py-2 px-6 rounded-lg hover:bg-opacity-80 w-full md:w-auto">
                                    {practiceState.currentQ < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                                </button>
                            )}
                        </div>
                    )}

                    {practiceType === 'quiz' && practiceState.finished && (
                        <div className="text-center">
                            <h3 className="text-3xl font-bold text-cu-red mb-2">Quiz Complete!</h3>
                            <p className="text-xl text-white mb-6">Your Score: {score} / {questions.length}</p>
                             <button onClick={resetPractice} className="bg-cu-red text-white py-2 px-6 rounded-lg hover:bg-opacity-80">
                                Start New Quiz
                            </button>
                        </div>
                    )}
                    
                    {practiceType === 'test' && !practiceState.finished && (
                         <div>
                            <p className="text-gray-400 mb-4">Question {practiceState.currentQ + 1} of {questions.length}</p>
                            <p className="text-xl font-semibold mb-6">{questions[practiceState.currentQ]}</p>
                            
                            {practiceState.status[practiceState.currentQ] === 'answering' && (
                                <div className="flex flex-col gap-4">
                                    <textarea 
                                        value={currentAnswer}
                                        onChange={(e) => setCurrentAnswer(e.target.value)}
                                        className="w-full bg-cu-gray border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cu-red"
                                        rows={8}
                                        placeholder="Your detailed answer..."
                                    />
                                    <button onClick={handleAnswerSubmit} className="bg-cu-red text-white py-2 px-6 rounded-lg hover:bg-opacity-80 w-full sm:w-auto self-end">
                                        Submit for Evaluation
                                    </button>
                                </div>
                            )}
                            
                            {practiceState.status[practiceState.currentQ] === 'loading' && (
                                <div className="text-center p-8">
                                    <p className="animate-pulse">Evaluating your answer...</p>
                                </div>
                            )}
                            
                            {practiceState.status[practiceState.currentQ] === 'evaluated' && (
                                <div className="flex flex-col gap-4">
                                    <EvaluationResult 
                                        userAnswer={practiceState.answers[practiceState.currentQ]} 
                                        evaluation={practiceState.feedback[practiceState.currentQ]}
                                    />
                                    <button onClick={handleNextQuestion} className="bg-cu-red text-white py-2 px-6 rounded-lg hover:bg-opacity-80 w-full sm:w-auto self-end">
                                        {practiceState.currentQ < questions.length - 1 ? 'Next Question' : 'Finish Test'}
                                    </button>
                                </div>
                            )}
                            {error && <p className="text-red-500 mt-4">{error}</p>}
                        </div>
                    )}

                     {practiceType === 'test' && practiceState.finished && (
                        <div className="text-center">
                            <h3 className="text-3xl font-bold text-cu-red mb-2">Test Complete!</h3>
                            <p className="text-xl text-white mb-6">You have completed all questions.</p>
                             <button onClick={resetPractice} className="bg-cu-red text-white py-2 px-6 rounded-lg hover:bg-opacity-80">
                                Start New Test
                            </button>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};


const CourierServicePage: React.FC = () => {
    const [shops] = useState<Shop[]>(MOCK_SHOPS);
    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const stored = localStorage.getItem('cu-courier-cart');
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    });
    
    useEffect(() => {
        try {
            localStorage.setItem('cu-courier-cart', JSON.stringify(cart));
        } catch (e) { console.error("Failed to save cart", e); }
    }, [cart]);


    const addToCart = (item: MenuItem) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map(cartItem => 
                    cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                );
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });
    };
    
    const updateQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            setCart(prevCart => prevCart.filter(item => item.id !== itemId));
        } else {
            setCart(prevCart => prevCart.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
        }
    };

    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cart]);

    const handlePlaceOrder = () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        alert(`Order placed successfully! Total: ₹${cartTotal}.`);
        setCart([]);
    };


    return (
        <div>
            <PageHeader title="Local Courier Service" subtitle="Order food and essentials from nearby shops." />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {shops.map(shop => (
                        <div key={shop.id} className="bg-cu-light-gray rounded-lg border border-gray-700 overflow-hidden">
                            <img src={shop.image} alt={shop.name} className="w-full h-40 object-cover" />
                            <div className="p-4">
                                <h3 className="text-xl font-bold text-white">{shop.name}</h3>
                                <p className="text-sm text-gray-400 mb-4">{shop.cuisine}</p>
                                <div className="space-y-3">
                                    {shop.menu.map(item => (
                                        <div key={item.id} className="flex justify-between items-center bg-cu-gray p-3 rounded-md">
                                            <div>
                                                <p className="font-semibold text-white">{item.name}</p>
                                                <p className="text-sm text-gray-400">{item.description}</p>
                                                <p className="text-cu-text mt-1">₹{item.price}</p>
                                            </div>
                                            <button onClick={() => addToCart(item)} className="bg-cu-red text-white text-sm py-1 px-4 rounded-lg hover:bg-opacity-80 transition-transform transform hover:scale-105">
                                                ADD
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-cu-light-gray p-4 rounded-lg border border-gray-700 sticky top-6">
                        <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-600 pb-2">Your Order</h3>
                        {cart.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">Your cart is empty.</p>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {cart.map(item => (
                                    <div key={item.id} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-sm text-gray-400">₹{item.price}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="bg-cu-gray w-6 h-6 rounded font-bold">-</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="bg-cu-gray w-6 h-6 rounded font-bold">+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                         {cart.length > 0 && (
                            <div className="mt-4 border-t border-gray-600 pt-4">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                                <button onClick={handlePlaceOrder} className="w-full bg-cu-red text-white py-2 rounded-lg mt-4 hover:bg-opacity-80">
                                    Place Order
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
