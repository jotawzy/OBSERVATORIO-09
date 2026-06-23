import { characterDatabase } from './database/characters.js';

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
    unlockedFiles: [], // 👈 Começa totalmente VAZIO como você pediu!
    historyLogs: [],
    insideObservatory: []
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

// Variáveis de controle locais para o funcionamento do app ativo
let npcAtual = null;
let perguntasRestantes = 0;

// 1. Função para sortear 4 a 5 NPCs aleatórios no início do dia
function iniciarFilaDoDia() {
    const todosIds = Object.keys(characterDatabase);
    
    // Sorteia uma quantidade entre 4 e 5
    const quantidade = Math.floor(Math.random() * 2) + 4; 
    
    // Embaralha os IDs disponíveis e pega a quantidade sorteada
    const embaralhado = todosIds.sort(() => 0.5 - Math.random());
    gameState.filaDoDia = embaralhado.slice(0, quantidade);
}

// 2. Cria ou abre a janela do aplicativo de solicitações
function criarJanelaSolicitacoes() {
    // Se a fila do dia estiver completamente vazia (primeira vez abrindo o app no dia), gera uma nova
    if (gameState.filaDoDia.length === 0 && gameState.insideObservatory.length === 0 && gameState.rejectedOutside.length === 0) {
        iniciarFilaDoDia();
    }

    const idJanela = criarJanelaSimples("Controle de Acesso - Portão", `
        <div class="solicitacoes-layout" style="display: flex; flex-direction: column; height: 100%; justify-content: space-between;">
            
            <!-- MESA DE TRABALHO (ITENS E SPRITE) -->
            <div style="display: flex; flex: 1; min-height: 200px; border-bottom: 1px solid #26422c;">
                <!-- CANTO ESQUERDO: ITEM TRAZIDO -->
                <div id="sol-item-container" style="width: 50%; border-right: 1px solid #26422c; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0b100c; padding: 10px;">
                    <div id="sol-item-visor" style="font-size: 50px; filter: drop-shadow(0 0 10px rgba(141,255,154,0.2));"></div>
                    <small id="sol-item-nome" style="font-size: 10px; opacity: 0.6; margin-top: 5px; text-align:center;"></small>
                </div>
                
                <!-- CANTO DIREITO: FOTO/SPRITE DO CADASTRADO -->
                <div style="width: 50%; display: flex; align-items: center; justify-content: center; background: #0f1411; position: relative;">
                    <div id="sol-npc-sprite" style="font-size: 80px; filter: drop-shadow(0 0 15px rgba(141,255,154,0.3)); animation: pulse 2s infinite;">👤</div>
                    <div style="position: absolute; top: 10px; right: 10px; font-size: 10px; background: #1a1010; color: #ff8d8d; padding: 2px 6px; border: 1px solid #422626;" id="sol-badge-status">DESCONHECIDO</div>
                </div>
            </div>

            <!-- ENVELOPE DE DIÁLOGO E INTERAÇÕES -->
            <div style="background: #0d120e; padding: 15px; display: flex; flex-direction: column; gap: 10px;">
                <!-- CAIXA DE TEXTO DO DIÁLOGO -->
                <div id="sol-dialogo-texto" style="font-size: 12px; line-height: 1.4; min-height: 55px; color: #c4ffd0; border-left: 3px solid #385e40; padding-left: 10px; white-space: pre-line;">
                    Aguardando sinal do portão externo...
                </div>

                <!-- PAINEL DE PERGUNTAS / INVESTIGAÇÃO -->
                <div id="sol-painel-perguntas" style="display: flex; flex-direction: column; gap: 5px;">
                    <!-- Botões de perguntas injetados via JS -->
                </div>

                <!-- BOTÕES DE DECISÃO FINAL -->
                <div style="display: flex; gap: 10px; margin-top: 5px; border-top: 1px dashed #26422c; padding-top: 10px;">
                    <button id="btn-liberar-portao" disabled style="flex: 1; background: #15331b; border: 1px solid #385e40; color: #8dff9a; padding: 8px; cursor: not-allowed; text-transform: uppercase; font-weight: bold; font-size: 11px;">Liberar Portão</button>
                    <button id="btn-mandar-embora" disabled style="flex: 1; background: #331515; border: 1px solid #5e3838; color: #ff8d8d; padding: 8px; cursor: not-allowed; text-transform: uppercase; font-weight: bold; font-size: 11px;">Mandar Embora</button>
                </div>
            </div>

        </div>
    `, "solicitacoes");

    // Prepara e joga na tela o primeiro NPC da fila
    chamarProximoNpc();
}

