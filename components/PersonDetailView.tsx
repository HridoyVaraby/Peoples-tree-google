import React from 'react';
import { Person, RelationshipType } from '../types';
import { UserIcon, TagIcon, LocationMarkerIcon, PencilIcon, TrashIcon, LinkIcon, UserGroupIcon, XIcon, BloodDropIcon } from './Icons';

interface PersonDetailViewProps {
    person: Person | null;
    allPeople: Person[];
    onEdit: (person: Person) => void;
    onDelete: (personId: string) => void;
    onClose: () => void;
    relationshipTypes: RelationshipType[];
}

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value?: string | string[] }> = ({ icon, label, value }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;

    return (
        <div className="flex items-start gap-3 mt-4">
            <div className="flex-shrink-0 w-6 h-6 text-brand-text-secondary">{icon}</div>
            <div>
                <h3 className="text-sm font-semibold text-brand-text-secondary">{label}</h3>
                {Array.isArray(value) ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                        {value.map((item, index) => (
                            <span key={index} className="px-2 py-0.5 text-xs text-brand-text-primary bg-brand-bg rounded-full">{item}</span>
                        ))}
                    </div>
                ) : (
                    <p className="text-brand-text-primary">{value}</p>
                )}
            </div>
        </div>
    );
};


const PersonDetailView: React.FC<PersonDetailViewProps> = ({ person, allPeople, onEdit, onDelete, onClose, relationshipTypes }) => {
    if (!person) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-brand-text-secondary">
                <UserGroupIcon className="w-24 h-24 mb-4 text-brand-border" />
                <h2 className="text-xl font-bold">Select a Person</h2>
                <p className="mt-2 text-sm">Click on a node in the graph to see their details here.</p>
            </div>
        );
    }
    
    const primaryColor = relationshipTypes.find(rt => rt.name === person.primaryRelationship)?.color || '#a3a3a3';

    const getPersonNameById = (id: string): string => {
        return allPeople.find(p => p.id === id)?.name || 'Unknown Person';
    };

    return (
        <div className="relative flex flex-col h-full">
            <button 
                onClick={onClose} 
                className="md:hidden absolute top-2 right-2 p-1 text-brand-text-secondary hover:text-brand-text-primary z-10 rounded-full hover:bg-brand-border"
                aria-label="Close details"
            >
                <XIcon className="w-6 h-6" />
            </button>
            <div className="flex-1">
                <div className="flex items-center gap-4">
                    <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <UserIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-brand-text-primary">{person.name}</h2>
                        <p className="text-sm text-brand-text-secondary">{person.primaryRelationship}</p>
                    </div>
                </div>

                <div className="mt-6 border-t border-brand-border pt-4">
                    <DetailItem icon={<TagIcon />} label="Aliases" value={person.aliases} />
                    <DetailItem icon={<TagIcon />} label="Tags" value={person.tags} />
                    <DetailItem icon={<LocationMarkerIcon />} label="Location" value={person.location} />
                    <DetailItem icon={<BloodDropIcon />} label="Blood Group" value={person.bloodGroup} />
                    
                    {person.notes && (
                        <div className="mt-4">
                           <h3 className="text-sm font-semibold text-brand-text-secondary mb-1">Notes</h3>
                           <p className="text-sm p-3 bg-brand-bg rounded-md whitespace-pre-wrap">{person.notes}</p>
                        </div>
                    )}
                    
                     <div className="mt-6">
                        <h3 className="text-sm font-semibold text-brand-text-secondary flex items-center gap-2"><LinkIcon className="w-5 h-5"/> Relationships</h3>
                        <ul className="mt-2 space-y-2">
                            {person.relationships.map((rel, index) => (
                                <li key={index} className="flex items-center justify-between p-2 text-sm bg-brand-bg rounded-md">
                                    <span>{rel.type}</span>
                                    <span className="font-semibold text-brand-accent">{getPersonNameById(rel.connected_to_id)}</span>
                                </li>
                            ))}
                             {person.relationships.length === 0 && <p className="text-xs text-brand-text-secondary">No relationships added.</p>}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-brand-border">
                <button
                    onClick={() => onEdit(person)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-600 rounded-md hover:bg-gray-500 transition-colors"
                >
                    <PencilIcon className="w-4 h-4" /> Edit
                </button>
                <button
                    onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${person.name}? This action cannot be undone.`)) {
                            onDelete(person.id);
                        }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-500 transition-colors"
                >
                    <TrashIcon className="w-4 h-4" /> Delete
                </button>
            </div>
        </div>
    );
};

export default PersonDetailView;
