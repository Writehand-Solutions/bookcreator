import { useState, useEffect } from "react";
import { Eye, EyeOff, Key, X, ExternalLink } from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ApiKeyManager({ onApiKeySet, position = "top-left" }) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // Check for existing API key in localStorage
    const savedApiKey = localStorage.getItem("openai_api_key");
    console.log("Saved API key found:", savedApiKey ? "Yes" : "No");
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
    console.log("Validating API key...");

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
      console.log("API key validation response:", data);

      if (response.ok && !data.error) {
        setIsValid(true);
        localStorage.setItem("openai_api_key", key);
        onApiKeySet(key);
        console.log("API key validated successfully");
        return true;
      } else {
        console.log("API key validation failed:", data.error);
        setIsValid(false);
        return false;
      }
    } catch (error) {
      console.log("API key validation error:", error);
      setIsValid(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveApiKey = async () => {
    console.log("Attempting to save API key");
    await validateApiKey(apiKey);
  };

  const handleRemoveApiKey = () => {
    console.log("Removing API key");
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
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 hover:bg-green-200"
        >
          <Key className="w-4 h-4 mr-2" />
          API Key Active
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveApiKey}
            className="ml-2 h-auto p-0 text-green-600 hover:text-green-800 hover:bg-transparent"
            title="Remove API Key"
          >
            <X className="w-4 h-4" />
          </Button>
        </Badge>
      </div>
    );
  }

  // If no valid API key, show the input form as a modal dialog
  return (
    <Dialog open={!isValid} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Key className="w-5 h-5 mr-2" />
            OpenAI API Key Required
          </DialogTitle>
          <DialogDescription>
            Please enter your OpenAI API key to use this application. Your key
            will be stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apikey">API Key</Label>
            <div className="relative">
              <Input
                id="apikey"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className={isValid === false ? "border-destructive" : ""}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSaveApiKey();
                  }
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {isValid === false && (
            <Alert variant="destructive">
              <AlertDescription>
                Invalid API key. Please check your key and try again.
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSaveApiKey}
            disabled={isValidating || !apiKey}
            className="w-full"
          >
            {isValidating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Validating...
              </>
            ) : (
              "Save API Key"
            )}
          </Button>

          <div className="text-sm text-muted-foreground">
            <p>
              Don't have an API key?{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center"
              >
                Get one from OpenAI
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
