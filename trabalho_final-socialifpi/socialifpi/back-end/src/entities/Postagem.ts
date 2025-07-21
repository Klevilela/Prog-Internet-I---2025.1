// entities/Postagem.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Comentario } from "./Comentario";
import { Categoria } from "./Categoria";

@Entity()
export class Postagem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    titulo: string;

    @Column("text")
    conteudo: string;

    @CreateDateColumn()
    data!: Date;

    @UpdateDateColumn()
    dataAtualizacao!: Date;

    @Column({ default: 0 })
    curtidas: number;

    @OneToMany(() => Comentario, comentario => comentario.postagem, { cascade: true })
    comentarios!: Comentario[];

    @ManyToOne(() => Categoria, categoria => categoria.postagens, { eager: true })
    categoria!: Categoria;

    constructor(titulo: string, conteudo: string, categoria: Categoria) {
        this.titulo = titulo;
        this.conteudo = conteudo;
        this.categoria = categoria;
        this.curtidas = 0;
    }
}