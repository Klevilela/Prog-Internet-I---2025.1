# Blog: Social IFPI

Este documento detalha a instalação, execuçaõ e uso da API


## Equipe
- Roniel, Vinicius Santiago e Kleberson
- Link do vídeo demonstrativo da aplicação: https://mega.nz/file/cgtXwYbD#nSokPycoUBIwC_VXYfl6-vKnDCWo1Az47GfHJO3uGdg

## Requisitos
- Node.js
- TypeScript
- PostgreSQL

## Instalando dependências
```bash
npm install reflect-metadata
npm install typeorm@0.3.12
npm install express typeorm reflect-metadata pg
npm install -D typescript ts-node-dev @types/node @types/express
npm install cors
npm install --save-dev @types/cors
npm install --save-dev typescript@4.9.5

```
## Criando o arquivo tsconfig.json
Se ainda não existir, crie com:
```bash
npx tsc --init

```
Edite alguns campos:
```bash
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true,
  "target": "ES2020",
  "module": "commonjs",
  "strict": true,
  "outDir": "./dist",
  "baseUrl": "./",
  "esModuleInterop": true
}
```
## Configure o Banco de Dados 
- **Arquivo:** back-end\src\data-source.ts
- O projeto está configurado para se conectar a um banco de dados PostgreSQL local com usuário e senha padrão. Ajuste para o seu caso e certifique-se de que exista um banco de dados com o nome **socialifpi_db**
```bash
export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "socialifpi_db",
    synchronize: true,
    logging: false,
    entities: [Categoria, Comentario, Postagem],
});

```
## Para rodar o Projeto
Instalar dependências
```bash
npm install
```
Desenvolvimento
```bash
npm run dev
```
Produção
```bash
npm run build
npm start
```
O servidor estará rodando em http://localhost:3000


## Endpoints da API (Como Fazer Requisições)

### # Postagem

#### Criar Postagem

```bash
POST http://localhost:3000/postagens
Content-Type: application/json

{
  "titulo": "Título da Postagem",
  "conteudo": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequata",
  "categoriaId": 1
}

```

#### Listar Postagens
```bash
GET http://localhost:3000/postagens
```

#### Buscar Postagem por ID
```bash
GET http://localhost:3000/postagens/1
```

#### Curtir Postagem
```bash
PATCH http://localhost:3000/postagens/1/curtir
```

#### Editar Postagem
```bash
PUT http://localhost:3000/postagens/1
Content-Type: application/json

{
  "titulo": "Título atualizado",
  "conteudo": "Conteúdo atualizado da postagem",
  "categoriaId": 1
}
```

#### Deletar Postagem
```bash
DELETE http://localhost:3000/postagens/1
```
**Nota!** Deletar uma postagem também apaga seus respectivos comentários em cascata.
### # Comentário

#### Adicionar Comentário em uma Postagem
```bash
POST http://localhost:3000/postagens/1/comentarios
Content-Type: application/json

{
  "conteudo": "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
}
```
#### Editar Comentário de uma Postagem
```bash
PUT http://localhost:3000/comentarios/1
Content-Type: application/json

{
  "conteudo": "Comentário editado com novo conteúdo!"
}
```
#### Deletar Comentário de uma Postagem
```bash
DELETE http://localhost:3000/comentarios/1
```

### # Categoria
#### Criar Categoria
```bash
POST http://localhost:3000/categorias
Content-Type: application/json

{
  "nome": "Nome da Categoria"
}
```
#### Listar Categorias
```bash
GET http://localhost:3000/categorias
```
#### Deletar Categoria
```bash
DELETE http://localhost:3000/categorias/1
```
**Nota!** "Não é possível deletar categoria com postagens associadas
