// entities/Comentario.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Postagem } from "./Postagem";

@Entity()
export class Comentario {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    conteudo: string;

    @CreateDateColumn()
    data!: Date;

    @ManyToOne(() => Postagem, postagem => postagem.comentarios, { onDelete: "CASCADE" })
    postagem!: Postagem;

    constructor(conteudo: string) {
        this.conteudo = conteudo;
    }
}