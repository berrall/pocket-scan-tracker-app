
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Scan } from "lucide-react";
import { ReceiptScanner } from "./ReceiptScanner";

export const AddExpense = () => {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [bankAccountType, setBankAccountType] = useState('');
  const [bankInstitution, setBankInstitution] = useState('');
  
  const { categories, bankAccountTypes, bankInstitutions, addTransaction } = useSupabaseData();
  const { toast } = useToast();

  const availableCategories = categories.filter(cat => cat.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      await addTransaction({
        type,
        amount: numAmount,
        category,
        description,
        date: new Date(),
        bankAccountType: bankAccountType || undefined,
        bankInstitution: bankInstitution || undefined,
      });

      toast({
        title: "Succès",
        description: `${type === 'expense' ? 'Dépense' : 'Revenu'} ajouté avec succès`,
      });

      // Reset form
      setAmount('');
      setCategory('');
      setDescription('');
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
    <div className="space-y-6">
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Saisie manuelle
          </TabsTrigger>
          <TabsTrigger value="scan" className="flex items-center gap-2">
            <Scan className="h-4 w-4" />
            Scanner un reçu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card className="max-w-2xl mx-auto shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <PlusCircle className="text-blue-600" />
                Ajouter une transaction
              </CardTitle>
              <CardDescription>
                Ajoutez une nouvelle dépense ou un nouveau revenu à votre budget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Type de transaction</Label>
                  <Select value={type} onValueChange={(value: 'expense' | 'income') => {
                    setType(value);
                    setCategory(''); // Reset category when type changes
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Dépense</SelectItem>
                      <SelectItem value="income">Revenu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Montant ($) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((cat) => (
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
                    placeholder="Description de la transaction..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Ajouter la transaction
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scan">
          <ReceiptScanner />
        </TabsContent>
      </Tabs>
    </div>
  );
};
