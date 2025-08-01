import { useState, useEffect } from "react";
import { EyeIcon, EyeSlashIcon, KeyIcon } from "@heroicons/react/24/outline";

export default function ApiKeyManager({ onApiKeySet, position = "top-left" }) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // Check for existing API key in localStorage
    const savedApiKey = localStorage.getItem("openai_api_key");
    console.log("Saved API key found:", savedApiKey ? "Yes" : "No"); // Debug log
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsValid(true); // Assume it's valid if saved
      onApiKeySet(savedApiKey);
    }
  }, [onApiKeySet]);

  const validateApiKey = async (key) => {
    if (!key || key.length < 20) {
      setIsValid(false);
      return false;
    }

    setIsValidating(true);
    console.log("Validating API key..."); // Debug log

    try {
      // Test the API key with a simple request
      const response = await fetch("/api/sendcommand", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: key,
          question: "Hello",
          system: 'You are a helpful assistant. Respond with just "OK".',
          context: "",
          functs: [],
          model: "gpt-4o-mini",
        }),
      });

      const data = await response.json();
      console.log("API key validation response:", data); // Debug log

      if (response.ok && !data.error) {
        setIsValid(true);
        localStorage.setItem("openai_api_key", key);
        onApiKeySet(key);
        console.log("API key validated successfully"); // Debug log
        return true;
      } else {
        console.log("API key validation failed:", data.error); // Debug log
        setIsValid(false);
        return false;
      }
    } catch (error) {
      console.log("API key validation error:", error); // Debug log
      setIsValid(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveApiKey = async () => {
    console.log("Attempting to save API key"); // Debug log
    await validateApiKey(apiKey);
  };

  const handleRemoveApiKey = () => {
    console.log("Removing API key"); // Debug log
    setApiKey("");
    setIsValid(null);
    localStorage.removeItem("openai_api_key");
    onApiKeySet("");
  };

  // Get position classes based on position prop
  const getPositionClasses = () => {
    switch (position) {
      case "bottom-left":
        return "fixed bottom-4 left-4 z-50";
      case "bottom-right":
        return "fixed bottom-4 right-4 z-50";
      case "top-right":
        return "fixed top-4 right-4 z-50";
      case "top-left":
      default:
        return "fixed top-4 left-4 z-50";
    }
  };

  // If API key is valid, show a minimal indicator
  if (isValid) {
    return (
      <div className={getPositionClasses()}>
        <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm">
          <KeyIcon className="w-4 h-4" />
          <span>API Key Active</span>
          <button
            onClick={handleRemoveApiKey}
            className="text-green-600 hover:text-green-800 ml-2"
            title="Remove API Key"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  // If no valid API key, show the input form
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <KeyIcon className="w-6 h-6 text-gray-600 mr-2" />
          <h2 className="text-xl font-semibold">OpenAI API Key Required</h2>
        </div>

        <p className="text-gray-600 mb-4">
          Please enter your OpenAI API key to use this application. Your key
          will be stored locally in your browser.
        </p>

        <div className="relative mb-4">
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className={`w-full px-3 py-2 border rounded-lg pr-10 ${
              isValid === false ? "border-red-500" : "border-gray-300"
            }`}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSaveApiKey();
              }
            }}
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
          >
            {showKey ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {isValid === false && (
          <p className="text-red-500 text-sm mb-4">
            Invalid API key. Please check your key and try again.
          </p>
        )}

        <button
          onClick={handleSaveApiKey}
          disabled={isValidating || !apiKey}
          className={`w-full py-2 px-4 rounded-lg font-medium ${
            isValidating || !apiKey
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isValidating ? "Validating..." : "Save API Key"}
        </button>

        <div className="mt-4 text-sm text-gray-500">
          <p>
            Don't have an API key?{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Get one from OpenAI
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
