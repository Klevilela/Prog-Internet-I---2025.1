
import { AppDataSource } from "./data-source";
import { Categoria } from "./entities/Categoria";

async function seedCategorias() {
  await AppDataSource.initialize();

  const categoriaRepo = AppDataSource.getRepository(Categoria);

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
      const c = new Categoria(nome);
      return c;
    });

    await categoriaRepo.save(categorias);
    console.log('Categorias pré-cadastradas inseridas com sucesso!');
  } else {
    console.log('Categorias já existem, não foi inserido nada.');
  }

  await AppDataSource.destroy();
}

seedCategorias().catch(console.error);