// 3. Puxa o próximo NPC da fila e atualiza os elementos visuais na tela
function chamarProximoNpc() {
    const proximoId = gameState.filaDoDia[0];

    // Se a fila acabou, limpa a mesa
    if (!proximoId) {
        document.getElementById("sol-npc-sprite").innerText = "❌";
        document.getElementById("sol-dialogo-texto").innerText = `[ SISTEMA DE CONTROLE ]\nTodos os candidatos da fila de hoje foram processados.\nUse o terminal para encerrar o expediente.`;
        document.getElementById("sol-item-visor").innerText = "";
        document.getElementById("sol-item-nome").innerText = "";
        document.getElementById("sol-painel-perguntas").innerHTML = "";
        document.getElementById("btn-liberar-portao").disabled = true;
        document.getElementById("btn-mandar-embora").disabled = true;
        return;
    }

    // Busca as propriedades brutas no banco de dados
    npcAtual = characterDatabase[proximoId];
    perguntasRestantes = npcAtual.perguntas.length;

    // Atualiza Foto (Canto Superior Direito)
    document.getElementById("sol-npc-sprite").innerText = npcAtual.sprite;
    document.getElementById("sol-badge-status").innerText = "IDENTIDADE RETIDA";

    // Atualiza Documento/Item (Canto Superior Esquerdo)
    const itemContainer = document.getElementById("sol-item-container");
    const itemVisor = document.getElementById("sol-item-visor");
    const itemNome = document.getElementById("sol-item-nome");

    if (npcAtual.itensTrazidos && npcAtual.itensTrazidos.length > 0) {
        const idItem = npcAtual.itensTrazidos[0];
        const dadosItem = itemsDatabase[idItem];
        if (dadosItem) {
            itemVisor.innerText = dadosItem.icone;
            itemNome.innerText = `[ ESCANEADO ]\n${dadosItem.nome}`;
            
            // AUTOMÁTICO: Ao carregar o item na mesa, ele passa a constar no app de Arquivos
            if (!gameState.unlockedFiles.includes(idItem)) {
                gameState.unlockedFiles.push(idItem);
            }
        }
    } else {
        itemVisor.innerText = "📁";
        itemNome.innerText = "Nenhum documento na bandeja";
    }

    // Atualiza Diálogo Inicial (Embaixo)
    document.getElementById("sol-dialogo-texto").innerText = `"${npcAtual.dialogoInicial}"`;

    // Reseta e bloqueia os botões de decisão até terminar o interrogatório
    const btnAceitar = document.getElementById("btn-liberar-portao");
    const btnRecusar = document.getElementById("btn-mandar-embora");
    btnAceitar.disabled = true;
    btnAceitar.style.cursor = "not-allowed";
    btnRecusar.disabled = true;
    btnRecusar.style.cursor = "not-allowed";

    // Gera os botões de perguntas dinamicamente
    renderizarBotoesPerguntas();
}

