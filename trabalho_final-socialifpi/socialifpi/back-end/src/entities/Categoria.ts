
// entities/Categoria.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Postagem } from "./Postagem";

@Entity()
export class Categoria {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nome: string;

    @OneToMany(() => Postagem, postagem => postagem.categoria)
    postagens!: Postagem[];

    constructor(nome: string) {
        this.nome = nome;
    }
}