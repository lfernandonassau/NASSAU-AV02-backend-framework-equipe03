# Fluxo Git

## Criar branch feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/<seu-nome>
git push -u origin feature/<seu-nome>
```

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