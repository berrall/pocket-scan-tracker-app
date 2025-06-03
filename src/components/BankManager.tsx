
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import { useBankInstitutions } from "@/hooks/useBankInstitutions";
import { useToast } from "@/hooks/use-toast";
import { Building, CreditCard, Plus, Edit, Trash2 } from "lucide-react";

export const BankManager = () => {
  const { bankAccountTypes, addBankAccountType, updateBankAccountType, deleteBankAccountType } = useBankAccounts();
  const { bankInstitutions, addBankInstitution, updateBankInstitution, deleteBankInstitution } = useBankInstitutions();
  const { toast } = useToast();

  const [newAccountTypeName, setNewAccountTypeName] = useState('');
  const [newInstitutionName, setNewInstitutionName] = useState('');
  const [editingAccountType, setEditingAccountType] = useState<{ id: string; name: string } | null>(null);
  const [editingInstitution, setEditingInstitution] = useState<{ id: string; name: string } | null>(null);

  const handleAddAccountType = () => {
    if (!newAccountTypeName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nom pour le type de compte",
        variant: "destructive",
      });
      return;
    }

    addBankAccountType({ name: newAccountTypeName.trim() });
    setNewAccountTypeName('');
    toast({
      title: "Succès",
      description: "Type de compte bancaire ajouté",
    });
  };

  const handleAddInstitution = () => {
    if (!newInstitutionName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nom pour l'institution bancaire",
        variant: "destructive",
      });
      return;
    }

    addBankInstitution({ name: newInstitutionName.trim() });
    setNewInstitutionName('');
    toast({
      title: "Succès",
      description: "Institution bancaire ajoutée",
    });
  };

  const handleUpdateAccountType = () => {
    if (!editingAccountType || !editingAccountType.name.trim()) return;

    updateBankAccountType(editingAccountType.id, { name: editingAccountType.name.trim() });
    setEditingAccountType(null);
    toast({
      title: "Succès",
      description: "Type de compte bancaire modifié",
    });
  };

  const handleUpdateInstitution = () => {
    if (!editingInstitution || !editingInstitution.name.trim()) return;

    updateBankInstitution(editingInstitution.id, { name: editingInstitution.name.trim() });
    setEditingInstitution(null);
    toast({
      title: "Succès",
      description: "Institution bancaire modifiée",
    });
  };

  const handleDeleteAccountType = (id: string, name: string) => {
    deleteBankAccountType(id);
    toast({
      title: "Succès",
      description: `Type de compte "${name}" supprimé`,
    });
  };

  const handleDeleteInstitution = (id: string, name: string) => {
    deleteBankInstitution(id);
    toast({
      title: "Succès",
      description: `Institution "${name}" supprimée`,
    });
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Building className="text-blue-600" />
          Gestion des banques
        </CardTitle>
        <CardDescription>
          Gérez vos types de comptes bancaires et institutions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="account-types" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account-types" className="flex items-center gap-2">
              <CreditCard size={16} />
              Types de comptes
            </TabsTrigger>
            <TabsTrigger value="institutions" className="flex items-center gap-2">
              <Building size={16} />
              Institutions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account-types" className="space-y-6">
            {/* Ajouter un type de compte */}
            <div className="flex gap-2">
              <Input
                placeholder="Nouveau type de compte..."
                value={newAccountTypeName}
                onChange={(e) => setNewAccountTypeName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddAccountType()}
              />
              <Button onClick={handleAddAccountType}>
                <Plus size={16} />
                Ajouter
              </Button>
            </div>

            {/* Liste des types de comptes */}
            <div className="space-y-2">
              {bankAccountTypes.map((accountType) => (
                <div key={accountType.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{accountType.name}</span>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingAccountType({ id: accountType.id, name: accountType.name })}
                        >
                          <Edit size={16} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Modifier le type de compte</DialogTitle>
                          <DialogDescription>
                            Modifiez le nom du type de compte bancaire
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-account-type">Nom du type de compte</Label>
                            <Input
                              id="edit-account-type"
                              value={editingAccountType?.name || ''}
                              onChange={(e) => setEditingAccountType(prev => 
                                prev ? { ...prev, name: e.target.value } : null
                              )}
                            />
                          </div>
                          <Button onClick={handleUpdateAccountType} className="w-full">
                            Modifier
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAccountType(accountType.id, accountType.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="institutions" className="space-y-6">
            {/* Ajouter une institution */}
            <div className="flex gap-2">
              <Input
                placeholder="Nouvelle institution bancaire..."
                value={newInstitutionName}
                onChange={(e) => setNewInstitutionName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddInstitution()}
              />
              <Button onClick={handleAddInstitution}>
                <Plus size={16} />
                Ajouter
              </Button>
            </div>

            {/* Liste des institutions */}
            <div className="space-y-2">
              {bankInstitutions.map((institution) => (
                <div key={institution.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{institution.name}</span>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingInstitution({ id: institution.id, name: institution.name })}
                        >
                          <Edit size={16} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Modifier l'institution bancaire</DialogTitle>
                          <DialogDescription>
                            Modifiez le nom de l'institution bancaire
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-institution">Nom de l'institution</Label>
                            <Input
                              id="edit-institution"
                              value={editingInstitution?.name || ''}
                              onChange={(e) => setEditingInstitution(prev => 
                                prev ? { ...prev, name: e.target.value } : null
                              )}
                            />
                          </div>
                          <Button onClick={handleUpdateInstitution} className="w-full">
                            Modifier
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteInstitution(institution.id, institution.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
