# Fluxo Git


# SÓ UMA VEZZZZZ E NUNCA MAIS
## Criar branch feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/<seu-nome>
git push -u origin feature/<seu-nome>
```
# SÓ UMA VEZZZZZ E NUNCA MAIS




## Atualizar branch feature antes de programar
```bash
git checkout develop
git pull origin develop
git checkout feature/<seu-nome>
git merge develop
```

## Commit durante o trabalho
```bash
git add .
git commit -m "feat: descrição do que foi feito"
```
# Envia a feature branch atual para o remoto (empurra o commit)
git push origin feature/<seu-nome>





# INICIO ==== Enviar da feature branch para develop via PR seguro (resolvendo conflitos localmente se necessário)

# Primeiro, atualiza develop local
git checkout develop
git pull origin develop

# Volta para a feature branch
git checkout feature/<seu-nome>

# Mescla develop na feature para resolver conflitos localmente
git merge develop
# Resolva os conflitos se houver, depois:
git add .
git commit -m "fix: resolução de conflitos com develop"

# Envia sua feature branch atualizada para o remoto
git push origin feature/<seu-nome>

# FIM ==== 




## Feature pronta
1. Atualizar feature com develop e testar.
2. Criar Pull Request para develop.
3. Revisão e merge.
4. Deletar branch feature:
```bash
git branch -d feature/<seu-nome>
git push origin --delete feature/<seu-nome>
```

## Atualizar main (quando todas features estiverem prontas)
```bash
git checkout main
git pull origin main
git merge develop
git push origin main
```

Equipe: CT, Izidio, Rick, Paulista, Indiano