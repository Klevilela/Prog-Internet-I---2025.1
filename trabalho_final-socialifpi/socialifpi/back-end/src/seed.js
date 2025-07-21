"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./data-source");
const Categoria_1 = require("./entities/Categoria");
async function seedCategorias() {
    await data_source_1.AppDataSource.initialize();
    const categoriaRepo = data_source_1.AppDataSource.getRepository(Categoria_1.Categoria);
    const categoriasExistentes = await categoriaRepo.count();
    if (categoriasExistentes === 0) {
        const categorias = [
            'gerais',
            'saude',
            'educacao',
            'esportes',
            'politica',
            'tecnologia e inovacao'
        ].map(nome => {
            const c = new Categoria_1.Categoria(nome);
            return c;
        });
        await categoriaRepo.save(categorias);
        console.log('Categorias pré-cadastradas inseridas com sucesso!');
    }
    else {
        console.log('Categorias já existem, não foi inserido nada.');
    }
    await data_source_1.AppDataSource.destroy();
}
seedCategorias().catch(console.error);
