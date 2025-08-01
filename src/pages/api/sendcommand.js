import axios from "axios";

async function handler(req, res) {
  console.log("=== /api/sendcommand called ===");
  console.log("Method:", req.method);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

  if (req.method !== "POST") return;

  try {
    // Get API key from multiple sources
    const {
      apiKey,
      question,
      context,
      system,
      functs,
      temperature,
      topP,
      num,
      model,
    } = req.body;

    // Try to get API key from:
    // 1. Request body (direct)
    // 2. Custom header
    // 3. Environment variable (fallback)
    const finalApiKey =
      apiKey ||
      req.headers["x-openai-api-key"] ||
      req.headers["X-OpenAI-API-Key"] ||
      process.env.OPENAI_API_KEY;

    console.log("API Key sources:");
    console.log("- Body apiKey:", apiKey ? "Present" : "Missing");
    console.log(
      "- Header x-openai-api-key:",
      req.headers["x-openai-api-key"] ? "Present" : "Missing"
    );
    console.log(
      "- Environment OPENAI_API_KEY:",
      process.env.OPENAI_API_KEY ? "Present" : "Missing"
    );
    console.log("- Final API key:", finalApiKey ? "Present" : "Missing");

    // Check if we have any API key
    if (!finalApiKey || finalApiKey === "placeholder") {
      console.log("❌ No valid API key found");
      return res.status(400).json({
        error:
          "OpenAI API key is required. Please set your API key in the application.",
      });
    }

    console.log("✅ Using API key for OpenAI call");

    const url = "https://api.openai.com/v1/chat/completions";
    const DEFAULT_MODEL = "gpt-4o-mini";
    const DEFAULT_TEMPERATURE = 0.6;
    const DEFAULT_TOP_P = 0.9;
    const DEFAULT_NUM = 1;

    const messages = [
      { role: "system", content: system },
      { role: "assistant", content: context || "" },
      { role: "user", content: question },
    ];

    try {
      const response = await axios.post(
        url,
        {
          model: model || DEFAULT_MODEL,
          messages,
          temperature: parseFloat(temperature) || DEFAULT_TEMPERATURE,
          top_p: parseFloat(topP) || DEFAULT_TOP_P,
          n: parseInt(num) || DEFAULT_NUM,
          functions: functs.length === 0 ? undefined : functs,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${finalApiKey}`,
          },
        }
      );

      console.log("✅ OpenAI API call successful");

      let answer =
        functs.length === 0
          ? response.data
          : response.data.choices[0].message.function_call
          ? response.data.choices[0].message.function_call.arguments
          : response.data.choices[0].message;
      let usage = response.data.usage;
      res.json({ answer, usage });
    } catch (error) {
      console.log(
        "❌ OpenAI API call failed:",
        error.response?.data || error.message
      );

      // Handle specific OpenAI API errors
      if (error.response?.status === 401) {
        res.status(401).json({ error: "Invalid OpenAI API key" });
      } else if (error.response?.status === 429) {
        res.status(429).json({ error: "Rate limit exceeded" });
      } else {
        res.json({ error: error.message });
      }
    }
  } catch (e) {
    console.log("❌ General error:", e);
    res.status(500).json({ error: "Something went wrong." });
  }
}

export default handler;
