import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Person, RelationshipType } from './types';
import GraphView from './components/GraphView';
import PersonDetailView from './components/PersonDetailView';
import PersonFormModal from './components/PersonFormModal';
import OnboardingModal from './components/OnboardingModal';
import Legend from './components/Legend';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import SettingsView from './components/SettingsView';
import { PlusIcon, UserGroupIcon, SearchIcon, XIcon, MenuIcon } from './components/Icons';
import * as db from './db';

type View = 'Dashboard' | 'Graph View' | 'Tree View' | 'Settings';

const App: React.FC = () => {
    const [people, setPeople] = useState<Person[]>([]);
    const [relationshipTypes, setRelationshipTypes] = useState<RelationshipType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOnboarding, setIsOnboarding] = useState(false);
    const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentView, setCurrentView] = useState<View>('Dashboard');

    useEffect(() => {
        const loadData = async () => {
            try {
                await db.initDB();
                const [allPeople, allTypes] = await Promise.all([db.getAllPeople(), db.getAllRelationshipTypes()]);
                
                setRelationshipTypes(allTypes);

                if (allPeople.length === 0) {
                    setIsOnboarding(true);
                } else {
                    setPeople(allPeople);
                }
            } catch (error) {
                console.error("Failed to load data from database", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleOnboardingComplete = async (selfPerson: Person) => {
        await db.savePerson(selfPerson);
        setPeople([selfPerson]);
        setIsOnboarding(false);
        setSelectedPersonId(selfPerson.id);
        setCurrentView('Graph View');
    };

    const handleNodeClick = useCallback((nodeId: string) => {
        setSelectedPersonId(nodeId);
    }, []);
    
    const handleCloseDetailView = () => {
        setSelectedPersonId(null);
    };

    const handleAddPerson = () => {
        setEditingPerson(null);
        setIsModalOpen(true);
    };
    
    const handleEditPerson = (person: Person) => {
        setEditingPerson(person);
        setIsModalOpen(true);
    };

    const handleSavePerson = async (person: Person) => {
        const oldPersonState = people.find(p => p.id === person.id);

        await db.savePerson(person);

        for (const rel of person.relationships) {
            const targetPerson = await db.getPerson(rel.connected_to_id);
            if (targetPerson && !targetPerson.relationships.some(r => r.connected_to_id === person.id)) {
                const updatedTarget = { ...targetPerson, relationships: [...targetPerson.relationships, { type: rel.type, connected_to_id: person.id }] };
                await db.savePerson(updatedTarget);
            }
        }

        if (oldPersonState) {
            const newRelIds = new Set(person.relationships.map(r => r.connected_to_id));
            const removedRels = oldPersonState.relationships.filter(r => !newRelIds.has(r.connected_to_id));
            for (const removedRel of removedRels) {
                const targetPerson = await db.getPerson(removedRel.connected_to_id);
                if (targetPerson) {
                     const updatedTarget = { ...targetPerson, relationships: targetPerson.relationships.filter(r => r.connected_to_id !== person.id) };
                    await db.savePerson(updatedTarget);
                }
            }
        }
        
        setPeople(await db.getAllPeople());
    };

    const handleDeletePerson = async (personId: string) => {
        const personToDelete = await db.getPerson(personId);
        if (!personToDelete) return;

        for (const rel of personToDelete.relationships) {
            const connectedPerson = await db.getPerson(rel.connected_to_id);
            if (connectedPerson) {
                const updatedPerson = { ...connectedPerson, relationships: connectedPerson.relationships.filter(r => r.connected_to_id !== personId) };
                await db.savePerson(updatedPerson);
            }
        }
        
        await db.deletePerson(personId);
        
        if (selectedPersonId === personId) {
            setSelectedPersonId(null);
        }
        setPeople(await db.getAllPeople());
    };

    const handleSaveRelationshipType = async (type: RelationshipType, oldName?: string) => {
        await db.saveRelationshipType(type);
        if (oldName && oldName !== type.name) {
            // If name changed, update all people
            const allPeople = await db.getAllPeople();
            const updates = allPeople.map(p => {
                let personChanged = false;
                const newPrimary = p.primaryRelationship === oldName ? type.name : p.primaryRelationship;
                if (newPrimary !== p.primaryRelationship) personChanged = true;

                const newRels = p.relationships.map(r => {
                    if (r.type === oldName) {
                        personChanged = true;
                        return { ...r, type: type.name };
                    }
                    return r;
                });
                if (personChanged) {
                    return db.savePerson({ ...p, primaryRelationship: newPrimary, relationships: newRels });
                }
                return Promise.resolve();
            });
            await Promise.all(updates);
            setPeople(await db.getAllPeople());
            await db.deleteRelationshipType(oldName);
        }
        setRelationshipTypes(await db.getAllRelationshipTypes());
    };

    const handleDeleteRelationshipType = async (typeName: string) => {
        await db.deleteRelationshipType(typeName);
        setRelationshipTypes(await db.getAllRelationshipTypes());
    };

    const handleExportData = async () => {
        try {
            const allPeople = await db.getAllPeople();
            const allTypes = await db.getAllRelationshipTypes();
            const backupData = {
                people: allPeople,
                relationshipTypes: allTypes,
            };
            const dataStr = JSON.stringify(backupData, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `peoples-tree-backup-${new Date().toISOString().slice(0, 10)}.json`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export data", error);
            alert("Error exporting data. Check the console for details.");
        }
    };

    const handleImportData = async (file: File) => {
        if (!window.confirm("Are you sure you want to import data? This will overwrite all current data in the application.")) {
            return;
        }
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (!data.people || !Array.isArray(data.people) || !data.relationshipTypes || !Array.isArray(data.relationshipTypes)) {
                    throw new Error("Invalid backup file structure.");
                }

                await db.importData(data);
                
                const [allPeople, allTypes] = await Promise.all([db.getAllPeople(), db.getAllRelationshipTypes()]);
                setPeople(allPeople);
                setRelationshipTypes(allTypes);
                setSelectedPersonId(null);
                setCurrentView('Dashboard');
                alert("Data imported successfully!");
            } catch (error) {
                console.error("Failed to import data", error);
                alert(`Error importing data: ${(error as Error).message}`);
            }
        };
        reader.readAsText(file);
    };

    const handleClearData = async () => {
        if (window.confirm("WARNING: This will permanently delete all your data. This action cannot be undone. Are you absolutely sure?")) {
            try {
                await db.clearAllData();
                window.location.reload();
            } catch (error) {
                console.error("Failed to clear data", error);
                alert("Error clearing data. Check console for details.");
            }
        }
    };

    const selectedPerson = useMemo(() => {
        return people.find(p => p.id === selectedPersonId) || null;
    }, [selectedPersonId, people]);

    const filteredPeople = useMemo(() => {
        if (!searchTerm) return people;
        const lowercasedTerm = searchTerm.toLowerCase();
        return people.filter(p => 
            p.name.toLowerCase().includes(lowercasedTerm) ||
            (p.aliases && p.aliases.some(a => a.toLowerCase().includes(lowercasedTerm))) ||
            (p.tags && p.tags.some(t => t.toLowerCase().includes(lowercasedTerm)))
        );
    }, [searchTerm, people]);
    
    const highlightedNodeId = useMemo(() => {
        if (searchTerm && filteredPeople.length > 0) {
            const exactMatch = filteredPeople.find(p => p.name.toLowerCase() === searchTerm.toLowerCase());
            return exactMatch ? exactMatch.id : filteredPeople[0].id;
        }
        return null;
    }, [searchTerm, filteredPeople]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-brand-bg text-brand-text-primary">
                <div className="flex flex-col items-center">
                    <UserGroupIcon className="w-24 h-24 mb-4 text-brand-accent animate-pulse" />
                    <p className="text-xl">Loading People's Tree...</p>
                </div>
            </div>
        );
    }

    if (isOnboarding) {
        return <OnboardingModal onComplete={handleOnboardingComplete} />;
    }

    return (
        <div className="flex h-screen font-sans bg-brand-bg text-brand-text-primary">
            <Sidebar 
                isOpen={isSidebarOpen} 
                setIsOpen={setIsSidebarOpen}
                currentView={currentView}
                onViewChange={(view) => setCurrentView(view as View)}
            />
            
            <div className="flex flex-col flex-1 h-screen overflow-hidden">
                <header className="flex items-center justify-between p-4 border-b border-brand-border bg-brand-surface shadow-md z-30 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full md:hidden hover:bg-brand-border" aria-label="Toggle menu">
                            <MenuIcon className="w-6 h-6"/>
                        </button>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-4">
                        <input
                            type="text"
                            placeholder="Search by name, tag, alias..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64 px-3 py-2 bg-brand-bg border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        />
                        <button
                            onClick={handleAddPerson}
                            className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-brand-accent rounded-md hover:bg-blue-600 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Add Person
                        </button>
                    </div>

                    <div className="flex md:hidden items-center gap-2">
                        <button onClick={() => setIsSearchVisible(prev => !prev)} className="p-2 rounded-full hover:bg-brand-border">
                            {isSearchVisible ? <XIcon className="w-6 h-6" /> : <SearchIcon className="w-6 h-6" />}
                        </button>
                        <button
                            onClick={handleAddPerson}
                            className="flex items-center justify-center w-10 h-10 bg-brand-accent rounded-full hover:bg-blue-600 transition-colors"
                            aria-label="Add Person"
                        >
                            <PlusIcon className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </header>
                
                {isSearchVisible && (
                    <div className="p-2 bg-brand-surface md:hidden border-b border-brand-border">
                        <input
                            type="text"
                            placeholder="Search by name, tag, alias..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
                            autoFocus
                        />
                    </div>
                )}

                <main className="flex flex-1 overflow-hidden relative">
                    {currentView === 'Dashboard' && <DashboardView people={people} />}
                    {currentView === 'Graph View' && (
                        <>
                            <div className="flex-1 relative">
                                <GraphView 
                                    people={filteredPeople} 
                                    onNodeClick={handleNodeClick}
                                    selectedNodeId={selectedPersonId}
                                    highlightedNodeId={highlightedNodeId}
                                    relationshipTypes={relationshipTypes}
                                />
                                <Legend relationshipTypes={relationshipTypes} />
                            </div>
                            <aside className={`absolute inset-0 transform transition-transform duration-300 ease-in-out bg-brand-surface border-l border-brand-border z-20 md:static md:w-96 md:transform-none ${selectedPersonId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                                <div className="h-full overflow-y-auto p-4">
                                    <PersonDetailView 
                                        person={selectedPerson} 
                                        allPeople={people} 
                                        onEdit={handleEditPerson}
                                        onDelete={handleDeletePerson}
                                        onClose={handleCloseDetailView}
                                        relationshipTypes={relationshipTypes}
                                    />
                                </div>
                            </aside>
                        </>
                    )}
                    {currentView === 'Settings' && (
                        <SettingsView 
                            relationshipTypes={relationshipTypes}
                            onSave={handleSaveRelationshipType}
                            onDelete={handleDeleteRelationshipType}
                            people={people}
                            onExport={handleExportData}
                            onImport={handleImportData}
                            onClearAllData={handleClearData}
                        />
                    )}
                    {currentView === 'Tree View' && (
                         <div className="w-full flex items-center justify-center h-full text-center text-brand-text-secondary">
                            <div>
                                <h2 className="text-2xl font-bold">{currentView}</h2>
                                <p className="mt-2">This feature is coming soon!</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            {isModalOpen && (
                <PersonFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSavePerson}
                    existingPerson={editingPerson}
                    allPeople={people}
                    relationshipTypes={relationshipTypes}
                />
            )}
        </div>
    );
};

export default App;