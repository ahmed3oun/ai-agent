
export function splitTextIntoChunks(text: string, chunkSize = 300, overlap = 50): string[] {
  const chunks: string[] = [];
  console.log('-----------------START/ Splitting text into chunks -----------------');
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    console.log(`----------------- ${text.slice(start, end)} : -----------------`);
    
    chunks.push(text.slice(start, end));
    if (end === text.length) break;
    start += chunkSize - overlap;
  }
  console.log(`----------------- Generated ${chunks.length} chunks : -----------------`);
  chunks.forEach((chunk, index) => {
    console.log(`----------------- Chunk ${index}: ${chunk} : -----------------`);
  });
   console.log('-----------------END/ Splitting text into chunks -----------------');
  return chunks;
}