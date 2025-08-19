import { useState, useRef } from 'react';
import { Upload, Globe, Image as ImageIcon, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/hooks/useSettings';

export function BrandingSection() {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [storageImages, setStorageImages] = useState<any[]>([]);
  const [loadingStorage, setLoadingStorage] = useState(false);

  const loadStorageImages = async () => {
    setLoadingStorage(true);
    try {
      const { data, error } = await supabase.storage
        .from('assets')
        .list('', {
          limit: 20,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;
      
      const imageFiles = data?.filter(file => 
        file.name.match(/\.(jpg|jpeg|png|svg|webp)$/i)
      ) || [];
      
      setStorageImages(imageFiles);
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
    } finally {
      setLoadingStorage(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.match(/^image\/(jpeg|jpg|png|svg\+xml|webp)$/)) {
      toast({
        title: "Erro",
        description: "Apenas arquivos PNG, JPG, SVG ou WEBP são aceitos.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (1MB)
    if (file.size > 1024 * 1024) {
      toast({
        title: "Erro", 
        description: "O arquivo deve ter no máximo 1MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const timestamp = Date.now();
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `romantech-logo-${timestamp}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('assets')
        .upload(fileName, selectedFile);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(fileName);

      await updateSettings({ logo_url: publicUrl });
      
      setSelectedFile(null);
      setUploadPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleExternalUrl = async () => {
    if (!externalUrl.trim()) return;
    
    try {
      await updateSettings({ logo_url: externalUrl });
      setExternalUrl('');
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleStorageSelect = async (fileName: string) => {
    try {
      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(fileName);

      await updateSettings({ logo_url: publicUrl });
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleClearLogo = async () => {
    try {
      await updateSettings({ logo_url: null });
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding</CardTitle>
        <CardDescription>
          Configure a identidade visual do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview da logo atual */}
        <div className="space-y-2">
          <Label>Logo Atual</Label>
          <div className="flex items-center space-x-4 p-4 border rounded-lg bg-muted/50">
            {settings?.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt="Logo atual" 
                className="h-12 w-auto max-w-32 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <ImageIcon className="h-6 w-6" />
                <span>RomanTech</span>
              </div>
            )}
            {settings?.logo_url && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearLogo}
                className="ml-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Logo
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="url">URL Externa</TabsTrigger>
            <TabsTrigger value="storage">Do Storage</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo-upload">Selecionar Arquivo</Label>
              <Input
                ref={fileInputRef}
                id="logo-upload"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                PNG, JPG, SVG ou WEBP. Máximo 1MB.
              </p>
            </div>
            
            {uploadPreview && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <img 
                    src={uploadPreview} 
                    alt="Preview" 
                    className="h-16 w-auto max-w-48 object-contain"
                  />
                </div>
                
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Enviando..." : "Salvar Logo"}
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="external-url">URL da Imagem</Label>
              <Input
                id="external-url"
                placeholder="https://exemplo.com/logo.png"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleExternalUrl} 
              disabled={!externalUrl.trim()}
              className="w-full"
            >
              <Globe className="h-4 w-4 mr-2" />
              Usar esta URL
            </Button>
          </TabsContent>
          
          <TabsContent value="storage" className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Imagens no Storage</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadStorageImages}
                disabled={loadingStorage}
              >
                {loadingStorage ? "Carregando..." : "Atualizar"}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {storageImages.map((image) => {
                const { data: { publicUrl } } = supabase.storage
                  .from('assets')
                  .getPublicUrl(image.name);
                
                return (
                  <div key={image.name} className="relative group">
                    <div className="aspect-square border rounded-lg overflow-hidden bg-muted/50">
                      <img 
                        src={publicUrl}
                        alt={image.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <Button
                      size="sm"
                      className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleStorageSelect(image.name)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Usar
                    </Button>
                  </div>
                );
              })}
            </div>
            
            {storageImages.length === 0 && !loadingStorage && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma imagem encontrada no storage.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}