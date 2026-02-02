import type { Event } from '../types/events';

// Model display names
export function getModelDisplayName(modelId: string | undefined): string {
  if (!modelId) return 'AI';

  const modelNames: Record<string, string> = {
    'deepseek/deepseek-v3.2': 'DeepSeek v3.2',
    'google/gemini-3-pro-preview': 'Gemini 3 Pro',
    'google/gemini-3-flash-preview': 'Gemini 3 Flash',
    'google/gemini-2.5-pro-preview-06-05': 'Gemini 2.5 Pro',
    'z-ai/glm-4.7': 'GLM-4.7',
    'openai/gpt-5.1-codex-mini': 'GPT-5.1 Codex Mini',
    'openai/gpt-5.1-codex-max': 'GPT-5.1 Codex Max',
  };

  return modelNames[modelId] || modelId;
}

// Model color class for styling
export function getModelColorClass(modelId: string | undefined): string {
  if (!modelId) return '';
  if (modelId.includes('pro')) return 'text-amber-600';
  if (modelId.includes('flash')) return 'text-blue-600';
  if (modelId.includes('deepseek')) return 'text-blue-600';
  if (modelId.includes('glm')) return 'text-zinc-500';
  if (modelId.includes('codex-max')) return 'text-amber-600';
  if (modelId.includes('codex-mini')) return 'text-green-600';
  return '';
}

// Calculate total output characters from AI-generated fields
export function calculateOutputChars(event: Event): number {
  let chars = 0;

  // Main fields
  chars += (event.title || '').length;
  chars += (event.lead || '').length;
  chars += (event.summary || '').length;

  // Metadata strings
  const m = event.metadata;
  if (m) {
    chars += (m.ttsText || '').length;
    chars += (m.shortHeadline || '').length;
    chars += (m.ultraShortHeadline || '').length;
    chars += (m.category || '').length;

    // Arrays - stringify to count content
    if (m.keyPoints) chars += JSON.stringify(m.keyPoints).length;
    if (m.mentionedCountries) chars += JSON.stringify(m.mentionedCountries).length;
    if (m.mentionedPeople) chars += JSON.stringify(m.mentionedPeople).length;
    if (m.location) chars += JSON.stringify(m.location).length;
    if (m.locations) chars += JSON.stringify(m.locations).length;
  }

  return chars;
}

// Estimate CO2 emissions based on output chars and model
// Based on Google's 2025 data: median query = 0.03g CO2 for ~0.24 Wh
// Using 3.5 chars/token for Polish (matches backend costTracker)
export function estimateCO2(event: Event): number {
  const outputChars = calculateOutputChars(event);
  const outputTokens = outputChars / 3.5; // ~3.5 chars per token (Polish)
  const inputTokens = outputTokens * 4; // estimate: input is ~4x output for summarization

  const modelId = event.metadata?.summarizationModel || event.summarizationModel || '';

  // CO2 per token estimates (grams) based on Google 2025 data + price ratios
  // Price ratio reflects computational cost -> energy -> CO2
  let inputRate: number;
  let outputRate: number;

  if (modelId.includes('pro')) {
    // Pro: 4x Flash due to reasoning overhead
    inputRate = 0.00002;
    outputRate = 0.00012;
  } else if (modelId.includes('flash')) {
    // Flash: baseline efficiency
    inputRate = 0.000005;
    outputRate = 0.00003;
  } else if (modelId.includes('deepseek')) {
    // DeepSeek v3.2: MoE activates only 37B of 671B params (~5.5%)
    inputRate = 0.000004;
    outputRate = 0.000024;
  } else if (modelId.includes('glm')) {
    // GLM-4.7: MoE activates only 32B of 355B params (~9%)
    inputRate = 0.000004;
    outputRate = 0.000024;
  } else if (modelId.includes('codex-max')) {
    // GPT-5.1 Codex Max: flagship agentic model, higher compute
    inputRate = 0.00006;
    outputRate = 0.00036;
  } else if (modelId.includes('codex-mini')) {
    // GPT-5.1 Codex Mini: efficient smaller model
    inputRate = 0.000005;
    outputRate = 0.00003;
  } else {
    // Default/unknown: use Flash rates
    inputRate = 0.000005;
    outputRate = 0.00003;
  }

  return (inputTokens * inputRate) + (outputTokens * outputRate);
}

// Format CO2 value for display (in milligrams, 1 decimal place)
export function formatCO2(grams: number): string {
  const milligrams = grams * 1_000;
  return milligrams.toLocaleString('pl-PL', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
}

// Calculate CO2 equivalents for tooltip
export function getCO2Equivalents(grams: number): string[] {
  // 1 km car (avg petrol) = ~120g CO2
  const carMeters = (grams / 120) * 1000;
  // 1 hour 50" LED TV (~100W) = ~36g CO2 (Poland grid ~360g/kWh)
  const tvSeconds = grams / 0.01; // 0.01g per second
  // 1ml of milk = ~2g CO2 (production)
  const milkMl = grams / 2;

  return [
    `= ${carMeters.toFixed(1)}m autem benzynowym`,
    `= ${tvSeconds.toFixed(0)}s telewizora 50" LED`,
    `= ${milkMl.toFixed(1)}ml mleka`
  ];
}
