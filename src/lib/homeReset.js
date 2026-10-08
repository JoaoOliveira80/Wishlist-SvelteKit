import { writable } from "svelte/store";

// Sinal incrementado pelo Header quando a logo e clicada.
// A pagina principal e a grade assinam e resetam busca, filtros e pagina,
// porque o Header mora no layout e nao tem acesso ao estado da pagina.
// A URL e limpa com goto('/') no mesmo clique; o estado local e limpo aqui
// para nao depender da ordem de chegada da navegacao.
export const homeReset = writable(0);
