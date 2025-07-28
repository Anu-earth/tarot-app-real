import React, { useState } from 'react';
import { Sparkles, Car as Cards, Moon, Stars, Loader2 } from 'lucide-react';
import OpenAI from 'openai';

interface ReadingResponse {
  interpretation: string;
}

function App() {
  const [question, setQuestion] = useState('');
  const [numCards, setNumCards] = useState(1);
  const [cardNames, setCardNames] = useState<string[]>(['']);
  const [reading, setReading] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleNumCardsChange = (num: number) => {
    setNumCards(num);
    const newCardNames = Array(num).fill('').map((_, index) => cardNames[index] || '');
    setCardNames(newCardNames);
  };

  const handleCardNameChange = (index: number, name: string) => {
    const newCardNames = [...cardNames];
    newCardNames[index] = name;
    setCardNames(newCardNames);
  };

  const generateReading = async () => {
    if (!question.trim()) {
      setError('Please enter your question or situation.');
      return;
    }

    const filledCards = cardNames.filter(name => name.trim());
    if (filledCards.length === 0) {
      setError('Please enter at least one card name.');
      return;
    }

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      setError('OpenAI API key not configured. Please add your API key to the environment variables.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Note: For production, use a backend API
      });

      const prompt = `As an experienced tarot reader, please provide an insightful interpretation for this reading:

Question/Situation: "${question}"

Cards drawn (${filledCards.length} cards):
${filledCards.map((card, index) => `${index + 1}. ${card}`).join('\n')}

Please provide a thoughtful, compassionate interpretation that addresses the question and explains how each card relates to the situation. Include practical guidance and insights.

Format your response with these sections using markdown:
# 🌟 Your Tarot Reading
## 📝 Your Question
## 🃏 Cards Drawn
## ✨ Overall Energy & Theme
## 🔮 Individual Card Interpretations
### Card 1: [Card Name]
**Position Meaning**: [meaning]
**Interpretation**: [detailed interpretation]
**Key Messages**: 
- [message 1]
- [message 2]
- [message 3]
## 🌙 Synthesis & Overall Guidance
## 💫 Practical Next Steps
## 🙏 Final Thoughts`;
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an experienced, compassionate tarot reader with deep knowledge of tarot symbolism and interpretation. Provide thoughtful, insightful readings that help people reflect on their situations and find guidance."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });
      
      const readingText = completion.choices[0]?.message?.content || 'Unable to generate reading. Please try again.';
      setReading(readingText);
    } catch (err) {
      setError('Failed to generate reading. Please check your API key and try again.');
      console.error('Error generating reading:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Moon className="text-yellow-400 w-8 h-8" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Mystic Reader</h1>
            <Stars className="text-yellow-400 w-8 h-8" />
          </div>
          <p className="text-purple-200 text-lg md:text-xl max-w-2xl mx-auto">
            Discover deeper insights into your life's questions through AI-assisted tarot interpretation
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
          {/* Question Input */}
          <div className="mb-8">
            <label className="block text-white text-lg font-medium mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Your Question or Situation
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What guidance are you seeking? Describe your situation or ask your question..."
              className="w-full p-4 rounded-xl bg-white/20 border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none h-32 transition-all duration-200"
            />
          </div>

          {/* Number of Cards */}
          <div className="mb-8">
            <label className="block text-white text-lg font-medium mb-3 flex items-center gap-2">
              <Cards className="w-5 h-5 text-yellow-400" />
              Number of Cards Pulled
            </label>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumCardsChange(num)}
                  className={`p-3 rounded-lg font-medium transition-all duration-200 ${
                    numCards === num
                      ? 'bg-purple-500 text-white shadow-lg scale-105'
                      : 'bg-white/20 text-purple-200 hover:bg-white/30 hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Card Name Inputs */}
          <div className="mb-8">
            <h3 className="text-white text-lg font-medium mb-4">Card Names</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {cardNames.map((cardName, index) => (
                <div key={index}>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Card {index + 1}
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => handleCardNameChange(index, e.target.value)}
                    placeholder="Enter card name..."
                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={generateReading}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Brewing Magic...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Brew Some Magic
              </>
            )}
          </button>
        </div>

        {/* Reading Results */}
        {reading && (
          <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Stars className="w-6 h-6 text-yellow-400" />
              Your Reading
            </h2>
            <div className="prose prose-invert max-w-none">
              <div className="text-purple-100 leading-relaxed whitespace-pre-line">
                {reading}
              </div>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-purple-300 text-sm">
            ✨ Powered by OpenAI's GPT-4 for personalized tarot interpretations ✨
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;