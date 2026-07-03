<div align="center">

# Family Tree

**Interactive family tree builder with D3.js visualization**

</div>

Web app for building and exploring family trees. Renders the tree as a zoomable, pannable D3.js SVG diagram. Each node holds a full person card — photo, dates, city, description — editable through a draggable side menu. Supports user accounts, multiple families, and seven interface languages.

## ■ Features

- ❖ **D3.js tree** — animated SVG tree with zoom, pan, and smooth transitions; nodes collapse and expand
- ❖ **Node editing** — add or delete nodes, toggle subtree visibility with toolbar instruments
- ❖ **Person cards** — photo upload, birth/death dates, city, description, custom card colour and connection line colour per node
- ❖ **User accounts** — registration and login with AES-encrypted passwords; session persisted via cookie hash
- ❖ **Multiple families** — each account can hold several independent family trees
- ❖ **Multi-language UI** — seven languages: English, Russian, German, Italian, Spanish, Japanese, Chinese
- ❖ **Draggable menu** — side panel can be repositioned by dragging its title bar

## ■ Stack

<div align="center">

| Component | Technology |
|-----------|------------|
| Frontend | React 18, SCSS, Bootstrap 5 |
| Visualization | D3.js (tree layout, SVG, zoom/pan) |
| UI extras | MUI DatePicker, react-colorful, react-icons |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Auth | CryptoJS AES (client-side encryption) |

</div>

## ■ How It Works

```
1. The React Tree component initialises a D3 tree layout on mount, then re-renders on state change using the D3 enter/update/exit pattern.
2. The Express server exposes a single /api endpoint accepting raw SQL fragments (select, insert, update, delete) forwarded to PostgreSQL.
3. Registration encrypts the password with CryptoJS AES; login validates credentials and issues a hash stored in a browser cookie.
4. Tree JSON is serialised and stored in the fam table; person details live in the person table; images are uploaded to the server disk.
```

## ■ Usage

```bash
# Backend (Node.js + Express + PostgreSQL)
npm install
npm start

# Frontend (React) — in a separate terminal
npm install
npm start
```

## ■ License

GPL-3.0 © [pluttan](https://github.com/pluttan)
