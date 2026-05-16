export type TranslationStyle = 'normal' | 'anime';

const postProcessCasual = (text: string): string => {
  let casual = text;
  const rules = [
    // Pronouns
    { p: /\bkamu\b/gi, r: 'lu' },
    { p: /\baku\b/gi, r: 'gw' },
    { p: /\bsaya\b/gi, r: 'gw' },
    { p: /\banda\b/gi, r: 'lu' },
    
    // Common Slang / Expletives (Natural Indonesian)
    { p: /\bpersetan\b/gi, r: 'sialan' },
    { p: /\bkotoran\b/gi, r: 'sial' },
    { p: /\bjalang\b/gi, r: 'brengsek' },
    { p: /\bbajingan\b/gi, r: 'brengsek' },
    { p: /\bsialan\b/gi, r: 'anjir' },
    { p: /\bmengutuk\b/gi, r: 'sial' },
    
    // Connectors & Fillers
    { p: /\btidak\b/gi, r: 'ga' },
    { p: /\bsangat\b/gi, r: 'banget' },
    { p: /\bsudah\b/gi, r: 'udah' },
    { p: /\bapa\b/gi, r: 'apaan' },
    { p: /\bbagaimana\b/gi, r: 'gimana' },
    { p: /\bmengapa\b/gi, r: 'kenapa' },
    { p: /\bmelihat\b/gi, r: 'liat' },
    { p: /\bhalo\b/gi, r: 'oi' },
    { p: /\bpergi\b/gi, r: 'cabut' },
    { p: /\bmengerti\b/gi, r: 'paham' },
    { p: /\btentu saja\b/gi, r: 'pastinya' },
    { p: /\bbisa\b/gi, r: 'bisa' },
    
    // Time & Frequency
    { p: /\bbesok\b/gi, r: 'besok' },
    { p: /\bsekarang\b/gi, r: 'skrg' },
    { p: /\bselalu\b/gi, r: 'selalu' },
  ];
  
  rules.forEach(rule => {
    casual = casual.replace(rule.p, rule.r);
  });
  
  // Clean up some weird double spaces or trailing issues
  return casual.replace(/\s+/g, ' ').trim();
};

/**
 * Fast Google Translate API (Unofficial)
 */
const fastGoogleTranslate = async (text: string, source: string, target: string): Promise<string> => {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0].map((s: any) => s[0]).join('');
  } catch (error) {
    console.error('Google Translate Error:', error);
    throw error;
  }
};

export const translateSubtitles = async (
  captions: any[],
  source: string,
  target: string,
  style: TranslationStyle = 'normal',
  onProgress?: (current: number, total: number) => void
): Promise<any[]> => {
  const total = captions.length;
  const translated = JSON.parse(JSON.stringify(captions));

  const chunkSize = 5; 
  for (let i = 0; i < total; i += chunkSize) {
    const chunk = translated.slice(i, i + chunkSize);
    
    await Promise.all(chunk.map(async (item: any, idx: number) => {
      if (!item.text) return;
      
      try {
        const original = item.text;
        let result = await fastGoogleTranslate(original, source, target);
        
        if (style === 'anime' && target === 'id') {
          result = postProcessCasual(result);
        }
        
        translated[i + idx].originalText = original;
        translated[i + idx].text = result;
      } catch (err) {
        console.error(`Failed at index ${i + idx}:`, err);
      }
    }));

    if (onProgress) onProgress(Math.min(i + chunkSize, total), total);
    await new Promise(r => setTimeout(r, 100));
  }

  return translated;
};
