import fetch from "node-fetch";

export const generateQuickNotes = async (req, res) => {
  try {
    const { lectureTitle } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.VITE_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate detailed study notes for the lecture topic: "${lectureTitle}". 
                  Include:
                  - Topic Name
                  - Definition
                  - Uses
                  - Example Code (if any)
                  - Other key details`
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No notes generated.";

    res.json({ notes: text });
  } catch (error) {
    console.error("Gemini error:", error.message);
    res.status(500).json({ error: "Failed to generate notes." });
  }
};
