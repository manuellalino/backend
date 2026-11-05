# API de Gestão de Loja

Backend REST para apoiar a operação de uma loja: centraliza cadastros e consultas de clientes, equipe, fornecedores e produtos, além de registrar pedidos e movimentações de estoque. O objetivo é oferecer uma interface HTTP única para que sistemas clientes possam consultar e persistir esses dados sem acessar o MySQL diretamente.

## Problema que resolve

A API reúne em um único serviço as operações de gestão que, de outra forma, exigiriam acesso direto ao banco por cada sistema consumidor. Ela organiza cadastros, pedidos, entradas e saídas de produtos e consultas de estoque, mantendo os dados em um banco relacional.

## Tecnologias

- Node.js e Express 5 para o servidor HTTP e as rotas REST.
- Sequelize 6 como ORM para mapear tabelas a modelos e executar consultas e operações de persistência.
- MySQL como banco de dados relacional, acessado pelo driver `mysql2`.
- `bcryptjs` para gerar e validar hashes de senha.
- `dotenv` para carregar configuração local do arquivo `.env`.
- `morgan`, `cors` e `body-parser` para logging HTTP, CORS e leitura dos corpos das requisições.

Os modelos e associações Sequelize estão em `models/`; a conexão compartilhada está em `sequelize.js`. A aplicação não executa `sync()` nem altera o schema automaticamente: o banco e as tabelas compatíveis precisam existir antes de usar as rotas. A migração disponível em `migrations/001_alinhar_schema_estoque.sql` pode alterar constraints, gatilhos e quantidades de estoque; revise e faça backup antes de aplicá-la em uma base com dados.

## Instalação e execução

Requisitos: Node.js compatível com as dependências do projeto e uma instância MySQL acessível.

```bash
npm install
npm start
```

Para desenvolvimento com reinicialização automática:

```bash
npm run dev
```

O servidor escuta em `0.0.0.0` e usa a porta de `PORT`, ou `5000` se ela não estiver definida.

## Configuração do ambiente

Crie um arquivo `.env` local na raiz ou configure as variáveis no ambiente de execução. Não publique valores reais, senhas, tokens ou o próprio arquivo `.env`.

| Variável | Obrigatória | Finalidade |
|---|---:|---|
| `DB_HOST` | Sim | Host do servidor MySQL |
| `DB_PORT` | Não | Porta do MySQL; padrão `3306` |
| `DB_USER` | Sim | Usuário do banco |
| `DB_PASSWORD` | Sim | Senha do banco |
| `DB_NAME` | Sim | Nome do banco de dados |
| `DB_SSL` | Não | Habilita TLS com validação do certificado (`true`/`false`); é habilitado por padrão em produção e desabilitado em desenvolvimento local. |
| `PORT` | Não | Porta HTTP da API; padrão `5000` |
| `CORS_ORIGINS` | Produção | Origens exatas do frontend, separadas por vírgula (ex.: `https://loja.example.com`). Em produção não pode ser `*`; localmente, se omitida, são aceitas `http://localhost`, `http://localhost:3000` e `http://localhost:5173`. |

Exemplo de `.env` sem credenciais reais:

```dotenv
DB_HOST=<host-do-mysql>
DB_PORT=3306
DB_USER=<usuario>
DB_PASSWORD=<senha>
DB_NAME=<banco>
PORT=5000
CORS_ORIGINS=http://localhost,http://localhost:3000,http://localhost:5173
```

## Endereço da API

Localmente, com a configuração padrão, use `http://localhost:5000`. Não há URL pública de hospedagem definida nos arquivos deste projeto. Depois de publicar a aplicação, configure abaixo a URL fornecida pelo serviço de hospedagem:

```text
API_BASE_URL=https://<dominio-publico-fornecido-pela-hospedagem>
```

Substitua o placeholder pelo endereço real antes de compartilhar a documentação ou executar exemplos contra produção.

### Publicação no Render

O projeto é uma aplicação Express persistente e usa `PORT`, adequada a um **Render Web Service** (em vez do modelo serverless da Vercel, que exigiria adaptar a inicialização e o ciclo de vida do pool). O arquivo `render.yaml` prepara um Blueprint com `npm ci`, `npm start`, `NODE_ENV=production` e verificação de prontidão em `/health/ready`. Para publicar:

