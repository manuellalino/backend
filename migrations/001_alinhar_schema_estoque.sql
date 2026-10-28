-- Execute uma única vez em uma base já criada com o dump original.
-- Para uma instalação nova, importe o dump atualizado em vez desta migração.

ALTER TABLE `funcionarios`
  ADD PRIMARY KEY (`id_funcionario`),
  MODIFY `id_funcionario` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `saidas`
  ADD PRIMARY KEY (`id_saida`),
  MODIFY `id_saida` int(11) NOT NULL AUTO_INCREMENT,
  ADD CONSTRAINT `fk_saidas_funcionarios`
    FOREIGN KEY (`id_funcionario`) REFERENCES `funcionarios` (`id_funcionario`);

ALTER TABLE `pedido_itens`
  DROP FOREIGN KEY `pedido_itens_ibfk_1`,
  ADD CONSTRAINT `pedido_itens_ibfk_1`
    FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`) ON DELETE CASCADE;

INSERT INTO `estoque` (`id_produto`, `quantidade`)
SELECT p.id_produto, COALESCE(e.quantidade, 0) - COALESCE(s.quantidade, 0)
FROM produtos p
LEFT JOIN (
  SELECT id_produto, SUM(quantidade) AS quantidade
  FROM entradas
  GROUP BY id_produto
) e ON e.id_produto = p.id_produto
LEFT JOIN (
  SELECT id_produto, SUM(quantidade) AS quantidade
  FROM saidas
  GROUP BY id_produto
) s ON s.id_produto = p.id_produto
ON DUPLICATE KEY UPDATE quantidade = VALUES(quantidade);

DROP TRIGGER IF EXISTS `trg_entrada_estoque`;
DROP TRIGGER IF EXISTS `trg_entrada_validar_insert`;
DROP TRIGGER IF EXISTS `trg_entrada_validar_update`;
DROP TRIGGER IF EXISTS `trg_entrada_estoque_update`;
DROP TRIGGER IF EXISTS `trg_entrada_validar_delete`;
DROP TRIGGER IF EXISTS `trg_entrada_estoque_delete`;
DROP TRIGGER IF EXISTS `trg_saida_estoque`;
DROP TRIGGER IF EXISTS `trg_saida_validar_insert`;
DROP TRIGGER IF EXISTS `trg_saida_validar_update`;
DROP TRIGGER IF EXISTS `trg_saida_estoque_update`;
DROP TRIGGER IF EXISTS `trg_saida_estoque_delete`;
DROP TRIGGER IF EXISTS `trg_historico_preco`;

DELIMITER $$

CREATE TRIGGER `trg_historico_preco` AFTER UPDATE ON `produtos` FOR EACH ROW
BEGIN
  IF NOT (OLD.preco <=> NEW.preco) THEN
    INSERT INTO historico_precos (id_produto, preco, vigencia)
    VALUES (NEW.id_produto, NEW.preco, CURDATE());
  END IF;
END$$

CREATE TRIGGER `trg_entrada_validar_insert` BEFORE INSERT ON `entradas` FOR EACH ROW
BEGIN
  IF NEW.quantidade <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A quantidade da entrada deve ser positiva';
  END IF;
END$$

CREATE TRIGGER `trg_entrada_estoque` AFTER INSERT ON `entradas` FOR EACH ROW
BEGIN
  INSERT INTO estoque (id_produto, quantidade)
  VALUES (NEW.id_produto, NEW.quantidade)
  ON DUPLICATE KEY UPDATE quantidade = quantidade + VALUES(quantidade);
END$$

CREATE TRIGGER `trg_entrada_validar_update` BEFORE UPDATE ON `entradas` FOR EACH ROW
BEGIN
  DECLARE v_estoque INT DEFAULT 0;
  IF NEW.quantidade <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A quantidade da entrada deve ser positiva';
  END IF;
  IF OLD.id_produto = NEW.id_produto THEN
    SELECT COALESCE((SELECT quantidade FROM estoque WHERE id_produto = OLD.id_produto), 0)
      INTO v_estoque;
    IF v_estoque + NEW.quantidade - OLD.quantidade < 0 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A alteração deixaria o estoque negativo';
    END IF;
  ELSE
    SELECT COALESCE((SELECT quantidade FROM estoque WHERE id_produto = OLD.id_produto), 0)
      INTO v_estoque;
    IF v_estoque - OLD.quantidade < 0 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A alteração deixaria o estoque negativo';
    END IF;
  END IF;
END$$

CREATE TRIGGER `trg_entrada_estoque_update` AFTER UPDATE ON `entradas` FOR EACH ROW
BEGIN
  IF OLD.id_produto = NEW.id_produto THEN
    UPDATE estoque
    SET quantidade = quantidade + NEW.quantidade - OLD.quantidade
    WHERE id_produto = OLD.id_produto;
  ELSE
    UPDATE estoque
    SET quantidade = quantidade - OLD.quantidade
    WHERE id_produto = OLD.id_produto;
    INSERT INTO estoque (id_produto, quantidade)
    VALUES (NEW.id_produto, NEW.quantidade)
    ON DUPLICATE KEY UPDATE quantidade = quantidade + VALUES(quantidade);
  END IF;
END$$

CREATE TRIGGER `trg_entrada_validar_delete` BEFORE DELETE ON `entradas` FOR EACH ROW
BEGIN
  DECLARE v_estoque INT DEFAULT 0;
  SELECT COALESCE((SELECT quantidade FROM estoque WHERE id_produto = OLD.id_produto), 0)
    INTO v_estoque;
  IF v_estoque - OLD.quantidade < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A exclusão deixaria o estoque negativo';
  END IF;
END$$

CREATE TRIGGER `trg_entrada_estoque_delete` AFTER DELETE ON `entradas` FOR EACH ROW
BEGIN
  UPDATE estoque
  SET quantidade = quantidade - OLD.quantidade
  WHERE id_produto = OLD.id_produto;
END$$

CREATE TRIGGER `trg_saida_validar_insert` BEFORE INSERT ON `saidas` FOR EACH ROW
BEGIN
  DECLARE v_estoque INT DEFAULT 0;
  IF NEW.quantidade <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A quantidade da saída deve ser positiva';
  END IF;
  SELECT COALESCE((SELECT quantidade FROM estoque WHERE id_produto = NEW.id_produto), 0)
    INTO v_estoque;
  IF v_estoque < NEW.quantidade THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Estoque insuficiente para a saída';
  END IF;
END$$

CREATE TRIGGER `trg_saida_estoque` AFTER INSERT ON `saidas` FOR EACH ROW
BEGIN
  UPDATE estoque
  SET quantidade = quantidade - NEW.quantidade
  WHERE id_produto = NEW.id_produto;
END$$

CREATE TRIGGER `trg_saida_validar_update` BEFORE UPDATE ON `saidas` FOR EACH ROW
BEGIN
  DECLARE v_estoque INT DEFAULT 0;
  IF NEW.quantidade <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A quantidade da saída deve ser positiva';
  END IF;
  SELECT COALESCE((SELECT quantidade FROM estoque WHERE id_produto = NEW.id_produto), 0)
    INTO v_estoque;
  IF OLD.id_produto = NEW.id_produto THEN
    SET v_estoque = v_estoque + OLD.quantidade;
  END IF;
  IF v_estoque < NEW.quantidade THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Estoque insuficiente para a saída';
  END IF;
END$$

CREATE TRIGGER `trg_saida_estoque_update` AFTER UPDATE ON `saidas` FOR EACH ROW
BEGIN
  IF OLD.id_produto = NEW.id_produto THEN
    UPDATE estoque
    SET quantidade = quantidade + OLD.quantidade - NEW.quantidade
    WHERE id_produto = OLD.id_produto;
  ELSE
    UPDATE estoque
    SET quantidade = quantidade + OLD.quantidade
    WHERE id_produto = OLD.id_produto;
    UPDATE estoque
    SET quantidade = quantidade - NEW.quantidade
    WHERE id_produto = NEW.id_produto;
  END IF;
END$$

CREATE TRIGGER `trg_saida_estoque_delete` AFTER DELETE ON `saidas` FOR EACH ROW
BEGIN
  UPDATE estoque
  SET quantidade = quantidade + OLD.quantidade
  WHERE id_produto = OLD.id_produto;
END$$

DELIMITER ;
