import { characterDatabase } from './database/characters.js';
import { documentsDatabase } from './database/documents.js';

const EmailsDatabase = [
    {
        id: 1,
        remetente: "Coordenação Central",
        assunto: "Relatório de estabilidade",
        data: "27/02/20?? - 08:12",
        conteudo: "Os sistemas do Observatório 9 permanecem operacionais.",
        lido: true
    },
    {
        id: 2,
        remetente: "Setor Externo",
        assunto: "Transmissão interrompida",
        data: "28/02/20?? - 23:47",
        conteudo: "Perdemos contato com duas estações secundárias.",
        lido: true
    },
    {
        id: 3,
        remetente: "???",
        assunto: "Você está sendo observado",
        data: "??/??/20?? - 04:13",
        conteudo: "Não confie nos relatórios da noite anterior.",
        lido: false
    }
];

// O Banco de dados de Itens fica aqui dentro para evitar erros de importação por enquanto!
const itemsDatabase = {
    "doc_id_comum": {
        id: "doc_id_comum",
        nome: "Identidade Civil Padrão",
        tipo: "Documento",
        icone: "🪪",
        descricao: "Documento de identificação padrão emitido pela Coalizão Central. Deve conter o selo holográfico verde e a data de validade ativa.",
        regrasValidação: "1. Foto precisa estar alinhada.\n2. O número de série nunca começa com '000'.\n3. Ano de emissão válido: pós-2022."
    },
    "doc_permissao_trabalho": {
        id: "doc_permissao_trabalho",
        nome: "Passe de Trabalho Externo",
        tipo: "Autorização",
        icone: "📜",
        descricao: "Emitido para operários que realizam manutenção nos filtros de ar externos do Observatório.",
        regrasValidação: "1. Deve possuir o carimbo do Setor de Engenharia.\n2. Válido apenas para o turno diurno."
    }
};

const gameState = {
    currentDay: 1,
    time: "21:34",
    emails: [...EmailsDatabase], 
    unlockedFiles: [], 
    historyLogs: [],
    insideObservatory: [],
    filaDoDia: [],
    rejectedOutside: []
};


/* ==========================================================================
   CONFIGURAÇÕES E SELETORES DA UI
   ========================================================================== */
const areaJanelas = document.getElementById("area-janelas");
const taskbar = document.getElementById("taskbar-apps");

let zIndex = 10;
const janelas = {};
const taskIcons = {};

const appIcons = {
    emails: "pixelarticons:mail",
    arquivos: "pixelarticons:folder",
    solicitacoes: "pixelarticons:radio-signal",
    quadro: "pixelarticons:link",
    registros: "pixelarticons:book"
};

const appsFullscreen = {
    solicitacoes: true,
    quadro: true
};

/* ==========================================================================
   LISTENERS DOS APLICATIVOS (CLIQUES NO DESKTOP)
   ========================================================================== */
document.getElementById("app-emails").addEventListener("click", abrirEmails);
document.getElementById("app-solicitacoes").addEventListener("click", criarJanelaSolicitacoes);
document.getElementById("app-arquivos").addEventListener("click", abrirArquivos);

document.getElementById("app-quadro").addEventListener("click", () =>
    criarJanelaSimples("Quadro", "<div class='detalhe-vazio'>📐 Quadro de investigação em desenvolvimento.</div>", "quadro")
);
document.getElementById("app-registros").addEventListener("click", () =>
    criarJanelaSimples("Registros", "<div class='detalhe-vazio'>📜 Histórico do Observatório vazio.</div>", "registros")
);

/* ==========================================================================
   SISTEMA DE GERENCIAMENTO DE JANELAS
   ========================================================================== */
function aplicarLayoutJanela(janela, tipoApp) {
    if (appsFullscreen?.[tipoApp]) {
        janela.classList.add("fullscreen");
        Object.assign(janela.style, {
            position: "absolute", top: "0", left: "0", right: "0", bottom: "60px", width: "auto", height: "auto"
        });
    } else {
        janela.classList.remove("fullscreen");
        Object.assign(janela.style, {
            position: "absolute", top: "60px", left: "60px", right: "auto", bottom: "auto",
            width: "min(900px, 92vw)", height: "min(600px, 75vh)"
        });
    }
}

