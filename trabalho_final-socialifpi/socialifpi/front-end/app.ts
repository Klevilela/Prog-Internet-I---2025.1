const getById = (id:string) => document.getElementById(id)

/* const urlPath:string = 'http://localhost:3000/postagens'
const urlCriarCategoria:string = 'http://localhost:3000/categorias' */
const urlListarPostagens:string = 'http://localhost:3000/postagens'


async function carregarCategorias() {
  const response = await fetch('http://localhost:3000/categorias')
  if (!response.ok) {
    console.error('Erro ao buscar categorias:', response.statusText)
    return
  }
  const categorias = await response.json()
  
  const select = getById('categoria')
  const selectFiltrarCategoria = getById('filterCategoria')

  if (!select) {
    console.error('Select de categorias não encontrado no DOM')
    alert("Por favor, selecione uma categoria.")
    return
  }
  select.innerHTML = ''
  const optionNull = document.createElement('option')
  optionNull.value = ''
  optionNull.textContent = 'Selecione uma categoria'
  select.appendChild(optionNull)

  //const divSelectsCategoria = document.createElement('div')
  //divSelectsCategoria.className = 'div-select-categoria'

    categorias.forEach((cat: {id: string, nome: string}) => {
        const option = document.createElement('option')
        option.value = cat.id
        //option.id = cat.id
        option.textContent = cat.nome
        select.appendChild(option)
    })
    

  if(!selectFiltrarCategoria){
    console.error('Select de categorias não encontrado no DOM')
    alert("Por favor, selecione uma categoria.")
    return
  }

  selectFiltrarCategoria.innerHTML = ''

  const optionTodas = document.createElement('option')
  optionTodas.value = 'todas'
  optionTodas.textContent = 'Todas'
  optionTodas.selected = true
  selectFiltrarCategoria.appendChild(optionTodas)
  //divSelectsCategoria.appendChild(optionTodas)
  
    categorias.forEach((cat:{id:string, nome:string})=>{
        const option = document.createElement('option')
        //option.value = cat.id
        option.textContent = cat.nome
        option.value = cat.nome
        selectFiltrarCategoria.appendChild(option)
    })

    /* divSelectsCategoria.appendChild(select)
    divSelectsCategoria.appendChild(selectFiltrarCategoria) */
    console.log(categorias)
}

// Chama essa função quando a página carregar
window.onload = () => {
  carregarCategorias()
  listarPostagens()
}


async function incluirPostagem() {
    const inputCategoria = <HTMLSelectElement>getById('categoria');
    const inputTitulo = <HTMLInputElement>getById('titulo');
    const inputConteudo = <HTMLInputElement>getById('conteudo');

    if (inputCategoria && inputTitulo && inputConteudo) {
        const categoriaId = inputCategoria.value;

        if (!categoriaId) {
            alert('Selecione uma categoria válida.');
            return;
        }
        if (!inputTitulo) {
            alert('O título está vazio.');
            return;
        }
        if (!inputConteudo) {
            alert('O conteúdo está vazio.');
            return;
        }

        const postagem = {
            titulo: inputTitulo.value,
            conteudo: inputConteudo.value,
            data: new Date().toISOString(),
            curtidas: 0,
            categoriaId: Number(categoriaId)
        };

        try {
            const responsePostagem = await fetch('http://localhost:3000/postagens', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(postagem)
            });

            if (!responsePostagem.ok) {
                const erro = await responsePostagem.json();
                alert(`Erro: ${erro.erro || 'Não foi possível criar a postagem.'}`);
                return;
            }

            const postagemIncluida = await responsePostagem.json();
            console.log(postagemIncluida);

            inputCategoria.value = '';
            inputTitulo.value = '';
            inputConteudo.value = '';

            listarPostagens();

        } catch (error) {
            alert('Erro ao conectar com o servidor.');
            console.error(error);
        }
    }
}


async function editarPostagem(id:number, tituloAtual?:string, textoAtual?:string){
    const titulo = prompt('Novo Titulo',tituloAtual)
    const conteudo = prompt('Novo conteúdo',textoAtual)


    if(!titulo || !conteudo){
        alert('Conteudo e título são obrigatórios')
        return
    }


    const postagemAlterada = {
        titulo:titulo,
        conteudo:conteudo,
    }

    const response = await fetch(`http://localhost:3000/postagens/${id}`, {
        method:'PUT',
        headers:{'Content-type':'application/json'},
        body: JSON.stringify(postagemAlterada)
    })

    const resposta = await response.json()
    console.log(resposta)

    if(response.ok){
        alert('Postagem alterada com sucesso !')
        await listarPostagens()
    }
}


