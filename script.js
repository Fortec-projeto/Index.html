
"use strict";

/* =========================================================
   VITAPET — EXPOTEC
   MOTOR PRINCIPAL DO JOGO

   Objetivos:
   - Preservar o personagem original
   - Funcionar com diferentes versões do HTML
   - Proteger o progresso salvo
   - Manter as regras originais dos hábitos
   - Atualizar a interface sem erros
   - Oferecer uma experiência agradável e responsiva
========================================================= */


/* =========================================================
   01. CONFIGURAÇÕES
========================================================= */

const CONFIG = Object.freeze({
    nome: "VitaPet",
    versaoDados: 5,

    armazenamento: {
        principal: "vitapetDados",
        backup: "vitapetDados_backup",
        antigo: [
            "vitapet_v4",
            "vitapet_v4_backup"
        ]
    },

    intervaloTempo: 10000,
    intervaloSalvamento: 15000,

    pontosPorNivel: 100,
    maximoStatus: 100,
    maximoNome: 20,
    maximoHistorico: 100,

    duracaoNotificacao: 3200,
    duracaoAnimacao: 750,

    intervaloMinimoClique: 450
});


/* =========================================================
   02. REGRAS DAS ATIVIDADES
========================================================= */

const ATIVIDADES = Object.freeze({
    agua: {
        nome: "Beber água",
        emoji: "💧",
        pontos: 10,
        alteracoes: {
            hidratacao: 10,
            bioenergia: 5
        },
        mensagem:
            "💧 Muito bem! A hidratação é importante para a saúde!"
    },

    sono: {
        nome: "Dormir",
        emoji: "😴",
        pontos: 30,
        alteracoes: {
            energia: 15,
            mental: 5
        },
        mensagem:
            "😴 Dormir bem ajuda a recuperar as energias!"
    },

    exercicio: {
        nome: "Exercício",
        emoji: "🏃",
        pontos: 25,
        alteracoes: {
            felicidade: 15,
            energia: -5,
            saude: 5
        },
        mensagem:
            "🏃 Boa! Movimentar o corpo faz muito bem!"
    },

    alimentacao: {
        nome: "Alimentação saudável",
        emoji: "🥗",
        pontos: 20,
        alteracoes: {
            saude: 10,
            energia: 5
        },
        mensagem:
            "🥗 Uma alimentação equilibrada ajuda seu corpo!"
    },

    pausa: {
        nome: "Pausa ativa",
        emoji: "🧘",
        pontos: 15,
        alteracoes: {
            mental: 10,
            felicidade: 5
        },
        mensagem:
            "🧘 Ótima escolha! A mente também precisa de cuidados!"
    }
});


/* =========================================================
   03. ACESSÓRIOS LEGADOS

   A loja foi retirada do HTML novo.
   Estes dados são mantidos para não perder
   compras feitas em versões anteriores.
========================================================= */

const ITENS_LOJA = Object.freeze({
    "Chapéu": {
        preco: 50,
        elemento: "acessorioChapeu",
        botao: "btnChapeu",
        emoji: "🎩"
    },

    "Óculos": {
        preco: 75,
        elemento: "acessorioOculos",
        botao: "btnOculos",
        emoji: "👓"
    },

    "Mochila": {
        preco: 100,
        elemento: "acessorioMochila",
        botao: "btnMochila",
        emoji: "🎒"
    }
});


/* =========================================================
   04. UTILITÁRIOS
========================================================= */

const elemento = id => document.getElementById(id);

function escrever(id, texto) {
    const alvo = elemento(id);

    if (alvo) {
        alvo.textContent = String(texto);
    }
}

function definirLargura(id, porcentagem) {
    const alvo = elemento(id);

    if (!alvo) return;

    alvo.style.width =
        limitar(porcentagem, 0, 100) + "%";
}

function numeroSeguro(valor, padrao = 0) {
    if (valor === null || valor === undefined || valor === "") {
        return padrao;
    }

    const numero = Number(valor);

    return Number.isFinite(numero)
        ? numero
        : padrao;
}

function inteiroSeguro(valor, padrao = 0) {
    return Math.max(
        0,
        Math.floor(numeroSeguro(valor, padrao))
    );
}

function limitar(valor, minimo = 0, maximo = 100) {
    return Math.min(
        maximo,
        Math.max(minimo, numeroSeguro(valor))
    );
}

function listaSegura(valor) {
    return Array.isArray(valor)
        ? valor
        : [];
}

function formatarNumero(valor) {
    return Math.floor(valor).toLocaleString("pt-BR");
}

function dataAtual() {
    return new Date().toLocaleString("pt-BR");
}

function movimentoReduzido() {
    return window.matchMedia &&
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
}

function criarElemento(tag, classe, texto) {
    const novo = document.createElement(tag);

    if (classe) {
        novo.className = classe;
    }

    if (texto !== undefined) {
        novo.textContent = String(texto);
    }

    return novo;
}


/* =========================================================
   05. ESTADO INICIAL
========================================================= */

function dadosIniciais() {
    return {
        versao: CONFIG.versaoDados,

        nome: "",

        saude: 100,
        hidratacao: 100,
        energia: 100,
        felicidade: 100,
        mental: 100,
        bioenergia: 100,

        biopontos: 0,
        pontosTotais: 0,
        nivel: 1,

        agua: 0,
        sono: 0,
        exercicio: 0,
        alimentacao: 0,
        pausa: 0,

        itensComprados: [],
        itensEquipados: [],

        historico: [],
        conquistas: [],

        ultimaMensagem:
            "Estou pronto para começar nossa aventura! 💚",

        criadoEm: null,
        atualizadoEm: null
    };
}

