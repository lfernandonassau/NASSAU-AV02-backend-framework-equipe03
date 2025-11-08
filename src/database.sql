-- Armazena os usuários do sistema (participantes e organizadores)
CREATE TABLE Usuario (
    id_usuario INT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(200) NOT NULL,
    tipo ENUM('organizador', 'participante') NOT NULL
);

-- Guarda informações dos locais onde os eventos acontecem
CREATE TABLE Local (
    id_local INT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    endereco VARCHAR(255),
    capacidade INT
);

-- Classifica os eventos por tema ou área
CREATE TABLE Categoria (
    id_categoria INT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);

-- Representa os eventos cadastrados no sistema
CREATE TABLE Evento (
    id_evento INT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    id_local INT NOT NULL,
    id_categoria INT NOT NULL,
    FOREIGN KEY (id_local) REFERENCES Local(id_local),
    FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria)
);

-- Registra informações sobre os palestrantes convidados
CREATE TABLE Palestrante (
    id_palestrante INT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    bio TEXT,
    email VARCHAR(150),
    telefone VARCHAR(20)
);

-- Representa as palestras que acontecem dentro de um evento
CREATE TABLE Palestra (
    id_palestra INT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    data_hora DATETIME NOT NULL,
    id_evento INT NOT NULL,
    id_palestrante INT,
    FOREIGN KEY (id_evento) REFERENCES Evento(id_evento),
    FOREIGN KEY (id_palestrante) REFERENCES Palestrante(id_palestrante)
);

-- Registra a participação de um usuário em um evento
CREATE TABLE Inscricao (
    id_inscricao INT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_evento INT NOT NULL,
    data_inscricao DATETIME NOT NULL,
    status ENUM('pendente', 'confirmada', 'cancelada') NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_evento) REFERENCES Evento(id_evento)
);

-- Emite certificados para inscrições concluídas
CREATE TABLE Certificado (
    id_certificado INT PRIMARY KEY,
    id_inscricao INT NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    data_emissao DATE NOT NULL,
    FOREIGN KEY (id_inscricao) REFERENCES Inscricao(id_inscricao)
);

-- Guarda notas e comentários feitos pelos usuários sobre as palestras
CREATE TABLE Avaliacao (
    id_avaliacao INT PRIMARY KEY,
    id_palestra INT NOT NULL,
    id_usuario INT NOT NULL,
    nota INT CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    FOREIGN KEY (id_palestra) REFERENCES Palestra(id_palestra),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- Armazena informações sobre os pagamentos das inscrições
CREATE TABLE Pagamento (
    id_pagamento INT PRIMARY KEY,
    id_inscricao INT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    status ENUM('pendente', 'pago', 'reembolsado') NOT NULL,
    data_pagamento DATETIME,
    FOREIGN KEY (id_inscricao) REFERENCES Inscricao(id_inscricao)
);