async function listarPostagens() {
    const response = await fetch(urlListarPostagens)
    const postagens = await response.json()
    console.log(postagens)

    const postagensElement = getById('postagens')
    if (!postagensElement) return;

    function renderPostagens(listaPostagens: any[]) {
        postagensElement.innerHTML = ''

        listaPostagens.forEach((postagem: {
            comentarios: any[]; categoria: { nome: string }; titulo: string | null; conteudo: string | null; data: string | number | Date; curtidas: string; id: number 
        }) => {
            const article = document.createElement('article')
            article.setAttribute('data-id', postagem.id.toString())

            

            const categoria = document.createElement('h3')
            categoria.textContent = postagem.categoria.nome

            const titulo = document.createElement('h2')
            titulo.textContent = postagem.titulo

            const conteudo = document.createElement('p')
            conteudo.textContent = postagem.conteudo

            const data = document.createElement('p')
            data.className = 'data'
            data.textContent = new Date(postagem.data).toLocaleDateString()

            const curtidas = document.createElement('p')
            curtidas.textContent = 'Curtidas: ' + postagem.curtidas
            curtidas.style.fontWeight = 'bold'

            

            const botaoCurtir = document.createElement('button')
            botaoCurtir.style.backgroundColor = 'palevioletred'
            botaoCurtir.textContent = 'Curtir'
            botaoCurtir.className = 'btn-curtir'
            botaoCurtir.addEventListener('click', () => curtirPostagem(postagem.id, curtidas))

            const botaoComentar = document.createElement('button')
            botaoComentar.style.backgroundColor = 'blue'
            botaoComentar.textContent = 'Comentar'
            botaoComentar.className = 'btn-comentar'
            botaoComentar.addEventListener('click', () => mostrarAreaComentario(postagem.id, article))

            


            const botaoDesabilitaComentario = document.createElement('button');
            botaoDesabilitaComentario.style.backgroundColor = 'darkorange';
            botaoDesabilitaComentario.className = 'btn-desabilita-comentario'
            botaoDesabilitaComentario.textContent = 'Desabilitar comentário'

            const divBotoesComentarios = document.createElement('div')
            divBotoesComentarios.className = 'botoes-comentario'
            //divBotoesComentarios.appendChild(botaoCurtir)
            divBotoesComentarios.appendChild(botaoComentar)
            divBotoesComentarios.appendChild(botaoDesabilitaComentario)

            const botaoEditarPostagem = document.createElement('button')
            botaoEditarPostagem.textContent = 'Editar Postagem'
            botaoEditarPostagem.style.backgroundColor = 'goldenrod'
            botaoEditarPostagem.classList = 'btn-editar-postagem'
            botaoEditarPostagem.addEventListener('click', ()=> editarPostagem(postagem.id, postagem.titulo, postagem.conteudo))


            const botaoExcluir = document.createElement('button')
            botaoExcluir.style.backgroundColor = 'red'
            botaoExcluir.textContent = 'Excluir'
            botaoExcluir.classList.add('btn-excluir')
            botaoExcluir.addEventListener('click', () => excluirPostagem(postagem.id))

            const divBotoesPostagem = document.createElement('div')
            divBotoesPostagem.className = 'botoes-postagem'

    
            divBotoesPostagem.appendChild(botaoEditarPostagem)
            divBotoesPostagem.appendChild(botaoExcluir)
            

            let comentarioHabilitado = true;

            botaoDesabilitaComentario.addEventListener("click", () => {
            if (comentarioHabilitado) {
                botaoComentar.disabled = true;
                botaoComentar.style.opacity = 0.5
                botaoDesabilitaComentario.textContent = "Habilitar comentário";
                botaoDesabilitaComentario.style.backgroundColor = "green";
            } else {
                botaoComentar.disabled = false;
                botaoComentar.style.opacity = '1';
                botaoDesabilitaComentario.textContent = "Desabilitar comentário";
                botaoDesabilitaComentario.style.backgroundColor = "orange";
            }

            comentarioHabilitado = !comentarioHabilitado;
            });

            let comentarioHabilitado2 = true;

            const btnDesComentario = getById('btnDesabilitaComentarios')
            if(btnDesComentario){
                btnDesComentario.className = 'btn-desabilita-comentario'
                btnDesComentario.textContent = 'Desabilitar todos os comentários'
                btnDesComentario.style.backgroundColor = '#f59e0b'
                
                btnDesComentario.addEventListener("click", () => {
                    if (comentarioHabilitado2) {
                        botaoComentar.disabled = true;
                        botaoComentar.style.opacity = 0.5
                        btnDesComentario.textContent = "Habilitar todos os comentários";
                        btnDesComentario.style.backgroundColor = "green";
                    } else {
                        botaoComentar.disabled = false;
                        botaoComentar.style.opacity = '1';
                        btnDesComentario.textContent = "Desabilitar comentário";
                        btnDesComentario.style.backgroundColor = "orange";
                    
                    }
                    comentarioHabilitado2 = !comentarioHabilitado2;
                })
            }



            article.appendChild(divBotoesPostagem)
            article.appendChild(categoria)
            article.appendChild(titulo)
            article.appendChild(conteudo)
            article.appendChild(data)
            article.appendChild(curtidas)
            article.appendChild(botaoCurtir)
            article.appendChild(divBotoesComentarios)

            if (postagem.comentarios && postagem.comentarios.length > 0) {
                const divComentarios = document.createElement('div')
                divComentarios.classList.add('comentarios')

                const comentariosOrdenados = postagem.comentarios.sort((a,b)=>new Date(b.data).getTime() - new Date(a.data).getTime())

                comentariosOrdenados.forEach((comentario: { id: number; conteudo: string; data: string }) => {
                    const pComentario = document.createElement('p')
                    pComentario.textContent = comentario.conteudo
                    pComentario.style.borderTop = '1px solid #ccc'
                    pComentario.style.paddingTop = '4px'

                    const dataComentario = document.createElement('p')
                    const data = new Date(comentario.data)
                    dataComentario.textContent = data.toLocaleString('pt-BR')

                    divComentarios.appendChild(pComentario)
                    divComentarios.appendChild(dataComentario)
                })

                article.appendChild(divComentarios)
            }

            postagensElement.appendChild(article)
        })
    }

    // Primeiro renderiza tudo
    renderPostagens(postagens)

    // Agora adiciona o filtro de categoria
    const selectFilterCategoria = getById('filterCategoria') as HTMLSelectElement
    if (selectFilterCategoria) {
        selectFilterCategoria.addEventListener('change', () => {
            const categoriaSelecionada = selectFilterCategoria.value

            if (categoriaSelecionada === '' || categoriaSelecionada === 'todas') {
                renderPostagens(postagens)
                return
            }

            const postagensFiltradas = postagens.filter(p => p.categoria.nome === categoriaSelecionada)

            if (postagensFiltradas.length === 0) {
                postagensElement.innerHTML = '<p>Nenhuma postagem foi encontrada.</p>'
            } else {
                renderPostagens(postagensFiltradas)
            }
        })
    }
}