let dados = dadosIniciais();

const CONTROLE = {
    armazenamentoDisponivel: false,
    notificacaoTimer: null,
    animacaoTimer: null,
    salvamentoTimer: null,
    ultimaAcao: "",
    ultimoClique: 0,
    ultimaTela: "telaInicio",
    iniciado: false,
    erroSalvamentoAvisado: false
};


/* =========================================================
   06. VALIDAÇÃO DOS DADOS
========================================================= */

const STATUS = [
    "saude",
    "hidratacao",
    "energia",
    "felicidade",
    "mental",
    "bioenergia"
];

const CONTADORES = [
    "agua",
    "sono",
    "exercicio",
    "alimentacao",
    "pausa"
];

function normalizarDados(origem) {
    const novo = dadosIniciais();

    if (
        !origem ||
        typeof origem !== "object" ||
        Array.isArray(origem)
    ) {
        return novo;
    }

    novo.nome =
        typeof origem.nome === "string"
            ? origem.nome.trim().slice(0, CONFIG.maximoNome)
            : "";

    STATUS.forEach(chave => {
        novo[chave] = limitar(
            numeroSeguro(origem[chave], 100)
        );
    });

    CONTADORES.forEach(chave => {
        novo[chave] = inteiroSeguro(origem[chave]);
    });

    novo.biopontos = inteiroSeguro(
        origem.biopontos
    );

    const nivelAnterior = Math.max(
        1,
        inteiroSeguro(origem.nivel, 1)
    );

    novo.pontosTotais = Math.max(
        novo.biopontos,
        inteiroSeguro(origem.pontosTotais),
        (nivelAnterior - 1) * CONFIG.pontosPorNivel
    );

    novo.nivel =
        Math.floor(
            novo.pontosTotais / CONFIG.pontosPorNivel
        ) + 1;

    const itensAntigos =
        origem.itensComprados ||
        origem.itens ||
        origem.inventario ||
        [];

    novo.itensComprados = [
        ...new Set(
            listaSegura(itensAntigos).filter(
                nome => Object.prototype.hasOwnProperty.call(
                    ITENS_LOJA,
                    nome
                )
            )
        )
    ];

    const equipadosAntigos =
        origem.itensEquipados ||
        origem.equipados ||
        [];

    novo.itensEquipados = [
        ...new Set(
            listaSegura(equipadosAntigos).filter(
                nome => novo.itensComprados.includes(nome)
            )
        )
    ];

    novo.historico = listaSegura(origem.historico)
        .filter(item =>
            item &&
            typeof item === "object" &&
            typeof item.nome === "string"
        )
        .slice(0, CONFIG.maximoHistorico)
        .map(item => ({
            nome: item.nome.slice(0, 60),
            pontos: inteiroSeguro(item.pontos),
            data:
                typeof item.data === "string"
                    ? item.data.slice(0, 50)
                    : "",
            tipo:
                typeof item.tipo === "string"
                    ? item.tipo
                    : ""
        }));

    novo.conquistas = [
        ...new Set(
            listaSegura(origem.conquistas)
                .filter(valor => typeof valor === "string")
        )
    ];

    if (typeof origem.ultimaMensagem === "string") {
        novo.ultimaMensagem =
            origem.ultimaMensagem.slice(0, 200);
    }

    novo.criadoEm =
        typeof origem.criadoEm === "string"
            ? origem.criadoEm
            : null;

    novo.atualizadoEm =
        typeof origem.atualizadoEm === "string"
            ? origem.atualizadoEm
            : null;

    return novo;
}

function limitarStatus() {
    STATUS.forEach(chave => {
        dados[chave] = limitar(dados[chave]);
    });
}


/* =========================================================
   07. ARMAZENAMENTO SEGURO
========================================================= */

function verificarArmazenamento() {
    try {
        const teste = "__vitapet_teste__";

        localStorage.setItem(teste, "ok");

        const sucesso =
            localStorage.getItem(teste) === "ok";

        localStorage.removeItem(teste);

        CONTROLE.armazenamentoDisponivel = sucesso;

    } catch (erro) {
        CONTROLE.armazenamentoDisponivel = false;

        console.warn(
            "VitaPet: armazenamento indisponível.",
            erro
        );
    }

    return CONTROLE.armazenamentoDisponivel;
}

function salvarDados() {
    if (!CONTROLE.armazenamentoDisponivel) {
        return false;
    }

    try {
        dados.atualizadoEm = new Date().toISOString();

        const texto = JSON.stringify(dados);

        localStorage.setItem(
            CONFIG.armazenamento.principal,
            texto
        );

        if (
            localStorage.getItem(
                CONFIG.armazenamento.principal
            ) !== texto
        ) {
            throw new Error(
                "O salvamento não foi confirmado."
            );
        }

        try {
            localStorage.setItem(
                CONFIG.armazenamento.backup,
                texto
            );
        } catch (erroBackup) {
            console.warn(
                "Backup não atualizado:",
                erroBackup
            );
        }

        CONTROLE.erroSalvamentoAvisado = false;

        return true;

    } catch (erro) {
        console.error(
            "VitaPet: falha ao salvar.",
            erro
        );

        if (!CONTROLE.erroSalvamentoAvisado) {
            mostrarNotificacao(
                "⚠️ Não foi possível salvar o progresso.",
                "erro"
            );

            CONTROLE.erroSalvamentoAvisado = true;
        }

        return false;
    }
}

