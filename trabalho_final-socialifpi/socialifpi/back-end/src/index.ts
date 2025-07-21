// index.ts
import express from "express";
import { AppDataSource } from "./data-source";
import { Postagem } from "./entities/Postagem";
import { Categoria } from "./entities/Categoria";
import { Comentario } from "./entities/Comentario";
import cors from 'cors'

import "reflect-metadata";


const app = express();
app.use(express.json());

app.use(cors())


AppDataSource.initialize().then(() => {
    console.log("Conectado ao banco!");



    // ################################################################### CRUD POSTAGENS #########################################################################################
    // CREATE - Criar postagem
    app.post('/postagens', async (req, res) => {
        try {
            const { titulo, conteudo, categoriaId } = req.body;

            if (!titulo || !conteudo || !categoriaId) {
                return res.status(400).json({ erro: "Título, conteúdo e categoria são obrigatórios" });
            }

            const categoriaRepo = AppDataSource.getRepository(Categoria);
            const postagemRepo = AppDataSource.getRepository(Postagem);

            const categoria = await categoriaRepo.findOneBy({ id: categoriaId });
            if (!categoria) {
                return res.status(404).json({ erro: "Categoria não encontrada" });
            }

            const postagem = new Postagem(titulo, conteudo, categoria);
            await postagemRepo.save(postagem);

            res.status(201).json(postagem);
        } catch (error) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    });

    // READ - Listar todas as postagens
    app.get('/postagens', async (req, res) => {
        try {
            const postagemRepo = AppDataSource.getRepository(Postagem);
            const postagens = await postagemRepo.find({
                relations: ["categoria", "comentarios"],
                order: { data: "DESC" }
            });
            res.json(postagens);
        } catch (error) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    });

    // READ - Buscar postagem por ID
    app.get('/postagens/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const postagemRepo = AppDataSource.getRepository(Postagem);

            const postagem = await postagemRepo.findOne({
                where: { id: parseInt(id) },
                relations: ["categoria", "comentarios"]
            });

            if (!postagem) {
                return res.status(404).json({ erro: "Postagem não encontrada" });
            }

            res.json(postagem);
        } catch (error) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    });

    // UPDATE - Atualizar postagem
    app.put("/postagens/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const { titulo, conteudo, categoriaId } = req.body;

            const postagemRepo = AppDataSource.getRepository(Postagem);
            const categoriaRepo = AppDataSource.getRepository(Categoria);

            const postagem = await postagemRepo.findOneBy({ id: parseInt(id) });
            if (!postagem) {
                return res.status(404).json({ erro: "Postagem não encontrada" });
            }

            if (titulo) postagem.titulo = titulo;
            if (conteudo) postagem.conteudo = conteudo;

            if (categoriaId) {
                const categoria = await categoriaRepo.findOneBy({ id: categoriaId });
                if (!categoria) {
                    return res.status(404).json({ erro: "Categoria não encontrada" });
                }
                postagem.categoria = categoria;
            }

            await postagemRepo.save(postagem);
            res.json(postagem);
        } catch (error) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    });

    // DELETE - Deletar postagem
    app.delete("/postagens/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const postagemRepo = AppDataSource.getRepository(Postagem);

            const postagem = await postagemRepo.findOneBy({ id: parseInt(id) });
            if (!postagem) {
                return res.status(404).json({ erro: "Postagem não encontrada" });
            }

            await postagemRepo.remove(postagem);
            res.json({ mensagem: "Postagem deletada com sucesso" });
        } catch (error) {
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

            const categoriaRepo = AppDataSource.getRepository(Categoria);
            const categoria = new Categoria(nome);
            await categoriaRepo.save(categoria);

            res.status(201).json(categoria);
        } catch (error) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    });

    // READ - Listar categorias
    app.get("/categorias", async (req, res) => {
        try {
            const categoriaRepo = AppDataSource.getRepository(Categoria);
            const categorias = await categoriaRepo.find();
            res.json(categorias);
        } catch (error) {
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

            const categoriaRepo = AppDataSource.getRepository(Categoria);
            const categoria = await categoriaRepo.findOneBy({ id: parseInt(id) });

            if (!categoria) {
                return res.status(404).json({ erro: "Categoria não encontrada" });
            }

            categoria.nome = nome;
            await categoriaRepo.save(categoria);

            res.json(categoria);
        } catch (error) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    });

    // DELETE - Excluir categoria
    app.delete("/categorias/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const categoriaRepo = AppDataSource.getRepository(Categoria);
            const postagemRepo = AppDataSource.getRepository(Postagem);

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
        } catch (error) {
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

            const postagemRepo = AppDataSource.getRepository(Postagem);
            const comentarioRepo = AppDataSource.getRepository(Comentario);

            const postagem = await postagemRepo.findOneBy({ id: parseInt(id) });
            if (!postagem) {
                return res.status(404).json({ erro: "Postagem não encontrada" });
            }

            const comentario = new Comentario(conteudo);
            comentario.postagem = postagem;
            await comentarioRepo.save(comentario);

            res.status(201).json(comentario);
        } catch (error) {
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

            const comentarioRepo = AppDataSource.getRepository(Comentario);
            const comentario = await comentarioRepo.findOneBy({ id: parseInt(id) });

            if (!comentario) {
                return res.status(404).json({ erro: "Comentário não encontrado" });
            }

            comentario.conteudo = conteudo;
            await comentarioRepo.save(comentario);

            res.json(comentario);
        } catch (error) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    });

    // DELETE - Excluir comentário
    app.delete("/comentarios/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const comentarioRepo = AppDataSource.getRepository(Comentario);

            const comentario = await comentarioRepo.findOneBy({ id: parseInt(id) });
            if (!comentario) {
                return res.status(404).json({ erro: "Comentário não encontrado" });
            }

            await comentarioRepo.remove(comentario);
            res.json({ mensagem: "Comentário deletado com sucesso" });
        } catch (error) {
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    });

    // ################################################################### CURTIR POSTAGENS #########################################################################################
    // UPDATE - Curtir postagem
    app.patch("/postagens/:id/curtir", async (req, res) => {
        try {
            const { id } = req.params;
            const postagemRepo = AppDataSource.getRepository(Postagem);

            const postagem = await postagemRepo.findOneBy({ id: parseInt(id) });
            if (!postagem) {
                return res.status(404).json({ erro: "Postagem não encontrada" });
            }

            postagem.curtidas += 1;
            await postagemRepo.save(postagem);

            res.json({ curtidas: postagem.curtidas });
        } catch (error) {
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
