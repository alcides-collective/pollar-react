import type { Event } from '../types/events';
import type { DailyBrief } from '../types/brief';

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
    'anthropic/claude-opus-4-5': 'Claude Opus 4.5',
    'anthropic/claude-sonnet-4': 'Claude Sonnet 4',
  };

  return modelNames[modelId] || modelId;
}

// Model color class for styling
export function getModelColorClass(modelId: string | undefined): string {
  if (!modelId) return '';
  if (modelId.includes('opus')) return 'text-orange-600';
  if (modelId.includes('sonnet')) return 'text-violet-600';
  if (modelId.includes('pro')) return 'text-amber-600';
  if (modelId.includes('flash')) return 'text-blue-600';
  if (modelId.includes('deepseek')) return 'text-blue-600';
  if (modelId.includes('glm')) return 'text-zinc-500';
  if (modelId.includes('codex-max')) return 'text-amber-600';
  if (modelId.includes('codex-mini')) return 'text-green-600';
  return '';
}

export function getModelPillClasses(modelId: string | undefined): string {
  if (!modelId) return 'bg-zinc-100 text-zinc-600';
  if (modelId.includes('opus')) return 'bg-orange-50 text-orange-700 ring-orange-200/60';
  if (modelId.includes('sonnet')) return 'bg-violet-50 text-violet-700 ring-violet-200/60';
  if (modelId.includes('pro')) return 'bg-amber-50 text-amber-700 ring-amber-200/60';
  if (modelId.includes('flash')) return 'bg-blue-50 text-blue-700 ring-blue-200/60';
  if (modelId.includes('deepseek')) return 'bg-blue-50 text-blue-700 ring-blue-200/60';
  if (modelId.includes('glm')) return 'bg-zinc-100 text-zinc-600 ring-zinc-200/60';
  if (modelId.includes('codex-max')) return 'bg-amber-50 text-amber-700 ring-amber-200/60';
  if (modelId.includes('codex-mini')) return 'bg-green-50 text-green-700 ring-green-200/60';
  return 'bg-zinc-100 text-zinc-600 ring-zinc-200/60';
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
  } else if (modelId.includes('opus')) {
    // Claude Opus 4.5: flagship Anthropic model, higher compute
    inputRate = 0.00004;
    outputRate = 0.00024;
  } else if (modelId.includes('sonnet')) {
    // Claude Sonnet 4: balanced Anthropic model
    inputRate = 0.000008;
    outputRate = 0.000048;
  } else {
    // Default/unknown: use Flash rates
    inputRate = 0.000005;
    outputRate = 0.00003;
  }

  return (inputTokens * inputRate) + (outputTokens * outputRate);
}

// Calculate total output characters from AI-generated fields for Brief
export function calculateBriefOutputChars(brief: DailyBrief): number {
  let chars = 0;

  // Main fields
  chars += (brief.headline || '').length;
  chars += (brief.lead || '').length;
  chars += (brief.executiveSummary || '').length;
  chars += (brief.greeting || '').length;
  chars += (brief.radioScript || '').length;

  // Sections
  if (brief.sections) {
    brief.sections.forEach(section => {
      chars += (section.headline || '').length;
      chars += (section.content || '').length;
      chars += (section.keyEvents || []).join('').length;
      chars += (section.insights || []).join('').length;
    });
  }

  // Insights
  if (brief.insights) {
    chars += (brief.insights.metaCommentary || '').length;
    chars += (brief.insights.trends || []).join('').length;
    chars += (brief.insights.correlations || []).join('').length;
    chars += (brief.insights.anomalies || []).join('').length;
    chars += (brief.insights.implications || []).join('').length;
  }

  // Word of the day
  if (brief.wordOfTheDay) {
    chars += JSON.stringify(brief.wordOfTheDay).length;
  }

  // Mentioned people/orgs
  if (brief.mentionedPeople) chars += JSON.stringify(brief.mentionedPeople).length;
  if (brief.mentionedOrganizations) chars += brief.mentionedOrganizations.join('').length;

  return chars;
}

