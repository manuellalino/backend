# API de Gestão de Loja

API REST em Node.js e Express para apoiar a gestão de uma loja. Ela disponibiliza operações para usuários, equipe, clientes, fornecedores, catálogo de produtos, pedidos e controle de estoque, com persistência em MySQL.

## Objetivos e funcionalidades

- Manter cadastros de usuários, funcionários, clientes, fornecedores e categorias.
- Gerenciar produtos e consultar o histórico de preços.
- Criar e atualizar pedidos e administrar os itens de cada pedido.
- Registrar entradas, saídas e movimentações de produtos.
- Consultar o estoque por produto e configurar seus limites mínimo e máximo e sua localização.
- Oferecer login por email e senha para usuários cadastrados.

## Tecnologias

- Node.js e Express
- MySQL
- JSON para corpos de requisição e respostas
- CORS habilitado para todas as origens (`*`)

## Como iniciar

Instale as dependências e inicie o servidor:

```bash
npm install
npm start
```

O servidor usa a porta definida em `PORT`; se ela não estiver definida, usa `5000`. Configure as credenciais do MySQL nas variáveis de ambiente:

| Variável | Descrição |
|---|---|
| `DB_HOST` | Endereço do servidor MySQL |
| `DB_PORT` | Porta do MySQL (padrão: `3306`) |
| `DB_USER` | Usuário do banco |
| `DB_PASSWORD` | Senha do banco |
| `DB_NAME` | Nome do banco de dados |

O arquivo `.env` pode ser usado para fornecer essas variáveis localmente. A API espera que o banco e suas tabelas já estejam criados.

## Endpoints

Os endpoints recebem e retornam JSON. Para operações de criação, envie os campos do recurso no corpo da requisição; para atualizações, envie via `PATCH` os campos que deseja alterar.

| Recurso | Endpoints | Funcionalidade |
|---|---|---|
| Verificação | `GET /teste` | Verifica se o servidor está respondendo. |
| Login | `POST /login` | Valida email e senha de um usuário ativo. |
| Usuários | `/usuario` | Listar, buscar por ID, cadastrar, atualizar e remover usuários. |
| Funcionários | `/funcionario` | Listar, buscar, cadastrar, atualizar e desativar funcionários. |
| Fornecedores | `/fornecedor` | Manter o cadastro de fornecedores. |
| Clientes | `/cliente` | Manter o cadastro de clientes. |
| Categorias | `/categoria` | Manter as categorias de produtos. |
| Produtos | `/produto` | Manter o catálogo de produtos. |
| Histórico de preços | `GET /produto/:idProduto/historico-precos` | Consultar o histórico de preços de um produto. |
| Estoque | `/estoque` | Listar o estoque, consultar o estoque de um produto e atualizar limites ou localização. |
| Pedidos | `/pedido` | Manter pedidos. |
| Itens do pedido | `/pedido/:idPedido/itens` | Listar, adicionar, atualizar e remover itens de um pedido. |
| Entradas | `/entrada` | Registrar e consultar entradas de produtos, além de atualizar ou remover registros. |
| Saídas | `/saida` | Registrar e consultar saídas de produtos, além de atualizar ou remover registros. |
| Movimentações | `/movimentacoes` ou `/movimentações` | Registrar, consultar, atualizar e remover movimentações. |

### Métodos das rotas de cadastro

Para `/usuario`, `/funcionario`, `/fornecedor`, `/cliente`, `/categoria`, `/produto`, `/pedido`, `/entrada`, `/saida` e `/movimentacoes`:

| Método | Caminho | Ação |
|---|---|---|
| `GET` | `/recurso` | Lista os registros. |
| `GET` | `/recurso/:id` | Busca um registro pelo identificador. |
| `POST` | `/recurso` | Cadastra um registro. |
| `PATCH` | `/recurso/:id` | Atualiza os campos enviados. |
| `DELETE` | `/recurso/:id` | Remove ou desativa um registro, conforme o recurso. |

O módulo de estoque não oferece cadastro ou remoção por esses métodos. A quantidade é consultada na tabela de estoque e não pode ser alterada diretamente por essa rota; `PATCH /estoque/:idProduto` atualiza somente `estoque_minimo`, `estoque_maximo` e `localizacao`.

### Exemplo: login

Requisição:

```http
POST /login
Content-Type: application/json
```

```json
{
  "email": "usuario@exemplo.com",
  "senha": "minha-senha"
}
```

Com credenciais válidas, a resposta contém uma mensagem e os dados públicos do usuário, sem a senha. Credenciais inválidas ou usuário inativo retornam `401`; email ou senha ausentes ou inválidos no formato retornam `400`.

## Respostas e erros

As respostas de sucesso normalmente incluem os dados sob uma chave referente ao recurso, como `produto`, `pedido` ou `estoque`, ou uma mensagem de confirmação. Um recurso inexistente pode retornar `404`; erros de validação retornam `400`; falhas de conexão ou consulta ao banco retornam `500`. Uma rota não registrada retorna `404`.

## Autenticação e segurança

O login valida credenciais e verifica se o usuário está ativo, mas **não gera token nem sessão**. As demais rotas não exigem autenticação por token ou sessão no código atual. Portanto, o login, por si só, não protege os demais endpoints.

A rota de login reconhece senhas bcrypt e, por compatibilidade com registros existentes, também compara senhas armazenadas em texto puro. Senhas em texto puro devem ser migradas para hashes seguros. Restrinja a exposição da API e configure CORS adequadamente antes de disponibilizá-la publicamente.
