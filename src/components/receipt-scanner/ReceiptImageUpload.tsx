
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Camera } from "lucide-react";

interface ReceiptImageUploadProps {
  image: string | null;
  onImageUpload: (image: string) => void;
  onRemoveImage: () => void;
  onScanReceipt: () => void;
  isScanning: boolean;
  hasScannedData: boolean;
}

export const ReceiptImageUpload = ({
  image,
  onImageUpload,
  onRemoveImage,
  onScanReceipt,
  isScanning,
  hasScannedData
}: ReceiptImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onImageUpload(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    onRemoveImage();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="receipt">Photo du reçu</Label>
      {!image ? (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors h-64 flex flex-col items-center justify-center"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-600">Cliquez pour télécharger</p>
          <p className="text-sm text-gray-500">ou glissez-déposez votre image ici</p>
          <p className="text-xs text-gray-400 mt-2">Formats supportés: JPG, PNG, WebP</p>
        </div>
      ) : (
        <div className="relative">
          <img 
            src={image} 
            alt="Reçu scanné" 
            className="w-full max-h-64 object-contain rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeImage}
          >
            <X size={16} />
          </Button>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      
      {image && !hasScannedData && (
        <Button 
          onClick={onScanReceipt}
          disabled={isScanning}
          className="w-full"
        >
          {isScanning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyse en cours avec IA...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Scanner avec IA
            </>
          )}
        </Button>
      )}
    </div>
  );
};
