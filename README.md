# 🎮 GameWishlist

> Descubra, explore e salve seus jogos favoritos em uma wishlist pessoal.

**Demo ao vivo → [gamewishlist.vercel.app](https://gamewishlist.vercel.app)**

![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=flat&logo=svelte&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)
![RAWG API](https://img.shields.io/badge/RAWG-API-blue?style=flat)

---

## ✨ Funcionalidades

- **Busca em tempo real** com debounce de 400ms integrada à RAWG API
- **Catálogo de jogos populares** carregado automaticamente na entrada
- **Wishlist persistente** salva no `localStorage` do navegador
- **Modal de detalhes** com abas de visão geral, especificações e galeria
- **Filtros por gênero, tags e plataforma** com ordenação configurável
- **Hero section** dinâmica com métricas do catálogo em tempo real
- **Cards responsivos** com rating, gênero, ano de lançamento e hover interativo
- **Interface totalmente responsiva** para desktop e mobile

---

## 🛠️ Stack

| Tecnologia | Uso |
|---|---|
| **SvelteKit 2 + Svelte 5** | Framework principal com runes (`$state`, `$derived`, `$props`) |
| **JavaScript + JSDoc** | Tipagem estática sem overhead de TypeScript |
| **RAWG API** | Banco de dados com +500k jogos catalogados |
| **CSS Custom Properties** | Sistema de design tokens para temas e consistência visual |
| **Vercel** | Deploy contínuo com CI/CD automático |

---

## 🚀 Rodando localmente

### Pré-requisitos

- Node.js 18+
- Chave de API gratuita da [RAWG](https://rawg.io/apidocs)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/JoaoOliveira80/Wishlist-SvelteKit.git
cd Wishlist-SvelteKit

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env e adicione sua chave RAWG
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_RAWG_API_KEY=sua_chave_aqui
```

### Desenvolvimento

```bash
npm run dev
# Acesse http://localhost:5173
```

### Build de produção

```bash
npm run build
npm run preview
```

---

## 📁 Estrutura do projeto

```
src/
├── lib/
│   ├── api.js              # Integração com a RAWG API
│   ├── wishlist.js         # Store global da wishlist
│   ├── colors.js           # Mapeamento de cores por gênero
│   ├── GameCardNew.svelte  # Card principal de jogo
│   ├── GameGrid.svelte     # Grid com filtros e ordenação
│   ├── GameModal.svelte    # Modal de detalhes do jogo
│   ├── GenreFilter.svelte  # Filtro por gênero
│   ├── Header.svelte       # Navegação principal
│   ├── HeroSection.svelte  # Banner com métricas
│   └── StatCard.svelte     # Card de estatística
└── routes/
    └── +page.svelte        # Página principal
```

---

## 👤 Autor

**João Vitor Cavalcante de Oliveira**
- GitHub: [@JoaoOliveira80](https://github.com/JoaoOliveira80)

---

## 📄 Licença

MIT — sinta-se livre para usar, modificar e distribuir.

---

*Data e imagens fornecidas por [RAWG](https://rawg.io).*
