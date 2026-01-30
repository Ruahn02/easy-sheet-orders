import { supabase } from '@/integrations/supabase/client';

export function useImageUpload() {
  const uploadImage = async (file: File): Promise<string | null> => {
    // Validações
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (file.size > maxSize) {
      throw new Error('Imagem muito grande. Máximo 2MB.');
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Formato inválido. Use JPG, PNG ou WEBP.');
    }
    
    // Gerar nome único (UUID)
    const ext = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;
    
    // Upload
    const { error } = await supabase.storage
      .from('produtos-imagens')
      .upload(fileName, file);
    
    if (error) throw error;
    
    // Retornar URL pública
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
