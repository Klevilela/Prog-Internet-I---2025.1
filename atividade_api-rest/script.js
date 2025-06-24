function getById(id){
    return document.getElementById(id)
}

const btnMostrarLobo = getById('botaoMostrarLobo')
const img = getById('imgFox')

btnMostrarLobo.addEventListener('click', mostrarLobo)

async function mostrarLobo() {
    try {
        const response = await fetch('https://randomfox.ca/floof/')
        let json = await response.json()
        img.src = json.image
    } catch (e) {
        console.error('Erro ao buscar imagem:', e)
        img.alt = 'Erro ao carregar imagem'
    }
}


const btnEnviaPost = getById('btnEnviaPost')
btnEnviaPost.addEventListener('click', enviaPost)
const resposta = getById('resposta')

async function enviaPost(){
    const titulo = getById('tituloPost').value
    const conteudo = getById('conteudo').value

    try {
        const url = 'https://jsonplaceholder.typicode.com/posts'
        const response = await fetch(url, {
            method: 'POST',
            headers:{'Content-type':'application/json'},
            body:JSON.stringify({
                title:titulo,
                body:conteudo,
                userId:1
            })
        })

        const json = await response.json()
        resposta.innerHTML = `
      <strong>Post criado com sucesso!</strong><br>
      <strong>ID:</strong> ${json.id}<br>
      <strong>Título:</strong> ${json.title}<br>
      <strong>Conteúdo:</strong> ${json.body}
    `
        console.log(json)
    
    } catch (error) {
        console.error('Erro:', error)
        resposta.innerText = 'Erro ao enviar post'
    }
}

const btnPedirFato = getById('btnPedirFato')
const catFato = getById('catFato')
btnPedirFato.addEventListener('click', pedirFato)

async function pedirFato() {
    try {
        const url = 'https://meowfacts.herokuapp.com/?lang=por-br'
        const response = await fetch(url)
        const json = await response.json()

        catFato.innerText = json.data[0]
        console.log(json)

    } catch (error) {
        catFato.innerText = 'Erro'
    }
}