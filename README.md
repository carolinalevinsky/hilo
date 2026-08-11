# Hilo

Herramienta de gestión para profesionales de la salud y la educación en Uruguay:
fonoaudiología, psicopedagogía, terapia ocupacional, psicología, psicomotricidad
y kinesiología.

---

## Arrancar

Necesitás [Docker Desktop](https://www.docker.com/products/docker-desktop/)
abierto (la base de datos corre ahí).

```bash
npm install
cp .env.example .env.local     # y completá los valores
npm run db:start               # levanta Postgres local
npm run dev                    # http://localhost:3000
```

Las claves que `npm run db:start` imprime al final van en `.env.local`.

### Si no tenés Node instalado

Poné `./dx` adelante de cualquiera de esos comandos y corren dentro de un
contenedor con Node 22:

```bash
./dx npm install
./dx npm run db:start
./dx npm run dev
```

Es un andamio para máquinas sin Node, no una decisión de arquitectura. El día
que instales Node en el host, los comandos de arriba funcionan tal cual sin el
`./dx` y `docker/` se puede borrar. El detalle de por qué funciona está
comentado en [`dx`](dx) y [`docker/entrypoint.sh`](docker/entrypoint.sh).

---

## Comandos

```bash
npm run dev               # servidor local
npm run build             # build de producción
npm run lint              # las tres reglas de arquitectura
npm run typecheck         # tipos
npm run test              # tests

npm run db:start          # levantar Postgres local
npm run db:reset          # rehacer la base desde las migraciones
npm run db:types          # regenerar los tipos de TypeScript

npm run check:boundaries  # que las reglas de arquitectura sigan funcionando
npm run check:secrets     # que no haya secretos expuestos al navegador
npm run check:rls         # que ninguna tabla quede sin protección
npm run check:migration   # que ningún cambio destructivo pase sin querer
```

Todos corren en CI en cada push.

---

## Dónde está cada cosa

```
src/app/          Pantallas y Server Actions
src/components/   Componentes de UI
src/server/       El backend — toda la lógica y todas las consultas
src/lib/          Helpers, variables de entorno, tipos generados
supabase/         Migraciones (la única fuente de verdad del esquema)
scripts/          Los checks de CI
docs/             Planes y guías
legacy/           El prototipo v1, congelado. Solo referencia.
```

---

## Documentación

| Archivo | Para qué |
| --- | --- |
| [`CLAUDE.md`](CLAUDE.md) | Las reglas del proyecto. Claude lo lee en cada sesión. |
| [`docs/when-things-break.md`](docs/when-things-break.md) | Qué hacer cuando algo se rompe. |
| [`docs/plan-01-workspace.md`](docs/plan-01-workspace.md) | Cómo se armó este workspace y por qué. |
| [`docs/plan-02-migration.md`](docs/plan-02-migration.md) | El plan de construcción, milestone por milestone. |
| [`legacy/README.md`](legacy/README.md) | Qué es la carpeta `legacy/` y qué se rescata de ahí. |
