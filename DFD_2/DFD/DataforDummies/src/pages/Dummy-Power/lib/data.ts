export type Table = {
    name: string
    description: string
    columns: string[]
    values: Record<string, any[]>
    types: string[]
}
export type Tables = Record<string, Table>

export type Entity = {
    id: string,
    name: string,
    description: string,
    position: { x: number, y: number },
    columns: {
        name: string,
        type: string,
        isPrimary?: boolean

    }[],

}
export type Entities = Record<string, Entity>

export const initTables = {
    sales: {
        name: "Ventas",
        description: "Registro de todas las transacciones de venta",
        columns: ["ID", "Fecha", "Producto", "Cantidad", "Precio", "Total"],
        types: ["number", "string", "string", "number", "number", "number"], // Tipos añadidos
        values: {
            "ID": [1, 2, 3, 4, 5],
            "Fecha": ["2023-01-15", "2023-01-16", "2023-01-17", "2023-01-18", "2023-01-19"],
            "Producto": ["Laptop", "Monitor", "Teclado", "Mouse", "Auriculares"],
            "Cantidad": [2, 3, 5, 5, 2],
            "Precio": [1200, 300, 80, 40, 150],
            "Total": [2400, 900, 400, 200, 300]
        }
    },
    customers: {
        name: "Clientes",
        description: "Información de los clientes registrados",
        columns: ["ID", "Nombre", "Email", "Teléfono", "País"],
        types: ["number", "string", "string", "string", "string"], // Tipos añadidos
        values: {
            "ID": [1, 2, 3],
            "Nombre": ["Juan Pérez", "María López", "Carlos Ruiz"],
            "Email": ["juan@example.com", "maria@example.com", "carlos@example.com"],
            "Teléfono": ["123-456-7890", "234-567-8901", "345-678-9012"],
            "País": ["España", "México", "Colombia"]
        }
    },
    products: {
        name: "Productos",
        description: "Catálogo de productos disponibles",
        columns: ["ID", "Nombre", "Categoría", "Precio", "Stock"],
        types: ["number", "string", "string", "number", "number"], // Tipos añadidos
        values: {
            "ID": [1, 2, 3, 4, 5],
            "Nombre": ["Laptop", "Monitor", "Teclado", "Mouse", "Auriculares"],
            "Categoría": ["Electrónica", "Electrónica", "Accesorios", "Accesorios", "Audio"],
            "Precio": [1200, 300, 80, 40, 150],
            "Stock": [15, 25, 50, 45, 20]
        }
    }
};

// Entities data
export const entities = {
    sales: {
        id: "sales",
        name: "Ventas",
        description: "Registro de todas las transacciones de venta",
        position: { x: 50, y: 100 },
        columns: [
            { name: "ID", type: "number", isPrimary: true },
            { name: "Fecha", type: "date" },
            { name: "Producto", type: "string" },
            { name: "Cantidad", type: "number" },
            { name: "Precio", type: "currency" },
            { name: "Total", type: "currency" },
        ],
    },
    customers: {
        id: "customers",
        name: "Clientes",
        description: "Información de los clientes registrados",
        position: { x: 400, y: 100 },
        columns: [
            { name: "ID", type: "number", isPrimary: true },
            { name: "Nombre", type: "string" },
            { name: "Email", type: "string" },
            { name: "Teléfono", type: "string" },
            { name: "País", type: "string" },
        ],
    },
    products: {
        id: "products",
        name: "Productos",
        description: "Catálogo de productos disponibles",
        position: { x: 200, y: 350 },
        columns: [
            { name: "ID", type: "number", isPrimary: true },
            { name: "Nombre", type: "string" },
            { name: "Categoría", type: "string" },
            { name: "Precio", type: "currency" },
            { name: "Stock", type: "number" },
        ],
    },
}

export type relationship = {
    id: number,
    from: string,
    to: string,
    type: string
}

export type relationships = relationship[]
// Relationships data
export const relationships = [
    { id: 1, from: "ventas", to: "clientes", type: "oneToMany" },
    { id: 2, from: "ventas", to: "productos", type: "manyToMany" },
]




export function generateEntityFromTable(tableId: string, tableData: any, index: number): Entity {
    const { name, description, columns, types } = tableData;

    return {
        id: tableId,
        name,
        description,
        position: {
            x: 70 + index * 100, // se desplaza 300px a la derecha por cada tabla
            y: 100
        },
        columns: columns.map((colName: string, i: number) => ({
            name: colName,
            type: types[i],
            isPrimary: i === 0
        }))
    };
}


export function getInitialEntities(tables: Tables): Entities {
    const Entities: Entities = {}
    Object.values(tables).map((table, index) => {
        const entity = {
            "id": table.name.toLowerCase(),
            "name": table.name,
            "description": table.description,
            "position": {
                x: 70 + index * 200,
                y: 100 + index* 100
            },
            "columns": table.columns.map((colName: string, i: number) => ({
                name: colName,
                type: table.types[i],
                isPrimary: i === 0
            }))
            
        }
        Entities[table.name.toLocaleLowerCase()] = entity
    })
    return Entities
}
