
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  image: {
    file_path: string;
    file_name: string;
    legenda: string;
    ano: string;
  } | null;
}

const ImageViewer = ({ isOpen, onClose, image }: ImageViewerProps) => {
  const [zoom, setZoom] = useState(1);

  if (!image) return null;

  const getPhotoUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('submission-photos')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('submission-photos')
        .download(image.file_path);

      if (error) {
        console.error('Error downloading image:', error);
        toast({
          title: "Erro no download",
          description: "Não foi possível baixar a imagem.",
          variant: "destructive"
        });
        return;
      }

      // Criar URL para download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download concluído",
        description: "A imagem foi baixada com sucesso."
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro durante o download.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {image.legenda}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-mono">{Math.round(zoom * 100)}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                disabled={zoom >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">Ano: {image.ano}</p>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <img
              src={getPhotoUrl(image.file_path)}
              alt={image.legenda}
              className="max-w-full h-auto rounded-lg shadow-lg transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
              onError={(e) => {
                e.currentTarget.src = '';
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
