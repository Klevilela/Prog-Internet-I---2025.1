function getById(id){
    return document.getElementById(id)
}

let botaoSolicitar = getById('botaoSolicitar')
botaoSolicitar.addEventListener('click', solicitar)

async function solicitar(){
    let url = 'https://api.adviceslip.com/advice'
    
    try{
        const response = await fetch(url)
        if (!response.ok){
            let json = await response.json()
            throw new Error('Erro ao consultar conselhos')
        }
        getById('conselho').innerText = json.slip.advice
    }catch(e){
        getById('conselho').innerText = 'Erro ao consultar'
    }
}

let botaoConsultarPais = getById('botaoConsultarPais')
botaoConsultarPais.addEventListener('click', consultarPais)

async function consultarPais() {
    let nomePais = getById('nomePais').value
    let url = 'https://restcountries.com/v3.1/name/' + nomePais

    try {
        let response = await fetch(url)
        let json = await response.json()

        if(!response.ok){
            throw new Error('Erro ao consultar país')
        }

        let bandeira = getById('bandeira')
        bandeira.src = json[0].flags.png
        bandeira.alt = json[0].flags.alt
    } catch (e) {
        getById('erro').innerText = 'Erro ao consultar país'
    }
}