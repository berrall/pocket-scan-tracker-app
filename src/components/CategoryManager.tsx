
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCategories } from "@/hooks/useCategories";
import { Category } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { FolderPlus, Edit2, Trash2, Tag } from "lucide-react";

export const CategoryManager = () => {
  const { expenseCategories, incomeCategories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedType, setSelectedType] = useState<'expense' | 'income'>('expense');
  const [formData, setFormData] = useState({ name: '', icon: '', color: '' });
  const { toast } = useToast();

  const COLOR_OPTIONS = [
    { value: 'bg-orange-100 text-orange-700', label: 'Orange' },
    { value: 'bg-blue-100 text-blue-700', label: 'Bleu' },
    { value: 'bg-green-100 text-green-700', label: 'Vert' },
    { value: 'bg-purple-100 text-purple-700', label: 'Violet' },
    { value: 'bg-red-100 text-red-700', label: 'Rouge' },
    { value: 'bg-pink-100 text-pink-700', label: 'Rose' },
    { value: 'bg-yellow-100 text-yellow-700', label: 'Jaune' },
    { value: 'bg-teal-100 text-teal-700', label: 'Sarcelle' },
    { value: 'bg-emerald-100 text-emerald-700', label: 'Émeraude' },
    { value: 'bg-gray-100 text-gray-700', label: 'Gris' },
  ];

  const resetForm = () => {
    setFormData({ name: '', icon: '', color: '' });
    setSelectedCategory(null);
  };

  const handleAdd = () => {
    if (!formData.name || !formData.icon || !formData.color) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    addCategory(selectedType, formData);
    toast({
      title: "Succès",
      description: `Catégorie "${formData.name}" ajoutée`,
    });
    
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = () => {
    if (!selectedCategory || !formData.name || !formData.icon || !formData.color) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    updateCategory(selectedType, selectedCategory.id, formData);
    toast({
      title: "Succès",
      description: `Catégorie "${formData.name}" mise à jour`,
    });
    
    resetForm();
    setIsEditDialogOpen(false);
  };

  const handleDelete = (type: 'expense' | 'income', category: Category) => {
    deleteCategory(type, category.id);
    toast({
      title: "Succès",
      description: `Catégorie "${category.name}" supprimée`,
    });
  };

  const openEditDialog = (type: 'expense' | 'income', category: Category) => {
    setSelectedType(type);
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color
    });
    setIsEditDialogOpen(true);
  };

  const CategoryList = ({ categories, type }: { categories: Category[], type: 'expense' | 'income' }) => (
    <div className="space-y-3">
      {categories.map((category) => (
        <div key={category.id} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${category.color}`}>
              <span className="text-lg">{category.icon}</span>
            </div>
            <span className="font-medium">{category.name}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEditDialog(type, category)}
            >
              <Edit2 size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(type, category)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Tag className="text-blue-600" />
          Gestion des catégories
        </CardTitle>
        <CardDescription>
          Ajoutez, modifiez ou supprimez vos catégories de dépenses et revenus
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="expense" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="expense" className="text-red-600">Catégories de dépenses</TabsTrigger>
            <TabsTrigger value="income" className="text-green-600">Catégories de revenus</TabsTrigger>
          </TabsList>

          <TabsContent value="expense" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Dépenses ({expenseCategories.length})</h3>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedType('expense')}>
                    <FolderPlus size={16} className="mr-2" />
                    Ajouter une catégorie
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
            <CategoryList categories={expenseCategories} type="expense" />
          </TabsContent>

          <TabsContent value="income" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Revenus ({incomeCategories.length})</h3>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedType('income')}>
                    <FolderPlus size={16} className="mr-2" />
                    Ajouter une catégorie
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
            <CategoryList categories={incomeCategories} type="income" />
          </TabsContent>
        </Tabs>

        {/* Dialog Ajouter */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une catégorie</DialogTitle>
              <DialogDescription>
                Créez une nouvelle catégorie de {selectedType === 'expense' ? 'dépense' : 'revenu'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom de la catégorie"
                />
              </div>
              <div>
                <Label htmlFor="icon">Icône (emoji)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🏠"
                />
              </div>
              <div>
                <Label htmlFor="color">Couleur</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une couleur" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${color.value}`}></div>
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { resetForm(); setIsAddDialogOpen(false); }}>
                Annuler
              </Button>
              <Button onClick={handleAdd}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Modifier */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la catégorie</DialogTitle>
              <DialogDescription>
                Modifiez les informations de la catégorie
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nom</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom de la catégorie"
                />
              </div>
              <div>
                <Label htmlFor="edit-icon">Icône (emoji)</Label>
                <Input
                  id="edit-icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🏠"
                />
              </div>
              <div>
                <Label htmlFor="edit-color">Couleur</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une couleur" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${color.value}`}></div>
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { resetForm(); setIsEditDialogOpen(false); }}>
                Annuler
              </Button>
              <Button onClick={handleEdit}>Modifier</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
