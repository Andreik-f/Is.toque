# Ativos de acesso

O mascote não é imagem: é um SVG inline em `src/components/ui/mascot.jsx`, porque o olho, a fita e as caixas se animam separados. A versão de duas caixas vale para o login e o cadastro, e a de uma caixa vem de `public/favicon.svg`. `textura.jpg` é a textura com linhas contínuas (1920×1279 px), usada no painel do formulário do login e no fundo das telas no celular. `textura-cadastro.svg` é a arte vertical (1042×1436) do painel âmbar do cadastro, só no desktop.

Login e cadastro são construídos com HTML semântico e CSS em `components/auth-screen.jsx`, `components/access-form.jsx`, `components/auth-controls.jsx` e `components/auth.css`: textos, títulos, campos e botões são elementos reais, e a curva lateral é uma forma vetorial decorativa definida em código.

Referência: Figma ISTOQUE, login desktop `3:26`, cadastro `2:69`, versões móveis `3:29` e `2:44`.
