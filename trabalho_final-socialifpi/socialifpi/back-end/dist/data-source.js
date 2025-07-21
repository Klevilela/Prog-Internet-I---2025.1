"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
// data-source.ts
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const Categoria_1 = require("./entities/Categoria");
const Comentario_1 = require("./entities/Comentario");
const Postagem_1 = require("./entities/Postagem");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "pgAdmin",
    database: "socialifpi_db",
    synchronize: true,
    logging: false,
    entities: [Categoria_1.Categoria, Comentario_1.Comentario, Postagem_1.Postagem],
});
