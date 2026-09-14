/* =========================================
   VITAPET - SISTEMA PRINCIPAL
========================================= */


/* DADOS DO JOGADOR */

let dados = {
    nome: "",
    saude: 100,
    hidratacao: 100,
    energia: 100,
    felicidade: 100,
    mental: 100,

    bioenergia: 100,
    biopontos: 0,

    agua: 0,
    exercicio: 0,
    alimentacao: 0,
    pausa: 0,

    nivel: 1
};


/* =========================================
   SALVAR DADOS
========================================= */

function salvarDados() {
    localStorage.setItem("vitapetDados", JSON.stringify(dados));
}


/* =========================================
   CARREGAR DADOS
========================================= */

function carregarDados() {

    const dadosSalvos = localStorage.getItem("vitapetDados");

    if (dadosSalvos) {

        dados = JSON.parse(dadosSalvos);

        document.getElementById("nomePetTela").innerText = dados.nome;

        atualizarInterface();
    }
}


/* =========================================
   TROCAR DE TELA
========================================= */

function mostrarTela(id) {

    const telas = document.querySelectorAll(".tela");

    telas.forEach(function(tela) {
        tela.classList.remove("ativa");
    });

    document.getElementById(id).classList.add("ativa");

    atualizarInterface();
}


/* =========================================
   CRIAR PET
========================================= */

function criarPet() {

    const nome = document.getElementById("nomePet").value.trim();

    if (nome === "") {

        mostrarNotificacao("Digite um nome para seu VitaPet!");

        return;
    }

    dados.nome = nome;

    salvarDados();

    document.getElementById("nomePetTela").innerText = dados.nome;

    mostrarTela("telaPrincipal");

    mostrarNotificacao("Seu VitaPet nasceu! 🐾");
}


/* =========================================
   LIMITAR VALORES
========================================= */

function limitarValores() {

    dados.saude = Math.max(0, Math.min(100, dados.saude));
    dados.hidratacao = Math.max(0, Math.min(100, dados.hidratacao));
    dados.energia = Math.max(0, Math.min(100, dados.energia));
    dados.felicidade = Math.max(0, Math.min(100, dados.felicidade));
    dados.mental = Math.max(0, Math.min(100, dados.mental));
    dados.bioenergia = Math.max(0, Math.min(100, dados.bioenergia));

}


/* =========================================
   ATUALIZAR INTERFACE
========================================= */

function atualizarInterface() {

    limitarValores();

    document.getElementById("saudeValor").innerText =
        Math.round(dados.saude);

    document.getElementById("hidratacaoValor").innerText =
        Math.round(dados.hidratacao);

    document.getElementById("energiaValor").innerText =
        Math.round(dados.energia);

    document.getElementById("felicidadeValor").innerText =
        Math.round(dados.felicidade);

    document.getElementById("mentalValor").innerText =
        Math.round(dados.mental);


    document.getElementById("bioenergia").innerText =
        Math.round(dados.bioenergia);

    document.getElementById("biopontos").innerText =
        dados.biopontos;


    /* BARRAS */

    document.getElementById("saudeBarra").style.width =
        dados.saude + "%";

    document.getElementById("hidratacaoBarra").style.width =
        dados.hidratacao + "%";

    document.getElementById("energiaBarra").style.width =
        dados.energia + "%";

    document.getElementById("felicidadeBarra").style.width =
        dados.felicidade + "%";

    document.getElementById("mentalBarra").style.width =
        dados.mental + "%";


    /* EVOLUÇÃO */

    let pontosNivel = dados.biopontos % 100;

    document.getElementById("nivelPet").innerText =
        "Nível " + dados.nivel;

    document.getElementById("xpTexto").innerText =
        pontosNivel + " / 100 BioPontos";

    document.getElementById("xpPreenchido").style.width =
        pontosNivel + "%";


    /* ESTATÍSTICAS */

    document.getElementById("aguaTotal").innerText =
        dados.agua;

    document.getElementById("exercicioTotal").innerText =
        dados.exercicio;

    document.getElementById("alimentacaoTotal").innerText =
        dados.alimentacao;

    document.getElementById("pausaTotal").innerText =
        dados.pausa;


    /* RANKING */

    document.getElementById("rankingPontos").innerText =
        dados.biopontos + " pts";


    salvarDados();

    verificarEstadoPet();
}


/* =========================================
   BIOPONTOS
========================================= */