function criarJanelaSimples(titulo, conteudo, tipoApp = "emails") {
    const janela = document.createElement("div");
    janela.classList.add("janela");

    const idJanela = Date.now();
    janelas[idJanela] = janela;

    aplicarLayoutJanela(janela, tipoApp);
    janela.style.zIndex = zIndex++;

    janela.innerHTML = `
        <div class="barra-janela">
            <span>${titulo}</span>
            <div class="botoes-janela">
                <button class="minimizar">_</button>
                <button class="fechar">X</button>
            </div>
        </div>
        <div class="conteudo-janela">${conteudo}</div>
    `;

    areaJanelas.appendChild(janela);

    janela.querySelector(".fechar").addEventListener("click", () => {
        janela.remove();
        delete janelas[idJanela];
        if (taskIcons[idJanela]) {
            taskIcons[idJanela].remove();
            delete taskIcons[idJanela];
        }
    });

    janela.querySelector(".minimizar").addEventListener("click", () => {
        janela.style.display = "none";
    });

    criarTaskbarIcone(idJanela, tipoApp);
    if (!appsFullscreen[tipoApp]) ativarDrag(janela, janela.querySelector(".barra-janela"));

    return idJanela;
}

function focarJanela(janela) {
    janela.style.zIndex = zIndex++;
}

/* ==========================================================================
   SISTEMA DE ARRASTAR JANELAS (DRAG)
   ========================================================================== */
function ativarDrag(janela, barra) {
    let offsetX = 0, offsetY = 0, arrastando = false, pointerId = null;

    barra.addEventListener("pointerdown", (e) => {
        if (e.target.closest("button")) return;
        arrastando = true;
        pointerId = e.pointerId;
        offsetX = e.clientX - janela.offsetLeft;
        offsetY = e.clientY - janela.offsetTop;
        focarJanela(janela);
        barra.setPointerCapture(pointerId);
    });

    barra.addEventListener("pointermove", (e) => {
        if (!arrastando || e.pointerId !== pointerId) return;
        janela.style.left = (e.clientX - offsetX) + "px";
        janela.style.top = (e.clientY - offsetY) + "px";
    });

    const parar = (e) => {
        if (e.pointerId !== pointerId) return;
        arrastando = false;
        pointerId = null;
    };

    barra.addEventListener("pointerup", parar);
    barra.addEventListener("pointercancel", parar);
    document.addEventListener("pointerup", parar);
}

/* ==========================================================================
   SISTEMA DA BARRA DE TAREFAS (TASKBAR)
   ========================================================================== */
function criarTaskbarIcone(id, tipoApp) {
    const icon = document.createElement("div");
    icon.classList.add("taskbar-icone");
    icon.innerHTML = `<iconify-icon icon="${appIcons[tipoApp] || "pixelarticons:question"}"></iconify-icon>`;

    icon.addEventListener("click", () => {
        const janela = janelas[id];
        if (!janela) return;
        janela.style.display = "flex";
        focarJanela(janela);
    });

    taskIcons[id] = icon;
    taskbar.appendChild(icon);
}

/* ==========================================================================
   APLICATIVO: E-MAILS
   ========================================================================== */
function abrirEmails() {
    const conteudo = `
        <div class="email-layout">
            <div class="email-lista" id="email-lista">${renderEmails()}</div>
            <div class="email-leitura" id="email-aberto">
                <p class="placeholder">Selecione um e-mail</p>
            </div>
        </div>
    `;
    criarJanelaSimples("Caixa de Entrada", conteudo, "emails");
}

function renderEmails() {
    return gameState.emails.map(email => `
        <div class="email-item ${email.lido ? 'lido' : 'nao-lido'}" data-id="${email.id}">
            <div class="email-topo">
                <strong>${email.remetente}</strong>
                ${email.lido ? "" : "<span class='ponto'>●</span>"}
            </div>
            <div class="email-assunto">${email.assunto}</div>
            <div class="email-data">${email.data}</div>
        </div>
    `).join("");
}

