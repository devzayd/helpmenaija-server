import "reflect-metadata";
import { DataSource } from "typeorm";
import CONFIG from "./config";
import { User, Contact, SessionEntity, KeyWord } from "./entity";

const AppDataSource = new DataSource({
  type: "postgres",
  // url: CONFIG.DATABASE_URL,
  host: CONFIG.DB_HOST,
  port: Number(CONFIG.DB_PORT),
  username: CONFIG.DB_USERNAME,
  password: CONFIG.DB_PASSWORD,
  database: CONFIG.DB_NAME,
  logging: false,
  synchronize: true,
  entities: [User, Contact, KeyWord, SessionEntity],
  migrations: [],
  subscribers: [],
});

export const initializeDBConnection = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database Connected");
  } catch (error) {
    throw new Error(error);
    // console.error(error);
  }
};
