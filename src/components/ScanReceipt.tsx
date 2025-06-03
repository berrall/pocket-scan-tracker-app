import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useSettings } from "@/hooks/useSettings";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import { useBankInstitutions } from "@/hooks/useBankInstitutions";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, X } from "lucide-react";

export const ScanReceipt = () => {
  const [image, setImage] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [bankAccountType, setBankAccountType] = useState('');
  const [bankInstitution, setBankInstitution] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addTransaction } = useTransactions();
  const { expenseCategories } = useCategories();
  const { bankAccountTypes } = useBankAccounts();
  const { bankInstitutions } = useBankInstitutions();
  const { settings } = useSettings();
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImage(result);
        
        // Simulation de la détection OCR du montant
        // En réalité, vous utiliseriez une API OCR comme Google Vision ou Tesseract.js
        simulateOCR(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateOCR = (imageData: string) => {
    // Simulation de détection OCR - génère un montant aléatoire pour la démo
    const simulatedAmount = (Math.random() * 100 + 5).toFixed(2);
    setAmount(simulatedAmount);
    setDescription("Montant détecté automatiquement");
    
    toast({
      title: "Reçu scanné !",
      description: `Montant détecté: ${simulatedAmount} ${settings.currencySymbol}`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      return;
    }

    addTransaction({
      type: 'expense',
      amount: numAmount,
      category,
      description,
      date: new Date(),
      receipt: image || undefined,
      bankAccountType: bankAccountType || undefined,
      bankInstitution: bankInstitution || undefined,
    });

    toast({
      title: "Succès",
      description: "Dépense ajoutée à partir du reçu scanné",
    });

    // Reset form
    setImage(null);
    setAmount('');
    setCategory('');
    setDescription('');
    setBankAccountType('');
    setBankInstitution('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    setImage(null);
    setAmount('');
    setDescription('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Camera className="text-blue-600" />
          Scanner un reçu
        </CardTitle>
        <CardDescription>
          Photographiez votre reçu pour ajouter automatiquement la dépense
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Zone de téléchargement d'image */}
        <div className="space-y-4">
          <Label htmlFor="receipt">Photo du reçu</Label>
          {!image ? (
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-600">Cliquez pour télécharger</p>
              <p className="text-sm text-gray-500">ou glissez-déposez votre image ici</p>
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
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Montant détecté ({settings.currencySymbol}) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg"
            />
            <p className="text-xs text-gray-500">
              Le montant est détecté automatiquement, vous pouvez le modifier si nécessaire
            </p>
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Description de l'achat..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!image}
          >
            Ajouter la dépense
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
