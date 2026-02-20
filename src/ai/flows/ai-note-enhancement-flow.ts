'use server';
/**
 * @fileOverview An AI agent to enhance notes for digital access items.
 *
 * - aiNoteEnhancement - A function that handles the AI-powered note enhancement process.
 * - AiNoteEnhancementInput - The input type for the aiNoteEnhancement function.
 * - AiNoteEnhancementOutput - The return type for the aiNoteEnhancement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiNoteEnhancementInputSchema = z.object({
  existingNotes: z.string().describe('The current notes for the digital access item.'),
  itemDescription:
    z.string().describe('A brief description of the digital access item, e.g., "Netflix account", "Disney+ profile".'),
});
export type AiNoteEnhancementInput = z.infer<typeof AiNoteEnhancementInputSchema>;

const AiNoteEnhancementOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the provided notes.'),
  suggestions: z
    .array(z.string())
    .describe('A list of suggested additions or improvements to make the notes more complete and consistent.'),
  resultDescription:
    z.string().describe('A description of what the AI did, e.g., "Notes were summarized and suggestions were provided."'),
});
export type AiNoteEnhancementOutput = z.infer<typeof AiNoteEnhancementOutputSchema>;

export async function aiNoteEnhancement(
  input: AiNoteEnhancementInput
): Promise<AiNoteEnhancementOutput> {
  return aiNoteEnhancementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiNoteEnhancementPrompt',
  input: {schema: AiNoteEnhancementInputSchema},
  output: {schema: AiNoteEnhancementOutputSchema},
  prompt: `You are an AI assistant specialized in organizing and enhancing notes for digital access items like streaming accounts (Netflix, Disney+, etc.).
Your goal is to analyze the provided 'existingNotes' in the context of the 'itemDescription' and then:
1. Provide a concise summary of the notes.
2. Suggest additional relevant details or improvements to make the notes clearer, more complete, and consistent.

If the notes are already very brief, focus more on providing relevant suggestions. If the notes are extensive, provide a good summary and then offer suggestions.

Here are the details:
Item Description: {{{itemDescription}}}
Existing Notes: {{{existingNotes}}}

Please provide your response in the specified JSON format, ensuring both 'summary' and 'suggestions' fields are populated (even if empty lists or strings are appropriate).
`,
});

const aiNoteEnhancementFlow = ai.defineFlow(
  {
    name: 'aiNoteEnhancementFlow',
    inputSchema: AiNoteEnhancementInputSchema,
    outputSchema: AiNoteEnhancementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate note enhancement output.');
    }
    // Determine resultDescription based on what was generated.
    let resultDesc = '';
    if (output.summary && output.summary.trim().length > 0 && output.suggestions.length > 0) {
      resultDesc = 'Notes were summarized and suggestions for improvement were provided.';
    } else if (output.summary && output.summary.trim().length > 0) {
      resultDesc = 'Notes were summarized.';
    } else if (output.suggestions.length > 0) {
      resultDesc = 'Suggestions for improvement were provided.';
    } else {
      resultDesc = 'No significant summary or suggestions were generated.';
    }

    return {
      ...output,
      resultDescription: resultDesc,
    };
  }
);
