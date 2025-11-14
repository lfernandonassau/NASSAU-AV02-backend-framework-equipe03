-- 🧩 Tabela de usuários
CREATE TABLE usuario (
  id_usuario SERIAL PRIMARY KEY,
  nome VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  senha VARCHAR NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('organizador', 'participante')),
  data_nascimento DATE NOT NULL,
  visibilidade TEXT NOT NULL DEFAULT 'ativo' CHECK (visibilidade IN ('ativo', 'inativo', 'excluido')),
  status_interno TEXT DEFAULT 'normal' CHECK (status_interno IN ('normal', 'bloqueado', 'expirado'))
);

-- 🧩 Categorias de eventos
CREATE TABLE categoria (
  id_categoria SERIAL PRIMARY KEY,
  nome VARCHAR NOT NULL,
  descricao TEXT,
  visibilidade TEXT NOT NULL DEFAULT 'ativo' CHECK (visibilidade IN ('ativo', 'inativo', 'excluido')),
  status_interno TEXT DEFAULT 'normal' CHECK (status_interno IN ('normal', 'bloqueado', 'expirado'))
);

-- 🧩 Locais
CREATE TABLE local (
  id_local SERIAL PRIMARY KEY,
  nome VARCHAR NOT NULL,
  endereco VARCHAR,
  capacidade INTEGER,
  visibilidade TEXT NOT NULL DEFAULT 'ativo' CHECK (visibilidade IN ('ativo', 'inativo', 'excluido')),
  status_interno TEXT DEFAULT 'normal' CHECK (status_interno IN ('normal', 'bloqueado', 'expirado'))
);

-- 🧩 Eventos
CREATE TABLE evento (
  id_evento SERIAL PRIMARY KEY,
  titulo VARCHAR NOT NULL,
  descricao TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  id_local INTEGER NOT NULL REFERENCES local(id_local),
  id_categoria INTEGER NOT NULL REFERENCES categoria(id_categoria),
  visibilidade TEXT NOT NULL DEFAULT 'ativo' CHECK (visibilidade IN ('ativo', 'inativo', 'excluido')),
  status_interno TEXT DEFAULT 'normal' CHECK (status_interno IN ('normal', 'expirado', 'cancelado'))
);

-- 🧩 Palestrantes
CREATE TABLE palestrante (
  id_palestrante SERIAL PRIMARY KEY,
  nome VARCHAR NOT NULL,
  bio TEXT,
  email VARCHAR,
  telefone VARCHAR,
  visibilidade TEXT NOT NULL DEFAULT 'ativo' CHECK (visibilidade IN ('ativo', 'inativo', 'excluido')),
  status_interno TEXT DEFAULT 'normal' CHECK (status_interno IN ('normal', 'bloqueado', 'expirado'))
);

-- 🧩 Palestras
CREATE TABLE palestra (
  id_palestra SERIAL PRIMARY KEY,
  titulo VARCHAR NOT NULL,
  descricao TEXT,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  id_evento INTEGER NOT NULL REFERENCES evento(id_evento),
  id_palestrante INTEGER REFERENCES palestrante(id_palestrante),
  visibilidade TEXT NOT NULL DEFAULT 'ativo' CHECK (visibilidade IN ('ativo', 'inativo', 'excluido')),
  status_interno TEXT DEFAULT 'normal' CHECK (status_interno IN ('normal', 'expirado', 'cancelado'))
);

-- 🧩 Inscrições
CREATE TABLE inscricao (
  id_inscricao SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario),
  id_evento INTEGER NOT NULL REFERENCES evento(id_evento),
  data_inscricao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('pendente', 'confirmada', 'cancelada')),
  visibilidade TEXT NOT NULL DEFAULT 'ativo' CHECK (visibilidade IN ('ativo', 'inativo', 'excluido')),
  status_interno TEXT DEFAULT 'normal' CHECK (status_interno IN ('normal', 'expirado', 'removido'))
);

-- 🧩 Certificados
CREATE TABLE certificado (
  id_certificado SERIAL PRIMARY KEY,
  id_inscricao INTEGER NOT NULL REFERENCES inscricao(id_inscricao),
  codigo VARCHAR NOT NULL UNIQUE,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  visibilidade TEXT NOT NULL DEFAULT 'ativo' CHECK (visibilidade IN ('ativo', 'inativo', 'excluido')),
  status_interno TEXT DEFAULT 'normal' CHECK (status_interno IN ('normal', 'revogado', 'expirado'))
);

-- 🧩 Pagamentos
CREATE TABLE pagamento (
  id_pagamento SERIAL PRIMARY KEY,
  id_inscricao INTEGER NOT NULL REFERENCES inscricao(id_inscricao),
  valor NUMERIC NOT NULL CHECK (valor >= 0),
  status TEXT NOT NULL CHECK (status IN ('pendente', 'pago', 'reembolsado')),
  data_pagamento TIMESTAMP WITH TIME ZONE,
  visibilidade TEXT NOT NULL DEFAULT 'ativo' CHECK (visibilidade IN ('ativo', 'inativo', 'excluido')),
  status_interno TEXT DEFAULT 'normal' CHECK (status_interno IN ('normal', 'reembolsado', 'expirado'))
);

-- 🧩 Avaliações
CREATE TABLE avaliacao (
  id_avaliacao SERIAL PRIMARY KEY,
  id_palestra INTEGER NOT NULL REFERENCES palestra(id_palestra),
  id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario),
  nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  visibilidade TEXT NOT NULL DEFAULT 'ativo' CHECK (visibilidade IN ('ativo', 'inativo', 'excluido')),
  status_interno TEXT DEFAULT 'normal' CHECK (status_interno IN ('normal', 'moderado', 'oculto'))
);

-- 🔍 Índices
CREATE INDEX idx_evento_id_local ON evento (id_local);
CREATE INDEX idx_evento_id_categoria ON evento (id_categoria);
CREATE INDEX idx_palestra_id_evento ON palestra (id_evento);
CREATE INDEX idx_palestra_id_palestrante ON palestra (id_palestrante);
CREATE INDEX idx_inscricao_id_usuario ON inscricao (id_usuario);
CREATE INDEX idx_inscricao_id_evento ON inscricao (id_evento);
CREATE INDEX idx_certificado_id_inscricao ON certificado (id_inscricao);
CREATE INDEX idx_avaliacao_palestra_usuario ON avaliacao (id_palestra, id_usuario);
CREATE INDEX idx_pagamento_id_inscricao ON pagamento (id_inscricao);

-- ⚙️ Função e trigger de verificação de idade
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
    FROM usuario
    WHERE id_usuario = NEW.id_usuario;

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


-- ⚙️ Função e trigger para bloquear inscrição de usuários excluídos
CREATE OR REPLACE FUNCTION bloquear_usuario_excluido()
RETURNS TRIGGER AS $$
DECLARE
  estado TEXT;
BEGIN
  SELECT visibilidade INTO estado
  FROM usuario
  WHERE id_usuario = NEW.id_usuario;

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

