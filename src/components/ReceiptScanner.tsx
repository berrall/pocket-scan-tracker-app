
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, X, Scan, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ReceiptData {
  storeName: string;
  date: string;
  subtotal: number;
  taxes: number;
  total: number;
  items: string[];
  confidence: number;
}

export const ReceiptScanner = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ReceiptData | null>(null);
  const [category, setCategory] = useState('');
  const [bankAccountType, setBankAccountType] = useState('');
  const [bankInstitution, setBankInstitution] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { categories, bankAccountTypes, bankInstitutions, addTransaction } = useSupabaseData();
  const { toast } = useToast();

  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImage(result);
        setScannedData(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const scanReceipt = async () => {
    if (!image) return;

    setIsScanning(true);
    
    try {
      // Convert base64 to blob for the API call
      const base64Data = image.split(',')[1];
      
      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        body: { 
          imageData: base64Data,
          mimeType: 'image/jpeg'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data && data.receiptData) {
        setScannedData(data.receiptData);
        
        toast({
          title: "Reçu scanné avec succès !",
          description: `Magasin: ${data.receiptData.storeName}, Total: ${data.receiptData.total.toFixed(2)} $`,
        });
      } else {
        throw new Error("Aucune donnée de reçu trouvée");
      }
    } catch (error) {
      console.error('Error scanning receipt:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du scan du reçu. Veuillez réessayer ou vérifier la qualité de l'image.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!scannedData || !category) {
      toast({
        title: "Erreur",
        description: "Veuillez scanner un reçu et sélectionner une catégorie",
        variant: "destructive",
      });
      return;
    }

    try {
      await addTransaction({
        type: 'expense',
        amount: scannedData.total,
        category,
        description: `${scannedData.storeName} - ${scannedData.items.join(', ')}`,
        date: new Date(scannedData.date),
        bankAccountType: bankAccountType || undefined,
        bankInstitution: bankInstitution || undefined,
      });

      toast({
        title: "Succès",
        description: "Transaction ajoutée à partir du reçu scanné",
      });

      // Reset form
      setImage(null);
      setScannedData(null);
      setCategory('');
      setBankAccountType('');
      setBankInstitution('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout de la transaction",
        variant: "destructive",
      });
    }
  };

  const removeImage = () => {
    setImage(null);
    setScannedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Scan className="text-blue-600" />
          Scanner un reçu avec IA
        </CardTitle>
        <CardDescription>
          Utilisez l'IA de Google pour extraire automatiquement les informations de votre reçu
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Upload Section */}
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
            
            {image && !scannedData && (
              <Button 
                onClick={scanReceipt}
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

          {/* Scanned Data Section */}
          <div className="space-y-4">
            {scannedData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Informations extraites par IA</h3>
                  {scannedData.confidence && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Confiance: {Math.round(scannedData.confidence * 100)}%
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Magasin:</span>
                    <span>{scannedData.storeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Date:</span>
                    <span>{new Date(scannedData.date).toLocaleDateString('fr-CA')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sous-total:</span>
                    <span>{scannedData.subtotal.toFixed(2)} $</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Taxes:</span>
                    <span>{scannedData.taxes.toFixed(2)} $</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold">{scannedData.total.toFixed(2)} $</span>
                  </div>
                  
                  {scannedData.items.length > 0 && (
                    <div className="mt-3">
                      <span className="font-medium">Articles détectés:</span>
                      <ul className="list-disc list-inside mt-1 text-xs">
                        {scannedData.items.slice(0, 5).map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                        {scannedData.items.length > 5 && (
                          <li className="text-gray-500">... et {scannedData.items.length - 5} autres</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transaction Form */}
            {scannedData && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankAccountType">Type de compte</Label>
                    <Select value={bankAccountType} onValueChange={setBankAccountType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le type" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankAccountTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankInstitution">Institution bancaire</Label>
                    <Select value={bankInstitution} onValueChange={setBankInstitution}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez la banque" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankInstitutions.map((bank) => (
                          <SelectItem key={bank.id} value={bank.id}>
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleAddTransaction}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!category}
                >
                  Ajouter la transaction
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Scanner IA avancé
          </h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• <strong>IA Google Vision:</strong> Reconnaissance optique de caractères (OCR) avancée</p>
            <p>• <strong>IA Gemini:</strong> Analyse intelligente et extraction structurée des données</p>
            <p>• <strong>Support international:</strong> Reçus du Canada, États-Unis, Europe et autres pays</p>
            <p>• <strong>Détection automatique:</strong> Nom du magasin, date, taxes, total, articles</p>
            <p>• <strong>Calcul de confiance:</strong> Score de fiabilité de l'extraction</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
