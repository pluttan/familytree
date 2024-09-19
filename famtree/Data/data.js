const { Client } = require('pg');
const crypto = require('crypto');
const CryptoJS = require('crypto-js');

class Data {
    constructor(props) {
        const connectionString = "postgresql://pluttan:Pluttan2004@localhost:5432/family-tree";
        this.bd = new Client({
            connectionString: connectionString,
        });

        this.state = {
            result: undefined,
        };

        this.connect();
    }
    async connect() {
        try {
            await this.bd.connect();
            console.log("Успешное подключение к базе данных");
        } catch (err) {
            console.error("Ошибка подключения к базе данных", err);
        }
    }

    async query(q) {
        try {
            const result = await this.bd.query(q);
            return result;
        } catch (err) {
            console.log(q);
            console.error("Ошибка выполнения запроса", err);
            return { rows: 'error' };
            // throw err;
        }
    }

    async doesUsernameExist(username) {
        try {
            const result = await this.query(`SELECT COUNT(*) FROM users WHERE username = '${username}'`);
            const count = parseInt(result.rows[0].count);
            return count > 0;
        } catch (err) {
            console.error("Error checking if username exists", err);
            // throw err;
        }
    }

    async hashGen(username) {
        const randomHash = crypto.randomBytes(32).toString('hex');
        await this.query(`Insert into sessions(hash, id_user) values ('${randomHash}', (SELECT user_id FROM users WHERE username = '${username}'))`);
        console.log(randomHash);
        return randomHash;
    }

    async login(login, hashPass) {
        try {
            const result = await this.query(`SELECT pass, user_id FROM users WHERE username = '${login}'`);
            const pas = result.rows[0].pass;

            const decryptedHashPass = CryptoJS.AES.decrypt(hashPass, login).toString(CryptoJS.enc.Utf8);
            const decryptedDatabasePass = CryptoJS.AES.decrypt(pas, login).toString(CryptoJS.enc.Utf8);

            return {
                logined: decryptedHashPass === decryptedDatabasePass,
                id: result.rows[0].user_id
            };
        } catch (error) {
            console.error('Error in login:', error.message);
            // Обработка ошибок, например, возвращение false в случае ошибки
            return false;
        }
    }


    disconnect() {
        this.bd.end();
    }
}
module.exports = {
    Data: Data
};
