# Dinâmica das Cartas

Aplicação web para realizar, de forma online e síncrona, a dinâmica **Os custos invisíveis do não desenvolvimento** da Casa dos Ventos.

O organizador cria uma sala, compartilha um link exclusivo e acompanha o envio das respostas em tempo real. Cada participante ordena dez cartas da mais crítica para a menos crítica.

## Funcionalidades

- Salas com código único de cinco caracteres.
- Acessos separados para organizador e participantes.
- Link de convite com o código da sala preenchido automaticamente.
- Lista de participantes sincronizada em tempo real.
- Ordenação das cartas por arrastar e soltar ou pelos botões de direção.
- Possibilidade de alterar e reenviar a ordem antes do encerramento.
- Acompanhamento da quantidade de respostas enviadas.
- Ranking coletivo por pontuação ponderada.
- Visualização individual da sequência enviada por cada pessoa, exclusiva do organizador.
- Tela de conclusão com a própria sequência para cada participante.
- Perguntas de apoio para a discussão final.
- Interface responsiva seguindo a identidade visual da Casa dos Ventos.

## Tecnologias

- Node.js
- Express
- Socket.IO
- HTML, CSS e JavaScript

As salas e respostas são mantidas na memória do servidor. O projeto não utiliza banco de dados.

## Requisitos

- Node.js 18 ou superior
- npm

## Executar localmente

Instale as dependências:

```bash
npm install
```

Inicie a aplicação:

```bash
npm start
```

Acesse:

```text
http://localhost:3000
```

Para desenvolvimento com reinicialização automática:

```bash
npm run dev
```

Para simular várias pessoas, abra o link dos participantes em navegadores ou janelas anônimas diferentes.

## Como conduzir a dinâmica

1. O organizador abre o endereço principal, informa o nome e seleciona **Criar sala**.
2. Depois que a sala for criada, seleciona **copiar link**.
3. Os participantes abrem o endereço recebido. Essa página apresenta somente a opção de entrar e já contém o código da sala.
4. Quando todos estiverem conectados, o organizador inicia a ordenação.
5. Cada pessoa organiza as dez cartas e seleciona **Enviar minha ordem**.
6. Enquanto a etapa estiver aberta, a pessoa pode alterar as cartas e selecionar **Reenviar ordem**.
7. O organizador acompanha quantas pessoas enviaram e seleciona **Exibir resultado**.
8. O organizador visualiza o ranking coletivo e a sequência individual de cada participante.
9. Cada participante visualiza a mensagem de conclusão e a própria sequência enviada.

## Cálculo do ranking coletivo

A primeira carta de cada sequência recebe 10 pontos, a segunda recebe 9 pontos e assim sucessivamente, até 1 ponto para a décima posição. O resultado coletivo é ordenado pela soma desses pontos.

Em caso de empate, são considerados, nesta ordem:

1. Quantidade de votos em primeiro lugar.
2. Número da carta.

## Publicar no Render

Crie um **Web Service** conectado a este repositório e utilize:

| Configuração | Valor |
| --- | --- |
| Language | `Node` |
| Branch | `main` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/` |

A variável `PORT` é fornecida automaticamente pelo Render e já é utilizada pelo servidor.

Use somente uma instância da aplicação. Como as salas ficam na memória, múltiplas instâncias teriam estados diferentes.

## Limitações atuais

- Salas e respostas são perdidas quando o servidor reinicia ou recebe um novo deploy.
- Se o organizador fechar ou recarregar a página, a sala é encerrada.
- Participantes desconectados não conseguem retornar à mesma sessão com a identidade anterior.
- Não faça deploy durante uma dinâmica em andamento.
- O plano gratuito de algumas plataformas pode suspender o serviço após um período sem uso.

Para uso permanente ou com múltiplas instâncias, os próximos passos recomendados são persistir as salas e utilizar o adaptador Redis do Socket.IO.

## Estrutura

```text
.
├── public/
│   ├── app.js          # Comportamento da interface e comunicação em tempo real
│   ├── brand.css       # Identidade visual da Casa dos Ventos
│   ├── index.html      # Estrutura das páginas
│   └── styles.css      # Estilos básicos da aplicação
├── server.js           # Servidor Express, salas e eventos Socket.IO
├── package.json
└── README.md
```
