import subsrt from 'subsrt-ts';

export const translateText = async (text: string, from: string, to: string, style: 'normal' | 'anime' = 'normal'): Promise<string> => {
  // Using MyMemory API (free and no key required for basic usage)
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.responseData && data.responseData.translatedText) {
      let translatedText = data.responseData.translatedText;

      // Basic post-processing for "Anime/Casual" style in Indonesian
      if (style === 'anime' && to === 'id') {
        translatedText = translatedText
          .replace(/\bSaya\b/g, 'Aku')
          .replace(/\bAnda\b/g, 'Kamu')
          .replace(/\btidak\b/g, 'nggak')
          .replace(/\bsudah\b/g, 'udah')
          .replace(/\bbisa\b/g, 'bisa')
          .replace(/\bmengapa\b/g, 'kenapa')
          .replace(/\bHalo\b/g, 'Oi')
          .replace(/\bBaiklah\b/g, 'Oke deh')
          .replace(/\bSangat\b/g, 'Banget')
          .replace(/\bKamu\b/g, 'Lu') // Even more casual
          .replace(/\bAku\b/g, 'Gue') // Even more casual
          .replace(/\bBenar\b/g, 'Bener')
          .replace(/\bMungkin\b/g, 'Kali ya');
      }
      return translatedText;
    }
    return text; // Fallback to original
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};

export const translateSubtitles = async (
  content: string, 
  from: string, 
  to: string, 
  style: 'normal' | 'anime' = 'normal',
  onProgress?: (progress: number) => void
): Promise<any[]> => {
  const captions = subsrt.parse(content);
  const total = captions.length;
  
  const translatedCaptions = [];
  for (let i = 0; i < captions.length; i++) {
    const caption = captions[i] as any;
    if (caption.text) {
      caption.text = await translateText(caption.text, from, to, style);
    }
    translatedCaptions.push(caption);
    
    if (onProgress) {
      onProgress(Math.round(((i + 1) / total) * 100));
    }
    
    // Tiny delay to be nice to the API
    if (i % 5 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return translatedCaptions;
};