function ganharPontos(valor) {

    dados.biopontos += valor;

    dados.bioenergia += valor / 2;

    if (dados.biopontos >= dados.nivel * 100) {

        dados.nivel++;

        mostrarNotificacao(
            "🎉 Seu VitaPet evoluiu para o nível " + dados.nivel + "!"
        );
    }
}


/* =========================================
   BEBER ÁGUA
========================================= */

function beberAgua() {

    dados.hidratacao += 10;

    dados.bioenergia += 5;

    dados.agua++;

    ganharPontos(10);

    document.getElementById("mensagemPet").innerText =
        "💧 Muito bem! A hidratação é importante!";

    mostrarNotificacao("+10 BioPontos 💧");

    atualizarInterface();
}


/* =========================================
   DORMIR
========================================= */

function dormir() {

    dados.energia += 15;

    dados.mental += 5;

    ganharPontos(30);

    document.getElementById("mensagemPet").innerText =
        "😴 Dormir bem ajuda seu corpo a recuperar energia!";

    mostrarNotificacao("+30 BioPontos 😴");

    atualizarInterface();
}


/* =========================================
   EXERCÍCIO
========================================= */

function exercicio() {

    dados.felicidade += 15;

    dados.energia -= 5;

    dados.saude += 5;

    dados.exercicio++;

    ganharPontos(25);

    document.getElementById("mensagemPet").innerText =
        "🏃 Exercício feito! Continue se movimentando!";

    mostrarNotificacao("+25 BioPontos 🏃");

    atualizarInterface();
}


/* =========================================
   ALIMENTAÇÃO
========================================= */

function alimentacao() {

    dados.saude += 10;

    dados.energia += 5;

    dados.alimentacao++;

    ganharPontos(20);

    document.getElementById("mensagemPet").innerText =
        "🥗 Uma alimentação equilibrada ajuda na saúde!";

    mostrarNotificacao("+20 BioPontos 🥗");

    atualizarInterface();
}


/* =========================================
   PAUSA ATIVA
========================================= */

function pausaAtiva() {

    dados.mental += 10;

    dados.felicidade += 5;

    dados.pausa++;

    ganharPontos(15);

    document.getElementById("mensagemPet").innerText =
        "🧘 Boa! Uma pausa também faz bem para a mente.";

    mostrarNotificacao("+15 BioPontos 🧘");

    atualizarInterface();
}


/* =========================================
   PASSAGEM DO TEMPO
========================================= */

setInterval(function() {

    if (dados.nome === "") {
        return;
    }


    /* Perdas naturais */

    dados.hidratacao -= 1;
    dados.energia -= 0.5;
    dados.felicidade -= 0.3;
    dados.mental -= 0.2;


    /* Se os atributos ficarem muito baixos,
       a saúde começa a cair */

    if (dados.hidratacao < 25) {

        dados.saude -= 1;
    }

    if (dados.energia < 25) {

        dados.saude -= 1;
        dados.mental -= 0.5;
    }

    if (dados.mental < 25) {

        dados.felicidade -= 0.5;
    }


    atualizarInterface();

}, 10000);


/* =========================================
   VERIFICAR ESTADO DO PET
========================================= */

function verificarEstadoPet() {

    const mensagem = document.getElementById("mensagemPet");

    if (dados.saude <= 20) {

        mensagem.innerText =
            "😟 Estou muito fraco... precisamos cuidar dos hábitos!";

    } else if (dados.hidratacao <= 20) {

        mensagem.innerText =
            "💧 Estou com sede... que tal beber água?";

    } else if (dados.energia <= 20) {

        mensagem.innerText =
            "😴 Estou cansado... precisamos descansar!";

    } else if (dados.mental <= 20) {

        mensagem.innerText =
            "🧠 Preciso de uma pausa... vamos cuidar da mente!";

    }
}


/* =========================================
   LOJA
========================================= */

function comprarItem(nome, preco) {

    if (dados.biopontos < preco) {

        mostrarNotificacao(
            "Você precisa de mais BioPontos!"
        );

        return;
    }


    dados.biopontos -= preco;

    mostrarNotificacao(
        "🎁 Você comprou: " + nome + "!"
    );

    atualizarInterface();
}


/* =========================================
   NOTIFICAÇÃO
========================================= */

function mostrarNotificacao(texto) {

    const notificacao =
        document.getElementById("notificacao");

    notificacao.innerText = texto;

    notificacao.classList.add("mostrar");


    setTimeout(function() {

        notificacao.classList.remove("mostrar");

    }, 2500);
}


/* =========================================
   INICIALIZAÇÃO
========================================= */

carregarDados();