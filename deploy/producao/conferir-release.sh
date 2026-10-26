#!/usr/bin/env bash
# Roda dentro do clone da Release. Aborta se algum commit que não veio do
# workflow de publicação mexeu nas pastas que ele espelha desde a última
# publicação. Recebe a ponta a conferir (padrão: HEAD).
set -euo pipefail

ponta=${1:-HEAD}
pastas=(codigo-fonte/Backend codigo-fonte/Frontend/istoque)

base=$(git log -1 --format=%H --grep='^Publicado-por: publicar-producao$' "$ponta")
if [ -z "$base" ]; then
  if [ "${PRIMEIRA:-false}" != "true" ]; then
    echo "::error::Nenhuma publicação anterior na Release: rode o workflow à mão com primeira_publicacao marcado"
    exit 1
  fi
  echo "Primeira publicação: o estado atual da Release vira a base"
  exit 0
fi

estranhos=$(git log --format='%h %an %s' "$base..$ponta" -- "${pastas[@]}")
if [ -n "$estranhos" ]; then
  echo "::error::Commits fora do workflow nas pastas espelhadas da Release:"
  echo "$estranhos"
  exit 1
fi
echo "Release conferida: nada fora do workflow desde ${base:0:7}"
