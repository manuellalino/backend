const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const modelOptions = tableName => ({
    tableName,
    timestamps: false,
    freezeTableName: true
});

const Categoria = sequelize.define('Categoria', {
    id_categoria: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(100), allowNull: false },
    descricao: DataTypes.TEXT,
    ativo: DataTypes.TINYINT
}, modelOptions('categorias'));

const Cliente = sequelize.define('Cliente', {
    id_cliente: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false },
    contato: DataTypes.STRING(20),
    ativo: DataTypes.TINYINT,
    criado_em: DataTypes.DATE,
    atualizado_em: DataTypes.DATE
}, modelOptions('clientes'));

const Fornecedor = sequelize.define('Fornecedor', {
    id_fornecedor: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(100), allowNull: false },
    empresa: DataTypes.STRING(100),
    email: DataTypes.STRING(100),
    telefone: DataTypes.STRING(20),
    cidade: DataTypes.STRING(50),
    estado: DataTypes.CHAR(2),
    ativo: DataTypes.TINYINT,
    criado_em: DataTypes.DATE,
    atualizado_em: DataTypes.DATE
}, modelOptions('fornecedores'));

const Funcionario = sequelize.define('Funcionario', {
    id_funcionario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(100), allowNull: false },
    cargo: { type: DataTypes.STRING(50), allowNull: false },
    salario: { type: DataTypes.DOUBLE, allowNull: false },
    telefone: DataTypes.STRING(20),
    email: DataTypes.STRING(100),
    data_admissao: DataTypes.DATEONLY,
    ativo: DataTypes.TINYINT,
    criado_em: DataTypes.DATE,
    atualizado_em: DataTypes.DATE
}, modelOptions('funcionarios'));

const Usuario = sequelize.define('Usuario', {
    id_usu: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(80), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false },
    senha: { type: DataTypes.STRING(255), allowNull: false },
    contato: DataTypes.STRING(20),
    genero: DataTypes.CHAR(1),
    ativo: DataTypes.TINYINT,
    criado_em: DataTypes.DATE,
    atualizado_em: DataTypes.DATE
}, modelOptions('usuarios'));

const Produto = sequelize.define('Produto', {
    id_produto: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: DataTypes.STRING(100),
    descricao: { type: DataTypes.STRING(200), allowNull: false },
    preco: DataTypes.DECIMAL(10, 2),
    imagem_produto: { type: DataTypes.STRING(255), allowNull: false },
    criado_em: DataTypes.DATE,
    atualizado_em: DataTypes.DATE,
    id_categoria: DataTypes.INTEGER
}, modelOptions('produtos'));

const Pedido = sequelize.define('Pedido', {
    id_pedido: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    status: DataTypes.TINYINT,
    data_pedido: DataTypes.DATEONLY,
    id_cliente: DataTypes.INTEGER,
    criado_em: DataTypes.DATE,
    atualizado_em: DataTypes.DATE
}, modelOptions('pedidos'));

const PedidoItem = sequelize.define('PedidoItem', {
    id_item: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_pedido: DataTypes.INTEGER,
    id_produto: DataTypes.INTEGER,
    quantidade: DataTypes.INTEGER,
    valor_unitario: DataTypes.DECIMAL(10, 2),
    subtotal: DataTypes.DECIMAL(10, 2)
}, modelOptions('pedido_itens'));

const Entrada = sequelize.define('Entrada', {
    id_entrada: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_produto: { type: DataTypes.INTEGER, allowNull: false },
    id_fornecedor: { type: DataTypes.INTEGER, allowNull: false },
    quantidade: { type: DataTypes.INTEGER, allowNull: false },
    valor_unitario: { type: DataTypes.DOUBLE, allowNull: false },
    data_entrada: DataTypes.DATEONLY,
    observacao: DataTypes.STRING(200),
    criado_em: DataTypes.DATE,
    atualizado_em: DataTypes.DATE
}, modelOptions('entradas'));

const Saida = sequelize.define('Saida', {
    id_saida: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_produto: { type: DataTypes.INTEGER, allowNull: false },
    id_funcionario: { type: DataTypes.INTEGER, allowNull: false },
    quantidade: { type: DataTypes.INTEGER, allowNull: false },
    valor_unitario: { type: DataTypes.DOUBLE, allowNull: false },
    data_saida: DataTypes.DATEONLY,
    destino: DataTypes.STRING(100),
    criado_em: DataTypes.DATE,
    atualizado_em: DataTypes.DATE
}, modelOptions('saidas'));

const Movimentacao = sequelize.define('Movimentacao', {
    id_movimentacao: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_produto: DataTypes.INTEGER,
    tipo: DataTypes.ENUM('E', 'S', 'A', 'P', 'T'),
    quantidade: DataTypes.INTEGER,
    data_movimentacao: DataTypes.DATE,
    observacao: DataTypes.TEXT
}, modelOptions('movimentacoes'));

const Estoque = sequelize.define('Estoque', {
    id_estoque: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_produto: { type: DataTypes.INTEGER, unique: true, allowNull: false },
    quantidade: { type: DataTypes.INTEGER, allowNull: false },
    estoque_minimo: DataTypes.INTEGER,
    estoque_maximo: DataTypes.INTEGER,
    localizacao: DataTypes.STRING(100)
}, modelOptions('estoque'));

const HistoricoPreco = sequelize.define('HistoricoPreco', {
    id_historico: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_produto: DataTypes.INTEGER,
    preco: DataTypes.DECIMAL(10, 2),
    vigencia: DataTypes.DATEONLY
}, modelOptions('historico_precos'));

const Log = sequelize.define('Log', {
    id_log: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario: DataTypes.STRING(100),
    tabela_afetada: DataTypes.STRING(100),
    acao: DataTypes.STRING(50),
    registro: DataTypes.INTEGER,
    data_hora: DataTypes.DATE
}, modelOptions('logs'));

Categoria.hasMany(Produto, { foreignKey: 'id_categoria', as: 'produtos' });
Produto.belongsTo(Categoria, { foreignKey: 'id_categoria', as: 'categoria' });
Pedido.hasMany(PedidoItem, { foreignKey: 'id_pedido', as: 'itens' });
PedidoItem.belongsTo(Produto, { foreignKey: 'id_produto', as: 'produto' });
Produto.hasOne(Estoque, { foreignKey: 'id_produto', as: 'estoque' });
Estoque.belongsTo(Produto, { foreignKey: 'id_produto', as: 'produto' });

module.exports = {
    Categoria,
    Cliente,
    Fornecedor,
    Funcionario,
    Usuario,
    Produto,
    Pedido,
    PedidoItem,
    Entrada,
    Saida,
    Movimentacao,
    Estoque,
    HistoricoPreco,
    Log
};
