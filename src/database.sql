-- Armazena os usuários do sistema (participantes e organizadores)
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(90) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(90) NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('organizador', 'participante'))
);

-- Guarda os locais onde os eventos acontecem
CREATE TABLE local (
    id_local SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    endereco VARCHAR(255),
    capacidade INT
);

-- Categorias para os eventos
CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);

-- Eventos cadastrados no sistema
CREATE TABLE evento (
    id_evento SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    id_local INT NOT NULL,
    id_categoria INT NOT NULL,
    CONSTRAINT fk_evento_local FOREIGN KEY (id_local) REFERENCES local(id_local) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_evento_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Palestrantes convidados
CREATE TABLE palestrante (
    id_palestrante SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    bio TEXT,
    email VARCHAR(150),
    telefone VARCHAR(20)
);

-- Palestras dentro dos eventos
CREATE TABLE palestra (
    id_palestra SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    id_evento INT NOT NULL,
    id_palestrante INT,
    CONSTRAINT fk_palestra_evento FOREIGN KEY (id_evento) REFERENCES evento(id_evento) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_palestra_palestrante FOREIGN KEY (id_palestrante) REFERENCES palestrante(id_palestrante) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Inscrição de usuário no evento
CREATE TABLE inscricao (
    id_inscricao SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_evento INT NOT NULL,
    data_inscricao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('pendente', 'confirmada', 'cancelada')),
    CONSTRAINT fk_inscricao_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_inscricao_evento FOREIGN KEY (id_evento) REFERENCES evento(id_evento) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Certificados emitidos para inscrições concluídas
CREATE TABLE certificado (
    id_certificado SERIAL PRIMARY KEY,
    id_inscricao INT NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT fk_certificado_inscricao FOREIGN KEY (id_inscricao) REFERENCES inscricao(id_inscricao) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Avaliações das palestras
CREATE TABLE avaliacao (
    id_avaliacao SERIAL PRIMARY KEY,
    id_palestra INT NOT NULL,
    id_usuario INT NOT NULL,
    nota INT NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    CONSTRAINT fk_avaliacao_palestra FOREIGN KEY (id_palestra) REFERENCES palestra(id_palestra) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_avaliacao_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uniq_avaliacao_usuario_palestra UNIQUE (id_palestra, id_usuario)
);

-- Pagamentos das inscrições
CREATE TABLE pagamento (
    id_pagamento SERIAL PRIMARY KEY,
    id_inscricao INT NOT NULL,
    valor NUMERIC(10,2) NOT NULL CHECK (valor >= 0),
    status TEXT NOT NULL CHECK (status IN ('pendente', 'pago', 'reembolsado')),
    data_pagamento TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_pagamento_inscricao FOREIGN KEY (id_inscricao) REFERENCES inscricao(id_inscricao) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Índices recomendados para performance em joins/filtragens
CREATE INDEX IF NOT EXISTS idx_evento_id_local ON evento (id_local);
CREATE INDEX IF NOT EXISTS idx_evento_id_categoria ON evento (id_categoria);
CREATE INDEX IF NOT EXISTS idx_palestra_id_evento ON palestra (id_evento);
CREATE INDEX IF NOT EXISTS idx_palestra_id_palestrante ON palestra (id_palestrante);
CREATE INDEX IF NOT EXISTS idx_inscricao_id_usuario ON inscricao (id_usuario);
CREATE INDEX IF NOT EXISTS idx_inscricao_id_evento ON inscricao (id_evento);
CREATE INDEX IF NOT EXISTS idx_certificado_id_inscricao ON certificado (id_inscricao);
CREATE INDEX IF NOT EXISTS idx_avaliacao_palestra_usuario ON avaliacao (id_palestra, id_usuario);
CREATE INDEX IF NOT EXISTS idx_pagamento_id_inscricao ON pagamento (id_inscricao);