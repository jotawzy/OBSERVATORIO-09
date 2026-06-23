export const EmailsDatabase = [
    {
        id: 1,
        remetente: "Coordenação Central",
        assunto: "Relatório de estabilidade.",
        data: "27/02/20?? - 08:12",
        conteudo: "Os sistemas do Observatório 9 permanecem operacionais.",
        lido: true
    },

    {
        id: 2,
        remetente: "Setor Externo",
        assunto: "Transmissão interrompida.",
        data: "28/02/20?? - 23:47",
        conteudo: "Perdemos contato com as estações secundárias. Não tentar fazer conexão.",
        lido: true
    },

    {
        id: 3,
        remetente: "???",
        assunto: "Você está sendo observado.",
        data: "??/??/20?? - 04:13",
        conteudo: "Não confie nos relatórios da noite anterior.",
        lido: true
    },
];

const gameState = {
    currentDay: 1,
    time: "21:34",
    emails: [...EmailsDatabase], 
    unlockedFiles: [],
    historyLogs: [],
    insideObservatory: []
};