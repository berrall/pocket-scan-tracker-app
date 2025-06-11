
import { AlertCircle } from "lucide-react";

export const ScannerInfo = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
      <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        Scanner IA avancé
      </h4>
      <div className="text-sm text-blue-700 space-y-1">
        <p>• <strong>IA Google Vision:</strong> Reconnaissance optique de caractères (OCR) avancée</p>
        <p>• <strong>IA Gemini:</strong> Analyse intelligente et extraction structurée des données</p>
        <p>• <strong>Support international:</strong> Reçus du Canada, États-Unis, Europe et autres pays</p>
        <p>• <strong>Détection automatique:</strong> Nom du magasin, date, taxes, total, articles</p>
        <p>• <strong>Calcul de confiance:</strong> Score de fiabilité de l'extraction</p>
      </div>
    </div>
  );
};
