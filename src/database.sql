-- Tabela de usuários do sistema
CREATE TABLE usuario (
  id_usuario SERIAL PRIMARY KEY,
  nome VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  senha VARCHAR NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('organizador', 'participante')),
  data_nascimento DATE NOT NULL
);

-- Categorias de eventos (ex: "Workshop", "18+", "Palestra")
CREATE TABLE categoria (
  id_categoria SERIAL PRIMARY KEY,
  nome VARCHAR NOT NULL,
  descricao TEXT
);

-- Locais onde eventos acontecem
CREATE TABLE local (
  id_local SERIAL PRIMARY KEY,
  nome VARCHAR NOT NULL,
  endereco VARCHAR,
  capacidade INTEGER
);

-- Eventos criados
CREATE TABLE evento (
  id_evento SERIAL PRIMARY KEY,
  titulo VARCHAR NOT NULL,
  descricao TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  id_local INTEGER NOT NULL,
  id_categoria INTEGER NOT NULL,
  FOREIGN KEY (id_local) REFERENCES local(id_local),
  FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

-- Palestrantes convidados
CREATE TABLE palestrante (
  id_palestrante SERIAL PRIMARY KEY,
  nome VARCHAR NOT NULL,
  bio TEXT,
  email VARCHAR,
  telefone VARCHAR
);

-- Palestras dentro dos eventos
CREATE TABLE palestra (
  id_palestra SERIAL PRIMARY KEY,
  titulo VARCHAR NOT NULL,
  descricao TEXT,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  id_evento INTEGER NOT NULL,
  id_palestrante INTEGER,
  FOREIGN KEY (id_evento) REFERENCES evento(id_evento),
  FOREIGN KEY (id_palestrante) REFERENCES palestrante(id_palestrante)
);

-- Inscrições dos usuários nos eventos
CREATE TABLE inscricao (
  id_inscricao SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL,
  id_evento INTEGER NOT NULL,
  data_inscricao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('pendente', 'confirmada', 'cancelada')),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
  FOREIGN KEY (id_evento) REFERENCES evento(id_evento)
);

-- Certificados gerados após a conclusão
CREATE TABLE certificado (
  id_certificado SERIAL PRIMARY KEY,
  id_inscricao INTEGER NOT NULL,
  codigo VARCHAR NOT NULL UNIQUE,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  FOREIGN KEY (id_inscricao) REFERENCES inscricao(id_inscricao)
);

-- Pagamentos das inscrições
CREATE TABLE pagamento (
  id_pagamento SERIAL PRIMARY KEY,
  id_inscricao INTEGER NOT NULL,
  valor NUMERIC NOT NULL CHECK (valor >= 0),
  status TEXT NOT NULL CHECK (status IN ('pendente', 'pago', 'reembolsado')),
  data_pagamento TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (id_inscricao) REFERENCES inscricao(id_inscricao)
);

-- Avaliações das palestras feitas pelos usuários
CREATE TABLE avaliacao (
  id_avaliacao SERIAL PRIMARY KEY,
  id_palestra INTEGER NOT NULL,
  id_usuario INTEGER NOT NULL,
  nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  FOREIGN KEY (id_palestra) REFERENCES palestra(id_palestra),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);


-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_evento_id_local ON evento (id_local);
CREATE INDEX IF NOT EXISTS idx_evento_id_categoria ON evento (id_categoria);
CREATE INDEX IF NOT EXISTS idx_palestra_id_evento ON palestra (id_evento);
CREATE INDEX IF NOT EXISTS idx_palestra_id_palestrante ON palestra (id_palestrante);
CREATE INDEX IF NOT EXISTS idx_inscricao_id_usuario ON inscricao (id_usuario);
CREATE INDEX IF NOT EXISTS idx_inscricao_id_evento ON inscricao (id_evento);
CREATE INDEX IF NOT EXISTS idx_certificado_id_inscricao ON certificado (id_inscricao);
CREATE INDEX IF NOT EXISTS idx_avaliacao_palestra_usuario ON avaliacao (id_palestra, id_usuario);
CREATE INDEX IF NOT EXISTS idx_pagamento_id_inscricao ON pagamento (id_inscricao);


-- Função que impede menores de entrarem em eventos restritos (ex: "18+", "maiores", "adulto")
CREATE OR REPLACE FUNCTION verificar_idade_evento()
RETURNS TRIGGER AS $$
DECLARE
  nome_categoria TEXT;
  data_nasc DATE;
BEGIN
  SELECT c.nome
    INTO nome_categoria
    FROM evento e
    JOIN categoria c ON c.id_categoria = e.id_categoria
   WHERE e.id_evento = NEW.id_evento;

  IF nome_categoria ~* '(18|\+18|maior|adult)' THEN
    SELECT data_nascimento
      INTO data_nasc
      FROM usuario
     WHERE id_usuario = NEW.id_usuario;

    IF age(CURRENT_DATE, data_nasc) < INTERVAL '18 years' THEN
      RAISE EXCEPTION 'Inscrição bloqueada: este evento é restrito a maiores de 18 anos.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger ligado à tabela de inscrição
CREATE TRIGGER trigger_verificar_idade_evento
BEFORE INSERT ON inscricao
FOR EACH ROW
EXECUTE FUNCTION verificar_idade_evento();
