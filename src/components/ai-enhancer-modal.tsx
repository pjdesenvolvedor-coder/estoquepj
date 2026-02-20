'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Check, RefreshCw } from 'lucide-react';
import { aiNoteEnhancement, AiNoteEnhancementOutput } from '@/ai/flows/ai-note-enhancement-flow';
import { InventoryItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AiEnhancerModalProps {
  item: InventoryItem | null;
  onOpenChange: (open: boolean) => void;
  onUpdate: (item: InventoryItem) => void;
}

export function AiEnhancerModal({ item, onOpenChange, onUpdate }: AiEnhancerModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiNoteEnhancementOutput | null>(null);

  const enhance = async () => {
    if (!item) return;
    setLoading(true);
    try {
      const output = await aiNoteEnhancement({
        existingNotes: item.notes || 'Nenhuma nota fornecida.',
        itemDescription: `${item.service} account - ${item.account}`
      });
      setResult(output);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applySummary = () => {
    if (!item || !result) return;
    onUpdate({
      ...item,
      notes: result.summary
    });
    onOpenChange(false);
    setResult(null);
  };

  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            IA Note Enhancer
          </DialogTitle>
          <DialogDescription>
            Use Inteligência Artificial para organizar e melhorar as observações da conta {item.service}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {!result ? (
            <div className="text-center py-8 space-y-4">
              <div className="p-4 bg-muted rounded-lg text-sm text-left font-mono mb-4">
                <p className="text-xs text-muted-foreground mb-2">NOTAS ATUAIS:</p>
                {item.notes || 'Vazio'}
              </div>
              <Button onClick={enhance} disabled={loading} className="w-full h-12 text-lg bg-secondary hover:bg-secondary/90">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processando com IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Melhorar Notas
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Resumo Sugerido pela IA:</h4>
                <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg text-sm">
                  {result.summary}
                </div>
              </div>

              {result.suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Sugestões de Melhoria:</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.suggestions.map((s, i) => (
                      <Badge key={i} variant="outline" className="font-normal border-secondary/30 text-secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground italic text-center">
                {result.resultDescription}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {result ? (
            <>
              <Button variant="ghost" onClick={() => setResult(null)} disabled={loading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
              <Button onClick={applySummary}>
                <Check className="w-4 h-4 mr-2" />
                Aplicar Resumo
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}