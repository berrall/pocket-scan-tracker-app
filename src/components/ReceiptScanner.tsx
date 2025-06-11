
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { Scan } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ReceiptImageUpload } from "./receipt-scanner/ReceiptImageUpload";
import { ScannedDataDisplay } from "./receipt-scanner/ScannedDataDisplay";
import { TransactionForm } from "./receipt-scanner/TransactionForm";
import { ScannerInfo } from "./receipt-scanner/ScannerInfo";

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
  
  const { addTransaction } = useSupabaseData();
  const { toast } = useToast();

  const handleImageUpload = (imageData: string) => {
    setImage(imageData);
    setScannedData(null);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setScannedData(null);
  };

  const scanReceipt = async () => {
    if (!image) return;

    setIsScanning(true);
    
    try {
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
        bank_account_type: bankAccountType || undefined,
        bank_institution: bankInstitution || undefined,
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
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout de la transaction",
        variant: "destructive",
      });
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
          <ReceiptImageUpload
            image={image}
            onImageUpload={handleImageUpload}
            onRemoveImage={handleRemoveImage}
            onScanReceipt={scanReceipt}
            isScanning={isScanning}
            hasScannedData={!!scannedData}
          />

          <div className="space-y-4">
            {scannedData && (
              <>
                <ScannedDataDisplay scannedData={scannedData} />
                <TransactionForm
                  category={category}
                  bankAccountType={bankAccountType}
                  bankInstitution={bankInstitution}
                  onCategoryChange={setCategory}
                  onBankAccountTypeChange={setBankAccountType}
                  onBankInstitutionChange={setBankInstitution}
                  onAddTransaction={handleAddTransaction}
                />
              </>
            )}
          </div>
        </div>

        <ScannerInfo />
      </CardContent>
    </Card>
  );
};