function carregarDados() {
    if (!verificarArmazenamento()) {
        return false;
    }

    const chaves = [
        CONFIG.armazenamento.principal,
        CONFIG.armazenamento.backup,
        ...CONFIG.armazenamento.antigo
    ];

    for (const chave of chaves) {
        try {
            const texto = localStorage.getItem(chave);

            if (!texto) continue;

            const objeto = JSON.parse(texto);

            const origem =
                objeto?.aplicativo === "VitaPet" &&
                objeto?.dados
                    ? objeto.dados
                    : objeto;

            if (
                origem &&
                typeof origem === "object" &&
                typeof origem.nome === "string"
            ) {
                dados = normalizarDados(origem);

                console.info(
                    "VitaPet: progresso recuperado."
                );

                return true;
            }

        } catch (erro) {
            console.warn(
                "Não foi possível recuperar:",
                chave,
                erro
            );
        }
    }

    return false;
}


/* =========================================================
   08. NAVEGAÇÃO ENTRE TELAS
========================================================= */

function mostrarTela(id) {
    const destino = elemento(id);

    if (!destino) {
        console.warn(
            "VitaPet: tela não encontrada:",
            id
        );

        return false;
    }

    document.querySelectorAll(".tela").forEach(tela => {
        tela.classList.remove("ativa");
        tela.setAttribute("aria-hidden", "true");
    });

    destino.classList.add("ativa");
    destino.removeAttribute("aria-hidden");

    CONTROLE.ultimaTela = id;

    atualizarInterface();

    window.scrollTo({
        top: 0,
        behavior: "auto"
    });

    return true;
}

function iniciarJogo() {
    if (dados.nome) {
        mostrarTela("telaPrincipal");
    } else {
        mostrarTela("telaCriador");

        setTimeout(() => {
            elemento("nomePet")?.focus();
        }, 100);
    }
}


/* =========================================================
   09. CRIAÇÃO DO PERSONAGEM
========================================================= */

function criarPet(evento) {
    if (evento?.preventDefault) {
        evento.preventDefault();
    }

    const campo = elemento("nomePet");

    if (!campo) {
        mostrarNotificacao(
            "⚠️ Campo do nome não encontrado.",
            "erro"
        );

        return false;
    }

    const nome = campo.value
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, CONFIG.maximoNome);

    const erroNome = elemento("erroNome");

    if (!nome) {
        if (erroNome) {
            erroNome.textContent =
                "Digite um nome para seu VitaPet.";
        }

        campo.focus();

        mostrarNotificacao(
            "🐾 Escolha um nome para seu amigo!"
        );

        return false;
    }

    if (erroNome) {
        erroNome.textContent = "";
    }

    const nomeAnterior = dados.nome;

    dados.nome = nome;

    if (!dados.criadoEm) {
        dados.criadoEm = new Date().toISOString();
    }

    dados.ultimaMensagem =
        `Olá! Eu sou ${nome}! Vamos cuidar da nossa saúde juntos! 💚`;

    salvarDados();
    mostrarTela("telaPrincipal");

    if (!nomeAnterior) {
        mostrarNotificacao(
            `💚 ${nome} chegou! Sua aventura começou!`
        );

        criarConfetes();
    } else {
        mostrarNotificacao(
            "💚 Nome atualizado com sucesso!"
        );
    }

    return true;
}


/* =========================================================
   10. BIOPONTOS E EXPERIÊNCIA
========================================================= */

function ganharPontos(valor) {
    const pontos = inteiroSeguro(valor);

    if (pontos <= 0) return false;

    const nivelAnterior = dados.nivel;

    dados.biopontos += pontos;

    // Regra original do projeto:
    // metade dos pontos também aumenta a Bioenergia.
    dados.bioenergia += pontos / 2;

    // Experiência não diminui com compras.
    dados.pontosTotais += pontos;

    dados.nivel =
        Math.floor(
            dados.pontosTotais / CONFIG.pontosPorNivel
        ) + 1;

    if (dados.nivel > nivelAnterior) {
        setTimeout(() => {
            criarConfetes();

            mostrarNotificacao(
                `🏆 Novo nível desbloqueado: ${dados.nivel}!`,
                "sucesso"
            );
        }, 450);

        return true;
    }

    return false;
}


/* =========================================================
   11. MOTOR DAS ATIVIDADES
========================================================= */

function podeExecutarAcao(tipo) {
    const agora = Date.now();

    if (
        CONTROLE.ultimaAcao === tipo &&
        agora - CONTROLE.ultimoClique <
            CONFIG.intervaloMinimoClique
    ) {
        return false;
    }

    CONTROLE.ultimaAcao = tipo;
    CONTROLE.ultimoClique = agora;

    return true;
}

