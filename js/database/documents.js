export const documentsDatabase = {
    "doc_id_comum": {
        id: "doc_id_comum",
        nome: "Identidade Civil Padrão",
        tipo: "Documento",
        icone: "pixelarticons:file",
        descricao: "Documento de identificação padrão emitido pela Coalizão Central. Deve conter o selo holográfico verde e a data de validade ativa.",
        regrasValidação: "1. Foto precisa estar alinhada.\n2. O número de série nunca começa com '000'.\n3. Ano de emissão válido: pós-2022."
    },
    "doc_permissao_trabalho": {
        id: "doc_permissao_trabalho",
        nome: "Passe de Trabalho Externo",
        tipo: "Autorização",
        icone: "pixelarticons:script", 
        descricao: "Emitido para operários que realizam manutenção nos filtros de ar externos do Observatório.",
        regrasValidação: "1. Deve possuir o carimbo do Setor de Engenharia.\n2. Válido apenas para o turno diurno."
    }
};