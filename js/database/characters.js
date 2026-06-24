// js/database/characters.js

export const characterDatabase = {
    "char_001": {
        id: "char_001",
        nomeReal: "Alana Rocha",
        sprite: "assets/alana-rocha.png",
        seguranca: "Seguro",
        dialogoInicial: "Por favor, senhor... Venho do Setor Agrícola. Minha estufa foi invadida e eu só preciso de um lugar seguro para passar a noite. Eu trouxe minha Identidade Civil Oficial. Está tudo em ordem, juro!",
        
        perguntas: [
            {
                textoBotao: "Perguntar sobre a invasão na estufa",
                respostaNpc: "Eles usavam jaquetas escuras... Pareciam saqueadores da Zona Desconhecida. Atiraram contra os geradores e eu tive que correr para os túneis de ventilação."
            },
            {
                textoBotao: "Questionar sobre a validade do ID",
                respostaNpc: "O carimbo está um pouco borrado porque pegou umidade na fuga, mas o chip magnético na lateral ainda funciona no leitor se você testar!"
            }
        ],
        
        reacaoAceito: "Muito obrigada, oficial! Que as luzes do Observatório guiem seus passos. Não vai se arrepender de ter me ajudado.",
        reacaoRecusado: "Não, por favor! Voltar para a névoa lá fora é uma sentença de morte... Você está me condenando!",
        
        itensTrazidos: ["doc_id_comum"]
    },

    "char_002": {
        id: "char_002",
        nomeReal: "Desconhecido 109",
        sprite: "🥷",
        seguranca: "Perigoso",
        dialogoInicial: "Abra o portão de uma vez, monitor. Não tenho o dia todo para ficar esperando sob a névoa ácida. Meus documentos? Estão bem aqui... Pegue.",
        perguntas: [
            {
                textoBotao: "Exigir justificativa para a pressa",
                respostaNpc: "O ar lá fora está congelando meus pulmões e você me fazendo perguntas imbecis? Só faça o seu trabalho e destranque a trava."
            },
            {
                textoBotao: "Perguntar sobre a origem das roupas",
                respostaNpc: "Roupas normais de andarilho. Protegem contra a radiação. Algum problema com meu estilo, oficial?"
            }
        ],
        
        reacaoAceito: "*Dá um sorriso cínico* Escolha inteligente, monitor. O Observatório precisa de pessoas... eficientes como nós.",
        reacaoRecusado: "Você acabou de cometer o maior erro da sua vida miserável. Lembrarei do seu rosto quando os portões caírem.",
        
        itensTrazidos: ["doc_id_comum"]
    },

    "char_003": {
        id: "char_003",
        nomeReal: "Beto o Velho",
        sprite: "👨‍🔧",
        seguranca: "Moderado",
        dialogoInicial: "Olha só, chefe... Eu tenho uns filtros de ar extras na minha mochila. Que tal me deixar entrar e a gente divide o lucro? Só não faça perguntas sobre de onde veio esse drive de dados...",
        perguntas: [
            {
                textoBotao: "Questionar procedência dos filtros",
                respostaNpc: "Foram... descartados pelo Setor de Engenharia na semana passada. Estão perfeitamente limpos, garanto."
            },
            {
                textoBotao: "Perguntar sobre o drive de dados",
                respostaNpc: "Ah, esse aparelhinho? Encontrei caído perto dos trilhos do trem de carga. Parece ter registros antigos, pode valer uma grana na Central."
            }
        ],
        
        reacaoAceito: "Negócio fechado, chefe! Meus pulmões agradecem o ar puro de dentro. Passa na minha cabine mais tarde para pegar sua parte.",
        reacaoRecusado: "Pff... Que burocrata certinho. Vai se arrepender quando o sistema de ventilação travar e você não tiver minhas peças de reposição.",
        
        itensTrazidos: ["doc_permissao_trabalho"]
    }
};
