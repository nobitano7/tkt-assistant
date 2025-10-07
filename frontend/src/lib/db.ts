import { openDB, type DBSchema } from 'idb';

interface DocumentDB extends DBSchema {
  documents: {
    key: number;
    value: {
      id: number;
      name: string;
      type: string;
      content: string; // Store parsed text content
    };
    indexes: { 'name': string };
  };
}

const dbPromise = openDB<DocumentDB>('TKT-DocumentsDB', 1, {
  upgrade(db) {
    const store = db.createObjectStore('documents', {
      keyPath: 'id',
      autoIncrement: true,
    });
    store.createIndex('name', 'name');
  },
});

export const addDocument = async (name: string, type: string, content: string) => {
  return (await dbPromise).add('documents', { name, type, content } as any);
};

export const getAllDocuments = async () => {
  return (await dbPromise).getAll('documents');
};

export const getDocument = async (id: number) => {
  return (await dbPromise).get('documents', id);
};

export const deleteDocument = async (id: number) => {
  return (await dbPromise).delete('documents', id);
};