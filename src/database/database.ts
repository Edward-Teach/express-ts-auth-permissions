import {Sequelize} from "sequelize-typescript";
import path from "node:path";
import {exec} from "node:child_process";

class Database {
    private static instance: Sequelize;

    private constructor() {
    }

    public static getInstance(): Sequelize {
        if (!this.instance) {
            this.instance = new Sequelize(
                {
                    username: process.env.DB_USER!,
                    database: process.env.DB_NAME!,
                    password: process.env.DB_PASSWORD!,
                    host: process.env.DB_HOST,
                    dialect: 'mysql',
                    logging: false,
                    models: [path.join(__dirname, '../models')]
                },
            );
        }
        return this.instance;
    }

    public static async initialize() {
        try {
            const sequelize: Sequelize = this.getInstance();
            await sequelize.authenticate();
            exec('npx sequelize-cli db:migrate --config config/config.js', (err, stdout, stderr) => {
                if (err) {
                    console.error(`Migration error: ${stderr}`);
                    return;
                }
                console.log(`Migration output: ${stdout}`);
            });/*
            sequelize.sync({ alter: true }).then(() => {
                console.log('Database & tables updated!');
            });*/
            console.log('Connection to the database has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    }

    public static async close() {
        try {
            await this.getInstance().close();
            console.log('Connection to the database has been closed.');
        } catch (error) {
            console.error('Error closing the database connection:', error);
        }
    }
}

export default Database;
