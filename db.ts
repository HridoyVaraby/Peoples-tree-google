import { Person, RelationshipType } from './types';
import { DEFAULT_RELATIONSHIP_TYPES } from './constants';

const DB_NAME = 'PeopleTreeDB';
const PEOPLE_STORE_NAME = 'people';
const REL_STORE_NAME = 'relationship_types';
const DB_VERSION = 2;

let db: IDBDatabase;

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(new Error("Error opening DB"));
        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };
        request.onupgradeneeded = (event) => {
            const dbInstance = (event.target as IDBOpenDBRequest).result;
            if (!dbInstance.objectStoreNames.contains(PEOPLE_STORE_NAME)) {
                dbInstance.createObjectStore(PEOPLE_STORE_NAME, { keyPath: 'id' });
            }
            if (event.oldVersion < 2) {
                if (!dbInstance.objectStoreNames.contains(REL_STORE_NAME)) {
                    const relStore = dbInstance.createObjectStore(REL_STORE_NAME, { keyPath: 'name' });
                    DEFAULT_RELATIONSHIP_TYPES.forEach(type => {
                        relStore.add(type);
                    });
                }
            }
        };
    });
}

export async function initDB() {
    await openDB();
}

// People Functions
export function getAllPeople(): Promise<Person[]> {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDB();
            const transaction = db.transaction(PEOPLE_STORE_NAME, 'readonly');
            const store = transaction.objectStore(PEOPLE_STORE_NAME);
            const request = store.getAll();

            request.onerror = () => reject(new Error("Error fetching all people"));
            request.onsuccess = () => resolve(request.result);
        } catch (error) {
            reject(error);
        }
    });
}

export function getPerson(id: string): Promise<Person | undefined> {
     return new Promise(async (resolve, reject) => {
        try {
            const db = await openDB();
            const transaction = db.transaction(PEOPLE_STORE_NAME, 'readonly');
            const store = transaction.objectStore(PEOPLE_STORE_NAME);
            const request = store.get(id);

            request.onerror = () => reject(new Error(`Error fetching person ${id}`));
            request.onsuccess = () => resolve(request.result);
        } catch(error) {
            reject(error);
        }
    });
}

export function savePerson(person: Person): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDB();
            const transaction = db.transaction(PEOPLE_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(PEOPLE_STORE_NAME);
            store.put(person);

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(new Error(`Error saving person ${person.id}`));
        } catch (error) {
            reject(error);
        }
    });
}

export function deletePerson(id: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDB();
            const transaction = db.transaction(PEOPLE_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(PEOPLE_STORE_NAME);
            store.delete(id);
        
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(new Error(`Error deleting person ${id}`));
        } catch (error) {
            reject(error);
        }
    });
}

// Relationship Type Functions
export function getAllRelationshipTypes(): Promise<RelationshipType[]> {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDB();
            const transaction = db.transaction(REL_STORE_NAME, 'readonly');
            const store = transaction.objectStore(REL_STORE_NAME);
            const request = store.getAll();

            request.onerror = () => reject(new Error("Error fetching all relationship types"));
            request.onsuccess = () => resolve(request.result);
        } catch (error) {
            reject(error);
        }
    });
}

export function saveRelationshipType(type: RelationshipType): Promise<void> {
     return new Promise(async (resolve, reject) => {
        try {
            const db = await openDB();
            const transaction = db.transaction(REL_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(REL_STORE_NAME);
            store.put(type);

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(new Error(`Error saving relationship type ${type.name}`));
        } catch (error) {
            reject(error);
        }
    });
}

export function deleteRelationshipType(typeName: string): Promise<void> {
     return new Promise(async (resolve, reject) => {
        try {
            const db = await openDB();
            const transaction = db.transaction(REL_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(REL_STORE_NAME);
            store.delete(typeName);
        
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(new Error(`Error deleting relationship type ${typeName}`));
        } catch (error) {
            reject(error);
        }
    });
}

// Data Management Functions
export function clearAllData(): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDB();
            const transaction = db.transaction([PEOPLE_STORE_NAME, REL_STORE_NAME], 'readwrite');
            transaction.objectStore(PEOPLE_STORE_NAME).clear();
            transaction.objectStore(REL_STORE_NAME).clear();

            transaction.oncomplete = () => resolve();
            transaction.onerror = (event) => reject(new Error(`Error clearing data: ${(event.target as IDBTransaction).error}`));
        } catch (error) {
            reject(error);
        }
    });
}

export function importData(data: { people: Person[], relationshipTypes: RelationshipType[] }): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            // First, clear all existing data
            await clearAllData();
            
            // Then, perform a bulk import
            const db = await openDB();
            const transaction = db.transaction([PEOPLE_STORE_NAME, REL_STORE_NAME], 'readwrite');
            const peopleStore = transaction.objectStore(PEOPLE_STORE_NAME);
            const typeStore = transaction.objectStore(REL_STORE_NAME);

            data.people.forEach(p => peopleStore.put(p));
            data.relationshipTypes.forEach(rt => typeStore.put(rt));

            transaction.oncomplete = () => resolve();
            transaction.onerror = (event) => reject(new Error(`Error during bulk import: ${(event.target as IDBTransaction).error}`));

        } catch (error) {
            reject(error);
        }
    });
}