function mostrarAreaComentario(id:number, container: HTMLElement){
    if (container.querySelector('.area-comentario')) return;

    const div = document.createElement('div')
    const inputAreaCoementario = document.createElement('textarea')
    div.classList.add('area-comentario');

    const btnEnviarComentario = document.createElement('button')
    btnEnviarComentario.textContent = 'Enviar'

    
    btnEnviarComentario.addEventListener('click', async ()=> {
        const texto = inputAreaCoementario.value
        if (!texto){
            alert('comentario vazio')
            return
        }

       await enviarComentario(id, container)
    })
    

    div.appendChild(inputAreaCoementario)
    div.appendChild(btnEnviarComentario)
    
    container.appendChild(div)
}

async function enviarComentario(id: number, container: HTMLElement) {
    const inputComentario = container.querySelector('textarea');
    const valorComentario = inputComentario?.value;

    if (!valorComentario || valorComentario.trim() === '') {
        alert('Comentário vazio não pode ser enviado!');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/postagens/${id}/comentarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ conteudo: valorComentario }) // <- importante!
        });

        if (!response.ok) {
            throw new Error('Erro ao enviar comentário');
        }

        const resultado = await response.json();
        console.log('Comentário enviado:', resultado);

        // Opcional: limpar textarea ou recarregar comentários
        inputComentario.value = '';
        //alert('Comentário enviado com sucesso!');
        listarPostagens()

    } catch (erro) {
        console.error('Erro ao enviar comentário:', erro);
        alert('Erro ao enviar o comentário.');
    }
}


async function excluirPostagem(id:number){
    const confirmar = confirm('Você deseja excluir essa postagem ?')

    if(confirmar){
        const response = await fetch(`http://localhost:3000/postagens/${id}`,{
            method:'DELETE',
        })

        if (response.ok) {
          alert('Postagem excluída com sucesso!');
          listarPostagens(); // atualiza a lista
        } else {
          alert('Erro ao excluir postagem.');
        }
    }

}

async function curtirPostagem(id:number, curtidasElement:HTMLParagraphElement){
    const response = await fetch(`http://localhost:3000/postagens/${id}/curtir`, {
        method:'PATCH'
    })

    const resultado = await response.json()
    curtidasElement.textContent = 'Curtidas: '+resultado.curtidas
}

const botaoPostar = getById('botaoNovaPostagem')



if(botaoPostar){
    botaoPostar.addEventListener('click', incluirPostagem)
}
