"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Postagem = void 0;
// entities/Postagem.ts
const typeorm_1 = require("typeorm");
const Comentario_1 = require("./Comentario");
const Categoria_1 = require("./Categoria");
let Postagem = class Postagem {
    constructor(titulo, conteudo, categoria) {
        this.titulo = titulo;
        this.conteudo = conteudo;
        this.categoria = categoria;
        this.curtidas = 0;
    }
};
exports.Postagem = Postagem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Postagem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Postagem.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], Postagem.prototype, "conteudo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Postagem.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Postagem.prototype, "dataAtualizacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Postagem.prototype, "curtidas", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Comentario_1.Comentario, comentario => comentario.postagem, { cascade: true }),
    __metadata("design:type", Array)
], Postagem.prototype, "comentarios", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Categoria_1.Categoria, categoria => categoria.postagens, { eager: true }),
    __metadata("design:type", Categoria_1.Categoria)
], Postagem.prototype, "categoria", void 0);
exports.Postagem = Postagem = __decorate([
    (0, typeorm_1.Entity)(),
    __metadata("design:paramtypes", [String, String, Categoria_1.Categoria])
], Postagem);
