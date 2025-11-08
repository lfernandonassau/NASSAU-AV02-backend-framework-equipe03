CREATE TABLE Usuario (
    id_Usuario INT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefone VARCHAR(20),
);

CREATE TABLE funcionarios (
    id_Funcionario INT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE funcionario_evento (
    id_Funcionario INT NOT NULL,
    id_Evento INT NOT NULL,
    funcao VARCHAR(100),
    PRIMARY KEY (id_Funcionario, id_Evento),
    FOREIGN KEY (id_Funcionario) REFERENCES funcionarios(id_Funcionario),
    FOREIGN KEY (id_Evento) REFERENCES Eventos(id_Evento)
);

CREATE TABLE Categoria (
    id_Categoria INT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);

CREATE TABLE Local (
    id_Local INT PRIMARY KEY,
    nome_Local VARCHAR(150) NOT NULL,
    endereco VARCHAR(250) NOT NULL,
    capacidade INT
);

CREATE TABLE Eventos (
    id_Evento INT PRIMARY KEY,
    nome_Evento VARCHAR(200) NOT NULL,
    data_Inicio DATE NOT NULL,
    data_Fim DATE,
    id_Categoria INT NOT NULL,
    id_Local INT NOT NULL,
    FOREIGN KEY (id_Categoria) REFERENCES Categoria(id_Categoria),
    FOREIGN KEY (id_Local) REFERENCES Local(id_Local)
);

CREATE TABLE palestrantes (
    id_Palestrante INT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    biografia TEXT,
    email VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE Evento_Palestrante (
    id_Evento INT NOT NULL,
    id_Palestrante INT NOT NULL,
    PRIMARY KEY (id_Evento, id_Palestrante),
    FOREIGN KEY (id_Evento) REFERENCES Eventos(id_Evento),
    FOREIGN KEY (id_Palestrante) REFERENCES palestrantes(id_Palestrante)
);

CREATE TABLE Inscricao (
    id_Inscricao INT PRIMARY KEY,
    id_Usuario INT NOT NULL,
    id_Evento INT NOT NULL,
    data_Inscricao DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_Usuario) REFERENCES Usuario(id_Usuario),
    FOREIGN KEY (id_Evento) REFERENCES Eventos(id_Evento)
);

CREATE TABLE Pagamento (
    id_Pagamento INT PRIMARY KEY,
    id_Inscricao INT NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data_Pagamento DATE NOT NULL,
    metodo_Pagamento VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_Inscricao) REFERENCES Inscricao(id_Inscricao)
);