function executarAtividade(tipo) {
    const atividade = ATIVIDADES[tipo];

    if (!atividade) {
        console.warn(
            "Atividade desconhecida:",
            tipo
        );

        return false;
    }

    if (!dados.nome) {
        mostrarNotificacao(
            "🐾 Crie seu VitaPet primeiro!"
        );

        mostrarTela("telaCriador");

        return false;
    }

    if (!podeExecutarAcao(tipo)) {
        return false;
    }

    Object.entries(atividade.alteracoes).forEach(
        ([atributo, valor]) => {
            if (typeof dados[atributo] === "number") {
                dados[atributo] += valor;
            }
        }
    );

    dados[tipo] += 1;

    ganharPontos(atividade.pontos);

    dados.ultimaMensagem = atividade.mensagem;

    dados.historico.unshift({
        nome: atividade.nome,
        pontos: atividade.pontos,
        tipo,
        data: dataAtual()
    });

    dados.historico = dados.historico.slice(
        0,
        CONFIG.maximoHistorico
    );

    limitarStatus();

    verificarConquistas();

    atualizarInterface();

    animarPet();

    mostrarNotificacao(
        `${atividade.emoji} ${atividade.nome}: +${atividade.pontos} BioPontos!`,
        "sucesso"
    );

    return true;
}


/* =========================================================
   12. FUNÇÕES COMPATÍVEIS COM O HTML
========================================================= */

function beberAgua() {
    return executarAtividade("agua");
}

function dormir() {
    return executarAtividade("sono");
}

function exercicio() {
    return executarAtividade("exercicio");
}

function alimentacao() {
    return executarAtividade("alimentacao");
}

function pausaAtiva() {
    return executarAtividade("pausa");
}


/* =========================================================
   13. PASSAGEM DO TEMPO
========================================================= */

function passagemDoTempo() {
    if (!dados.nome) return;

    dados.hidratacao -= 1;
    dados.energia -= 0.5;
    dados.felicidade -= 0.3;
    dados.mental -= 0.2;

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

    limitarStatus();

    atualizarInterface();
}


/* =========================================================
   14. EXPRESSÕES DO PERSONAGEM

   Não altera:
   - formato do corpo
   - orelhas
   - olhos originais
   - boca original
   - bochechas originais

   Apenas aplica classes já previstas no CSS.
========================================================= */

function obterEstadoPet() {
    if (dados.saude <= 20) {
        return {
            classe: "triste",
            humor: "😟 Precisa de cuidado",
            mensagem:
                "Estou precisando de mais cuidados com a saúde!"
        };
    }

    if (dados.hidratacao <= 20) {
        return {
            classe: "triste",
            humor: "💧 Com sede",
            mensagem:
                "Estou com sede! Vamos cuidar da hidratação?"
        };
    }

    if (dados.energia <= 20) {
        return {
            classe: "cansado",
            humor: "😴 Cansado",
            mensagem:
                "Estou cansado! Precisamos descansar."
        };
    }

    if (dados.mental <= 20) {
        return {
            classe: "triste",
            humor: "🧠 Precisa de pausa",
            mensagem:
                "Que tal uma pausa para descansar a mente?"
        };
    }

    if (dados.felicidade <= 20) {
        return {
            classe: "triste",
            humor: "😔 Tristinho",
            mensagem:
                "Uma atividade agradável pode melhorar meu humor!"
        };
    }

    return {
        classe: "",
        humor: "😊 Feliz",
        mensagem: dados.ultimaMensagem
    };
}

function verificarEstadoPet() {
    const pet = elemento("petPrincipal");
    const estado = obterEstadoPet();

    if (pet) {
        pet.classList.remove(
            "triste",
            "cansado"
        );

        if (estado.classe) {
            pet.classList.add(estado.classe);
        }
    }

    escrever("mensagemPet", estado.mensagem);
    escrever("humorPet", estado.humor);
}

function animarPet() {
    const pet = elemento("petPrincipal");

    if (!pet || movimentoReduzido()) {
        return;
    }

    clearTimeout(CONTROLE.animacaoTimer);

    // Compatibilidade com os dois nomes de classe.
    pet.classList.remove(
        "comemorando",
        "festejar"
    );

    void pet.offsetWidth;

    pet.classList.add(
        "comemorando",
        "festejar"
    );

    CONTROLE.animacaoTimer = setTimeout(() => {
        pet.classList.remove(
            "comemorando",
            "festejar"
        );
    }, CONFIG.duracaoAnimacao);
}


/* =========================================================
   15. ATUALIZAÇÃO DOS STATUS
========================================================= */

function atualizarBarras() {
    const atributos = [
        "saude",
        "hidratacao",
        "energia",
        "felicidade",
        "mental"
    ];

    atributos.forEach(atributo => {
        const valor = limitar(dados[atributo]);

        escrever(
            atributo + "Valor",
            Math.round(valor)
        );

        definirLargura(
            atributo + "Barra",
            valor
        );

        const barra = elemento(
            atributo + "Barra"
        );

        if (barra) {
            barra.classList.toggle(
                "alerta",
                valor <= 25
            );

            barra.classList.toggle(
                "baixo",
                valor <= 25
            );

            barra.setAttribute(
                "role",
                "progressbar"
            );

            barra.setAttribute(
                "aria-valuemin",
                "0"
            );

            barra.setAttribute(
                "aria-valuemax",
                "100"
            );

            barra.setAttribute(
                "aria-valuenow",
                String(Math.round(valor))
            );
        }
    });
}


/* =========================================================
   16. EVOLUÇÃO E NÍVEIS
========================================================= */

