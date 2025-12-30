import { GoogleGenAI } from "@google/genai";
import { Match, Player } from "../types";

const getAI = () => {
    const apiKey = process.env.API_KEY || '';
    if (!apiKey) {
        console.error("API_KEY is missing from environment variables.");
    }
    return new GoogleGenAI({ apiKey });
};

export const generateBattleNarrative = async (
  match: Match,
  player1: Player,
  player2: Player,
  highlights: string
): Promise<string> => {
  const ai = getAI();
  const modelId = "gemini-3-flash-preview";

  const winner = match.winnerId === player1.id ? player1.name : (match.winnerId === player2.id ? player2.name : "No one (Draw)");
  const loser = match.winnerId === player1.id ? player2.name : (match.winnerId === player2.id ? player1.name : "No one");

  const prompt = `
    Write a short, dramatic, Warhammer 40k style battle report (max 150 words).
    Use grimdark terminology.
    
    Context:
    Mission: ${match.mission}
    Attacker: ${player1.name} (${player1.faction})
    Defender: ${player2.name} (${player2.faction})
    Winner: ${winner}
    Score: ${match.player1Score} - ${match.player2Score}
    Key Highlights provided by players: ${highlights}

    Focus on the cinematic moments described in the highlights.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "Communication with the Logis Strategos failed. No record found.";
  } catch (error) {
    console.error("Error generating narrative:", error);
    return "The warp storms interfere with our communications. Narrative unavailable.";
  }
};

export const chatWithTactician = async (message: string, history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
    const ai = getAI();
    // Using a system instruction to set the persona
    const instruction = "You are a seasoned Imperial Tactician and Logis Strategos. You speak with authority, using 40k terminology (M41 era). You help users with Warhammer 40k rules, stratagems, and army composition advice. Be concise but thematic.";
    
    // Construct the chat correctly
    // Note: The history format for the SDK might differ slightly, but passing simple context usually works better via generateContent for single turns or simple chat management.
    // However, to use the proper Chat API:
    
    try {
        const chat = ai.chats.create({
            model: "gemini-3-flash-preview",
            config: {
                systemInstruction: instruction,
            },
            history: history.map(h => ({
                role: h.role,
                parts: h.parts
            }))
        });

        const result = await chat.sendMessage({
            message: message
        });
        
        return result.text || "Static on the vox line...";
    } catch (e) {
        console.error("Chat error", e);
        return "The machine spirit is displeased. (API Error)";
    }
}