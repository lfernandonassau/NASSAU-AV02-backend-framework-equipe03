-- =============================================
-- =============== CONFIGURAÇÕES ===============
-- =============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =============================================
-- =============== USUARIO =====================
-- =============================================

CREATE TABLE public.usuario (
  id_usuario SERIAL PRIMARY KEY,
  nome VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  senha VARCHAR NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('organizador', 'participante')),
  data_nascimento DATE NOT NULL,
  visibilidade TEXT NOT NULL DEFAULT 'ativo'
    CHECK (visibilidade IN ('ativo', 'inativo', 'excluido')),
  status_interno TEXT DEFAULT 'normal'
    CHECK (status_interno IN (
      'normal','bloqueado','expirado','removido',
      'cancelado','revogado','moderado','oculto'
    )),
  foto_url VARCHAR,
  telefone VARCHAR UNIQUE
);


-- =============================================
-- =============== CATEGORIA ===================
-- =============================================

CREATE TABLE public.categoria (
  id_categoria SERIAL PRIMARY KEY,
  nome VARCHAR NOT NULL,
  descricao TEXT,
  visibilidade TEXT NOT NULL DEFAULT 'ativo'
    CHECK (visibilidade IN ('ativo','inativo','excluido')),
  status_interno TEXT DEFAULT 'normal'
    CHECK (status_interno IN (
      'normal','bloqueado','expirado','removido',
      'cancelado','revogado','moderado','oculto'
    ))
);


-- =============================================
-- =============== LOCAL =======================
-- =============================================

CREATE TABLE public.local (
  id_local SERIAL PRIMARY KEY,
  nome VARCHAR NOT NULL,
  endereco VARCHAR,
  capacidade INTEGER,
  visibilidade TEXT NOT NULL DEFAULT 'ativo'
    CHECK (visibilidade IN ('ativo','inativo','excluido')),
  status_interno TEXT DEFAULT 'normal'
    CHECK (status_interno IN (
      'normal','bloqueado','expirado','removido',
      'cancelado','revogado','moderado','oculto'
    ))
);


-- =============================================
-- =============== EVENTO ======================
-- =============================================

CREATE TABLE public.evento (
  id_evento SERIAL PRIMARY KEY,
  titulo VARCHAR NOT NULL,
  descricao TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  id_local INTEGER NOT NULL,
  id_categoria INTEGER NOT NULL,
  visibilidade TEXT NOT NULL DEFAULT 'ativo'
    CHECK (visibilidade IN ('ativo','inativo','excluido','publico','privado')),
  status_interno TEXT DEFAULT 'normal'
    CHECK (status_interno IN (
      'normal','bloqueado','expirado','removido','cancelado',
      'revogado','moderado','oculto'
    )),
  id_usuario_criador INTEGER NOT NULL,

  CONSTRAINT fk_evento_local FOREIGN KEY (id_local)
    REFERENCES public.local(id_local),

  CONSTRAINT fk_evento_categoria FOREIGN KEY (id_categoria)
    REFERENCES public.categoria(id_categoria),

  CONSTRAINT fk_evento_usuario_criador FOREIGN KEY (id_usuario_criador)
    REFERENCES public.usuario(id_usuario)
);


-- =============================================
-- =============== CONVITE_EVENTO ==============
-- =============================================

