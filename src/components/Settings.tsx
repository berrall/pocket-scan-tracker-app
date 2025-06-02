
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/hooks/useSettings";
import { CURRENCY_OPTIONS } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon } from "lucide-react";

export const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();

  const handleCurrencyChange = (currencyCode: string) => {
    const currency = CURRENCY_OPTIONS.find(c => c.code === currencyCode);
    if (currency) {
      updateSettings({
        currency: currency.code,
        currencySymbol: currency.symbol
      });
      
      toast({
        title: "Devise mise à jour",
        description: `Devise changée vers ${currency.name} (${currency.symbol})`,
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <SettingsIcon className="text-blue-600" />
          Paramètres
        </CardTitle>
        <CardDescription>
          Configurez votre application selon vos préférences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="currency">Devise</Label>
          <Select value={settings.currency} onValueChange={handleCurrencyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une devise" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{currency.symbol}</span>
                    <span>{currency.name}</span>
                    <span className="text-gray-500">({currency.code})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500">
            Devise actuelle : {settings.currencySymbol} ({settings.currency})
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
