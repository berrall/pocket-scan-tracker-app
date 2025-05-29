
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactions } from "@/hooks/useTransactions";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/types";
import { Receipt, Wallet, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const TransactionHistory = () => {
  const { transactions, deleteTransaction } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const { toast } = useToast();

  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    const matchesType = filterType === 'all' || transaction.type === filterType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleDelete = (id: string, description: string) => {
    deleteTransaction(id);
    toast({
      title: "Transaction supprimée",
      description: `"${description}" a été supprimée`,
    });
  };

  const getCategoryInfo = (categoryId: string) => {
    return allCategories.find(cat => cat.id === categoryId) || {
      name: categoryId,
      icon: '📝',
      color: 'bg-gray-100 text-gray-700'
    };
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Historique des transactions</CardTitle>
          <CardDescription>
            Consultez et gérez toutes vos transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Type de transaction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="expense">Dépenses</SelectItem>
                <SelectItem value="income">Revenus</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {allCategories.map((cat) => (
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

          {/* Liste des transactions */}
          <div className="space-y-3">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => {
                const categoryInfo = getCategoryInfo(transaction.category);
                return (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-full ${categoryInfo.color}`}>
                        <span className="text-lg">{categoryInfo.icon}</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{transaction.description}</h3>
                          {transaction.type === 'expense' ? (
                            <Receipt className="h-4 w-4 text-red-500" />
                          ) : (
                            <Wallet className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {categoryInfo.name} • {transaction.date.toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)} €
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(transaction.id, transaction.description)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg text-gray-500">
                  {transactions.length === 0 
                    ? "Aucune transaction enregistrée" 
                    : "Aucune transaction ne correspond à vos critères"
                  }
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {transactions.length === 0 
                    ? "Commencez par ajouter une dépense ou un revenu"
                    : "Essayez de modifier vos filtres de recherche"
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
