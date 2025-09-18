import React, { useState, useMemo, useRef } from 'react';
import { Person, RelationshipType } from '../types';
import { PencilIcon, TrashIcon, XIcon, CheckIcon, PlusIcon, DownloadIcon, UploadIcon, ExclamationIcon } from './Icons';

interface SettingsViewProps {
    relationshipTypes: RelationshipType[];
    onSave: (type: RelationshipType, oldName?: string) => void;
    onDelete: (name: string) => void;
    people: Person[];
    onExport: () => void;
    onImport: (file: File) => void;
    onClearAllData: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ relationshipTypes, onSave, onDelete, people, onExport, onImport, onClearAllData }) => {
    const [newTypeName, setNewTypeName] = useState('');
    const [newTypeColor, setNewTypeColor] = useState('#ffffff');
    const [editingTypeName, setEditingTypeName] = useState<string | null>(null);
    const [editFormState, setEditFormState] = useState<RelationshipType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    const usedTypes = useMemo(() => {
        const usage = new Map<string, number>();
        relationshipTypes.forEach(rt => usage.set(rt.name, 0));

        people.forEach(p => {
            usage.set(p.primaryRelationship, (usage.get(p.primaryRelationship) || 0) + 1);
            p.relationships.forEach(r => {
                usage.set(r.type, (usage.get(r.type) || 0) + 1);
            });
        });
        return usage;
    }, [people, relationshipTypes]);

    const handleAddType = () => {
        if (!newTypeName.trim()) {
            setError("Type name cannot be empty.");
            return;
        }
        if (relationshipTypes.some(rt => rt.name.toLowerCase() === newTypeName.trim().toLowerCase())) {
            setError("A relationship type with this name already exists.");
            return;
        }
        setError(null);
        onSave({ name: newTypeName.trim(), color: newTypeColor });
        setNewTypeName('');
        setNewTypeColor('#ffffff');
    };

    const handleStartEdit = (type: RelationshipType) => {
        setEditingTypeName(type.name);
        setEditFormState({ ...type });
        setError(null);
    };

    const handleCancelEdit = () => {
        setEditingTypeName(null);
        setEditFormState(null);
        setError(null);
    };

    const handleSaveEdit = () => {
        if (!editFormState || !editingTypeName) return;
        if (!editFormState.name.trim()) {
            setError("Type name cannot be empty.");
            return;
        }
        if (editFormState.name.trim().toLowerCase() !== editingTypeName.toLowerCase() && relationshipTypes.some(rt => rt.name.toLowerCase() === editFormState.name.trim().toLowerCase())) {
            setError("A relationship type with this name already exists.");
            return;
        }
        
        onSave(editFormState, editingTypeName);
        handleCancelEdit();
    };
    
    const handleDelete = (name: string) => {
        if (window.confirm(`Are you sure you want to delete the "${name}" relationship type?`)) {
            onDelete(name);
        }
    };

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImport(file);
        }
        e.target.value = ''; // Allow re-uploading the same file
    };

    return (
        <div className="p-4 md:p-8 h-full overflow-y-auto w-full">
            <h1 className="text-3xl font-bold text-brand-text-primary mb-6">Settings</h1>
            
            <div className="max-w-2xl mx-auto">
                <div className="bg-brand-surface p-6 rounded-lg shadow-lg border border-brand-border">
                    <h2 className="text-xl font-semibold text-brand-text-primary mb-4">Manage Relationship Types</h2>
                    
                    <div className="mb-6 pb-6 border-b border-brand-border">
                        <h3 className="text-lg font-medium text-brand-text-primary mb-3">Add New Type</h3>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <input
                                type="text"
                                placeholder="Type Name"
                                value={newTypeName}
                                onChange={(e) => setNewTypeName(e.target.value)}
                                className="input-style flex-grow w-full"
                            />
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <input
                                    type="color"
                                    value={newTypeColor}
                                    onChange={(e) => setNewTypeColor(e.target.value)}
                                    className="p-1 h-10 w-10 block bg-brand-bg border border-brand-border cursor-pointer rounded-md"
                                    title="Select color"
                                />
                                <button
                                    onClick={handleAddType}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-brand-accent rounded-md hover:bg-blue-600 transition-colors"
                                >
                                    <PlusIcon className="w-5 h-5"/> Add
                                </button>
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>

                    <div className="space-y-3">
                        {relationshipTypes.map(type => (
                            <div key={type.name} className="bg-brand-bg p-3 rounded-md">
                                {editingTypeName === type.name && editFormState ? (
                                    <div className="flex flex-col sm:flex-row items-center gap-3">
                                        <div 
                                            className="w-8 h-8 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: editFormState.color }}
                                        ></div>
                                        <input
                                            type="text"
                                            value={editFormState.name}
                                            onChange={(e) => setEditFormState({ ...editFormState, name: e.target.value })}
                                            className="input-style flex-grow w-full"
                                        />
                                        <input
                                            type="color"
                                            value={editFormState.color}
                                            onChange={(e) => setEditFormState({ ...editFormState, color: e.target.value })}
                                            className="p-1 h-10 w-10 block bg-brand-bg border border-brand-border cursor-pointer rounded-md"
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={handleSaveEdit} className="p-2 text-green-500 hover:bg-brand-surface rounded-full"><CheckIcon className="w-5 h-5" /></button>
                                            <button onClick={handleCancelEdit} className="p-2 text-gray-400 hover:bg-brand-surface rounded-full"><XIcon className="w-5 h-5" /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-8 h-8 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: type.color }}
                                        ></div>
                                        <span className="flex-grow font-medium">{type.name}</span>
                                        <span className="text-xs text-brand-text-secondary bg-brand-surface px-2 py-1 rounded-full">
                                            In use by {usedTypes.get(type.name) || 0}
                                        </span>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleStartEdit(type)} className="p-2 text-gray-400 hover:text-white hover:bg-brand-surface rounded-full"><PencilIcon className="w-5 h-5" /></button>
                                            <button 
                                                onClick={() => handleDelete(type.name)} 
                                                disabled={(usedTypes.get(type.name) || 0) > 0}
                                                className="p-2 text-red-600 hover:text-red-400 hover:bg-brand-surface rounded-full disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                                title={(usedTypes.get(type.name) || 0) > 0 ? "Cannot delete a type that is in use" : "Delete type"}
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-brand-surface p-6 rounded-lg shadow-lg border border-brand-border mt-8">
                    <h2 className="text-xl font-semibold text-brand-text-primary mb-4">Data Management</h2>
                     <p className="text-sm text-brand-text-secondary mb-4">
                        Export your data as a JSON file for backup, or import a previously saved backup file.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={onExport} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 font-semibold bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">
                            <DownloadIcon className="w-5 h-5" /> Export Data
                        </button>
                        <button onClick={handleImportClick} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 font-semibold bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">
                            <UploadIcon className="w-5 h-5" /> Import Data
                        </button>
                        <input type="file" ref={importInputRef} onChange={handleFileSelected} className="hidden" accept="application/json" />
                    </div>
                    <div className="mt-6 border-t border-brand-border pt-6">
                        <h3 className="text-lg font-medium text-red-500">Danger Zone</h3>
                        <p className="text-sm text-brand-text-secondary mt-1 mb-3">
                            This action will permanently delete all people and relationship types. This cannot be undone.
                        </p>
                        <button onClick={onClearAllData} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-red-700 rounded-md hover:bg-red-600 transition-colors">
                            <ExclamationIcon className="w-5 h-5" /> Clear All Data
                        </button>
                    </div>
                </div>
            </div>
            <style>{`.input-style { background-color: #1a1a1a; border: 1px solid #444444; border-radius: 0.375rem; padding: 0.5rem 0.75rem; color: #f0f0f0; } .input-style:focus { outline: none; ring: 2px; ring-color: #3b82f6; }`}</style>
        </div>
    );
};

export default SettingsView;