// Estimate CO2 emissions for Brief
export function estimateBriefCO2(brief: DailyBrief): number {
  const outputChars = calculateBriefOutputChars(brief);
  const outputTokens = outputChars / 3.5; // ~3.5 chars per token (Polish)
  const inputTokens = outputTokens * 6; // estimate: input is ~6x output for brief (more sources)

  const modelId = brief.metadata?.model || '';

  // CO2 per token estimates (grams)
  let inputRate: number;
  let outputRate: number;

  if (modelId.includes('opus')) {
    inputRate = 0.00004;
    outputRate = 0.00024;
  } else if (modelId.includes('sonnet')) {
    inputRate = 0.000008;
    outputRate = 0.000048;
  } else if (modelId.includes('pro')) {
    inputRate = 0.00002;
    outputRate = 0.00012;
  } else if (modelId.includes('flash')) {
    inputRate = 0.000005;
    outputRate = 0.00003;
  } else if (modelId.includes('deepseek')) {
    inputRate = 0.000004;
    outputRate = 0.000024;
  } else {
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

// Model descriptions for tooltips
export function getModelDescription(modelId: string | undefined): { title: string; text: string } {
  if (!modelId) return { title: 'AI', text: '' };

  const descriptions: Record<string, { title: string; text: string }> = {
    'google/gemini-3-pro-preview': {
      title: 'Gemini 3 Pro',
      text: 'Topowy model Google z listopada 2025. Przetwarza do miliona tokenów na wejściu i 64 tysiące na wyjściu. W testach MMMU-Pro osiąga 81%, a w trybie Deep Think poprawia wynik ARC-AGI-2 z 31% do 45%. Rozumie tekst, obrazy, wideo i dźwięk.'
    },
    'google/gemini-3-flash-preview': {
      title: 'Gemini 3 Flash',
      text: 'Szybki model Google z grudnia 2025, generuje 218 tokenów na sekundę — trzy razy więcej niż poprzednik. W testach kodowania SWE-bench zdobywa 78%, a w rozumowaniu GPQA Diamond aż 90%. Kosztuje pół dolara za milion tokenów wejściowych.'
    },
    'google/gemini-2.5-pro-preview-06-05': {
      title: 'Gemini 2.5 Pro',
      text: 'Model z maja 2025, poprzednia generacja flagowca Google. Obsługuje milion tokenów kontekstu i rozumie różne formaty — tekst, obrazy, wideo oraz audio. Został zastąpiony przez nowszą serię 3, ale wciąż działa stabilnie.'
    },
    'deepseek/deepseek-v3.2': {
      title: 'DeepSeek v3.2',
      text: 'Chiński model open-source z grudnia 2025, licencja Apache 2.0. Ma 671 miliardów parametrów, ale dzięki architekturze MoE aktywuje tylko 37 miliardów na token. W teście AIME 2025 zdobywa 96% — więcej niż GPT-5. Kosztuje 10× mniej niż konkurenci.'
    },
    'z-ai/glm-4.7': {
      title: 'GLM-4.7',
      text: 'Model open-source od Z.AI z grudnia 2025. Ma 355 miliardów parametrów, ale architektura MoE aktywuje tylko 32 miliardy na token. Zajmuje 1. miejsce wśród modeli open-source na Code Arena. W SWE-bench zdobywa 73,8%, a w τ²-Bench aż 87,4%.'
    },
    'openai/gpt-5.1-codex-mini': {
      title: 'GPT-5.1 Codex Mini',
      text: 'Mniejszy model z rodziny Codex od OpenAI, listopad 2025. Zoptymalizowany pod kątem szybkości i kosztu. Osiąga 96% w matematyce i 98% w rozumowaniu. Idealny do codziennych zadań przy zachowaniu wysokiej jakości.'
    },
    'openai/gpt-5.1-codex-max': {
      title: 'GPT-5.1 Codex Max',
      text: 'Flagowy model agentyczny OpenAI z listopada 2025. Pierwszy model trenowany na milionach tokenów kontekstu przez kompaktowanie. W SWE-Bench zdobywa 77,9%, używając 30% mniej tokenów reasoning niż poprzednik.'
    },
    'anthropic/claude-opus-4-5': {
      title: 'Claude Opus 4.5',
      text: 'Flagowy model Anthropic z lutego 2025. Pierwszy model hybrydowy łączący rozumowanie z intuicją. Osiąga najwyższe wyniki w testach kreatywności i pisania. Okno kontekstowe 200K tokenów.'
    },
    'anthropic/claude-sonnet-4': {
      title: 'Claude Sonnet 4',
      text: 'Zbalansowany model Anthropic z lutego 2025. Oferuje optymalny stosunek jakości do ceny. Idealny do codziennych zadań analitycznych i pisarskich. Okno kontekstowe 200K tokenów.'
    }
  };

  return descriptions[modelId] || {
    title: getModelDisplayName(modelId),
    text: 'Model sztucznej inteligencji użyty do analizy i podsumowania tego wydarzenia.'
  };
}
