import { useState, useEffect } from "react";
import { Eye, EyeOff, Key, X, ExternalLink } from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const SWIPEONE_WEBHOOK =
  "https://integrations-api.swipeone.com/webhooks/apps/generic-webhooks/68c0f7862bed62f785822d11";

export default function ApiKeyManager({ onApiKeySet, position = "top-left" }) {
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(null);

  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const savedApiKey = typeof window !== "undefined" ? localStorage.getItem("openai_api_key") : null;
    const savedEmail = typeof window !== "undefined" ? localStorage.getItem("openai_user_email") : null;

    if (savedEmail) {
      setEmail(savedEmail);
      setEmailValid(true);
    }

    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsValid(true); // Assume it's valid if it was saved before
      if (onApiKeySet) onApiKeySet(savedApiKey);
    }
  }, [onApiKeySet]);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const sendEmailToSwipeOne = async (emailToSend) => {
    try {
      await fetch(SWIPEONE_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailToSend,
          source: "productised-api-key-modal",
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      // Do not block UX if webhook fails
      console.error("SwipeOne webhook failed:", err);
    }
  };

  const validateApiKey = async (key) => {
    if (!key || key.length < 20) {
      setIsValid(false);
      return false;
    }

    setIsValidating(true);

    try {
      const response = await fetch("/api/sendcommand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      if (response.ok && !data.error) {
        setIsValid(true);
        if (typeof window !== "undefined") {
          localStorage.setItem("openai_api_key", key);
        }
        if (onApiKeySet) onApiKeySet(key);
        return true;
      } else {
        setIsValid(false);
        return false;
      }
    } catch (error) {
      console.error("API key validation error:", error);
      setIsValid(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveApiKey = async () => {
    // Require a valid email first
    const ok = isValidEmail(email);
    setEmailValid(ok);
    if (!ok) return;

    // Persist + send to SwipeOne (non-blocking)
    if (typeof window !== "undefined") localStorage.setItem("openai_user_email", email);
    sendEmailToSwipeOne(email);

    // Then validate and save API key
    await validateApiKey(apiKey);
  };

  const handleRemoveApiKey = () => {
    setApiKey("");
    setIsValid(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("openai_api_key");
    }
    if (onApiKeySet) onApiKeySet("");
  };

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

  // When valid, show compact badge
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

  // Otherwise show modal dialog
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
            Please enter your email and OpenAI API key to use this application.
            Your key will be stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => {
                const val = e.target.value;
                setEmail(val);
                if (emailValid !== null) setEmailValid(isValidEmail(val));
              }}
              className={emailValid === false ? "border-destructive" : ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveApiKey();
              }}
            />
            {emailValid === false && (
              <p className="text-xs text-destructive">Please enter a valid email.</p>
            )}
          </div>

          {/* API Key */}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveApiKey();
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                aria-label={showKey ? "Hide API key" : "Show API key"}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
            disabled={isValidating || !apiKey || !email}
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
              Don&apos;t have an API key?{" "}
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
