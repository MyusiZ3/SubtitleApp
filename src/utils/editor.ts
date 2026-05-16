

/**
 * Shifts subtitle timing by a given amount of milliseconds.
 */
export const shiftTime = (captions: any[], ms: number): any[] => {
  return captions.map(cap => ({
    ...cap,
    start: Math.max(0, cap.start + ms),
    end: Math.max(0, cap.end + ms)
  }));
};

/**
 * Removes common ads and Hearing Impaired tags from captions.
 */
export const cleanupSubtitles = (captions: any[]): any[] => {
  const adPatterns = [
    /translated by/gi,
    /captioned by/gi,
    /sync by/gi,
    /corrected by/gi,
    /www\./gi,
    /http/gi,
    /\.com/gi,
    /\.org/gi,
    /\.net/gi,
    /join us/gi,
    /subtitles by/gi,
    /edit by/gi
  ];

  const hiPatterns = [
    /\[.*?\]/g,
    /\(.*?\)/g,
    /^.*?:\s/g
  ];

  return captions.map(cap => {
    let text = cap.text || '';
    for (const pattern of adPatterns) {
      if (pattern.test(text)) {
        text = '';
        break;
      }
    }
    if (text) {
      for (const pattern of hiPatterns) {
        text = text.replace(pattern, '');
      }
    }
    return { ...cap, text: text.trim() };
  }).filter(cap => cap.text !== '');
};

/**
 * Performs bulk search and replace on captions.
 */
export const bulkSearchReplace = (captions: any[], search: string, replace: string, caseSensitive: boolean): any[] => {
  if (!search) return captions;
  const flags = caseSensitive ? 'g' : 'gi';
  const regex = new RegExp(search, flags);

  return captions.map(cap => ({
    ...cap,
    text: cap.text.replace(regex, replace)
  }));
};

/**
 * Advanced Substation Alpha (.ass) Style Modifier
 * This applies style overrides to the built ASS content string.
 */
export const applyStyleToAss = (assContent: string, options: { fontSize?: number, color?: string }): string => {
  let result = assContent;
  
  if (options.fontSize) {
    // Replace FontSize in Style lines
    result = result.replace(/(Style:.*?,)(\d+)(,.*)/g, `$1${options.fontSize}$3`);
  }
  
  if (options.color) {
    // ASS colors are &HBBGGRR& (Hex). We expect #RRGGBB from input and convert to BGR.
    const hex = options.color.replace('#', '');
    const r = hex.substring(0, 2);
    const g = hex.substring(2, 4);
    const b = hex.substring(4, 6);
    const bgr = `${b}${g}${r}`;
    
    // Replace PrimaryColour (usually the 4th or 5th field in Style definition)
    // This is a bit complex due to CSV nature of ASS, but common pattern is &H[0-9A-F]+&
    result = result.replace(/(&H)[0-9A-F]{6}(&)/gi, `$1${bgr.toUpperCase()}$2`);
  }

  return result;
};
