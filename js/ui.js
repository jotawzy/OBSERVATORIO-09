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
function obtenerConteudoArquivos() {
    return `
        <div class="arquivos-layout">
            <div class="arquivos-lista">
                <div class="arquivos-placeholder">📁 Nenhum arquivo carregado</div>
            </div>
            <div class="arquivos-detalhe">
                <div class="detalhe-placeholder">Selecione um arquivo para visualizar</div>
            </div>
        </div>
    `;
}

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