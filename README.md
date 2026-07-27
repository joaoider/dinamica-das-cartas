# Dinâmica das Cartas

Aplicação simples para realizar online e em tempo real a dinâmica **Os custos invisíveis do não desenvolvimento**.

## Executar no computador

É necessário ter o Node.js 18 ou superior instalado.

```bash
npm install
npm start
```

Abra `http://localhost:3000`. Para simular várias pessoas, abra o endereço em janelas anônimas diferentes.

## Como facilitar

1. O facilitador abre o endereço principal, informa o nome e cria uma sala.
2. Clica em **copiar link** e compartilha o endereço exclusivo dos participantes.
3. Quem recebe o link vê somente a opção de entrar, com o código da sala já preenchido.
4. Quando todos entrarem, inicia a ordenação.
5. Cada pessoa arrasta as dez cartas da mais crítica para a menos crítica e envia.
6. O facilitador exibe o ranking coletivo e conduz as quatro perguntas de discussão.

## Colocar na internet

O projeto pode ser publicado diretamente em serviços que executem Node.js, como Render, Railway ou Fly.io. Configure o comando de instalação como `npm install` e o de inicialização como `npm start`. O serviço define a variável `PORT` automaticamente.

As salas ficam somente na memória. Isso mantém o MVP simples, mas elas são perdidas quando o servidor reinicia e uma única instância do servidor deve ser usada. Para uso permanente ou em escala, o próximo passo é persistir as salas e usar um adaptador Redis para o Socket.IO.
