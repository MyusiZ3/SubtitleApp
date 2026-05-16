import subsrt from 'subsrt-ts';

export type SubtitleFormat = 'srt' | 'ass' | 'vtt' | 'sbv' | 'json';

export const convertSubtitle = (content: string, targetFormat: SubtitleFormat): string => {
  try {
    const captions = subsrt.parse(content);
    return subsrt.build(captions, { format: targetFormat });
  } catch (error) {
    console.error('Conversion error:', error);
    throw new Error('Failed to convert subtitle format.');
  }
};

export const buildSubtitle = (captions: any[], format: SubtitleFormat = 'srt'): string => {
  return subsrt.build(captions, { format });
};

export const downloadFile = (content: string, fileName: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
