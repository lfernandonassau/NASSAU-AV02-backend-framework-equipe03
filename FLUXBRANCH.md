# Atualiza branches remotas
git fetch --all

# Lista todas as branches locais e remotas
git branch -a

# Cria cópia local e entra na branch do colega
git checkout -b feature/nome-da-branch origin/feature/nome-da-branch

# Faz modificações no código
# (edite os arquivos normalmente)

# Adiciona as alterações
git add .

# Cria um commit com mensagem
git commit -m "descrição da alteração"

# Envia atualização para a branch remota real
git push origin feature/nome-da-branch

# Volta para sua branch principal
git checkout feature/ct-server

# Apaga a cópia local da branch acessada
git branch -D feature/nome-da-branch

# (Opcional) Remove referências de branches remotas apagadas
git fetch -p
