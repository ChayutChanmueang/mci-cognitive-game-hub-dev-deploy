class db {
    constructor() {
        // load config
        this.host = "http://localhost";
        this.port = 3001;
    }

    async getRow(from, select, order, ascending) {
        const response = await fetch(`${this.host}:${this.port}/api/getrow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: from,
                select: select,
                order: order,
                ascending: ascending
            })
        });

        return await response.json();
    }

    async getRowSingle(from, select, row, value) {
        const response = await fetch(`${this.host}:${this.port}/api/getrowsingle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: from,
                select: select,
                row: row,
                value: value
            })
        });

        return await response.json();
    }

    async createRow(from, insert) {
        const response = await fetch(`${this.host}:${this.port}/api/createrow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: from,
                insert: insert
            })
        });

        return await response.json();
    }

    async updateRow(from, update, row, value) {
        const response = await fetch(`${this.host}:${this.port}/api/updaterow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: from,
                update: update,
                row: row,
                value: value
            })
        });

        return await response.json();
    }
}

export default new db();