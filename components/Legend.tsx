import React from 'react';
import { RelationshipType } from '../types';

interface LegendProps {
    relationshipTypes: RelationshipType[];
}

const Legend: React.FC<LegendProps> = ({ relationshipTypes }) => {
    return (
        <div className="absolute bottom-2 left-2 bg-brand-surface bg-opacity-80 p-2 md:p-3 rounded-lg shadow-lg border border-brand-border">
            <h4 className="font-bold text-sm mb-2 text-brand-text-primary">Relationship Types</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {relationshipTypes.map(type => (
                    <div key={type.name} className="flex items-center gap-2">
                        <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: type.color }}
                        ></div>
                        <span className="text-xs text-brand-text-secondary">{type.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Legend;