// 4. Cria os botões com as perguntas que podem ser feitas
function renderizarBotoesPerguntas() {
    const container = document.getElementById("sol-painel-perguntas");
    container.innerHTML = "";

    if (perguntasRestantes > 0) {
        npcAtual.perguntas.forEach((pergunta, index) => {
            const btn = document.createElement("button");
            btn.style.cssText = "background: #111a13; border: 1px solid #233827; color: #a6d9b0; padding: 5px 10px; font-size: 10px; text-align: left; cursor: pointer; transition: 0.1s;";
            btn.innerText = `💬 ${pergunta.textoBotao}`;
            
            // Hover effect simples via JS
            btn.onmouseover = () => btn.style.background = "#1b2b1f";
            btn.onmouseout = () => btn.style.background = "#111a13";

            btn.addEventListener("click", () => {
                // Altera o texto do diálogo com a resposta do NPC
                document.getElementById("sol-dialogo-texto").innerText = `Você: ${pergunta.textoBotao}\n\nNPC: "${pergunta.respostaNpc}"`;
                
                // Remove essa pergunta específica para que não possa ser feita de novo
                npcAtual.perguntas.splice(index, 1);
                perguntasRestantes--;

                // Atualiza a lista de botões
                renderizarBotoesPerguntas();
            });

            container.appendChild(btn);
        });
    } else {
        // Quando esgotam as perguntas, libera os botões de decisão final!
        container.innerHTML = `<div style="font-size:9px; color:#8dff9a; opacity:0.6; text-align:center; padding: 2px;">[ INTERROGATÓRIO CONCLUÍDO - TOME UMA DECISÃO ]</div>`;
        
        const btnAceitar = document.getElementById("btn-liberar-portao");
        const btnRecusar = document.getElementById("btn-mandar-embora");
        
        btnAceitar.disabled = false;
        btnAceitar.style.cursor = "pointer";
        btnRecusar.disabled = false;
        btnRecusar.style.cursor = "pointer";
    }
}

// 5. Configura e ouve as ações definitivas do jogador (Liberar / Mandar Embora)
document.addEventListener("click", (e) => {
    if (!npcAtual) return;

    // SE CLICOU EM LIBERAR PORTÃO (ACEITO)
    if (e.target.id === "btn-liberar-portao") {
        document.getElementById("sol-dialogo-texto").innerText = `[ PORTÃO ABERTO ]\n\nNPC: "${npcAtual.reacaoAceito}"`;
        
        // Adiciona à base interna revelando o Nome Real
        gameState.insideObservatory.push({
            id: npcAtual.id,
            nome: npcAtual.nomeReal,
            sprite: npcAtual.sprite,
            seguranca: npcAtual.seguranca
        });

        concluirResolucaoNpc();
    }

    // SE CLICOU EM MANDAR EMBORA (RECUSADO)
    if (e.target.id === "btn-mandar-embora") {
        document.getElementById("sol-dialogo-texto").innerText = `[ ACESSO NEGADO ]\n\nNPC: "${npcAtual.reacaoRecusado}"`;
        
        // Adiciona à lista de excluídos lá fora (apenas some do banco ativo)
        gameState.rejectedOutside.push(npcAtual.id);

        concluirResolucaoNpc();
    }
});

// Remove o NPC processado do topo da fila e aguarda 3 segundos para carregar o próximo
function concluirResolucaoNpc() {
    // Bloqueia cliques repetidos nos botões durante a transição
    document.getElementById("btn-liberar-portao").disabled = true;
    document.getElementById("btn-mandar-embora").disabled = true;
    document.getElementById("sol-painel-perguntas").innerHTML = "";

    // Remove do topo do array da fila
    gameState.filaDoDia.shift(); 

    // Pausa dramática de 3 segundos para o jogador ler o desfecho da fala dele, antes do próximo chegar
    setTimeout(() => {
        chamarProximoNpc();
    }, 3200);
}

/* ==========================================================================
   GERENCIADOR DE CLIQUES GLOBAIS (E-MAILS E ARQUIVOS)
   ========================================================================== */
// ... O resto dos ouvintes e seletores de e-mail/arquivos continuam exatamente iguais abaixo ...