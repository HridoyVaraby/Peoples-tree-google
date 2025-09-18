export interface RelationshipType {
    name: string;
    color: string;
}

export interface Relationship {
    type: string;
    connected_to_id: string;
}

export interface Person {
    id: string;
    name: string;
    aliases?: string[];
    tags?: string[];
    location?: string;
    notes?: string;
    relationships: Relationship[];
    primaryRelationship: string;
    bloodGroup?: string;
}
