
import { CheckCircle } from "lucide-react";

interface ReceiptData {
  storeName: string;
  date: string;
  subtotal: number;
  taxes: number;
  total: number;
  items: string[];
  confidence: number;
}

interface ScannedDataDisplayProps {
  scannedData: ReceiptData;
}

export const ScannedDataDisplay = ({ scannedData }: ScannedDataDisplayProps) => {
  return (
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
  );
};
