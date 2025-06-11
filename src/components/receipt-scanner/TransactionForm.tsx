
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseData } from "@/hooks/useSupabaseData";

interface TransactionFormProps {
  category: string;
  bankAccountType: string;
  bankInstitution: string;
  onCategoryChange: (category: string) => void;
  onBankAccountTypeChange: (type: string) => void;
  onBankInstitutionChange: (institution: string) => void;
  onAddTransaction: () => void;
}

export const TransactionForm = ({
  category,
  bankAccountType,
  bankInstitution,
  onCategoryChange,
  onBankAccountTypeChange,
  onBankInstitutionChange,
  onAddTransaction
}: TransactionFormProps) => {
  const { categories, bankAccountTypes, bankInstitutions } = useSupabaseData();
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Catégorie *</Label>
        <Select value={category} onValueChange={onCategoryChange}>
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
          <Select value={bankAccountType} onValueChange={onBankAccountTypeChange}>
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
          <Select value={bankInstitution} onValueChange={onBankInstitutionChange}>
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
        onClick={onAddTransaction}
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={!category}
      >
        Ajouter la transaction
      </Button>
    </div>
  );
};
