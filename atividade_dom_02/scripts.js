/*Questão 1*/

function mostraErro(id, msg){
    let elemento = document.getElementById(id)

    if(!elemento){
        console.warn('elemento não encontrado')
        return
    }
    elemento.textContent = msg
    elemento.classList.remove('oculto')

    setTimeout(function(){
        elemento.classList.add('oculto')
        elemento.textContent = ''
    }, 3000)

    document.getElementById('botaoErro').
    addEventListener('click', function(){ mostraErro('mensagemErro', 'Erro, tente novamente')})
}


let botaoExibir = document.getElementById('botaoExibir');
botaoExibir.addEventListener('click', exibirConteudo);

function exibirConteudo() {
    let conteudo = document.getElementById('caixaDeTexto').value;

    if(conteudo.trim() === ''){
        mostraErro('conteudo', 'O campo não pode ser vazio')
        return
    }

    document.getElementById('conteudo').innerHTML = conteudo;
}

let botaoCalculaEngajamento = document.getElementById('btn_calcular_engajamento')

botaoCalculaEngajamento.addEventListener('click', calculaEngajamento)

function calculaEngajamento(){
    let interacoes = document.getElementById('num_interacoes').value
    let visualizacoes = document.getElementById('num_visualizacoes').value


    if (interacoes.trim() === ''){
        mostraErro('erro_entrada', 'O valor das interações é nulo')
        return
    }
    if (visualizacoes.trim() === ''){
        mostraErro('erro_entrada', 'O valor das visualizações é nulo')
        return
    }

    if (isNaN(interacoes.trim())){
        mostraErro('erro_entrada', 'O valor total das interações não é um número')
        return
    }
    if (isNaN(visualizacoes.trim())){
        mostraErro('erro_entrada', 'O valor total das visualizações é um número')
        return
    }

    let engajamento = (Number(interacoes) / Number(visualizacoes)) * 100
    

    document.getElementById('res_engajamento').innerText = `Taxa de engajamento:  ${engajamento}`
}



let botaoCarregaImagem = document.getElementById('btn_carrega_img')

botaoCarregaImagem.addEventListener('click', carregaImagem)
let resultado = document.getElementById('resultado')

function carregaImagem(){
    let uploadImagem = document.getElementById('uploadImagem')
    let arquivoSelecionado = uploadImagem.files[0]
    
    let img = document.createElement('img')
    img.src = URL.createObjectURL(arquivoSelecionado)
    
    resultado.appendChild(img)

}

const selectElement = document.querySelector('.fotos')
const resutladoImg = document.querySelector('.resultadoFotos')

selectElement.addEventListener('change', (e)=>{
    let caminhoImagem = e.target.value

    resutladoImg.innerHTML = ''

    let img = document.createElement('img')
    img.src = caminhoImagem

    resutladoImg.appendChild(img)
})


const redesSociaisName = document.getElementsByName('redesSociais')
const btnEnviarSelecao = document.getElementById('enviarBtn')
const redesSelecionadas = document.getElementById('redesSelecionadas')

btnEnviarSelecao.addEventListener('click', mostrarSelecao)

function mostrarSelecao(){
   
   redesSelecionadas.innerHTML = ''
   let selecionadas = []

    for (let element of redesSociaisName) {
        if (element.checked){
            selecionadas.push(element.value)
        }
    }

    if (selecionadas.length === 0){
        mostraErro('msgErro', 'Selecione pelo menos 1 rede social')
        return
    }

    for (let valor of selecionadas) {
        let p = document.createElement('p');
        p.textContent = valor;
        redesSelecionadas.appendChild(p);
    }
}

const inputHashtag = document.getElementById('input_hashtag')
const btnAdicionaHashtag = document.getElementById('btnAdicionarHashtag')
const selectHashtag = document.getElementById('selectHashtag')

btnAdicionaHashtag.addEventListener('click', adicionaHashtag)
let listHashtags = []

function adicionaHashtag(){
    let hashTag = inputHashtag.value
    let option = document.createElement('option')

    
    if (hashTag.trim() === ''){
        mostraErro('erroSelect', 'O valor é nulo')
        return
    }

    if(hashTag.trim().length < 2){
        mostraErro('erroSelect', 'O valor é menor que 2 caracteres')
        return
    }

    if (listHashtags.includes(hashTag.toLowerCase())){
        mostraErro('erroSelect', 'O valor é repetido')
        return    
    }

    if(listHashtags.length >= 5){
        mostraErro('erroSelect', 'A quantidade máxima de hashtags é 5')
        return
    }
    
    listHashtags.push(hashTag.toLowerCase())
    
    option.textContent = '#'+hashTag
    selectHashtag.appendChild(option)
    inputHashtag.innerHTML = ''
}

const btnRemoverHasgtag = document.getElementById('btnRemoverHashtag')
btnRemoverHasgtag.addEventListener('click', removerHashtag)

function removerHashtag(){
    const arraySelecionadas = Array.from(selectHashtag.selectedOptions)

    if (arraySelecionadas.length === 0){
        mostraErro('erroSelect', 'Selecione uma hashtag')
        return
    }

    arraySelecionadas.forEach(opcao => {
        selectHashtag.removeChild(opcao)

        const hashtagSemSustenido = opcao.textContent.slice(1).toLowerCase();
        const index = listHashtags.indexOf(hashtagSemSustenido);
        if (index !== -1) {
            listHashtags.splice(index, 1);
        }
    })
}

const btnDireita = document.getElementById('moverParaDireitaBtn')
const btnEsquerda = document.getElementById('moverParaEsquerdaBtn')

const ativosDisponiveis = document.getElementById('ativosDisponiveis')
const carteiraInvestimentos = document.getElementById('carteiraInvestimentos')

const erro = document.getElementById('erroInv')

btnDireita.addEventListener('click', moverParaEsquerda)
btnEsquerda.addEventListener('click', moverParaDireita)



function moverParaEsquerda(){
    const ativosSelecionados = Array.from(ativosDisponiveis.selectedOptions)

    if (ativosSelecionados.length === 0){
        mostraErro('erroInv', 'Selecione ao menos um item')
        return
    }

    ativosSelecionados.forEach(ativo =>{
        ativosDisponiveis.removeChild(ativo)
        carteiraInvestimentos.appendChild(ativo)
    })

    atualizarBotoes()
}

function moverParaDireita(){
    const carteiraInvestimentosSelecionados = Array.from(carteiraInvestimentos.selectedOptions)

    if (carteiraInvestimentosSelecionados.length === 0){
        mostraErro('mensagem', 'Selecione ao menos um item')
        return
    }

    carteiraInvestimentosSelecionados.forEach(inv =>{
        carteiraInvestimentos.removeChild(inv)
        ativosDisponiveis.appendChild(inv)
    })

    atualizarBotoes()
}

function atualizarBotoes() {
  btnDireita.disabled  = ativosDisponiveis.options.length === 0;
  btnEsquerda.disabled = carteiraInvestimentos.options.length === 0;
}