function atualizarEvolucao() {
    dados.nivel =
        Math.floor(
            dados.pontosTotais / CONFIG.pontosPorNivel
        ) + 1;

    const xp =
        dados.pontosTotais % CONFIG.pontosPorNivel;

    const progresso =
        xp / CONFIG.pontosPorNivel * 100;

    escrever(
        "nivelPet",
        `Nível ${dados.nivel}`
    );

    escrever(
        "nivelCabecalho",
        `Nível ${dados.nivel}`
    );

    escrever(
        "xpTexto",
        `${xp} / ${CONFIG.pontosPorNivel} XP`
    );

    escrever(
        "xpResumo",
        `${xp} / ${CONFIG.pontosPorNivel} XP`
    );

    escrever(
        "pontosAcumulados",
        `${formatarNumero(dados.pontosTotais)} pontos conquistados no total`
    );

    definirLargura(
        "xpPreenchido",
        progresso
    );

    definirLargura(
        "xpResumoBarra",
        progresso
    );
}


/* =========================================================
   17. ESTATÍSTICAS
========================================================= */

function totalAtividades() {
    return CONTADORES.reduce(
        (total, chave) => total + dados[chave],
        0
    );
}

function atualizarEstatisticas() {
    escrever("aguaTotal", dados.agua);
    escrever("sonoTotal", dados.sono);

    escrever(
        "exercicioTotal",
        dados.exercicio
    );

    escrever(
        "alimentacaoTotal",
        dados.alimentacao
    );

    escrever(
        "pausaTotal",
        dados.pausa
    );

    escrever(
        "atividadesTotal",
        totalAtividades()
    );

    atualizarGrafico();
}


/* =========================================================
   18. GRÁFICO DE ATIVIDADES

   Renderizado somente quando o HTML
   possui a área graficoAtividades.
========================================================= */

function atualizarGrafico() {
    const area = elemento("graficoAtividades");

    if (!area) return;

    const atividades = [
        {
            nome: "💧 Água",
            valor: dados.agua
        },
        {
            nome: "😴 Sono",
            valor: dados.sono
        },
        {
            nome: "🏃 Exercício",
            valor: dados.exercicio
        },
        {
            nome: "🥗 Alimentação",
            valor: dados.alimentacao
        },
        {
            nome: "🧘 Pausa ativa",
            valor: dados.pausa
        }
    ];

    const maior = Math.max(
        1,
        ...atividades.map(item => item.valor)
    );

    const fragmento = document.createDocumentFragment();

    atividades.forEach(atividade => {
        const linha = criarElemento(
            "div",
            "grafico-linha"
        );

        const cabecalho = criarElemento("div");

        cabecalho.style.display = "flex";
        cabecalho.style.justifyContent =
            "space-between";

        const nome = criarElemento(
            "span",
            "",
            atividade.nome
        );

        const valor = criarElemento(
            "strong",
            "",
            atividade.valor
        );

        cabecalho.append(nome, valor);

        const trilho = criarElemento(
            "div",
            "grafico-trilho"
        );

        trilho.style.height = "12px";
        trilho.style.borderRadius = "20px";
        trilho.style.background = "#e7f3eb";
        trilho.style.overflow = "hidden";
        trilho.style.marginTop = "9px";

        const barra = criarElemento(
            "div",
            "grafico-barra"
        );

        barra.style.width =
            (atividade.valor / maior * 100) + "%";

        barra.style.height = "100%";
        barra.style.borderRadius = "20px";

        barra.style.background =
            "linear-gradient(90deg, #19a977, #8bdab0)";

        trilho.appendChild(barra);
        linha.append(cabecalho, trilho);

        linha.style.marginBottom = "18px";

        fragmento.appendChild(linha);
    });

    area.replaceChildren(fragmento);
}


/* =========================================================
   19. HISTÓRICO DE ATIVIDADES
========================================================= */

function atualizarHistorico() {
    const area = elemento("historicoAtividades");

    if (!area) return;

    if (dados.historico.length === 0) {
        const vazio = criarElemento(
            "p",
            "",
            "Nenhuma atividade registrada ainda. Comece cuidando do seu VitaPet!"
        );

        area.replaceChildren(vazio);
        return;
    }

    const fragmento = document.createDocumentFragment();

    dados.historico
        .slice(0, 20)
        .forEach(atividade => {
            const linha = criarElemento(
                "div",
                "historico-item"
            );

            linha.style.display = "flex";
            linha.style.justifyContent =
                "space-between";
            linha.style.alignItems = "center";
            linha.style.gap = "15px";
            linha.style.padding = "13px 0";
            linha.style.borderBottom =
                "1px solid #e6f0e9";

            const descricao = criarElemento(
                "span",
                "",
                `${atividade.nome} · ${atividade.data}`
            );

            const pontos = criarElemento(
                "strong",
                "",
                `+${atividade.pontos} ⭐`
            );

            pontos.style.color = "#19986c";

            linha.append(
                descricao,
                pontos
            );

            fragmento.appendChild(linha);
        });

    area.replaceChildren(fragmento);
}


/* =========================================================
   20. CONQUISTAS

   São registradas automaticamente.
   Não concedem pontos extras.
========================================================= */

