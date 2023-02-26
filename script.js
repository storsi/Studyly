//ELEMENTI HTML
//Utilità:
//generale
const modUtilita = document.getElementsByClassName("modUtilita")
//musica
const musica = document.getElementById("musica")
const cambiaMusica = document.getElementById("cambiaMusica")
const canzoniF = document.getElementById("canzoniFinite")
const canzoniL = document.getElementById("canzoniLive")
const volume = document.getElementById("volume")
const riproduzioneP = document.getElementById("riproduzione")
const bottoniCanzoni = document.getElementsByClassName("canzone")
//timer
const tempo = document.getElementById("tempo")
const cambiaTempo = document.getElementById("cambiaTempo")
const studioP = document.getElementById("studioP")
const fase = document.getElementById("fase")
const tempiPreimpostati = document.getElementById("sceltePreimpostate")
const minLavoro = document.getElementById("minStudio")
const minRiposo = document.getElementById("minRiposo")
const numRipetizioni = document.getElementById("ripetizioni")
//studio
const studio = document.getElementById("studio")
const cambiaStudio = document.getElementById("cambiaStudia")
const materie = document.getElementById("materie")
//File e Tavolo da lavoro
const tipoFile = document.getElementById("tipoFile")
const nomeFile = document.getElementById("nomeFile")
const tavoloDaLavoro = document.getElementById("tavoloDaLavoro")
const nFile = document.getElementById("nFile")

//----------------------------------------------------------------------------------------------------

//VARIABILI
var xmlContent
var idTimer
let player;
var creaFileBtnBool = true

//----------------------------------------------------------------------------------------------------

//LETTURA FILE XML
document.addEventListener('DOMContentLoaded', () => {
    let url = 'file.xml'
    fetch(url).then(response=>response.text()).then(data=> {
        let parser = new DOMParser()
        let xml = parser.parseFromString(data, 'application/xml')
        xmlContent = xml
        //Richiamo delle funzioni che usano xmlContent
        inserisciCanzoni()
        caricaTempi()
        insersisciMaterie()
    })
})

//----------------------------------------------------------------------------------------------------
//FUNZIONI UTILITÀ

//Funzione richiamata per "aprire" o "chiudere" l'utilità
function apriChiudiUtilita(pulsante, div) {
    fase.innerText = ""
    div.scrollTop = "0"
    if(div.offsetHeight <= 65) {
        //Apre
        pulsante.style.rotate = -180 + "deg"
        div.style.height = 40 + "vh"
        div.style.overflow = "auto"
    } else {
        //Chiude
        pulsante.style.rotate = 0 + "deg"
        div.style.height = 6 + "vh";
        div.style.overflow = "hidden"
    }
}

//----------------------------------------------------------------------------------------------------
//Musica

//dispone le canzoni presenti nel file xml nel loro elenco
function inserisciCanzoni() {
    let canzoniFinite = xmlContent.getElementsByTagName("canzoneFinita")
    let canzoniLive = xmlContent.getElementsByTagName("canzoneLive")

    canzoniF.innerHTML = ""
    canzoniL.innerHTML = ""

    for(i = 0; i < canzoniFinite.length; i++) {
        canzoniF.innerHTML += `
        <li class="canzone" onclick="selezionaCanzone('Video',${i}, ${i})">
            ${canzoniFinite[i].firstChild.nodeValue} - ${canzoniFinite[i].getAttribute("durata")}
        </li>`
    }
    for(i = 0; i < canzoniLive.length; i++) {
        canzoniL.innerHTML += `
        <li class="canzone" onclick="selezionaCanzone('Live',${i}, ${i + canzoniFinite.length})">
            ${canzoniLive[i].firstChild.nodeValue} - LIVE
        </li>`
    }
}
//fa partire la canzone che gli passiamo come parametro e modifica il 
//background-color del pulsante associato
function selezionaCanzone(tipo, i, bottone) {
    let canzoni
    interrompiRiproduzione()

    if(tipo == "Live") {
        canzoni = xmlContent.getElementsByTagName("canzoneLive")
    } else {
        canzoni = xmlContent.getElementsByTagName("canzoneFinita")
    }

    for(j = 0; j < bottoniCanzoni.length; j++) {
        bottoniCanzoni[j].style.backgroundColor = "transparent"
    }

    player.loadVideoById(canzoni[i].getAttribute("v"))
    bottoniCanzoni[bottone].style.backgroundColor = "rgb(255, 201, 101)"
}
//estrae una canzone casuale tra quelle "non LIVE"
function estraiCanzone() {
    let canzoniFinite = xmlContent.getElementsByTagName("canzoneFinita")
    console.log(canzoniFinite)

    let numRandom = Math.floor(Math.random() * canzoniFinite.length)

    selezionaCanzone("Video", numRandom, numRandom)
}
//onclick event per il pulsante dell'utilità (che la "apre" e "chiude")
modUtilita[0].addEventListener("click", function() {
    apriChiudiUtilita(modUtilita[0], musica)
})

