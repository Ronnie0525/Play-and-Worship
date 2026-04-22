# Play & Worship Brand Kit

## Logo files

| File | Use case |
|---|---|
| `logo.svg` | Web logo (used live on the landing + app) — full badge with gradient, shine, vignette, drop shadow. |
| `logo-illustrator.svg` | **Open this one in Illustrator.** Cleaned master SVG — full color badge without any CSS-only effects (no `mix-blend-mode`, no `style=""`). |
| `logo-mark-white.svg` | Just the play + cross mark, solid white, transparent background. For dark surfaces. |
| `logo-mark-gold.svg` | Just the mark, solid antique gold. For neutral / print contexts. |
| `logo-mark-dark.svg` | Just the mark, solid myrtle green. For light surfaces. |

## Colors

| Role | Name | Hex | CMYK |
|---|---|---|---|
| Primary | Antique Gold | `#C89D4A` | — |
| Secondary | **Myrtle Green** | `#2E736D` | C 60 · M 0 · Y 5 · K 55 |
| Gold highlight | Light Gold | `#E3B96E` | — |
| Myrtle highlight | Light Myrtle | `#4A9691` | — |
| Alert | Warm Brick | `#c14a3a` | — |
| Ink (light) | Cream | `#F8ECD0` | — |

## Typography

- **Display / serif:** Source Serif 4, weights 400 · 500 · 600 · 700
- **UI / sans:** Inter (landing), Segoe UI (app)
- **Monospace:** Cascadia Mono / Consolas

## Opening in Illustrator

1. Open Illustrator → **File → Open** → pick `logo-illustrator.svg`.
2. Two gradients (`rw-bg`, `rw-mark`) and one radial (`rw-vignette`) will appear in the **Gradients** panel.
3. The play + cross mark is a single compound path using `fill-rule: evenodd` — if you need to edit only the cross, use **Object → Compound Path → Release**.
4. To export a PNG/JPG: **File → Export → Export As** (or **Asset Export** for multi-size output).