1. Envie o repositório para uma conta GitHub autorizada e, no Render, crie um Blueprint conectado a esse repositório/branch usando `render.yaml`.
2. Preencha no Render `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` e `CORS_ORIGINS` com valores do ambiente de produção. Nunca coloque valores secretos no `render.yaml` ou no Git. `DB_PORT` é inicialmente `3306`; ajuste se o provedor do banco usar outra porta.
3. Use uma instância MySQL que aceite conexões de saída do Render. Configure TLS conforme o provedor e restrinja o firewall do banco aos IPs de saída indicados na página **Connect > Outbound** do serviço e à porta MySQL; não abra o banco para qualquer origem. Se o banco atual só aceitar conexões da rede local, configure um banco acessível pelo Render ou atualize a allowlist no provedor.
4. Configure `CORS_ORIGINS` com a origem exata do frontend publicado (esquema e domínio, sem caminho), por exemplo `https://frontend.example.com`. Para mais de um frontend, separe as origens por vírgula. Não use `*` em produção.
5. Aguarde o deploy ficar saudável. O Render injeta `PORT`; o processo autentica no banco antes de começar a escutar e o health check `/health/ready` verifica o acesso ao MySQL.
6. Copie a URL `onrender.com` atribuída pelo Render para a seção “Endereço da API” e teste `GET /teste`, `GET /health/ready` e o fluxo de cadastro/login.

A publicação exige acesso à conta Render, autorização para conectar o repositório e configuração válida/permitida pelo provedor MySQL. Esses acessos não ficam armazenados no repositório.

## Formato das requisições e respostas

As rotas que recebem dados aceitam JSON com `Content-Type: application/json`. Use `POST` para criar, `PATCH` para enviar somente os campos a atualizar e `DELETE` para remover ou desativar, conforme o recurso. Os nomes dos campos seguem as colunas do banco, em `snake_case`.

Listas e consultas normalmente retornam JSON com uma chave que identifica o recurso, como `produto`, `pedido`, `itens` ou `estoque`. Criações retornam `201` e uma mensagem, geralmente acompanhada do ID criado. Atualizações e exclusões retornam mensagem de confirmação. Alguns endpoints de leitura por ID retornam um objeto e outros retornam uma lista sob a chave do recurso; consulte o endpoint específico.

Respostas de erro incluem uma chave `mensagem` ou `erro`. Conforme a rota, dados inválidos podem retornar `400`, credenciais inválidas `401`, registros ausentes `404` e falhas internas ou de banco `500`.

## Rotas disponíveis

`/:id` representa o identificador do recurso indicado; `:idProduto`, `:idPedido` e `:idItem` representam identificadores específicos. As rotas abaixo são relativas à URL base da API.