const CONQUISTAS = [
    {
        id: "primeiro-passo",
        nome: "Primeiro passo",
        descricao: "Realizar a primeira atividade",
        emoji: "🌱",
        condicao: () => totalAtividades() >= 1
    },
    {
        id: "hidratacao-5",
        nome: "Amigo da água",
        descricao: "Registrar água 5 vezes",
        emoji: "💧",
        condicao: () => dados.agua >= 5
    },
    {
        id: "movimento-5",
        nome: "Em movimento",
        descricao: "Registrar 5 exercícios",
        emoji: "🏃",
        condicao: () => dados.exercicio >= 5
    },
    {
        id: "mente-tranquila",
        nome: "Mente tranquila",
        descricao: "Registrar 5 pausas",
        emoji: "🧘",
        condicao: () => dados.pausa >= 5
    },
    {
        id: "dez-habitos",
        nome: "Boa rotina",
        descricao: "Registrar 10 atividades",
        emoji: "⭐",
        condicao: () => totalAtividades() >= 10
    },
    {
        id: "nivel-cinco",
        nome: "Grande evolução",
        descricao: "Alcançar o nível 5",
        emoji: "🏆",
        condicao: () => dados.nivel >= 5
    }
];

function verificarConquistas() {
    CONQUISTAS.forEach(conquista => {
        if (
            conquista.condicao() &&
            !dados.conquistas.includes(conquista.id)
        ) {
            dados.conquistas.push(conquista.id);

            setTimeout(() => {
                mostrarNotificacao(
                    `${conquista.emoji} Conquista: ${conquista.nome}!`,
                    "sucesso"
                );
            }, 900);
        }
    });

    atualizarConquistas();
}

function atualizarConquistas() {
    const area = elemento("listaConquistas");

    if (!area) return;

    const fragmento = document.createDocumentFragment();

    CONQUISTAS.forEach(conquista => {
        const desbloqueada =
            dados.conquistas.includes(conquista.id);

        const card = criarElemento(
            "article",
            "conquista" +
                (desbloqueada ? "" : " bloqueada")
        );

        const icone = criarElemento(
            "div",
            "icone",
            conquista.emoji
        );

        const titulo = criarElemento(
            "h3",
            "",
            conquista.nome
        );

        const descricao = criarElemento(
            "p",
            "",
            conquista.descricao
        );

        const situacao = criarElemento(
            "small",
            "",
            desbloqueada
                ? "✓ Conquistada"
                : "🔒 Bloqueada"
        );

        card.append(
            icone,
            titulo,
            descricao,
            situacao
        );

        fragmento.appendChild(card);
    });

    area.replaceChildren(fragmento);
}


/* =========================================================
   21. RANKING DEMONSTRATIVO

   Não é um ranking online.
   Os demais participantes são fictícios.
========================================================= */

function obterRanking() {
    return [
        {
            nome: dados.nome || "Você",
            pontos: dados.pontosTotais,
            voce: true
        },
        {
            nome: "Lucas",
            pontos: 420,
            voce: false
        },
        {
            nome: "Mariana",
            pontos: 380,
            voce: false
        },
        {
            nome: "Gabriel",
            pontos: 310,
            voce: false
        }
    ].sort((a, b) => b.pontos - a.pontos);
}

function atualizarRanking() {
    escrever(
        "rankingPontos",
        `${formatarNumero(dados.pontosTotais)} pts`
    );

    const area = elemento("listaRanking");

    if (area) {
        const fragmento =
            document.createDocumentFragment();

        obterRanking().forEach((jogador, indice) => {
            const linha = criarElemento(
                "div",
                "ranking-item" +
                    (jogador.voce ? " voce primeiro" : "")
            );

            const posicao = criarElemento(
                "span",
                "posicao",
                ["🥇", "🥈", "🥉"][indice] ||
                    `${indice + 1}º`
            );

            const nome = criarElemento(
                "b",
                "",
                jogador.nome +
                    (jogador.voce ? " (você)" : "")
            );

            const pontos = criarElemento(
                "strong",
                "",
                `${formatarNumero(jogador.pontos)} pts`
            );

            linha.append(
                posicao,
                nome,
                pontos
            );

            fragmento.appendChild(linha);
        });

        area.replaceChildren(fragmento);
    }

    // Compatibilidade com o ranking fixo
    // do HTML novo aprovado.
    const rankingFixo = document.querySelector(
        "#telaRanking .ranking:not(#listaRanking)"
    );

    if (rankingFixo) {
        const primeiraLinha =
            rankingFixo.querySelector(".ranking-item");

        if (primeiraLinha) {
            const nome = primeiraLinha.querySelector("b");
            const pontos =
                primeiraLinha.querySelector("strong");

            if (nome) {
                nome.textContent =
                    `${dados.nome || "Você"} (você)`;
            }

            if (pontos) {
                pontos.textContent =
                    `${formatarNumero(dados.pontosTotais)} pts`;
            }
        }
    }
}


/* =========================================================
   22. LOJA ANTIGA

   Mantida apenas para compatibilidade
   com dados e HTML anteriores.
========================================================= */

function comprarItem(nome, preco) {
    const item = ITENS_LOJA[nome];

    if (!item || item.preco !== Number(preco)) {
        return false;
    }

    if (!dados.nome) {
        mostrarNotificacao(
            "Crie seu VitaPet primeiro!"
        );

        return false;
    }

    const comprado =
        dados.itensComprados.includes(nome);

    const equipado =
        dados.itensEquipados.includes(nome);

    if (!comprado) {
        if (dados.biopontos < item.preco) {
            mostrarNotificacao(
                `⭐ Você precisa de ${item.preco} BioPontos para comprar ${nome}.`
            );

            return false;
        }

        dados.biopontos -= item.preco;

        dados.itensComprados.push(nome);
        dados.itensEquipados.push(nome);

        mostrarNotificacao(
            `🎉 ${nome} comprado!`
        );

    } else if (equipado) {
        dados.itensEquipados =
            dados.itensEquipados.filter(
                itemAtual => itemAtual !== nome
            );

        mostrarNotificacao(
            `${item.emoji} ${nome} guardado!`
        );

    } else {
        dados.itensEquipados.push(nome);

        mostrarNotificacao(
            `${item.emoji} ${nome} equipado!`
        );
    }

    atualizarInterface();
    animarPet();

    return true;
}