CREATE TABLE public.convite_evento (
  id_convite_evento SERIAL PRIMARY KEY,
  id_evento INTEGER NOT NULL,
  id_usuario_convidado INTEGER NOT NULL,
  id_usuario_remetente INTEGER,
  status TEXT NOT NULL DEFAULT 'enviado'
    CHECK (status IN ('enviado', 'aceito', 'recusado', 'expirado')),
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  data_envio TIMESTAMPTZ NOT NULL DEFAULT now(),
  expiracao TIMESTAMPTZ,
  observacao TEXT,
  visibilidade TEXT NOT NULL DEFAULT 'ativo'
    CHECK (visibilidade IN ('ativo','inativo','excluido')),
  status_interno TEXT NOT NULL DEFAULT 'normal'
    CHECK (status_interno IN (
      'normal','bloqueado','expirado','removido','cancelado',
      'revogado','moderado','oculto'
    )),
  assento VARCHAR,
  secao VARCHAR,
  papel_sugerido TEXT CHECK (papel_sugerido IN (
    'participante','organizador','moderador','convidado'
  )),

  CONSTRAINT convite_evento_id_evento_fkey FOREIGN KEY (id_evento)
    REFERENCES public.evento(id_evento),

  CONSTRAINT convite_evento_id_usuario_convidado_fkey FOREIGN KEY (id_usuario_convidado)
    REFERENCES public.usuario(id_usuario),

  CONSTRAINT convite_evento_id_usuario_remetente_fkey FOREIGN KEY (id_usuario_remetente)
    REFERENCES public.usuario(id_usuario)
);


-- =============================================
-- ============ EVENTO_USUARIO =================
-- =============================================

CREATE TABLE public.evento_usuario (
  id_evento INTEGER NOT NULL,
  id_usuario INTEGER NOT NULL,
  papel TEXT NOT NULL CHECK (papel IN (
    'participante','organizador','convidado','moderador','palestrante'
  )),
  is_criador BOOLEAN NOT NULL DEFAULT false,
  convite_status TEXT DEFAULT 'NAO'
    CHECK (convite_status IN ('SIM','NAO','ACEITO')),
  origem_convite INTEGER,
  assento VARCHAR,
  secao VARCHAR,
  data_atribuicao TIMESTAMPTZ NOT NULL DEFAULT now(),
  observacao TEXT,
  visibilidade TEXT NOT NULL DEFAULT 'ativo'
    CHECK (visibilidade IN ('ativo','inativo','excluido')),
  status_interno TEXT NOT NULL DEFAULT 'normal'
    CHECK (status_interno IN (
      'normal','bloqueado','expirado','removido','cancelado',
      'revogado','moderado','oculto'
    )),

  PRIMARY KEY (id_evento, id_usuario),

  CONSTRAINT evento_usuario_id_evento_fkey FOREIGN KEY (id_evento)
    REFERENCES public.evento(id_evento),

  CONSTRAINT evento_usuario_id_usuario_fkey FOREIGN KEY (id_usuario)
    REFERENCES public.usuario(id_usuario),

  CONSTRAINT evento_usuario_origem_convite_fkey FOREIGN KEY (origem_convite)
    REFERENCES public.convite_evento(id_convite_evento)
);


-- =============================================
-- =============== INSCRICAO ===================
-- =============================================

CREATE TABLE public.inscricao (
  id_inscricao SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL,
  id_evento INTEGER NOT NULL,
  data_inscricao TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('pendente','confirmada','cancelada')),
  visibilidade TEXT NOT NULL DEFAULT 'ativo'
    CHECK (visibilidade IN ('ativo','inativo','excluido')),
  status_interno TEXT DEFAULT 'normal'
    CHECK (status_interno IN (
      'normal','bloqueado','expirado','removido','cancelado',
      'revogado','moderado','oculto'
    )),
  assento VARCHAR,
  secao VARCHAR,

  CONSTRAINT fk_inscricao_usuario FOREIGN KEY (id_usuario)
    REFERENCES public.usuario(id_usuario),

  CONSTRAINT fk_inscricao_evento FOREIGN KEY (id_evento)
    REFERENCES public.evento(id_evento)
);


-- =============================================
-- =============== CERTIFICADO =================
-- =============================================

