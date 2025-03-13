import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a receipt analysis expert. Extract detailed information from receipt images in a structured format. Be precise with numbers and confident in your analysis."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Please analyze this receipt image and extract the following information in JSON format:\n" +
                  "- items: array of items with name, price (in cents), quantity, and confidence level (0-1)\n" +
                  "- language: detected language of the receipt\n" +
                  "- totalAmount: total amount in cents\n" +
                  "- date: receipt date if visible (ISO format)\n" +
                  "- storeName: name of the store if visible\n\n" +
                  "Ensure all numerical values are in their smallest unit (cents for currency)."
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
    response_format: { type: "json_object" },
    max_tokens: 1500,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Failed to process receipt");
  }

  try {
    // Parse the JSON response directly since we specified json_object format
    const parsedData = JSON.parse(content);

    // Ensure the response matches our expected format
    return {
      items: parsedData.items.map((item: any) => ({
        name: item.name,
        price: Math.round(item.price), // Ensure price is an integer
        quantity: Math.round(item.quantity), // Ensure quantity is an integer
        confidence: Math.min(1, Math.max(0, item.confidence)), // Ensure confidence is between 0 and 1
      })),
      language: parsedData.language?.toLowerCase() || 'en',
      totalAmount: Math.round(parsedData.totalAmount),
      date: parsedData.date,
      storeName: parsedData.storeName,
    };
  } catch (error) {
    console.error('Error parsing OpenAI response:', error, 'Raw response:', content);
    throw new Error('Failed to parse receipt data');
  }
}