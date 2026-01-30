
## Plano: Suporte a Imagem (Foto) nos Produtos

### Visao Geral

Adicionar suporte a upload de imagens para produtos usando Supabase Storage, sem quebrar produtos existentes e mantendo a feature puramente visual.

---

### 1. Diagnostico do Estado Atual

| Item | Status |
|------|--------|
| Campo `fotoUrl` no tipo TypeScript | Existe, mas nao e persistido |
| Campo no formulario de produto | Existe como URL (linha 413-418), mas nao salva |
| Coluna no banco de dados | NAO existe |
| Bucket de storage | NAO existe |
| Exibicao na listagem | Ja existe com placeholder (Package icon) |
| Exibicao no ProductCard | Ja existe com placeholder |

**Problema:** O campo `fotoUrl` do formulario nao e salvo porque nao existe coluna no banco, e hoje usa URL externa que voce nao quer.

---

### 2. Alteracoes no Banco de Dados

**Migration SQL:**

```sql
-- Adicionar coluna imagem_url (nullable) na tabela produtos
ALTER TABLE produtos 
ADD COLUMN imagem_url TEXT;

-- Criar bucket publico para imagens de produtos
INSERT INTO storage.buckets (id, name, public)
VALUES ('produtos-imagens', 'produtos-imagens', true);

-- Politicas RLS para o bucket
CREATE POLICY "Imagens de produtos sao publicas para leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'produtos-imagens');

CREATE POLICY "Qualquer um pode fazer upload de imagens de produtos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'produtos-imagens');

CREATE POLICY "Qualquer um pode atualizar imagens de produtos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'produtos-imagens');

CREATE POLICY "Qualquer um pode deletar imagens de produtos"
ON storage.objects FOR DELETE
USING (bucket_id = 'produtos-imagens');
```

**Caracteristicas:**
- Coluna `imagem_url` e TEXT nullable - produtos antigos ficam com NULL
- Bucket publico para leitura (imagens aparecem sem autenticacao)
- Politicas permissivas (mesmo padrao das outras tabelas)

---

### 3. Hook de Upload de Imagem

**Novo arquivo:** `src/hooks/useImageUpload.ts`

```typescript
import { supabase } from '@/integrations/supabase/client';

export function useImageUpload() {
  const uploadImage = async (file: File): Promise<string | null> => {
    // Validacoes
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (file.size > maxSize) {
      throw new Error('Imagem muito grande. Maximo 2MB.');
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Formato invalido. Use JPG, PNG ou WEBP.');
    }
    
    // Gerar nome unico (UUID)
    const ext = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;
    
    // Upload
    const { error } = await supabase.storage
      .from('produtos-imagens')
      .upload(fileName, file);
    
    if (error) throw error;
    
    // Retornar URL publica
    const { data } = supabase.storage
      .from('produtos-imagens')
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  };
  
  const deleteImage = async (url: string): Promise<void> => {
    // Extrair nome do arquivo da URL
    const fileName = url.split('/').pop();
    if (!fileName) return;
    
    await supabase.storage
      .from('produtos-imagens')
      .remove([fileName]);
  };
  
  return { uploadImage, deleteImage };
}
```

---

### 4. Alteracoes no Hook useProdutos

**Arquivo:** `src/hooks/useSupabaseData.ts`

Adicionar mapeamento do campo `imagem_url`:

```typescript
// No fetchProdutos (linha ~240)
setProdutos(produtosData.map(p => ({
  id: p.id,
  codigo: p.codigo,
  nome: p.nome,
  qtdMaxima: p.qtd_maxima,
  fotoUrl: p.imagem_url || undefined,  // <- NOVO
  status: p.status as 'ativo' | 'inativo',
  entidadeIds: entidadesPorProduto[p.id] || (p.entidade_id ? [p.entidade_id] : []),
  entidadeId: p.entidade_id,
  ordem: p.ordem ?? undefined,
  criadoEm: new Date(p.criado_em),
})));

// No addProduto (linha ~260)
const { data, error } = await supabase
  .from('produtos')
  .insert({
    ...
    imagem_url: produto.fotoUrl || null,  // <- NOVO
  })

// No updateProduto (linha ~291)
if (updates.fotoUrl !== undefined) dbUpdates.imagem_url = updates.fotoUrl || null;
```

---

### 5. UI do Formulario de Produto

**Arquivo:** `src/pages/admin/Produtos.tsx`

Substituir campo de URL por componente de upload:

