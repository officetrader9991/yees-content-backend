import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Languages } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TranslatorPage() {
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
          <Button>Translate</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          <Textarea placeholder="Enter text to translate..." className="min-h-[300px] text-base" />
          <ArrowRight className="h-8 w-8 text-gray-400 mx-4" />
          <Textarea placeholder="Translation..." className="min-h-[300px] text-base" readOnly />
        </div>
      </CardContent>
    </Card>
  );
} 