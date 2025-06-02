
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dashboard } from "@/components/Dashboard";
import { AddExpense } from "@/components/AddExpense";
import { ScanReceipt } from "@/components/ScanReceipt";
import { TransactionHistory } from "@/components/TransactionHistory";
import { Settings } from "@/components/Settings";
import { CategoryManager } from "@/components/CategoryManager";
import { Wallet, Receipt, Camera, History, Settings as SettingsIcon, Tag } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Wallet className="text-blue-600" />
            Gestion Familiale
          </h1>
          <p className="text-gray-600 text-lg">Suivez vos dépenses et revenus en toute simplicité</p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Wallet size={16} />
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Receipt size={16} />
              Ajouter
            </TabsTrigger>
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <Camera size={16} />
              Scanner
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History size={16} />
              Historique
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tag size={16} />
              Catégories
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <SettingsIcon size={16} />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="add">
            <AddExpense />
          </TabsContent>

          <TabsContent value="scan">
            <ScanReceipt />
          </TabsContent>

          <TabsContent value="history">
            <TransactionHistory />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager />
          </TabsContent>

          <TabsContent value="settings">
            <Settings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