/* ==========================================================================
   APLICATIVO: ARQUIVOS (INTERFACE LIMPA E INTEGRADA)
   ========================================================================== */
function abrirArquivos() {
    const itensDesbloqueados = gameState.unlockedFiles.map(id => itemsDatabase[id]).filter(Boolean);
    let listaHTML = "";

    if (itensDesbloqueados.length === 0) {
        listaHTML = `
            <div class="arquivos-placeholder" style="padding: 15px; text-align: center; opacity: 0.4;">
                <p style="margin: 0; font-size: 11px;">[ SISTEMA DE ARQUIVOS VAZIO ]</p>
                <span style="font-size: 9px; display: block; margin-top: 5px; line-height: 1.2;">Nenhum documento scanneado no portão do Observatório hoje.</span>
            </div>
        `;
    } else {
        listaHTML = itensDesbloqueados.map(item => `
            <div class="arquivo-item" data-item-id="${item.id}">
                <span>${item.icone} ${item.nome}</span>
                <small style="display:block; opacity:0.6; font-size:9px; margin-top: 2px;">Tipo: ${item.tipo}</small>
            </div>
        `).join("");
    }

    const conteudo = `
        <div class="arquivos-layout" style="display: flex; height: 100%;">
            <div class="arquivos-lista" id="arquivos-lista" style="border-right: 1px solid #26422c; width: 35%; padding: 10px; overflow-y: auto;">
                ${listaHTML}
            </div>
            <div class="arquivos-detalhe" id="arquivos-detalhe" style="flex: 1; padding: 12px; overflow-y: auto;">
                <div class="detalhe-placeholder" style="opacity: 0.5; font-size: 11px; text-align: center; margin-top: 40px;">
                    Aguardando dados para análise de autenticidade.
                </div>
            </div>
        </div>
    `;

    criarJanelaSimples("Arquivos", conteudo, "arquivos");
}

/* ==========================================================================
   GERENCIADOR DE CLIQUES GLOBAIS (E-MAILS E ARQUIVOS)
   ========================================================================== */
document.addEventListener("click", (e) => {
    // 1. LÓGICA DE CLIQUE NOS EMAILS
    const itemEmail = e.target.closest(".email-item");
    if (itemEmail) {
        const id = Number(itemEmail.dataset.id);
        const email = gameState.emails.find(evt => evt.id === id);
        if (email) {
            email.lido = true;
            const lista = document.getElementById("email-lista");
            if (lista) lista.innerHTML = renderEmails();

            const box = document.getElementById("email-aberto");
            if (box) {
                box.innerHTML = `
                    <div class="email-conteudo">
                        <h3>${email.assunto}</h3>
                        <p class="remetente">De: ${email.remetente}</p>
                        <p class="data">${email.data}</p>
                        <br>
                        <p>${email.conteudo}</p>
                    </div>
                `;
            }
        }
        return;
    }

    // 2. LÓGICA DE CLIQUE NOS ARQUIVOS
    const itemArquivo = e.target.closest(".arquivo-item");
    if (itemArquivo) {
        const itemId = itemArquivo.dataset.itemId;
        const itemDados = itemsDatabase[itemId];
        if (!itemDados) return;

        const painelDetalhe = document.getElementById("arquivos-detalhe");
        if (!painelDetalhe) return;

        painelDetalhe.innerHTML = `
            <div class="detalhe-documento">
                <div style="display: flex; gap: 15px; align-items: center; border-bottom: 1px solid #26422c; padding-bottom: 12px;">
                    <div style="font-size: 30px; background: #102115; border: 1px solid #26422c; width: 45px; height: 45px; display:flex; align-items:center; justify-content:center;">
                        ${itemDados.icone}
                    </div>
                    <div>
                        <h2 style="margin:0; color: #8dff9a; font-size: 13px; text-transform: uppercase;">${itemDados.nome}</h2>
                        <p style="margin: 3px 0 0 0; opacity: 0.7; font-size: 9px;">Categoria: ${itemDados.tipo}</p>
                    </div>
                </div>
                <div style="margin-top: 15px;">
                    <h3 style="color: #8dff9a; font-size: 10px; margin-bottom: 4px;">PROPRIEDADES:</h3>
                    <p style="line-height: 1.4; opacity: 0.8; background: #0f1411; padding: 8px; border: 1px solid #1f2a24; margin:0; font-size: 11px;">
                        ${itemDados.descricao}
                    </p>
                </div>
                <div style="margin-top: 15px;">
                    <h3 style="color: #ff8d8d; font-size: 10px; margin-bottom: 4px;">DIRETRIZES DO MONITOR:</h3>
                    <div style="line-height: 1.4; opacity: 0.9; background: #1a1010; padding: 8px; border: 1px solid #422626; color: #ffcfe8; white-space: pre-line; font-size: 11px;">
                        ${itemDados.regrasValidação}
                    </div>
                </div>
            </div>
        `;
    }
});

