
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
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${googleApiKey}`, {
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
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
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
      throw new Error('Failed to parse structured receipt data');
    }

    // Validate and clean the data
    if (!receiptData.storeName || !receiptData.date || !receiptData.total) {
      throw new Error('Missing required receipt information');
    }

    // Ensure numeric values are properly formatted
    receiptData.subtotal = Number(receiptData.subtotal) || 0;
    receiptData.taxes = Number(receiptData.taxes) || 0;
    receiptData.total = Number(receiptData.total) || 0;
    receiptData.confidence = Math.min(Math.max(Number(receiptData.confidence) || 0.7, 0), 1);

    // Ensure items is an array
    if (!Array.isArray(receiptData.items)) {
      receiptData.items = [];
    }

    console.log('Successfully parsed receipt data:', receiptData);

    return new Response(JSON.stringify({ 
      receiptData,
      extractedText: extractedText.substring(0, 500) // Include sample of extracted text for debugging
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