function atualizarAcessorios() {
    Object.entries(ITENS_LOJA).forEach(
        ([nome, item]) => {
            const acessorio = elemento(item.elemento);

            if (!acessorio) return;

            acessorio.hidden =
                !dados.itensEquipados.includes(nome);
        }
    );
}

function atualizarLoja() {
    escrever(
        "saldoLoja",
        formatarNumero(dados.biopontos)
    );

    Object.entries(ITENS_LOJA).forEach(
        ([nome, item]) => {
            const botao = elemento(item.botao);

            if (!botao) return;

            const comprado =
                dados.itensComprados.includes(nome);

            const equipado =
                dados.itensEquipados.includes(nome);

            botao.textContent = equipado
                ? "✓ Retirar acessório"
                : comprado
                    ? "Equipar novamente"
                    : `Comprar · ${item.preco} ⭐`;

            botao.classList.toggle(
                "equipado",
                equipado
            );
        }
    );

    atualizarAcessorios();
    atualizarInventario();
}

function atualizarInventario() {
    const area = elemento("inventario");

    if (!area) return;

    if (!dados.itensComprados.length) {
        area.replaceChildren(
            criarElemento(
                "p",
                "",
                "Nenhum acessório comprado ainda."
            )
        );

        return;
    }

    const fragmento =
        document.createDocumentFragment();

    dados.itensComprados.forEach(nome => {
        const item = ITENS_LOJA[nome];

        if (!item) return;

        const equipado =
            dados.itensEquipados.includes(nome);

        fragmento.appendChild(
            criarElemento(
                "div",
                "inventario-item",
                `${item.emoji} ${nome} · ${
                    equipado ? "Equipado" : "Guardado"
                }`
            )
        );
    });

    area.replaceChildren(fragmento);
}


/* =========================================================
   23. NOTIFICAÇÕES
========================================================= */

function mostrarNotificacao(texto, tipo = "normal") {
    const notificacao = elemento("notificacao");

    if (!notificacao) return;

    clearTimeout(CONTROLE.notificacaoTimer);

    notificacao.textContent = texto;

    notificacao.classList.remove(
        "sucesso",
        "erro"
    );

    if (tipo === "sucesso" || tipo === "erro") {
        notificacao.classList.add(tipo);
    }

    notificacao.classList.add("mostrar");

    // Estilo complementar para garantir
    // boa aparência mesmo sem CSS adicional.
    notificacao.style.zIndex = "9999";
    notificacao.style.background =
        tipo === "erro"
            ? "#a73e4c"
            : tipo === "sucesso"
                ? "#176e53"
                : "#174c40";

    CONTROLE.notificacaoTimer = setTimeout(() => {
        notificacao.classList.remove("mostrar");
    }, CONFIG.duracaoNotificacao);
}


/* =========================================================
   24. EFEITOS DE COMEMORAÇÃO
========================================================= */

function criarConfetes() {
    if (movimentoReduzido()) {
        return;
    }

    let area = elemento("efeitos");

    // O HTML novo não possui essa área.
    // Criamos automaticamente quando necessário.
    if (!area) {
        area = document.createElement("div");
        area.id = "efeitos";

        area.style.position = "fixed";
        area.style.inset = "0";
        area.style.zIndex = "9998";
        area.style.pointerEvents = "none";
        area.style.overflow = "hidden";

        document.body.appendChild(area);
    }

    const cores = [
        "#20b884",
        "#ffd26d",
        "#a993f3",
        "#ff9dab",
        "#81c9f5"
    ];

    for (let i = 0; i < 35; i++) {
        const confete = document.createElement("span");

        const tamanho = 6 + Math.random() * 7;
        const duracao = 1.8 + Math.random() * 1.3;
        const deslocamento =
            (Math.random() - 0.5) * 250;

        confete.style.position = "absolute";
        confete.style.left =
            Math.random() * 100 + "%";
        confete.style.top = "-20px";

        confete.style.width = tamanho + "px";
        confete.style.height =
            tamanho * 1.6 + "px";

        confete.style.borderRadius = "3px";

        confete.style.background =
            cores[i % cores.length];

        confete.style.opacity = "0.95";

        confete.animate(
            [
                {
                    transform:
                        "translate(0, 0) rotate(0deg)",
                    opacity: 1
                },
                {
                    transform:
                        `translate(${deslocamento}px, 105vh) rotate(720deg)`,
                    opacity: 0
                }
            ],
            {
                duration: duracao * 1000,
                delay: Math.random() * 400,
                easing: "ease-in",
                fill: "forwards"
            }
        );

        area.appendChild(confete);

        setTimeout(() => {
            confete.remove();
        }, duracao * 1000 + 600);
    }
}


/* =========================================================
   25. ATUALIZAÇÃO GERAL

   Todas as funções toleram elementos
   ausentes no HTML.
========================================================= */

