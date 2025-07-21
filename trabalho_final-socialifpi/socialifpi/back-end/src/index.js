"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// index.ts
const express_1 = __importDefault(require("express"));
const data_source_1 = require("./data-source");
const Postagem_1 = require("./entities/Postagem");
const Categoria_1 = require("./entities/Categoria");
const Comentario_1 = require("./entities/Comentario");
const cors_1 = __importDefault(require("cors"));
require("reflect-metadata");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
data_source_1.AppDataSource.initialize().then(() => {
    console.log("Conectado ao banco!");
    // ################################################################### CRUD POSTAGENS #########################################################################################
    // CREATE - Criar postagem
    app.post('/postagens', async (req, res) => {
        try {
            const { titulo, conteudo, categoriaId } = req.body;
            if (!titulo || !conteudo || !categoriaId) {
                return res.status(400).json({ erro: "Título, conteúdo e categoria são obrigatórios" });
            }
            const categoriaRepo = data_source_1.AppDataSource.getRepository(Categoria_1.Categoria);
            const postagemRepo = data_source_1.AppDataSource.getRepository(Postagem_1.Postagem);
            const categoria = await categoriaRepo.findOneBy({ id: categoriaId });
            if (!categoria) {
                return res.status(404).json({ erro: "Categoria não encontrada" });
            }
            const postagem = new Postagem_1.Postagem(titulo, conteudo, categoria);
            await postagemRepo.save(postagem);
            res.status(201).json(postagem);
        }
        catch (error) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    });
    // READ - Listar todas as postagens
    app.get('/postagens', async (req, res) => {
        try {
            const postagemRepo = data_source_1.AppDataSource.getRepository(Postagem_1.Postagem);
            const postagens = await postagemRepo.find({
                relations: ["categoria", "comentarios"],
                order: { data: "DESC" }
            });
            res.json(postagens);
        }
        catch (error) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    });
    // READ - Buscar postagem por ID
    app.get('/postagens/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const postagemRepo = data_source_1.AppDataSource.getRepository(Postagem_1.Postagem);
            const postagem = await postagemRepo.findOne({
                where: { id: parseInt(id) },
                relations: ["categoria", "comentarios"]
            });
            if (!postagem) {
                return res.status(404).json({ erro: "Postagem não encontrada" });
            }
            res.json(postagem);
        }
        catch (error) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    });
    // UPDATE - Atualizar postagem
    app.put("/postagens/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const { titulo, conteudo, categoriaId } = req.body;
            const postagemRepo = data_source_1.AppDataSource.getRepository(Postagem_1.Postagem);
            const categoriaRepo = data_source_1.AppDataSource.getRepository(Categoria_1.Categoria);
            const postagem = await postagemRepo.findOneBy({ id: parseInt(id) });
            if (!postagem) {
                return res.status(404).json({ erro: "Postagem não encontrada" });
            }
            if (titulo)
                postagem.titulo = titulo;
            if (conteudo)
                postagem.conteudo = conteudo;
            if (categoriaId) {
                const categoria = await categoriaRepo.findOneBy({ id: categoriaId });
                if (!categoria) {
                    return res.status(404).json({ erro: "Categoria não encontrada" });
                }
                postagem.categoria = categoria;
            }
            await postagemRepo.save(postagem);
            res.json(postagem);
        }
        catch (error) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    });
    // DELETE - Deletar postagem
    app.delete("/postagens/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const postagemRepo = data_source_1.AppDataSource.getRepository(Postagem_1.Postagem);
            const postagem = await postagemRepo.findOneBy({ id: parseInt(id) });
            if (!postagem) {
                return res.status(404).json({ erro: "Postagem não encontrada" });
            }
            await postagemRepo.remove(postagem);
            res.json({ mensagem: "Postagem deletada com sucesso" });
        }
        catch (error) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    });
    // ################################################################### CRUD CATEGORIAS #########################################################################################
    // CREATE - Criar categoria
    app.post("/categorias", async (req, res) => {
        try {
            const { nome } = req.body;
            if (!nome) {
                return res.status(400).json({ erro: "Nome da categoria é obrigatório" });
            }
            const categoriaRepo = data_source_1.AppDataSource.getRepository(Categoria_1.Categoria);
            const categoria = new Categoria_1.Categoria(nome);
            await categoriaRepo.save(categoria);
            res.status(201).json(categoria);
        }
        catch (error) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    });
    // READ - Listar categorias
    app.get("/categorias", async (req, res) => {
        try {
            const categoriaRepo = data_source_1.AppDataSource.getRepository(Categoria_1.Categoria);
            const categorias = await categoriaRepo.find();
            res.json(categorias);
        }
        catch (error) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    });
    // UPDATE - Editar categoria
    app.put("/categorias/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const { nome } = req.body;
            if (!nome) {
                return res.status(400).json({ erro: "Nome da categoria é obrigatório" });
            }
            const categoriaRepo = data_source_1.AppDataSource.getRepository(Categoria_1.Categoria);
            const categoria = await categoriaRepo.findOneBy({ id: parseInt(id) });
            if (!categoria) {
                return res.status(404).json({ erro: "Categoria não encontrada" });
            }
            categoria.nome = nome;
            await categoriaRepo.save(categoria);
            res.json(categoria);
        }
        catch (error) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    });
    // DELETE - Excluir categoria
    app.delete("/categorias/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const categoriaRepo = data_source_1.AppDataSource.getRepository(Categoria_1.Categoria);
            const postagemRepo = data_source_1.AppDataSource.getRepository(Postagem_1.Postagem);
            const categoria = await categoriaRepo.findOneBy({ id: parseInt(id) });
            if (!categoria) {
                return res.status(404).json({ erro: "Categoria não encontrada" });
            }
            // Verificar se há postagens associadas
            const postagensAssociadas = await postagemRepo.count({
                where: { categoria: { id: parseInt(id) } }
            });
            if (postagensAssociadas > 0) {
                return res.status(400).json({
                    erro: "Não é possível deletar categoria com postagens associadas",
                    postagensAssociadas
                });
            }
            await categoriaRepo.remove(categoria);
            res.json({ mensagem: "Categoria deletada com sucesso" });
        }
        catch (error) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    });
    // ################################################################### CRUD COMENTÁRIOS #########################################################################################
    // CREATE - Adicionar comentário
    app.post("/postagens/:id/comentarios", async (req, res) => {
        try {
            const { id } = req.params;
            const { conteudo } = req.body;
            if (!conteudo) {
                return res.status(400).json({ erro: "Conteúdo do comentário é obrigatório" });
            }
            const postagemRepo = data_source_1.AppDataSource.getRepository(Postagem_1.Postagem);
            const comentarioRepo = data_source_1.AppDataSource.getRepository(Comentario_1.Comentario);
            const postagem = await postagemRepo.findOneBy({ id: parseInt(id) });
            if (!postagem) {
                return res.status(404).json({ erro: "Postagem não encontrada" });
            }
            const comentario = new Comentario_1.Comentario(conteudo);
            comentario.postagem = postagem;
            await comentarioRepo.save(comentario);
            res.status(201).json(comentario);
        }
        catch (error) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    });
    // UPDATE - Editar comentário
    app.put("/comentarios/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const { conteudo } = req.body;
            if (!conteudo) {
                return res.status(400).json({ erro: "Conteúdo do comentário é obrigatório" });
            }
            const comentarioRepo = data_source_1.AppDataSource.getRepository(Comentario_1.Comentario);
            const comentario = await comentarioRepo.findOneBy({ id: parseInt(id) });
            if (!comentario) {
                return res.status(404).json({ erro: "Comentário não encontrado" });
            }
            comentario.conteudo = conteudo;
            await comentarioRepo.save(comentario);
            res.json(comentario);
        }
        catch (error) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    });
    // DELETE - Excluir comentário
    app.delete("/comentarios/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const comentarioRepo = data_source_1.AppDataSource.getRepository(Comentario_1.Comentario);
            const comentario = await comentarioRepo.findOneBy({ id: parseInt(id) });
            if (!comentario) {
                return res.status(404).json({ erro: "Comentário não encontrado" });
            }
            await comentarioRepo.remove(comentario);
            res.json({ mensagem: "Comentário deletado com sucesso" });
        }
        catch (error) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    });
    // ################################################################### CURTIR POSTAGENS #########################################################################################
    // UPDATE - Curtir postagem
    app.patch("/postagens/:id/curtir", async (req, res) => {
        try {
            const { id } = req.params;
            const postagemRepo = data_source_1.AppDataSource.getRepository(Postagem_1.Postagem);
            const postagem = await postagemRepo.findOneBy({ id: parseInt(id) });
            if (!postagem) {
                return res.status(404).json({ erro: "Postagem não encontrada" });
            }
            postagem.curtidas += 1;
            await postagemRepo.save(postagem);
            res.json({ curtidas: postagem.curtidas });
        }
        catch (error) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    });
    app.listen(3000, () => {
        console.log("Servidor rodando na porta 3000");
        console.log("Endpoints disponíveis:");
        console.log("  POST   /postagens");
        console.log("  GET    /postagens");
        console.log("  GET    /postagens/:id");
        console.log("  PUT    /postagens/:id");
        console.log("  DELETE /postagens/:id");
        console.log("  PATCH  /postagens/:id/curtir");
        console.log("  POST   /postagens/:id/comentarios");
        console.log("  PUT    /comentarios/:id");
        console.log("  DELETE /comentarios/:id");
        console.log("  POST   /categorias");
        console.log("  GET    /categorias");
        console.log("  PUT    /categorias/:id");
        console.log("  DELETE /categorias/:id");
    });
}).catch(err => console.error("Erro ao conectar:", err));
