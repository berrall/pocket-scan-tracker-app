
import { useState } from "react";
import { CheckCircle, Edit3, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ReceiptData {
  storeName: string;
  date: string;
  subtotal: number;
  taxes: number;
  total: number;
  items: string[];
  confidence: number;
}

interface EditableScannedDataProps {
  scannedData: ReceiptData;
  onDataChange: (updatedData: ReceiptData) => void;
}

export const EditableScannedData = ({ scannedData, onDataChange }: EditableScannedDataProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ReceiptData>(scannedData);

  const handleSave = () => {
    onDataChange(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(scannedData);
    setIsEditing(false);
  };

  const handleItemsChange = (value: string) => {
    const items = value.split('\n').filter(item => item.trim() !== '');
    setEditedData(prev => ({ ...prev, items }));
  };

  if (isEditing) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Modifier les informations</h3>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-1" />
              Sauvegarder
            </Button>
            <Button
              onClick={handleCancel}
              size="sm"
              variant="outline"
            >
              <X className="h-4 w-4 mr-1" />
              Annuler
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="storeName">Nom du magasin</Label>
            <Input
              id="storeName"
              value={editedData.storeName}
              onChange={(e) => setEditedData(prev => ({ ...prev, storeName: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={editedData.date}
              onChange={(e) => setEditedData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="subtotal">Sous-total ($)</Label>
              <Input
                id="subtotal"
                type="number"
                step="0.01"
                value={editedData.subtotal}
                onChange={(e) => setEditedData(prev => ({ ...prev, subtotal: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            
            <div>
              <Label htmlFor="taxes">Taxes ($)</Label>
              <Input
                id="taxes"
                type="number"
                step="0.01"
                value={editedData.taxes}
                onChange={(e) => setEditedData(prev => ({ ...prev, taxes: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            
            <div>
              <Label htmlFor="total">Total ($)</Label>
              <Input
                id="total"
                type="number"
                step="0.01"
                value={editedData.total}
                onChange={(e) => setEditedData(prev => ({ ...prev, total: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="items">Articles (un par ligne)</Label>
            <Textarea
              id="items"
              value={editedData.items.join('\n')}
              onChange={(e) => handleItemsChange(e.target.value)}
              placeholder="Article 1&#10;Article 2&#10;Article 3"
              rows={4}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-green-800">Informations extraites par IA</h3>
          {scannedData.confidence && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              Confiance: {Math.round(scannedData.confidence * 100)}%
            </span>
          )}
        </div>
        <Button
          onClick={() => setIsEditing(true)}
          size="sm"
          variant="outline"
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Edit3 className="h-4 w-4 mr-1" />
          Modifier
        </Button>
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
