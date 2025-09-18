import React, { useState, useEffect, Fragment } from 'react';
import { Person, Relationship, RelationshipType } from '../types';
import { XIcon } from './Icons';

interface PersonFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (person: Person) => void;
    existingPerson: Person | null;
    allPeople: Person[];
    relationshipTypes: RelationshipType[];
}

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

const PersonFormModal: React.FC<PersonFormModalProps> = ({ isOpen, onClose, onSave, existingPerson, allPeople, relationshipTypes }) => {
    const [person, setPerson] = useState<Partial<Person>>({});
    
    useEffect(() => {
        const defaultPrimary = relationshipTypes.find(t => t.name === "Unknown/Unclassified")?.name || (relationshipTypes[0]?.name || '');
        if (existingPerson) {
            setPerson({
                ...existingPerson,
                aliases: existingPerson.aliases || [],
                tags: existingPerson.tags || [],
                bloodGroup: existingPerson.bloodGroup || 'Unknown',
            });
        } else {
            setPerson({
                id: Date.now().toString(),
                name: '',
                aliases: [],
                tags: [],
                location: '',
                notes: '',
                relationships: [],
                primaryRelationship: defaultPrimary,
                bloodGroup: 'Unknown',
            });
        }
    }, [existingPerson, isOpen, relationshipTypes]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPerson(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (field: 'tags' | 'aliases', value: string) => {
        const values = value.split(',').map(item => item.trim()).filter(Boolean);
        setPerson(prev => ({ ...prev, [field]: values }));
    };
    
    const handleRelationshipChange = (index: number, field: keyof Relationship, value: string) => {
        const newRelationships = [...(person.relationships || [])];
        newRelationships[index] = { ...newRelationships[index], [field]: value };
        setPerson(prev => ({ ...prev, relationships: newRelationships }));
    };
    
    const addRelationship = () => {
        const defaultType = relationshipTypes.find(t => t.name === "Unknown/Unclassified")?.name || (relationshipTypes[0]?.name || '');
        const newRelationship: Relationship = { type: defaultType, connected_to_id: '' };
        setPerson(prev => ({ ...prev, relationships: [...(prev.relationships || []), newRelationship] }));
    };
    
    const removeRelationship = (index: number) => {
        const newRelationships = (person.relationships || []).filter((_, i) => i !== index);
        setPerson(prev => ({ ...prev, relationships: newRelationships }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (person.name) {
            onSave(person as Person);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-brand-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-brand-border">
                    <h2 className="text-xl font-bold">{existingPerson ? 'Edit Person' : 'Add New Person'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-brand-border">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <form id="person-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-text-secondary">Name *</label>
                        <input type="text" name="name" value={person.name || ''} onChange={handleChange} required className="mt-1 w-full input-style" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text-secondary">Primary Relationship</label>
                        <select name="primaryRelationship" value={person.primaryRelationship} onChange={handleChange} className="mt-1 w-full input-style">
                            {relationshipTypes.map(type => <option key={type.name} value={type.name}>{type.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text-secondary">Blood Group</label>
                        <select name="bloodGroup" value={person.bloodGroup || 'Unknown'} onChange={handleChange} className="mt-1 w-full input-style">
                            {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-brand-text-secondary">Aliases (comma-separated)</label>
                        <input type="text" name="aliases" value={(person.aliases || []).join(', ')} onChange={e => handleArrayChange('aliases', e.target.value)} className="mt-1 w-full input-style" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-brand-text-secondary">Tags (comma-separated)</label>
                        <input type="text" name="tags" value={(person.tags || []).join(', ')} onChange={e => handleArrayChange('tags', e.target.value)} className="mt-1 w-full input-style" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text-secondary">Location</label>
                        <input type="text" name="location" value={person.location || ''} onChange={handleChange} className="mt-1 w-full input-style" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-brand-text-secondary">Notes</label>
                        <textarea name="notes" value={person.notes || ''} onChange={handleChange} rows={4} className="mt-1 w-full input-style"></textarea>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Relationships</h3>
                        <div className="space-y-3">
                            {(person.relationships || []).map((rel, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-brand-bg rounded-md">
                                    <select value={rel.type} onChange={e => handleRelationshipChange(index, 'type', e.target.value)} className="flex-1 input-style">
                                        {relationshipTypes.map(type => <option key={type.name} value={type.name}>{type.name}</option>)}
                                    </select>
                                    <select value={rel.connected_to_id} onChange={e => handleRelationshipChange(index, 'connected_to_id', e.target.value)} className="flex-1 input-style">
                                        <option value="">Select Person</option>
                                        {allPeople.filter(p => p.id !== person.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <button type="button" onClick={() => removeRelationship(index)} className="p-2 text-red-500 hover:text-red-400">
                                        <XIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addRelationship} className="mt-2 text-sm text-brand-accent hover:underline">
                            + Add Relationship
                        </button>
                    </div>
                    <style>{`.input-style { background-color: #1a1a1a; border: 1px solid #444444; border-radius: 0.375rem; padding: 0.5rem 0.75rem; color: #f0f0f0; } .input-style:focus { outline: none; ring: 2px; ring-color: #3b82f6; }`}</style>
                </form>

                <footer className="p-4 border-t border-brand-border bg-brand-surface flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500">Cancel</button>
                    <button type="submit" form="person-form" className="px-4 py-2 bg-brand-accent text-white rounded-md hover:bg-blue-600">Save</button>
                </footer>
            </div>
        </div>
    );
};

export default PersonFormModal;
