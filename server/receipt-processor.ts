import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ProcessedReceipt = {
  items: {
    name: string;
    price: number;
    quantity: number;
    confidence: number;
  }[];
  language: string;
  totalAmount: number;
  date?: string;
  storeName?: string;
};

export async function processReceipt(imageBuffer: Buffer): Promise<ProcessedReceipt> {
  const base64Image = imageBuffer.toString('base64');

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-vision",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "This is a receipt image. Please analyze it and extract the following information in a structured format:\n" +
                  "1. List of items with their names, prices (in cents), quantities, and your confidence level (0-1)\n" +
                  "2. Language of the receipt\n" +
                  "3. Total amount\n" +
                  "4. Store name if visible\n" +
                  "5. Receipt date if visible\n" +
                  "Return the data in a consistent format that can be parsed."
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ]
      }
    ],
    max_tokens: 1000,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Failed to process receipt");
  }

  try {
    // Parse the AI response
    // Using a simple format parsing approach - could be enhanced with more robust parsing
    const lines = content.split('\n');
    const items: ProcessedReceipt['items'] = [];
    let language = 'en';
    let totalAmount = 0;
    let storeName: string | undefined;
    let date: string | undefined;

    for (const line of lines) {
      if (line.toLowerCase().includes('item:')) {
        const itemMatch = line.match(/Item:\s*(.+?)\s*,\s*Price:\s*(\d+)\s*,\s*Quantity:\s*(\d+)\s*,\s*Confidence:\s*([\d.]+)/i);
        if (itemMatch) {
          items.push({
            name: itemMatch[1],
            price: parseInt(itemMatch[2]),
            quantity: parseInt(itemMatch[3]),
            confidence: parseFloat(itemMatch[4])
          });
        }
      } else if (line.toLowerCase().includes('language:')) {
        language = line.split(':')[1].trim().toLowerCase();
      } else if (line.toLowerCase().includes('total:')) {
        const totalMatch = line.match(/\d+/);
        if (totalMatch) {
          totalAmount = parseInt(totalMatch[0]);
        }
      } else if (line.toLowerCase().includes('store:')) {
        storeName = line.split(':')[1].trim();
      } else if (line.toLowerCase().includes('date:')) {
        date = line.split(':')[1].trim();
      }
    }

    return {
      items,
      language,
      totalAmount,
      storeName,
      date
    };
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    throw new Error('Failed to parse receipt data');
  }
}