import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const categories = ["General", "Programming", "Story"];

const CreateBookFormInitial = ({
  topicRef,
  handleCreateBook,
  isGenerating,
  status,
}) => {
  const [category, setCategory] = useState(categories[0]);
  const [topic, setTopic] = useState("");
  const [keypoints, setKeypoints] = useState("");
  const [language, setLanguage] = useState("English");
  const [languages, setLanguages] = useState([]);
  const [isTouched, setIsTouched] = useState(false);

  useEffect(() => {
    // Predefined list of ISO 639-1 language codes
    const identifiers = [
      "af",
      "sq",
      "am",
      "ar",
      "hy",
      "az",
      "eu",
      "be",
      "bn",
      "bs",
      "bg",
      "ca",
      "ceb",
      "zh",
      "co",
      "hr",
      "cs",
      "da",
      "nl",
      "en",
      "eo",
      "et",
      "fi",
      "fr",
      "fy",
      "gl",
      "ka",
      "de",
      "el",
      "gu",
      "ht",
      "ha",
      "haw",
      "he",
      "hi",
      "hmn",
      "hu",
      "is",
      "ig",
      "id",
      "ga",
      "it",
      "ja",
      "jw",
      "kn",
      "kk",
      "km",
      "rw",
      "ko",
      "ku",
      "ky",
      "lo",
      "la",
      "lv",
      "lt",
      "lb",
      "mk",
      "mg",
      "ms",
      "ml",
      "mt",
      "mi",
      "mr",
      "mn",
      "my",
      "ne",
      "no",
      "ny",
      "or",
      "ps",
      "fa",
      "pl",
      "pt",
      "pa",
      "ro",
      "ru",
      "sm",
      "gd",
      "sr",
      "st",
      "sn",
      "sd",
      "si",
      "sk",
      "sl",
      "so",
      "es",
      "su",
      "sw",
      "sv",
      "tl",
      "tg",
      "ta",
      "tt",
      "te",
      "th",
      "tr",
      "tk",
      "uk",
      "ur",
      "ug",
      "uz",
      "vi",
      "cy",
      "xh",
      "yi",
      "yo",
      "zu",
    ];

    const locale = "en-US";

    let languages = [];

    identifiers.forEach((identifier, index) => {
      const name = new Intl.DisplayNames([locale], { type: "language" }).of(
        identifier
      );
      languages.push({
        id: identifier,
        name: name,
      });
    });
    setLanguages(languages);
  }, []);

  const handleGenerateClick = async () => {
    setIsTouched(true);

    if (!topic) {
      return;
    }

    return await handleCreateBook(category, topic, keypoints, language);
  };

  const exampleTopics = [
    "Authentic & traditional recipes from world cuisines.",
    "How to build a modern JavaScript library from scratch.",
    "A time traveler's love story in a thrilling adventure.",
  ];

  return (
    <div className="space-y-4 max-w-full">
      <div className="font-semibold text-3xl">Create My Book</div>

      <div className="space-y-2">
        <Label className="text-base font-medium">Category:</Label>
        <RadioGroup
          value={category}
          onValueChange={setCategory}
          className="flex gap-6"
        >
          {categories.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <RadioGroupItem value={item} id={`initial-${item}`} />
              <Label
                htmlFor={`initial-${item}`}
                className="cursor-pointer text-base"
              >
                {item}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="initial-topic" className="text-base font-medium">
          Topic:
        </Label>
        <Input
          id="initial-topic"
          type="text"
          value={topic}
          ref={topicRef}
          onChange={(e) => setTopic(e.target.value)}
          className={`${
            isTouched && topic.trim() === ""
              ? "ring-2 ring-orange-400 ring-offset-2"
              : ""
          }`}
          placeholder="Enter your book topic..."
        />

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Example topics:</div>
          <div className="flex flex-wrap gap-3">
            {exampleTopics.map((exampleTopic, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-sm h-auto p-2 whitespace-normal text-left max-w-[160px]"
                onClick={() => {
                  setTopic(exampleTopic);
                  setIsTouched(true);
                }}
              >
                {exampleTopic}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="initial-keypoints" className="text-base font-medium">
          What you want to include in the book (optional):
        </Label>
        <Textarea
          id="initial-keypoints"
          value={keypoints}
          onChange={(e) => setKeypoints(e.target.value)}
          rows={4}
          placeholder="Key points, themes, or specific topics to cover..."
          className="min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-base font-medium">Book Language:</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((item) => (
              <SelectItem key={item.id} value={item.name}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 pt-2">
        <Button
          className="w-full text-lg py-6"
          onClick={async () => {
            await handleGenerateClick();
          }}
          disabled={isGenerating}
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Abort
            </>
          ) : (
            "Create My Book"
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          AI can make mistakes. Check important info.
        </div>
      </div>

      {isGenerating && (
        <div className="flex items-center justify-center gap-2 pt-4 border-t">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <div className="font-semibold text-xl text-center">{status}</div>
        </div>
      )}
    </div>
  );
};

export default CreateBookFormInitial;
