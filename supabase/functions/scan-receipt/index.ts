import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReceiptData {
  storeName: string;
  date: string;
  subtotal: number;
  taxes: number;
  total: number;
  items: string[];
  confidence: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, mimeType } = await req.json();
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');

    if (!googleApiKey) {
      console.error('Google API key not configured');
      throw new Error('Google API key not configured');
    }

    console.log('Starting receipt scanning process...');

    // Step 1: Use Google Vision API for OCR
    const visionResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{
          image: {
            content: imageData
          },
          features: [
            { type: 'TEXT_DETECTION', maxResults: 1 },
            { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }
          ]
        }]
      }),
    });

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error(`Vision API error: ${visionResponse.status} - ${errorText}`);
      throw new Error(`Vision API error: ${visionResponse.status}`);
    }

    const visionData = await visionResponse.json();
    console.log('Vision API response received');

    if (!visionData.responses || !visionData.responses[0] || !visionData.responses[0].textAnnotations) {
      throw new Error('No text detected in the image');
    }

    const extractedText = visionData.responses[0].textAnnotations[0].description;
    console.log('Extracted text length:', extractedText.length);

    // Step 2: Use Gemini API to analyze and structure the receipt data
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${googleApiKey}`;
    
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze this receipt text and extract the following information in JSON format. Be very careful with number parsing and currency detection. Support receipts from Canada, USA, and other countries:

Required JSON structure:
{
  "storeName": "string",
  "date": "YYYY-MM-DD",
  "subtotal": number,
  "taxes": number,
  "total": number,
  "items": ["item1", "item2", ...],
  "confidence": number (0-1)
}

Rules:
- Extract store/merchant name from the top of the receipt
- Parse date in YYYY-MM-DD format
- Identify subtotal (before taxes)
- Calculate or extract tax amount
- Find the final total amount
- List individual items purchased (up to 10 most relevant)
- Provide confidence score based on data quality
- Handle different currencies (CAD, USD, EUR, etc.)
- Support various receipt formats (grocery, restaurant, retail, gas station)

Receipt text:
${extractedText}`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
      
      // If Gemini fails, create a basic receipt structure from the extracted text
      console.log('Falling back to basic text analysis...');
      const fallbackData = await createFallbackReceiptData(extractedText);
      
      return new Response(JSON.stringify({ 
        receiptData: fallbackData,
        extractedText: extractedText.substring(0, 500),
        fallback: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini API response received');

    if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
      throw new Error('No structured data generated from Gemini');
    }

    const responseText = geminiData.candidates[0].content.parts[0].text;
    console.log('Gemini response:', responseText);

    // Extract JSON from the response (handle markdown code blocks)
    let jsonText = responseText;
    if (responseText.includes('```json')) {
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
    } else if (responseText.includes('```')) {
      const jsonMatch = responseText.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
    }

    let receiptData: ReceiptData;
    try {
      receiptData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw response:', responseText);
      
      // Fallback to basic analysis
      const fallbackData = await createFallbackReceiptData(extractedText);
      return new Response(JSON.stringify({ 
        receiptData: fallbackData,
        extractedText: extractedText.substring(0, 500),
        fallback: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate and clean the data
    receiptData = validateAndCleanReceiptData(receiptData);

    console.log('Successfully parsed receipt data:', receiptData);

    return new Response(JSON.stringify({ 
      receiptData,
      extractedText: extractedText.substring(0, 500)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scan-receipt function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Receipt scanning failed. Please ensure the image is clear and contains a valid receipt.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Fallback function to create basic receipt data from text
async function createFallbackReceiptData(text: string): Promise<ReceiptData> {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Try to find store name (usually first non-empty line)
  let storeName = 'Magasin non identifié';
  if (lines.length > 0) {
    storeName = lines[0].substring(0, 50); // Limit length
  }
  
  // Try to find date
  let date = new Date().toISOString().split('T')[0];
  const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/;
  for (const line of lines) {
    const dateMatch = line.match(dateRegex);
    if (dateMatch) {
      try {
        const parsedDate = new Date(dateMatch[0]);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate.toISOString().split('T')[0];
        }
      } catch (e) {
        // Keep default date
      }
      break;
    }
  }
  
  // Try to find monetary amounts
  const amounts: number[] = [];
  const amountRegex = /\$?\s*(\d+[,\.]?\d*)/g;
  
  for (const line of lines) {
    const matches = line.match(amountRegex);
    if (matches) {
      for (const match of matches) {
        const num = parseFloat(match.replace(/[\$,]/g, ''));
        if (!isNaN(num) && num > 0 && num < 10000) { // Reasonable range
          amounts.push(num);
        }
      }
    }
  }
  
  // Assume the largest amount is the total
  const total = amounts.length > 0 ? Math.max(...amounts) : 0;
  const subtotal = total > 0 ? total * 0.88 : 0; // Approximate subtotal (assuming ~12% tax)
  const taxes = total - subtotal;
  
  // Extract potential items (lines that don't look like headers or totals)
  const items: string[] = [];
  for (const line of lines.slice(1, 10)) { // Skip first line (store name), take up to 9 more
    if (line.length > 3 && line.length < 50 && !line.match(/total|tax|sous-total|date/i)) {
      items.push(line);
    }
  }
  
  return {
    storeName,
    date,
    subtotal: Math.round(subtotal * 100) / 100,
    taxes: Math.round(taxes * 100) / 100,
    total: Math.round(total * 100) / 100,
    items: items.slice(0, 5), // Limit to 5 items
    confidence: 0.3 // Low confidence for fallback
  };
}

// Function to validate and clean receipt data
function validateAndCleanReceiptData(receiptData: any): ReceiptData {
  return {
    storeName: receiptData.storeName || 'Magasin non identifié',
    date: receiptData.date || new Date().toISOString().split('T')[0],
    subtotal: Math.round((Number(receiptData.subtotal) || 0) * 100) / 100,
    taxes: Math.round((Number(receiptData.taxes) || 0) * 100) / 100,
    total: Math.round((Number(receiptData.total) || 0) * 100) / 100,
    items: Array.isArray(receiptData.items) ? receiptData.items.slice(0, 10) : [],
    confidence: Math.min(Math.max(Number(receiptData.confidence) || 0.7, 0), 1)
  };
}