```tsx
// Estado adicional
const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);
const [isUploading, setIsUploading] = useState(false);

// Ao abrir modal para editar
if (produto) {
  setImagePreview(produto.fotoUrl || null);
}

// Handler de selecao de arquivo
const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  // Validacao de tamanho
  if (file.size > 2 * 1024 * 1024) {
    toast({ title: 'Imagem muito grande. Maximo 2MB.', variant: 'destructive' });
    return;
  }
  
  setImageFile(file);
  setImagePreview(URL.createObjectURL(file));
};

// Handler de remover imagem
const handleRemoveImage = () => {
  setImageFile(null);
  setImagePreview(null);
  setFormData(prev => ({ ...prev, fotoUrl: '' }));
};

// No submit - fazer upload antes de salvar
const handleSubmit = async () => {
  // ... validacoes existentes ...
  
  let finalImageUrl = formData.fotoUrl;
  
  if (imageFile) {
    setIsUploading(true);
    try {
      finalImageUrl = await uploadImage(imageFile) || '';
    } catch (err) {
      toast({ title: 'Erro ao enviar imagem', variant: 'destructive' });
      setIsUploading(false);
      return;
    }
    setIsUploading(false);
  }
  
  // ... resto do submit com finalImageUrl ...
};
```

**UI do campo de upload:**

```tsx
<div>
  <label className="text-sm font-medium text-foreground mb-2 block">
    Imagem do Produto (opcional)
  </label>
  
  {/* Preview */}
  {imagePreview ? (
    <div className="relative w-32 h-32 mb-2">
      <img 
        src={imagePreview} 
        alt="Preview" 
        className="w-full h-full object-cover rounded-lg border"
      />
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
        onClick={handleRemoveImage}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  ) : (
    <div className="w-32 h-32 mb-2 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50">
      <Package className="h-8 w-8 text-muted-foreground" />
    </div>
  )}
  
  {/* Input de arquivo */}
  <Input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    onChange={handleImageSelect}
    className="max-w-xs"
  />
  <p className="text-xs text-muted-foreground mt-1">
    JPG, PNG ou WEBP. Maximo 2MB.
  </p>
</div>
```

---

### 6. Exibicao nas Listagens

**Listagem de Produtos (Produtos.tsx):**
Ja existe codigo para exibir imagem com placeholder (linhas 275-282). Vai funcionar automaticamente apos o mapeamento correto.

**ProductCard (ordem de pedido):**
Ja existe codigo para exibir imagem com placeholder (linhas 53-69). Vai funcionar automaticamente.

**Tela de Pedidos (admin):**
Opcionalmente pode adicionar miniatura, mas nao e obrigatorio.

---

### 7. Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| **Migration SQL** | Adicionar coluna `imagem_url`, criar bucket, RLS |
| `src/types/index.ts` | Manter `fotoUrl` como esta (ja existe) |
| `src/hooks/useImageUpload.ts` | NOVO - hook de upload |
| `src/hooks/useSupabaseData.ts` | Mapear `imagem_url` <-> `fotoUrl` |
| `src/pages/admin/Produtos.tsx` | Substituir campo URL por upload com preview |

---

### 8. Regras Respeitadas

| Regra | Status |
|-------|--------|
| NAO usar links externos | OK - apenas upload |
| NAO quebrar produtos antigos | OK - coluna nullable |
| NAO alterar pedidos/inventario | OK - nenhuma alteracao |
| Imagem puramente visual | OK - nao afeta regras |
| Bucket publico | OK - imagens acessiveis |
| Limite 2MB | OK - validacao no hook |
| Formatos JPG/PNG/WEBP | OK - validacao no hook |
| Placeholder padrao | OK - ja existe |

---

### 9. Fluxo de Uso

```
Administrador abre formulario de produto
        |
        v
Clica em "Escolher arquivo" ou arrasta imagem
        |
        v
Preview aparece imediatamente (local)
        |
        v
Pode clicar no X para remover
        |
        v
Ao salvar, imagem e enviada para Supabase Storage
        |
        v
URL publica e salva no campo imagem_url
        |
        v
Imagem aparece na listagem e no formulario de pedido
```

---

### 10. Reversibilidade

Para remover completamente:
1. Remover coluna `imagem_url` da tabela produtos
2. Deletar bucket `produtos-imagens`
3. Remover hook `useImageUpload`
4. Reverter alteracoes no formulario

Produtos e pedidos continuam funcionando normalmente.
