import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const ComponentSchema = z.object({
  name: z.string(),
  description: z.string(),
  essential: z.boolean(),
});

const ClaimHintsSchema = z.object({
  problem: z.string(),
  coreInventiveConcept: z.string(),
  components: z.array(ComponentSchema),
  relationships: z.array(z.string()),
  functions: z.array(z.string()),
  alternatives: z.array(z.string()),
  priorArtCheckpoints: z.array(z.string()),
});

export type ClaimHints = z.infer<typeof ClaimHintsSchema>;

export async function extractClaimHints(
  extractedFields: Record<string, unknown>,
  messages: { role: string; content: string }[],
): Promise<ClaimHints> {
  const convoSummary = messages
    .slice(-20)
    .map((m) => `[${m.role === 'user' ? '발명자' : 'AI'}] ${m.content}`)
    .join('\n');

  const fieldsSummary = JSON.stringify(extractedFields, null, 2);

  const { object } = await generateObject({
    model: anthropic('claude-sonnet-4-6'),
    schema: ClaimHintsSchema,
    prompt: `You are a Korean patent specialist. Extract claim-relevant information from the following invention disclosure.

Extracted fields:
${fieldsSummary}

Conversation (recent 20 turns):
${convoSummary}

Extract:
1. problem: Core technical problem the invention solves (Korean)
2. coreInventiveConcept: The key inventive step — what makes this novel (Korean)
3. components: All identified components/elements with:
   - name (Korean)
   - description (what it does, Korean)
   - essential: true if invention cannot function without it
4. relationships: How components connect/interact (Korean, each as a sentence)
5. functions: What the invention or its parts do (Korean, each as a sentence)
6. alternatives: Alternative embodiments or implementations (Korean)
7. priorArtCheckpoints: Known prior art or differences the inventor mentioned (Korean)

Be concise. Extract only what's explicitly stated or clearly implied from the conversation.`,
  });

  return object;
}

const SuggestedClaimSchema = z.object({
  id: z.string(),
  scope: z.enum(['broad', 'medium', 'narrow']),
  recommended: z.boolean(),
  text: z.string(),
  rationale: z.string(),
  risks: z.array(z.string()),
  attorneyQuestions: z.array(z.string()),
});

const ClaimsOutputSchema = z.object({
  claims: z.array(SuggestedClaimSchema),
});

export type SuggestedClaim = z.infer<typeof SuggestedClaimSchema>;

export async function generateClaims(
  hints: ClaimHints,
  inventionTitle: string,
): Promise<SuggestedClaim[]> {
  const essentialComponents = hints.components.filter((c) => c.essential);
  const allComponents = hints.components;

  const { object } = await generateObject({
    model: anthropic('claude-sonnet-4-6'),
    schema: ClaimsOutputSchema,
    prompt: `You are a Korean patent attorney drafting claim suggestions for a Korean patent application.

Invention title: ${inventionTitle}

Extracted claim hints:
- Problem: ${hints.problem}
- Core inventive concept: ${hints.coreInventiveConcept}
- Essential components: ${essentialComponents.map((c) => `${c.name}: ${c.description}`).join('; ')}
- All components: ${allComponents.map((c) => `${c.name} (${c.essential ? '필수' : '선택'}): ${c.description}`).join('; ')}
- Component relationships: ${hints.relationships.join('; ')}
- Functions: ${hints.functions.join('; ')}
- Alternatives: ${hints.alternatives.join('; ')}
- Prior art checkpoints: ${hints.priorArtCheckpoints.join('; ')}

Generate exactly 3 independent claim drafts:

1. BROAD (id: "broad") — Only essential components, abstract function language ("포함하는"). Broad protection but higher prior art risk.
2. MEDIUM (id: "medium", recommended: true) — Essential components + 1-2 key relationships, concrete functions. Balanced scope and stability.
3. NARROW (id: "narrow") — All components, specific embodiment details. Nearly certain to be granted but easy to design around.

For each claim:
- text: The actual Korean patent claim text, starting with "1. ${inventionTitle}에 있어서," and ending with "를 특징으로 하는 ${inventionTitle}."
- rationale: Why this scope was chosen (Korean, 2-3 sentences)
- risks: 2-3 specific risks (Korean)
- attorneyQuestions: 2-3 recommended questions to ask a patent attorney (Korean)

Use proper Korean patent claim language. "포함하는", "결합된", "연결된", "구성되는" as appropriate.`,
  });

  return object.claims;
}