/* ==========================================================================
   APLICATIVO: SOLICITAÇÕES
   ========================================================================== */

let npcAtual = null;
let paginasDialogo = [];
let paginaAtualIdx = 0;
let acaoPosDialogo = null;

function iniciarFilaDoDia() {
    const todosIds = Object.keys(characterDatabase);
    const quantidade = Math.floor(Math.random() * 2) + 4; 
    const embaralhado = todosIds.sort(() => 0.5 - Math.random());
    gameState.filaDoDia = embaralhado.slice(0, quantidade);
}

function criarJanelaSolicitacoes() {
    if (gameState.filaDoDia.length === 0 && gameState.insideObservatory.length === 0 && gameState.rejectedOutside.length === 0) {
        iniciarFilaDoDia();
    }

    criarJanelaSimples("Controle de Acesso", `
        <div class="solicitacoes-layout" style="display: flex; flex-direction: column; height: 100%; justify-content: space-between;">
            
            <!-- ÁREA SUPERIOR: MESA DE INSPEÇÃO (50%) -->
            <div id="area-mesa-trabalho" style="display: flex; height: 50%; border-bottom: 2px solid #26422c;">
                <!-- ESQUERDA: ITEM -->
                <div id="sol-item-container" style="width: 50%; border-right: 2px solid #26422c; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0b100c;">
                    <iconify-icon id="sol-item-visor" icon="" style="font-size: 60px; color: #8dff9a; filter: drop-shadow(0 0 10px rgba(141,255,154,0.2));"></iconify-icon>
                    <small id="sol-item-nome" style="font-size: 12px; opacity: 0.6; margin-top: 10px; text-align:center; color: #8dff9a; font-family: monospace; text-transform: uppercase;"></small>
                </div>
                
                <!-- DIREITA: NPC -->
                <div style="width: 50%; display: flex; align-items: center; justify-content: center; background: #0f1411; position: relative;">
                    <iconify-icon id="sol-npc-sprite" icon="pixelarticons:user" style="font-size: 90px; color: #8dff9a; filter: drop-shadow(0 0 15px rgba(141,255,154,0.3));"></iconify-icon>
                    <div style="position: absolute; top: 10px; right: 10px; font-size: 11px; background: #1a1010; color: #ff8d8d; padding: 4px 8px; border: 1px solid #422626; font-family: monospace;" id="sol-badge-status">DESCONHECIDO</div>
                </div>
            </div>

            <!-- ÁREA INFERIOR: PAINEL DE COMUNICAÇÃO DIVIDIDO EM COLUNAS (50%) -->
            <div id="area-painel-inferior" style="height: 50%; background: #0d120e; padding: 15px; display: flex; gap: 15px;">
                
                <!-- COLUNA ESQUERDA: CAIXA DE DIÁLOGO GIGANTE -->
                <div id="caixa-dialogo-clicavel" style="flex: 2; background: #050806; border: 1px solid #385e40; padding: 15px; position: relative; cursor: pointer; display: flex; flex-direction: column;">
                    <div id="sol-dialogo-texto" style="font-size: 18px; color: #c4ffd0; font-family: monospace; line-height: 1.6; flex: 1;">
                        Sincronizando feed de áudio...
                    </div>
                    <div id="indicador-clique" style="font-size: 12px; color: #8dff9a; text-align: right; margin-top: 10px; display: none;">▼ CLIQUE PARA CONTINUAR ▼</div>
                </div>

                <!-- COLUNA DIREITA: BOTÕES DE AÇÃO -->
                <div id="sol-painel-interacao" style="flex: 1; display: flex; flex-direction: column; gap: 10px; justify-content: center;">
                    <!-- Botões entram aqui quando o diálogo acaba -->
                </div>
            </div>

        </div>
    `, "solicitacoes");

    chamarProximoNpc();
}

