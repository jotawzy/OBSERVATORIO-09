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

document.getElementById("app-arquivos").addEventListener("click", () =>
    criarJanelaSimples("Arquivos", obterConteudoArquivos(), "arquivos")
);
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

// Gerenciador de cliques nos e-mails
document.addEventListener("click", (e) => {
    const item = e.target.closest(".email-item");
    if (!item) return;

    const id = Number(item.dataset.id);
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
});

/* ==========================================================================
   APLICATIVO: ARQUIVOS
   ========================================================================== */
import { itemsDatabase } from './database/items.js';

function obterConteudoArquivos() {
    // Busca na base de dados apenas os IDs que foram jogados dentro do gameState
    const itensDesbloqueados = gameState.unlockedFiles.map(id => itemsDatabase[id]).filter(Boolean);

    let listaHTML = "";

    // Se não houver nada descoberto, mostra a interface inicial de sistema vazio
    if (itensDesbloqueados.length === 0) {
        listaHTML = `
            <div class="arquivos-placeholder" style="padding: 20px; text-align: center; opacity: 0.4;">
                <iconify-icon icon="pixelarticons:folder-minus" style="font-size: 32px; color: #ff8d8d;"></iconify-icon>
                <p style="margin-top: 10px; font-size: 11px;">[ SISTEMA DE ARQUIVOS VAZIO ]</p>
                <span style="font-size: 9px; display: block; line-height: 1.3;">Nenhum documento ou objeto foi escaneado no portão do Observatório hoje.</span>
            </div>
        `;
    } else {
        // Se houver itens, gera os botões clicáveis na barra lateral esquerda
        listaHTML = itensDesbloqueados.map(item => `
            <div class="arquivo-item" data-item-id="${item.id}" style="animation: fadeIn 0.1s ease;">
                <span>${item.icone} ${item.nome}</span>
                <small style="display:block; opacity:0.6; font-size:9px; margin-top: 2px;">Tipo: ${item.tipo}</small>
            </div>
        `).join("");
    }

    return `
        <div class="arquivos-layout">
            <!-- LISTA ESQUERDA (DIFERENTES ITENS APARECERÃO AQUI) -->
            <div class="arquivos-lista" id="arquivos-lista" style="border-right: 1px solid #26422c; width: 35%; padding: 10px; overflow-y: auto;">
                ${listaHTML}
            </div>

            <!-- PAINEL DIREITO (GUIA DE VERIFICAÇÃO TÉCNICA) -->
            <div class="arquivos-detalhe" id="arquivos-detalhe" style="flex: 1; padding: 12px; overflow-y: auto;">
                <div class="detalhe-placeholder" style="opacity: 0.5; font-size: 11px; text-align: center; margin-top: 40px;">
                    <iconify-icon icon="pixelarticons:device-laptop" style="font-size: 24px; display:block; margin: 0 auto 10px;"></iconify-icon>
                    Aguardando seleção de dados para análise de autenticidade.
                </div>
            </div>
        </div>
    `;
}

document.addEventListener("click", (e) => {
    const itemClick = e.target.closest(".arquivo-item");
    if (!itemClick) return;

    const itemId = itemClick.dataset.itemId;
    const itemDados = itemsDatabase[itemId];
    if (!itemDados) return;

    const painelDetalhe = document.getElementById("arquivos-detalhe");
    if (!painelDetalhe) return;

    painelDetalhe.innerHTML = `
        <div class="detalhe-documento" style="animation: fadeIn 0.15s ease;">
            <div style="display: flex; gap: 15px; align-items: center; border-bottom: 1px solid #26422c; padding-bottom: 12px;">
                <div style="font-size: 30px; background: #102115; border: 1px solid #26422c; width: 45px; height: 45px; display:flex; align-items:center; justify-content:center;">
                    ${itemDados.icone}
                </div>
                <div>
                    <h2 style="margin:0; color: #8dff9a; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">${itemDados.nome}</h2>
                    <p style="margin: 3px 0 0 0; opacity: 0.7; font-size: 9px;">Categoria: ${itemDados.tipo}</p>
                </div>
            </div>
            
            <div style="margin-top: 15px;">
                <h3 style="color: #8dff9a; font-size: 10px; margin-bottom: 4px; letter-spacing: 0.5px;">PROPRIEDADES / DESCRIÇÃO:</h3>
                <p style="line-height: 1.4; opacity: 0.8; background: #0f1411; padding: 8px; border: 1px solid #1f2a24; margin:0; font-size: 11px;">
                    ${itemDados.descricao}
                </p>
            </div>

            <div style="margin-top: 15px;">
                <h3 style="color: #ff8d8d; font-size: 10px; margin-bottom: 4px; letter-spacing: 0.5px;">DIRETRIZES DE VERIFICAÇÃO DO MONITOR:</h3>
                <div style="line-height: 1.4; opacity: 0.9; background: #1a1010; padding: 8px; border: 1px solid #422626; color: #ffcfe8; white-space: pre-line; font-size: 11px;">
                    ${itemDados.regrasValidação}
                </div>
            </div>
        </div>
    `;
});

/* ==========================================================================
   APLICATIVO: SOLICITAÇÕES
   ========================================================================== */
function criarJanelaSolicitacoes() {
    criarJanelaSimples("Solicitações", `
        <div class="solicitacoes-layout">
            <div class="sol-docs">
                <div class="doc-placeholder">📄 Nenhum documento selecionado</div>
            </div>
            <div class="sol-npc">
                <div class="npc-sprite">👤</div>
            </div>
            <div class="sol-dialogo">
                <div class="dialogo-texto">Aguardando solicitações do portão...</div>
                <div class="dialogo-opcoes">
                    <button disabled>Aceitar</button>
                    <button disabled>Recusar</button>
                </div>
            </div>
        </div>
    `, "solicitacoes");
}