function atualizarInterface() {
    limitarStatus();

    const nome = dados.nome || "Pet";

    escrever("nomePetTela", nome);
    escrever("nomeFala", nome);

    escrever(
        "bioenergia",
        Math.round(dados.bioenergia)
    );

    escrever(
        "biopontos",
        formatarNumero(dados.biopontos)
    );

    atualizarBarras();
    atualizarEvolucao();
    atualizarEstatisticas();
    atualizarHistorico();
    atualizarRanking();
    atualizarLoja();
    atualizarConquistas();
    verificarEstadoPet();

    salvarDados();
}


/* =========================================================
   26. EVENTOS DE FORMULÁRIO
========================================================= */

function configurarFormulario() {
    const formulario = elemento("formCriarPet");

    if (formulario) {
        formulario.addEventListener(
            "submit",
            criarPet
        );
    }

    const campo = elemento("nomePet");

    if (!campo) return;

    // O HTML aprovado já possui onkeydown.
    // Evitamos adicionar outro evento de Enter.
    if (
        !formulario &&
        !campo.hasAttribute("onkeydown")
    ) {
        campo.addEventListener(
            "keydown",
            evento => {
                if (evento.key === "Enter") {
                    evento.preventDefault();
                    criarPet();
                }
            }
        );
    }

    campo.addEventListener("input", () => {
        const erro = elemento("erroNome");

        if (erro) {
            erro.textContent = "";
        }
    });
}


/* =========================================================
   27. PROTEÇÃO CONTRA PERDA DE PROGRESSO
========================================================= */

function configurarSalvamentoAutomatico() {
    CONTROLE.salvamentoTimer = setInterval(
        () => {
            if (dados.nome) {
                salvarDados();
            }
        },
        CONFIG.intervaloSalvamento
    );

    window.addEventListener("pagehide", () => {
        salvarDados();
    });

    document.addEventListener(
        "visibilitychange",
        () => {
            if (document.hidden) {
                salvarDados();
            }
        }
    );
}


/* =========================================================
   28. PAUSA INTELIGENTE DO JOGO

   O tempo só avança quando a aba está
   visível. Isso evita penalizar o pet
   enquanto o navegador está fechado.
========================================================= */

function configurarPassagemDoTempo() {
    setInterval(() => {
        if (
            document.hidden ||
            !dados.nome
        ) {
            return;
        }

        passagemDoTempo();
    }, CONFIG.intervaloTempo);
}


/* =========================================================
   29. RECURSOS DE ACESSIBILIDADE
========================================================= */

function configurarAcessibilidade() {
    const notificacao = elemento("notificacao");

    if (notificacao) {
        notificacao.setAttribute(
            "role",
            "status"
        );

        notificacao.setAttribute(
            "aria-live",
            "polite"
        );

        notificacao.setAttribute(
            "aria-atomic",
            "true"
        );
    }

    const mensagem = elemento("mensagemPet");

    if (mensagem) {
        mensagem.setAttribute(
            "aria-live",
            "polite"
        );
    }
}


/* =========================================================
   30. VERIFICAÇÃO DA ESTRUTURA
========================================================= */

function verificarEstrutura() {
    const essenciais = [
        "telaInicio",
        "telaCriador",
        "telaPrincipal",
        "nomePet",
        "petPrincipal",
        "bioenergia",
        "biopontos"
    ];

    const ausentes = essenciais.filter(
        id => !elemento(id)
    );

    if (ausentes.length) {
        console.warn(
            "VitaPet: elementos HTML ausentes:",
            ausentes
        );
    } else {
        console.info(
            "VitaPet: estrutura principal encontrada."
        );
    }
}


/* =========================================================
   31. INICIALIZAÇÃO
========================================================= */

function inicializarVitaPet() {
    if (CONTROLE.iniciado) {
        return;
    }

    CONTROLE.iniciado = true;

    try {
        verificarEstrutura();

        carregarDados();

        configurarFormulario();
        configurarAcessibilidade();
        configurarSalvamentoAutomatico();
        configurarPassagemDoTempo();

        atualizarInterface();

        if (dados.nome) {
            mostrarTela("telaPrincipal");
        } else {
            mostrarTela("telaInicio");
        }

        console.info(
            "💚 VitaPet EXPOTEC iniciado."
        );

    } catch (erro) {
        console.error(
            "Erro ao inicializar VitaPet:",
            erro
        );

        const aviso = elemento(
            "erroInicializacao"
        );

        if (aviso) {
            aviso.textContent =
                "O VitaPet encontrou um problema ao iniciar.";
            aviso.hidden = false;
        }

        mostrarNotificacao(
            "⚠️ Ocorreu um problema ao iniciar o jogo.",
            "erro"
        );
    }
}


/* =========================================================
   32. INICIAR QUANDO O HTML ESTIVER PRONTO
========================================================= */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        inicializarVitaPet,
        { once: true }
    );
} else {
    inicializarVitaPet();
}


/* =========================================================
   33. FUNÇÕES GLOBAIS

   Necessárias porque o HTML utiliza
   atributos onclick.
========================================================= */

Object.assign(window, {
    mostrarTela,
    iniciarJogo,
    criarPet,

    beberAgua,
    dormir,
    exercicio,
    alimentacao,
    pausaAtiva,

    comprarItem
});


/* =========================================================
   FIM — VITAPET EXPOTEC
========================================================= */
