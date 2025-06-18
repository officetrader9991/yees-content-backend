"use client";
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Languages, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TranslatorPage() {
  const [inputText, setInputText] = React.useState('');
  const [translatedText, setTranslatedText] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleTranslate = async () => {
    setLoading(true);
    setError(null);
    setTranslatedText('');

    try {
      const response = await fetch('https://growlark.app.n8n.cloud/webhook/ae6bc5cf-37fe-48ad-89d2-a90b85ba4983', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const result = await response.json();
      setTranslatedText(result.translated_content || 'No translation found in response.');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-6 w-6" />
          <span>Translator</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Button onClick={handleTranslate} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? 'Translating...' : 'Translate'}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          <Textarea
            placeholder="Enter text to translate..."
            className="min-h-[300px] text-base"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <ArrowRight className="h-8 w-8 text-gray-400 mx-4" />
          <Textarea
            placeholder="Translation..."
            className="min-h-[300px] text-base"
            readOnly
            value={translatedText}
          />
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </CardContent>
    </Card>
  );
} 