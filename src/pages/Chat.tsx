// src/pages/Chat.tsx
import { useState } from "react";
import { Input } from "../components/ui/input.tsx";
import {Button} from  "../components/ui/button.tsx";
import {
  callGemini,
  generateMockResponse,
  type AIResponse,
} from "@/utils/aiService";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [geminiKey, setGeminiKey] = useState(
      import.meta.env.VITE_GEMINI_API_KEY ?? ""
  );

  /* ------------------------- chat send handler ------------------------- */
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setInput("");

    try {
      let ai: AIResponse;

      if (geminiKey) {
        ai = await callGemini(userMsg.content, geminiKey);
      } else {
        ai = generateMockResponse(userMsg.content);
      }

      const aiMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: ai.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Gemini error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "⚠️ Failed to fetch a response from Gemini.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------------------------ render ------------------------------ */
  return (
      <div className="flex flex-col h-full">
        {/* Message list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
              <div
                  key={m.id}
                  className={
                    m.role === "user"
                        ? "text-right text-sm text-blue-600"
                        : "text-left  text-sm text-gray-900"
                  }
              >
                {m.content}
              </div>
          ))}
        </div>

        {/* Input row */}
        <div className="p-4 border-t flex gap-2">
          <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me anything about crypto…"
          />
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? "…" : "Send"}
          </Button>

          {/* show / hide key settings */}
          <Button
              variant="outline"
              onClick={() => setShowApiKeyInput((p) => !p)}
          >
            API Key
          </Button>
        </div>

        {/* Gemini key input panel */}
        {showApiKeyInput && (
            <div className="p-4 border-t space-y-2 bg-muted">
              <label className="block text-xs font-medium">Gemini API Key</label>
              <Input
                  placeholder="Paste your Gemini key"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Don’t have one? Generate for free at&nbsp;
                <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    className="underline"
                >
                  Google AI Studio
                </a>
                .
              </p>
            </div>
        )}
      </div>
  );
};

export default Chat;
