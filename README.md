# Space Invaders (edição browser)

Homenagem ao clássico de 1978, rodando no navegador. Arquitetura: Vite + TypeScript + Canvas 2D, sem dependências em runtime.

## Rodar

```bash
npm install
npm run dev      # abre em http://localhost:5173
```

```bash
npm test         # testes unitários (Vitest)
npm run build    # typecheck + build em dist/
npm run preview  # serve o build
```

No celular na mesma rede, use o endereço "Network" que o Vite imprime (controles de toque aparecem automaticamente).

## Controles

| Ação | Teclado | Toque |
|---|---|---|
| Mover | Setas ← → ou A / D | ◀ ▶ |
| Atirar | Espaço ou X | FOGO |
| Pausa | P ou Esc | II |
| Selecionar no menu | Enter ou Espaço | FOGO |
| Som on/off | M | menu |
| Efeito CRT on/off | C | menu |
| Mostrar/ocultar controles de toque | T | — |

## Regras

- 5 fileiras x 11 invasores. Pontos por fileira (de cima pra baixo): 30, 20, 20, 10, 10. Nave misteriosa: 50, 100, 150 ou 300.
- Só um tiro seu na tela por vez. Seu tiro destrói tiros inimigos.
- Invasores aceleram conforme são destruídos (marcha de 4 notas acompanha). Ao tocar a borda descem uma linha.
- 4 barricadas destrutíveis pixel a pixel: tiros dos dois lados e invasores passando corroem.
- Invasores chegando ao canhão = invasão, game over imediato.
- 3 vidas, uma vida extra em 1500 pontos (como o original). Ondas infinitas: cada onda começa mais baixa e mais rápida.
- Top 10 com iniciais salvo em `localStorage`.

## Estrutura

```
src/
  config.ts      constantes (tamanhos, velocidades, pontos, timings)
  rng.ts         PRNG determinístico (mulberry32)
  formation.ts   grade de invasores: marcha, borda/descida, velocidade, atiradores
  barricade.ts   barricadas pixel a pixel: impacto, explosão, corrosão
  scoring.ts     pontuação, vida extra, pontos do UFO
  collision.ts   AABB
  storage.ts     high scores e configurações (localStorage)
  input.ts       teclado + botões de toque
  audio.ts       sons sintetizados (Web Audio): marcha, tiros, UFO, explosões
  font.ts        fonte pixel 3x5
  sprites.ts     pixel art (2 frames por invasor)
  game.ts        máquina de estados e lógica de jogo
  render.ts      desenho do mundo, HUD, telas e demo do menu
  main.ts        bootstrap, loop e escala do canvas
tests/           testes Vitest da lógica pura
```
