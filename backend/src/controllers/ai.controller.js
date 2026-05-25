require('dotenv').config();
const OpenAI = require('openai').default;

let client = null;
const getClient = () => {
  if (!client && process.env.OPENAI_API_KEY) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
};

// GET /api/ai/recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const ai = getClient();
    if (!ai) return res.json({ recommendations: [
      { title: 'Advanced React Patterns', reason: 'Based on your React course progress — ready for the next level.' },
      { title: 'TypeScript Fundamentals', reason: 'Pair it with your JavaScript knowledge for stronger codebases.' },
      { title: 'Node.js Microservices',   reason: 'Natural next step after Full Stack development.' },
    ]});

    const prompt = `You are an AI learning coach for EduVerse.AI.
Student: ${req.user.name}, Role: ${req.user.role}.
Provide 3 personalized course recommendations. Return ONLY valid JSON array:
[{"title":"...","reason":"..."}]`;

    const completion = await ai.chat.completions.create({
      model: 'gpt-3.5-turbo', max_tokens: 300, temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    let recs;
    try { recs = JSON.parse(completion.choices[0].message.content); }
    catch { recs = [{ title: 'Check your dashboard', reason: 'AI response could not be parsed.' }]; }
    res.json({ recommendations: recs });
  } catch (err) { res.status(500).json({ message: 'AI service error: ' + err.message }); }
};

// POST /api/ai/feedback
exports.getAssignmentFeedback = async (req, res) => {
  try {
    const { assignmentTitle, studentAnswer } = req.body;
    if (!assignmentTitle || !studentAnswer)
      return res.status(400).json({ message: 'assignmentTitle and studentAnswer required' });

    const ai = getClient();
    if (!ai) return res.json({ feedback: 'AI feedback is not configured. Add your OpenAI API key to enable this feature.' });

    const completion = await ai.chat.completions.create({
      model: 'gpt-3.5-turbo', max_tokens: 200, temperature: 0.6,
      messages: [{ role: 'user', content:
        `Assignment: "${assignmentTitle}". Student answer: "${studentAnswer.substring(0, 600)}".
         Give 3-bullet feedback: correctness, quality, improvement. Be encouraging. Max 80 words.`
      }],
    });
    res.json({ feedback: completion.choices[0].message.content });
  } catch (err) { res.status(500).json({ message: 'AI service error: ' + err.message }); }
};