CREATE TABLE public.certificado (
  id_certificado SERIAL PRIMARY KEY,
  id_inscricao INTEGER NOT NULL,
  codigo VARCHAR NOT NULL UNIQUE,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  visibilidade TEXT NOT NULL DEFAULT 'ativo'
    CHECK (visibilidade IN ('ativo','inativo','excluido')),
  status_interno TEXT DEFAULT 'normal'
    CHECK (status_interno IN (
      'normal','bloqueado','expirado','removido','cancelado',
      'revogado','moderado','oculto'
    )),

  CONSTRAINT fk_certificado_inscricao FOREIGN KEY (id_inscricao)
    REFERENCES public.inscricao(id_inscricao)
);


-- =============================================
-- =============== PALESTRANTE =================
-- =============================================

CREATE TABLE public.palestrante (
  id_palestrante SERIAL PRIMARY KEY,
  nome VARCHAR NOT NULL,
  bio TEXT,
  email VARCHAR,
  telefone VARCHAR,
  visibilidade TEXT NOT NULL DEFAULT 'ativo'
    CHECK (visibilidade IN ('ativo','inativo','excluido')),
  status_interno TEXT DEFAULT 'normal'
    CHECK (status_interno IN (
      'normal','bloqueado','expirado','removido','cancelado',
      'revogado','moderado','oculto'
    ))
);


-- =============================================
-- =============== PALESTRA ====================
-- =============================================

CREATE TABLE public.palestra (
  id_palestra SERIAL PRIMARY KEY,
  titulo VARCHAR NOT NULL,
  descricao TEXT,
  data_hora TIMESTAMPTZ NOT NULL,
  id_evento INTEGER NOT NULL,
  id_palestrante INTEGER,
  visibilidade TEXT NOT NULL DEFAULT 'ativo'
    CHECK (visibilidade IN ('ativo','inativo','excluido')),
  status_interno TEXT DEFAULT 'normal'
    CHECK (status_interno IN (
      'normal','bloqueado','expirado','removido','cancelado',
      'revogado','moderado','oculto'
    )),

  CONSTRAINT fk_palestra_evento FOREIGN KEY (id_evento)
    REFERENCES public.evento(id_evento),

  CONSTRAINT fk_palestra_palestrante FOREIGN KEY (id_palestrante)
    REFERENCES public.palestrante(id_palestrante)
);


-- =============================================
-- =============== AVALIACAO ===================
-- =============================================

CREATE TABLE public.avaliacao (
  id_avaliacao SERIAL PRIMARY KEY,
  id_palestra INTEGER NOT NULL,
  id_usuario INTEGER NOT NULL,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  visibilidade TEXT NOT NULL DEFAULT 'ativo'
    CHECK (visibilidade IN ('ativo','inativo','excluido')),
  status_interno TEXT DEFAULT 'normal'
    CHECK (status_interno IN (
      'normal','bloqueado','expirado','removido','cancelado',
      'revogado','moderado','oculto'
    )),

  CONSTRAINT fk_avaliacao_palestra FOREIGN KEY (id_palestra)
    REFERENCES public.palestra(id_palestra),

  CONSTRAINT fk_avaliacao_usuario FOREIGN KEY (id_usuario)
    REFERENCES public.usuario(id_usuario)
);


-- =============================================
-- =============== PAGAMENTO ===================
-- =============================================

CREATE TABLE public.pagamento (
  id_pagamento SERIAL PRIMARY KEY,
  id_inscricao INTEGER NOT NULL,
  valor NUMERIC NOT NULL CHECK (valor >= 0),
  status TEXT NOT NULL CHECK (status IN ('pendente','pago','reembolsado')),
  data_pagamento TIMESTAMPTZ,
  visibilidade TEXT NOT NULL DEFAULT 'ativo'
    CHECK (visibilidade IN ('ativo','inativo','excluido')),
  status_interno TEXT DEFAULT 'normal'
    CHECK (status_interno IN (
      'normal','bloqueado','expirado','removido','cancelado',
      'revogado','moderado','oculto'
    )),

  CONSTRAINT fk_pagamento_inscricao FOREIGN KEY (id_inscricao)
    REFERENCES public.inscricao(id_inscricao)
);
