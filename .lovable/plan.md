

## Corrigir Exportacao XLSX

### Problema

O import dinamico `await import('xlsx')` retorna um objeto de modulo ES. A biblioteca `xlsx` exporta como `default`, entao `XLSX.utils` e `XLSX.writeFile` estao `undefined` -- o que causa erro silencioso no catch.

O PDF funciona porque `jspdf` usa named exports (`const { jsPDF } = await import('jspdf')`), enquanto o xlsx nao.

### Correcao

**Arquivo:** `src/pages/admin/Pedidos.tsx` (linha 396)

Trocar:
```typescript
const XLSX = await import('xlsx');
```

Por:
```typescript
const xlsxModule = await import('xlsx');
const XLSX = xlsxModule.default || xlsxModule;
```

Isso garante compatibilidade tanto com bundlers que resolvem o default automaticamente quanto com os que nao resolvem.

### Impacto

- Apenas 1 linha alterada
- Nenhuma mudanca de logica ou layout
- PDF continua funcionando normalmente
- Dados exportados permanecem identicos