// ==========================================
// MÁQUINA DE TEXTO E PAGINAÇÃO
// ==========================================
function exibirDialogo(texto, callbackBotoes) {
    // Quebra o texto em páginas de aprox. 140 caracteres respeitando palavras inteiras
    const maxLen = 140;
    const palavras = texto.split(' ');
    paginasDialogo = [];
    let pagAtual = "";

    palavras.forEach(palavra => {
        if ((pagAtual.length + palavra.length) > maxLen) {
            paginasDialogo.push(pagAtual.trim());
            pagAtual = palavra + " ";
        } else {
            pagAtual += palavra + " ";
        }
    });
    if (pagAtual.trim().length > 0) paginasDialogo.push(pagAtual.trim());

    paginaAtualIdx = 0;
    acaoPosDialogo = callbackBotoes;
    
    // Oculta os botões enquanto o diálogo acontece
    document.getElementById("sol-painel-interacao").innerHTML = ""; 
    renderizarPaginaDialogo();
}

function renderizarPaginaDialogo() {
    document.getElementById("sol-dialogo-texto").innerText = paginasDialogo[paginaAtualIdx];
    
    // Mostra a setinha apenas se houver mais páginas ou botões a carregar
    const indicador = document.getElementById("indicador-clique");
    if (paginaAtualIdx < paginasDialogo.length - 1 || acaoPosDialogo) {
        indicador.style.display = "block";
    } else {
        indicador.style.display = "none";
    }
}

// Ouve cliques SOMENTE na caixa de diálogo do aplicativo de solicitações
document.addEventListener("click", (e) => {
    const caixaClicavel = e.target.closest("#caixa-dialogo-clicavel");
    if (caixaClicavel && paginasDialogo.length > 0) {
        if (paginaAtualIdx < paginasDialogo.length - 1) {
            paginaAtualIdx++;
            renderizarPaginaDialogo();
        } else {
            // Fim do diálogo! Limpa as páginas e mostra os botões.
            document.getElementById("indicador-clique").style.display = "none";
            paginasDialogo = [];
            if (acaoPosDialogo) {
                acaoPosDialogo();
                acaoPosDialogo = null; // Consume o callback para não repetir
            }
        }
    }
});

// ==========================================
// FLUXO DO NPC E TERMINAL
// ==========================================

let isTyping = false;
let typingTimeout = null;

// --- EFEITO DE ESCRITA (Pode pular ao clicar) ---
async function typewriter(element, text) {
    isTyping = true;
    element.innerText = "";
    
    for (let i = 0; i < text.length; i++) {
        if (!isTyping) {
            element.innerText = text; // Pula a animação instantaneamente
            return;
        }
        element.innerText += text[i];
        await new Promise(r => setTimeout(r, 20));
    }
    isTyping = false;
}

// Clicar no texto pula a animação
document.getElementById("sol-dialogo-texto").onclick = () => {
    if (isTyping) isTyping = false;
};

// --- TERMINAL ---
function iniciarAnimacaoTerminal() {
    const terminal = document.getElementById("tela-terminal");
    terminal.innerHTML = `
        <div style="margin-bottom:10px;">OBSERVATORIO OS [versão 2.4.0]</div>
        <div id="terminal-logs"></div>
    `;
    renderizarPrompt();
}

function renderizarPrompt() {
    const logs = document.getElementById("terminal-logs");
    logs.innerHTML += `<div>OBSERVATORIO_OS:> <input type="text" id="term-input" autofocus style="background:transparent; border:none; color:inherit; font-family:inherit; width:60%; outline:none;"></div>`;
    
    const input = document.getElementById("term-input");
    input.focus();
    
    input.onkeydown = async (e) => {
        if (e.key === "Enter") {
            const cmd = input.value.trim().toLowerCase();
            input.disabled = true;
            logs.innerHTML += `<div>OBSERVATORIO_OS:> ${cmd}</div>`;
            await executarComando(cmd);
            renderizarPrompt();
        }
    };
}