| Recurso | Método e caminho | Finalidade |
|---|---|---|
| Verificação | `GET /teste` | Verifica se o servidor responde. |
| Login | `POST /login` | Valida email e senha de um usuário ativo. |
| Usuários | `GET /usuario` | Lista usuários sem incluir senhas. |
| Usuários | `GET /usuario/:id` | Consulta um usuário sem incluir senha. |
| Usuários | `POST /usuario` | Cadastra usuário; senha é armazenada como hash bcrypt. |
| Usuários | `PATCH /usuario/:id` | Atualiza campos permitidos; uma nova senha também é armazenada como hash. |
| Usuários | `DELETE /usuario/:id` | Remove usuário. |
| Funcionários | `GET /funcionario`, `GET /funcionario/:id` | Lista e consulta funcionários. |
| Funcionários | `POST /funcionario` | Cadastra funcionário; exige `nome`, `cargo` e `salario`. |
| Funcionários | `PATCH /funcionario/:id` | Atualiza campos enviados. |
| Funcionários | `DELETE /funcionario/:id` | Desativa o funcionário (`ativo = 0`). |
| Clientes | `GET /cliente`, `GET /cliente/:id` | Lista e consulta clientes. |
| Clientes | `POST /cliente` | Cadastra cliente. |
| Clientes | `PATCH /cliente/:id` | Atualiza campos enviados. |
| Clientes | `DELETE /cliente/:id` | Remove cliente. |
| Fornecedores | `GET /fornecedor`, `GET /fornecedor/:id` | Lista e consulta fornecedores. |
| Fornecedores | `POST /fornecedor` | Cadastra fornecedor. |
| Fornecedores | `PATCH /fornecedor/:id` | Atualiza campos enviados. |
| Fornecedores | `DELETE /fornecedor/:id` | Remove fornecedor. |
| Categorias | `GET /categoria`, `GET /categoria/:id` | Lista e consulta categorias. |
| Categorias | `POST /categoria` | Cadastra categoria; exige `nome`. |
| Categorias | `PATCH /categoria/:id` | Atualiza `nome`, `descricao` e/ou `ativo`. |
| Categorias | `DELETE /categoria/:id` | Remove categoria. |
| Produtos | `GET /produto`, `GET /produto/:id` | Lista e consulta produtos. |
| Produtos | `POST /produto` | Cadastra produto. |
| Produtos | `PATCH /produto/:id` | Atualiza campos enviados. |
| Produtos | `DELETE /produto/:id` | Remove produto. |
| Histórico de preços | `GET /produto/:idProduto/historico-precos` | Lista o histórico de preços em ordem decrescente de vigência. |
| Pedidos | `GET /pedido`, `GET /pedido/:id` | Lista e consulta pedidos. |
| Pedidos | `POST /pedido` | Cadastra pedido. |
| Pedidos | `PATCH /pedido/:id` | Atualiza campos enviados. |
| Pedidos | `DELETE /pedido/:id` | Remove pedido. |
| Itens do pedido | `GET /pedido/:idPedido/itens` | Lista os itens e o nome do produto associado. |
| Itens do pedido | `POST /pedido/:idPedido/itens` | Adiciona item; exige produto, quantidade inteira positiva e valor unitário não negativo. Calcula subtotal. |
| Itens do pedido | `PATCH /pedido/:idPedido/itens/:idItem` | Atualiza produto, quantidade e/ou valor unitário; recalcula subtotal. |
| Itens do pedido | `DELETE /pedido/:idPedido/itens/:idItem` | Remove item do pedido. |
| Entradas | `GET /entrada`, `GET /entrada/:id` | Lista e consulta entradas de produtos. |
| Entradas | `POST /entrada` | Registra entrada de produto. |
| Entradas | `PATCH /entrada/:id` | Atualiza entrada. |
| Entradas | `DELETE /entrada/:id` | Remove entrada. |
| Saídas | `GET /saida`, `GET /saida/:id` | Lista e consulta saídas de produtos. |
| Saídas | `POST /saida` | Registra saída de produto. |
| Saídas | `PATCH /saida/:id` | Atualiza saída. |
| Saídas | `DELETE /saida/:id` | Remove saída. |
| Movimentações | `GET /movimentacoes`, `GET /movimentacoes/:id` | Lista e consulta movimentações. |
| Movimentações | `POST /movimentacoes` | Registra movimentação. |
| Movimentações | `PATCH /movimentacoes/:id` | Atualiza movimentação. |
| Movimentações | `DELETE /movimentacoes/:id` | Remove movimentação. |
| Movimentações (compatibilidade) | Mesmos métodos em `/movimentações` | Alias com acentuação para as rotas de movimentações. Prefira `/movimentacoes`. |
| Estoque | `GET /estoque` | Lista estoque e produtos, incluindo produtos sem registro de estoque. |
| Estoque | `GET /estoque/:idProduto` | Consulta estoque e configuração de um produto. |
| Estoque | `PATCH /estoque/:idProduto` | Atualiza `estoque_minimo`, `estoque_maximo` e/ou `localizacao`; não altera quantidade. |

As rotas de recursos que têm `GET /:id`, `POST /`, `PATCH /:id` e `DELETE /:id` seguem esses métodos como indicado na tabela; não há `PUT` implementado. A quantidade em estoque é mantida pelas operações de entrada e saída e pelos gatilhos do banco, não por uma rota de edição direta.

## Cadastrar usuário e testar login

Use uma senha de teste e envie-a somente no corpo da requisição; não a grave em arquivos públicos. O cadastro aplica bcrypt antes de armazenar:

```http
POST /usuario HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "nome": "Usuario de teste",
  "email": "teste@example.com",
  "senha": "senha-de-teste-segura",
  "ativo": 1
}
```

A resposta de cadastro contém `mensagem` e `id_usu`, nunca a senha. Para autenticar:

```http
POST /login HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "email": "teste@example.com",
  "senha": "senha-de-teste-segura"
}
```

Com credenciais válidas de um usuário ativo, a API retorna `200`, a mensagem `Login realizado com sucesso.` e os dados públicos do usuário. Credenciais inválidas ou conta inativa retornam `401`; campos ausentes ou inválidos retornam `400`. A rota não gera token nem sessão.

Para remover o usuário de teste, use `DELETE /usuario/:id` com o ID retornado no cadastro.

## Autenticação e acesso às rotas

O login valida a identidade, mas não emite token nem sessão. **Atualmente nenhuma rota exige autenticação**: os demais endpoints podem ser chamados sem passar pelo login. Não trate os recursos como protegidos. Antes de disponibilizar a API em uma rede pública, implemente e aplique autorização, restrinja CORS (atualmente aceita todas as origens) e use HTTPS.

Senhas cadastradas e atualizadas pela API são armazenadas com bcrypt. Para compatibilidade com registros legados, o login aceita temporariamente uma senha em texto puro existente e substitui o valor por um hash bcrypt após autenticação bem-sucedida. Migre os dados legados e não inclua senhas reais, hashes, credenciais ou tokens no Git.
