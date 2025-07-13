import Dexie, { EntityTable } from 'dexie'



interface File{
    id: number;
    projectId: number;
    name: string;
    columns: string[];
    data: any;
    lastTime: number;
    isSave: false;
}
const db = new Dexie('D4d.db') as Dexie &{
    files: EntityTable<File, 'id'>
}

db.version(1).stores({
    files: "++id, projectId, name, data, lastTime"
})

export type {File}
export {db} 