async function executarComando(cmd) {
    const logs = document.getElementById("terminal-logs");
    const comandos = {
        "/help": "COMANDOS: /help, /status, /encerrarturno",
        "/status": "SISTEMA OPERACIONAL ESTÁVEL. PORTÕES MAGNÉTICOS EM ESPERA.",
        "/encerrarturno": "INICIANDO SINCRONIZAÇÃO..."
    };

    if (comandos[cmd]) {
        if (cmd === "/encerrarturno") {
            logs.innerHTML += `<div>> Sincronizando dados...</div>`;
            await new Promise(r => setTimeout(r, 1000));
            logs.innerHTML += `<div>> TURNO ENCERRADO COM SUCESSO.</div>`;
        } else {
            logs.innerHTML += `<div>${comandos[cmd]}</div>`;
        }
    } else {
        logs.innerHTML += `<div>ERRO: Comando '${cmd}' não reconhecido.</div>`;
    }
}

// --- LÓGICA DE NPCS (Busca direto no Database) ---
function chamarProximoNpc() {
    const proximoId = gameState.filaDoDia[0];

    if (!proximoId) {
        document.querySelector(".solicitacoes-layout").innerHTML = `<div id="tela-terminal"></div>`;
        iniciarAnimacaoTerminal();
        return;
    }

    const npc = characterDatabase[proximoId];
    npcAtual = { ...npc, perguntas: [...npc.perguntas] };

    // Atualiza elementos visuais (sprites dinâmicas)
    document.getElementById("sol-npc-sprite").innerText = npcAtual.sprite;
    document.getElementById("sol-badge-status").innerText = npcAtual.seguranca;

    // Documentos dinâmicos
    const itemVisor = document.getElementById("sol-item-visor");
    const itemNome = document.getElementById("sol-item-nome");
    
    if (npcAtual.itensTrazidos?.length > 0) {
        const doc = documentsDatabase[npcAtual.itensTrazidos[0]];
        itemVisor.innerText = doc ? doc.icone : "📁";
        itemNome.innerText = doc ? doc.nome : "DOC DESCONHECIDO";
    } else {
        itemVisor.innerText = "✖";
        itemNome.innerText = "SEM DOCUMENTO";
    }

    // Diálogo limpo
    typewriter(document.getElementById("sol-dialogo-texto"), npcAtual.dialogoInicial).then(() => {
        renderizarPainelDinamico();
    });
}

function renderizarPainelDinamico() {
    const painel = document.getElementById("sol-painel-interacao");
    painel.innerHTML = "";

    if (npcAtual.perguntas?.length >= 2) {
        npcAtual.perguntas.slice(0, 2).forEach(p => {
            const btn = document.createElement("button");
            btn.className = "btn-acao";
            btn.innerText = p.textoBotao;
            btn.onclick = () => {
                // Diálogo limpo sem prefixos
                typewriter(document.getElementById("sol-dialogo-texto"), p.respostaNpc).then(() => {
                    npcAtual.perguntas.splice(0, 2);
                    renderizarPainelDinamico();
                });
            };
            painel.appendChild(btn);
        });
    } else {
        const opcoes = [{t: "LIBERAR", a: "liberar"}, {t: "RECUSAR", a: "recusar"}];
        opcoes.forEach(op => {
            const btn = document.createElement("button");
            btn.className = "btn-acao";
            btn.innerText = op.t;
            btn.onclick = () => processarDecisaoFinal(op.a);
            painel.appendChild(btn);
        });
    }
}

function processarDecisaoFinal(acao) {
    document.getElementById("sol-painel-interacao").innerHTML = "";
    const texto = acao === "liberar" ? npcAtual.reacaoAceito : npcAtual.reacaoRecusado;
    
    typewriter(document.getElementById("sol-dialogo-texto"), texto).then(() => {
        gameState.filaDoDia.shift();
        setTimeout(chamarProximoNpc, 2000);
    });
}