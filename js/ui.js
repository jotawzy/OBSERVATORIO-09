const areaJanelas = document.getElementById("area-janelas");
const taskbar = document.getElementById("taskbar-apps");

let zIndex = 10;

const janelas = {};
const taskIcons = {};

/* =========================
ICONS DOS APPS
========================= */

const appIcons = {
    emails: "pixelarticons:mail",
    arquivos: "pixelarticons:folder",
    solicitacoes: "pixelarticons:radio-signal",
    quadro: "pixelarticons:link",
    registros: "pixelarticons:book"
};

/* =========================
FULLSCREEN APPS
========================= */

const appsFullscreen = {
    solicitacoes: true,
    quadro: true
};

/* =========================
APPS
========================= */

document.getElementById("app-emails").addEventListener("click", () => abrirEmails());

document.getElementById("app-arquivos").addEventListener("click", () =>
    criarJanelaSimples("Arquivos", "Em desenvolvimento", "arquivos")
);

document.getElementById("app-solicitacoes").addEventListener("click", () =>
    criarJanelaSolicitacoes()
);

document.getElementById("app-quadro").addEventListener("click", () =>
    criarJanelaSimples("Quadro", "Em desenvolvimento", "quadro")
);

document.getElementById("app-registros").addEventListener("click", () =>
    criarJanelaSimples("Registros", "Em desenvolvimento", "registros")
);

/* =========================
JANELA BASE
========================= */

function criarJanelaSimples(titulo, conteudo, tipoApp = "emails"){

    const janela = document.createElement("div");
    janela.classList.add("janela");

    const idJanela = Date.now();
    janelas[idJanela] = janela;

    if (appsFullscreen?.[tipoApp]) {
    janela.classList.add("fullscreen");
    janela.style.top = "0";
    janela.style.left = "0";
    janela.style.width = "100%";
    janela.style.height = "100%";
} else {
    janela.classList.remove("fullscreen");
    janela.style.top = "60px";
    janela.style.left = "60px";
}

    janela.style.zIndex = zIndex++;

    janela.innerHTML = `
        <div class="barra-janela">
            <span>${titulo}</span>
            <div class="botoes-janela">
                <button class="minimizar">_</button>
                <button class="fechar">X</button>
            </div>
        </div>

        <div class="conteudo-janela">
            ${conteudo}
        </div>
    `;

    areaJanelas.appendChild(janela);

    const btnFechar = janela.querySelector(".fechar");
    const btnMin = janela.querySelector(".minimizar");

    btnFechar.addEventListener("click", () => {

        janela.remove();
        delete janelas[idJanela];

        if (taskIcons[idJanela]) {
            taskIcons[idJanela].remove();
            delete taskIcons[idJanela];
        }
    });

    btnMin.addEventListener("click", () => {
        janela.style.display = "none";
    });

    criarTaskbarIcone(idJanela, tipoApp);

    ativarDrag(janela, janela.querySelector(".barra-janela"));

    return idJanela;
}

/* =========================
DRAG (PC + MOBILE)
========================= */

function ativarDrag(janela, barra){

    let offsetX = 0;
    let offsetY = 0;
    let arrastando = false;
    let pointerId = null;

    barra.addEventListener("pointerdown", (e) => {

    const botao = e.target.closest("button");
    if (botao) return;

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

    function parar(e){
        if (e.pointerId !== pointerId) return;
        arrastando = false;
        pointerId = null;
    }

    barra.addEventListener("pointerup", parar);
    barra.addEventListener("pointercancel", parar);
    document.addEventListener("pointerup", parar);
}

/* =========================
FOCO
========================= */

function focarJanela(janela){
    janela.style.zIndex = zIndex++;
}

/* =========================
TASKBAR
========================= */

function criarTaskbarIcone(id, tipoApp){

    const icon = document.createElement("div");
    icon.classList.add("taskbar-icone");

    const iconFinal = appIcons[tipoApp] || "pixelarticons:question";

    icon.innerHTML = `<iconify-icon icon="${iconFinal}"></iconify-icon>`;

    icon.addEventListener("click", () => {

        const janela = janelas[id];
        if (!janela) return;

        janela.style.display = "flex";
        focarJanela(janela);
    });

    taskIcons[id] = icon;

    taskbar.appendChild(icon);
}

/* =========================
EMAILS
========================= */

const Emails = [
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

/* =========================
RENDER EMAILS
========================= */

function renderEmails(){

    return Emails.map(email => `
        <div class="email-item ${email.lido ? "lido" : "nao-lido"}" data-id="${email.id}">
            <div class="email-topo">
                <strong>${email.remetente}</strong>
                ${email.lido ? "" : "<span class='ponto'>●</span>"}
            </div>

            <div class="email-assunto">${email.assunto}</div>
            <div class="email-data">${email.data}</div>
        </div>
    `).join("");
}

/* =========================
ABRIR EMAILS
========================= */

function abrirEmails(){

    const conteudo = `
        <div class="email-layout">

            <div class="email-lista" id="email-lista">
                ${renderEmails()}
            </div>

            <div class="email-leitura" id="email-aberto">
                <p class="placeholder">Selecione um e-mail</p>
            </div>

        </div>
    `;

    criarJanelaSimples("Caixa de Entrada", conteudo, "emails");

    document.addEventListener("click", emailClickHandler);
}

/* =========================
CLICK EMAIL
========================= */

function emailClickHandler(e){

    const item = e.target.closest(".email-item");
    if (!item) return;

    const id = Number(item.dataset.id);
    abrirEmail(id);

    const lista = document.getElementById("email-lista");
    if (lista) lista.innerHTML = renderEmails();
}

/* =========================
ABRIR EMAIL
========================= */

function abrirEmail(id){

    const email = Emails.find(e => e.id === id);
    if (!email) return;

    email.lido = true;

    const box = document.getElementById("email-aberto");
    if (!box) return;

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

// HUD SOLICITAÇÕES 

function criarJanelaSolicitacoes(){

    const janela = document.createElement("div");
    janela.classList.add("janela", "fullscreen");

    const idJanela = Date.now();
    janelas[idJanela] = janela;

    janela.style.zIndex = zIndex++;

    janela.innerHTML = `
        <div class="barra-janela">
            <span>Solicitações</span>
            <div class="botoes-janela">
                <button class="fechar">X</button>
            </div>
        </div>

        <div class="solicitacoes-layout">

            <div class="sol-docs">
                <div class="doc-placeholder">
                    📄 Nenhum documento selecionado
                </div>
            </div>

            <div class="sol-npc">
                <div class="npc-sprite">👤</div>
            </div>

            <div class="sol-dialogo">
                <div class="dialogo-texto">
                    Aguardando solicitações...
                </div>

                <div class="dialogo-opcoes">
                    <button disabled>Opção 1</button>
                    <button disabled>Opção 2</button>
                </div>
            </div>

        </div>
    `;

    areaJanelas.appendChild(janela);

    const btnFechar = janela.querySelector(".fechar");

btnFechar.addEventListener("click", () => {

    janela.remove();
    delete janelas[idJanela];

    if (taskIcons[idJanela]) {
        taskIcons[idJanela].remove();
        delete taskIcons[idJanela];
    }
});

    criarTaskbarIcone(idJanela, "solicitacoes");

    return idJanela;
}