//----------------------------------------------------------------------------------------------------
//Timer

//inserisce nel proprio elenco i tempi preimpostati presenti nel file xml
function caricaTempi() {
    let tempi = xmlContent.getElementsByTagName("tecnica")
    tempiPreimpostati.innerHTML = ""

    for(i = 0; i < tempi.length; i++) {
        tempiPreimpostati.innerHTML += `
        <li id="tempiLi" onclick="caricaTempo(${i})">
            ${tempi[i].firstChild.nodeValue} <br> 
            ${tempi[i].getAttribute("minLavoro")} - ${tempi[i].getAttribute("minRiposo")}
            per ${tempi[i].getAttribute("numRipetizioni")} volte
        </li>`
    }
}
//al click di uno dei timer preimpostati, va ad inserire negli input i valori corrispondenti
function caricaTempo(i) {
    let tempi = xmlContent.getElementsByTagName("tecnica")


    console.log(tempi + " " + i)
    minLavoro.value = tempi[i].getAttribute("minLavoro")
    minRiposo.value = tempi[i].getAttribute("minRiposo")
    numRipetizioni.value = tempi[i].getAttribute("numRipetizioni")
}
//si richiama al click del pulsante avvia nell'utilità Tempo, prepara il timer e lo fa partire
function avviaTempo() {
    var time = xmlContent.getElementsByTagName("tempo")

    apriChiudiUtilita(modUtilita[1], tempo)
    annullaTimer()

    var mLav = parseInt(minLavoro.value)
    var mRip = parseInt(minRiposo.value)
    var numR = parseInt(numRipetizioni.value)

    if(mLav != null && mRip != null && numR != null && mLav > 0 && numR > 0) {
        time[0].firstChild.nodeValue = mLav * 60 + 1
        time[1].firstChild.nodeValue = mRip * 60 + 1
        time[2].firstChild.nodeValue = "Lavoro"
        time[3].firstChild.nodeValue = numR

        timer(time, numR, mLav, mRip)
    }
}
//fa partire il timer ed alterna la sessione di riposo con quella di lavoro fino a quando 
//le ripetizioni non arrivano o 0
function timer(tempi, numR, mLav, mRip) {
    var riposo = false
    var rep = numR


    idTimer = setInterval(() => {

        if(riposo) {
            if(tempi[1].firstChild.nodeValue <= 0) {
                riposo = false
                tempi[1].firstChild.nodeValue = mRip * 60 + 1
            } else {
                fase.innerText = "Riposo:"
                fase.style.color= "green"
                studioP.style.color = "green"
                tempi[1].firstChild.nodeValue = parseInt(tempi[1].firstChild.nodeValue) - 1
                studioP.innerText = ""

                if(Math.floor(tempi[1].firstChild.nodeValue / 60) < 10) {
                    studioP.innerText += " 0" + Math.floor(tempi[1].firstChild.nodeValue / 60) + " : "
                } else {
                    studioP.innerText += " " + Math.floor(tempi[1].firstChild.nodeValue / 60) + " : "
                }

                if(tempi[1].firstChild.nodeValue % 60 < 10) {
                    studioP.innerText += " 0" + tempi[1].firstChild.nodeValue % 60
                } else {
                    studioP.innerText += " " + tempi[1].firstChild.nodeValue % 60
                }
            }
        } else {
            if(tempi[0].firstChild.nodeValue <= 0) {
                riposo = true
                tempi[0].firstChild.nodeValue = mLav * 60 + 1
                rep--
            } else {
                tempi[0].firstChild.nodeValue = parseInt(tempi[0].firstChild.nodeValue) - 1
                fase.style.color= "rgb(150, 0, 0)"
                studioP.style.color = "rgb(150, 0, 0)"
                fase.innerText = "Lavoro:"
                studioP.innerText = ""

                if(Math.floor(tempi[0].firstChild.nodeValue / 60) < 10) {
                    studioP.innerText += " 0" + Math.floor(tempi[0].firstChild.nodeValue / 60) + " : "
                } else {
                    studioP.innerText += " " + Math.floor(tempi[0].firstChild.nodeValue / 60) + " : "
                }

                if(tempi[0].firstChild.nodeValue % 60 < 10) {
                    studioP.innerText += " 0" + tempi[0].firstChild.nodeValue % 60
                } else {
                    studioP.innerText += " " + tempi[0].firstChild.nodeValue % 60
                }
            }
        }

        if(rep <= 0) {
            fase.style.color= "black"
            studioP.style.color = "black"
            fase.innerText = ""
            studioP.innerText = "Completato!"
            annullaTimer()
        }
    }, 1000)
}
//interrompe il timer
function annullaTimer() {
    clearInterval(idTimer)
}
//onclick event per il pulsante dell'utilità (che la "apre" e "chiude")
modUtilita[1].addEventListener("click", function() {
    apriChiudiUtilita(modUtilita[1], tempo)
})

