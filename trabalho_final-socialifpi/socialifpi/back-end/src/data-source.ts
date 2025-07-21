// data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Categoria } from "./entities/Categoria";
import { Comentario } from "./entities/Comentario";
import { Postagem } from "./entities/Postagem";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "pgAdmin",
    database: "socialifpi_db",
    synchronize: true,
    logging: false,
    entities: [Categoria, Comentario, Postagem],
});