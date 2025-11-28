-- =============================================
-- ============= TRIGGERS DE REGRAS ============
-- =============================================

-- 🔍 Validar idade mínima para eventos 18+
CREATE OR REPLACE FUNCTION verificar_idade_evento()
RETURNS TRIGGER AS $$
DECLARE
  nome_categoria TEXT;
  data_nasc DATE;
  idade INTEGER;
BEGIN
  SELECT c.nome INTO nome_categoria
  FROM evento e
  JOIN categoria c ON c.id_categoria = e.id_categoria
  WHERE e.id_evento = NEW.id_evento;

  IF nome_categoria ~* '(18|\+18|maior|adult)' THEN
    SELECT data_nascimento INTO data_nasc
    FROM usuario WHERE id_usuario = NEW.id_usuario;

    SELECT EXTRACT(YEAR FROM age(CURRENT_DATE, data_nasc))::int INTO idade;

    IF idade < 18 THEN
      RAISE EXCEPTION 'Inscrição bloqueada: este evento é restrito a maiores de 18 anos.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_verificar_idade_evento
BEFORE INSERT ON inscricao
FOR EACH ROW
EXECUTE FUNCTION verificar_idade_evento();


-- ❌ Impedir inscrição de usuário excluído
CREATE OR REPLACE FUNCTION bloquear_usuario_excluido()
RETURNS TRIGGER AS $$
DECLARE estado TEXT;
BEGIN
  SELECT visibilidade INTO estado
  FROM usuario WHERE id_usuario = NEW.id_usuario;

  IF estado = 'excluido' THEN
    RAISE EXCEPTION 'Inscrição não permitida: usuário está excluído.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bloquear_usuario_excluido
BEFORE INSERT ON inscricao
FOR EACH ROW
EXECUTE FUNCTION bloquear_usuario_excluido();


-- 🎂 Validar data de nascimento
CREATE OR REPLACE FUNCTION verificar_data_nascimento_valida()
RETURNS TRIGGER AS $$
DECLARE idade INTEGER;
BEGIN
  SELECT EXTRACT(YEAR FROM age(CURRENT_DATE, NEW.data_nascimento))::int INTO idade;

  IF idade < 0 THEN
    RAISE EXCEPTION 'Data de nascimento inválida: futuro.';
  END IF;

  IF idade > 120 THEN
    RAISE EXCEPTION 'Data de nascimento inválida: idade maior que 120.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_data_nascimento
BEFORE INSERT OR UPDATE ON usuario
FOR EACH ROW
EXECUTE FUNCTION verificar_data_nascimento_valida();