//----------------------------------------------------------------------------------------------------
//Studio

//dispone le materie nel file xml nel loro elenco
function insersisciMaterie() {
    let mat = xmlContent.getElementsByTagName("materia")
    materie.innerHTML = ""

    for(i = 0; i < mat.length; i++) {
        materie.innerHTML += `
        <li id="materia">
            ${mat[i].firstChild.nodeValue}<br>(non funzionano...)
        </li>`
    }
}
//onclick event per il pulsante dell'utilità (che la "apre" e "chiude")
modUtilita[2].addEventListener("click", function() {
    apriChiudiUtilita(modUtilita[2], studio)
})

//----------------------------------------------------------------------------------------------------
//PLAYER DI YOUTUBE

// Funzione chiamata quando l'API di YouTube è pronta
function onYouTubeIframeAPIReady() {
    // Crea un nuovo player
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        events: {
            'onReady': onPlayerReady,
        }
    });
}

// Funzione chiamata quando il player è pronto
function onPlayerReady(event) {
    //la qualità del video è bassa
    event.target.setPlaybackQuality('small');
    //il volume è di default a 20
    event.target.setVolume(20);
}
//interrompe il video
function interrompiRiproduzione() {
    if(player != null)
        player.stopVideo()

    for(j = 0; j < bottoniCanzoni.length; j++) {
        bottoniCanzoni[j].style.backgroundColor = "transparent"
    }
}
//modifica il volume, viene richiamata con "onchange" dal file html
function modificaVolume() {
    player.setVolume(volume.value)
}

//----------------------------------------------------------------------------------------------------
//AGGIUNTA "FILE"

//al click del pulsante per aggiungere il "file", "aprirà" o "chiuderà" l'input ed il pulsante per
//l'inserimento del nome
function creaFileBtnPremuto() {
    if(creaFileBtnBool) {
        tipoFile.style.height = 9 + "vh"
    } else {
        tipoFile.style.height = 0 + "vh"
    }

    creaFileBtnBool = !creaFileBtnBool
}
//viene richiamata per aggiungere un "file" nel file xml
function aggiungiFile() {
    creaFileBtnPremuto()
    nuovoFile = xmlContent.createElement("file")

    if(nomeFile != null) {
        nuovoFile.setAttribute("nome", nomeFile.value)
        xmlContent.getElementsByTagName("files")[0].appendChild(nuovoFile)
        nomeFile.value = ""
        inserisciFile()
    }
}
//inserisce tutti i "file" nel file xml nel tavolo da lavoro
function inserisciFile() {
    let tuttiFile = xmlContent.getElementsByTagName("file")
    tavoloDaLavoro.innerHTML = ""


    for(i = 0; i < tuttiFile.length; i++) {
        tavoloDaLavoro.innerHTML += `
        <div class="file">
            <img src="https://www.computerhope.com/jargon/t/text-file.png">
            <p>${tuttiFile[i].getAttribute("nome")}.txt</p>
            <button class="duplicaFile" onclick="duplicaFile(${i})">Duplica</button>
            <button class="eliminaFile" onclick="eliminaFile(${i})">Elimina</button>
        </div>`
    }
}
//viene richiamata per duplicare il "file" (nodo) selezionato
function duplicaFile(i) {

    vecchioNodo = xmlContent.getElementsByTagName("file")[i]
    nuovoNodo = vecchioNodo.cloneNode(true)
    var nomeNodo = nuovoNodo.getAttribute("nome").split("(")
    nuovoNodo.setAttribute("nome", nomeNodo[0] + "(dup)")
    xmlContent.getElementsByTagName("files")[0].appendChild(nuovoNodo)

    inserisciFile()
}
//viene richiamata per eliminare il "file"(nodo) selezionato
function eliminaFile(i) {

    nodo = xmlContent.getElementsByTagName("file")[i]
    nodo.parentNode.removeChild(nodo)

    inserisciFile()
}