import React from 'react';
import { DashboardIcon, UserGroupIcon, TreeViewIcon, SettingsIcon, ChevronLeftIcon } from './Icons';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    currentView: string;
    onViewChange: (view: string) => void;
}

const menuItems = [
    { name: 'Dashboard', icon: <DashboardIcon className="w-6 h-6" /> },
    { name: 'Graph View', icon: <UserGroupIcon className="w-6 h-6" /> },
    { name: 'Tree View', icon: <TreeViewIcon className="w-6 h-6" /> },
    { name: 'Settings', icon: <SettingsIcon className="w-6 h-6" /> },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, currentView, onViewChange }) => {
    return (
        <>
            {/* Backdrop for mobile */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden ${isOpen ? 'block' : 'hidden'}`}
                onClick={() => setIsOpen(false)}
            ></div>
            
            <aside className={`fixed top-0 left-0 h-full bg-brand-surface border-r border-brand-border z-40 transition-all duration-300 ease-in-out flex flex-col
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0 
                ${isOpen ? 'md:w-64' : 'md:w-20'}`}>
                
                <div className={`flex items-center border-b border-brand-border p-4 h-20 ${isOpen ? 'justify-between' : 'md:justify-center'}`}>
                    <div className={`flex items-center gap-3 ${isOpen ? '' : 'md:hidden'}`}>
                         <UserGroupIcon className="w-8 h-8 text-brand-accent flex-shrink-0" />
                         <span className="text-xl font-bold whitespace-nowrap">People's Tree</span>
                    </div>
                     <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 rounded-full hidden md:block hover:bg-brand-border"
                        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        <ChevronLeftIcon className={`w-6 h-6 transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`} />
                    </button>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-2">
                    {menuItems.map((item) => (
                        <button 
                            key={item.name}
                            onClick={() => onViewChange(item.name)}
                            className={`w-full flex items-center p-3 rounded-lg transition-colors text-left
                            ${currentView === item.name ? 'bg-brand-accent text-white' : 'text-brand-text-secondary hover:bg-brand-border hover:text-brand-text-primary'}
                            ${isOpen ? 'justify-start' : 'md:justify-center'}`}
                            title={item.name}
                        >
                            <span className="flex-shrink-0">{item.icon}</span>
                            <span className={`ml-4 whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'md:opacity-0 md:hidden'}`}>{item.name}</span>
                        </button>
                    ))}
                </nav>

            </aside>
        </>
    );
};

export default Sidebar;
