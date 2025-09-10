import Head from "next/head";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { PopoverGroup } from "@headlessui/react";
import { PencilIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import ContentBuilder from "@innovastudio/contentbuilder";
import BookCreatorAI from "bookcreatorai";

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, BookOpen, ChevronLeft, Edit3, RotateCcw } from "lucide-react";

import CreateBookFormInitial from "../components/CreateBookFormInitial";
import ChapterVersionsPopover from "../components/ChapterVersionsPopover";
import RewriteChapterPopover from "../components/RewriteChapterPopover";
import AddBook from "../components/AddBook";
import DeleteBookButton from "../components/DeleteBookButton";
import PrintBookButton from "../components/PrintBookButton";
import MathContentWrapper from "../components/MathContentWrapper";
import ApiKeyManager from "../components/ApiKeyManager";

export default function CreateBook() {
  // --- settings ---
  const [isDemo, setIsDemo] = useState(false);

  // API KEY STATE
  const [userApiKey, setUserApiKey] = useState("");
  const [userId, setUserId] = useState(null);

  const [limit, setLimit] = useState(2);
  const [model, setModel] = useState("gpt-4o-mini");
  const [showCost, setShowCost] = useState(false);
  const [creditConversion, setCreditConversion] = useState(60);
  const [showCredit, setShowCredit] = useState(false);
  // --- /settings ---

  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [rewritePrompt, setRewritePrompt] = useState("");
  const [status, setStatus] = useState("");
  const [bookHtml, setBookHtml] = useState("");
  const [books, setBooks] = useState([]);
  const [book, setBook] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [rewrites, setRewrites] = useState([]);
  const [initialChapter, setInitialChapter] = useState(false);
  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");
  const [keypoints, setKeypoints] = useState("");
  const [category, setCategory] = useState(3);
  const [language, setLanguage] = useState("English");
  const [showChapterList, setShowChapterList] = useState(false);
  const [activeBookId, setActiveBookId] = useState(null);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(null);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [builderObject, setBuilderObject] = useState(null);
  const [bookObject, setBookObject] = useState(null);
  const [versionLoading, setVersionLoading] = useState(false);
  const [bookLoading, setBookLoading] = useState(false);

  const [selectedBooks, setSelectedBooks] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const topicRef = useRef(null);
  const promptRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const [page, setPage] = useState(0);
  const [hasMoreBooks, setHasMoreBooks] = useState(true);
  const scrollableMainRef = useRef(null);
  const scrollableSideRef = useRef(null);

  const [isUserReady, setIsUserReady] = useState(false);

  useEffect(() => {
    const getOrCreateUserId = () => {
      const stored = localStorage.getItem("userId");
      if (stored) return stored;
      const newId =
        Date.now().toString(36) + Math.random().toString(36).substr(2);
      localStorage.setItem("userId", newId);
      return newId;
    };

    setUserId(getOrCreateUserId());
    setIsUserReady(true);
  }, []);

  // Initialize BookCreatorAI when API key is available
  useEffect(() => {
    if (userApiKey) {
      console.log("🚀 Initializing BookCreatorAI with API key in headers");
      const book = new BookCreatorAI({
        sendCommandUrl: "/api/sendcommand",
        demo: false,
        defaultHeaders: {
          "X-OpenAI-API-Key": userApiKey,
          "Content-Type": "application/json",
        },
      });
      setBookObject(book);
    }
  }, [userApiKey]);

  function startEditing() {
    if (builderObject) return;

    setIsEditing(true);

    setTimeout(() => {
      const builder = new ContentBuilder({
        container: ".container",
        snippetModal: true,
      });

      builder.loadSnippets("assets/minimalist-blocks/content.js");
      const wrappedContent = wrapContentWithDOMParser(bookHtml);
      builder.loadHtml(wrappedContent);
      setBuilderObject(builder);
    }, 0);
  }

  async function getChapterTitle(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const h2 = doc.querySelector("h2");
    if (h2) {
      const s = h2.innerText;
      const title = s.replace(/^\D*\d+[:\.]\s*/, "");
      return title;
    } else {
      const index = chapters.findIndex(
        (chapter) => chapter.id === activeChapterId
      );
      const title = chapters[index].title;
      return title;
    }
  }

  async function stopEditing() {
    if (builderObject) {
      const html = builderObject.html();
      const title = await getChapterTitle(html);

      let chapterData = {
        id: activeChapterId,
        html,
        title,
        user_id: userId,
        apiKey: userApiKey,
      };

      let result = await fetch("/api/updatechapter", {
        method: "POST",
        body: JSON.stringify(chapterData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      builderObject.destroy();
      setBuilderObject(false);
      setIsEditing(false);

      let bookData = { id: activeBookId };
      result = await fetch("/api/readbook", {
        method: "POST",
        body: JSON.stringify(bookData),
        headers: {
          "Content-Type": "application/json",
        },
      });
      result = await result.json();
      if (!result.error) {
        const item = result.chapters.find(
          (chapter) => chapter.id + "" === activeChapterId + ""
        );
        setBookHtml(item.html);
        setChapters(result.chapters);
      }
    }
  }

  // Function to fetch books in batches (pagination)
  const fetchBooks = async (reset = false) => {
    if (!hasMoreBooks && !loading) return;

    if (reset) {
      localStorage.removeItem("activeBookId");
      localStorage.removeItem("activeChapterId");
      setPage(0);
      setHasMoreBooks(true);
    }

    const BATCH_SIZE = 20;
    const currentPage = reset ? 0 : page;
    const offset = currentPage * BATCH_SIZE;

    setLoading(true);

    let result = await fetch("/api/getbooks", {
      method: "POST",
      body: JSON.stringify({ offset, limit, user_id: userId }),
      headers: { "Content-Type": "application/json" },
    });
    result = await result.json();
    if (!result.error) {
      let booksData = result.books;

      if (booksData.length < BATCH_SIZE) {
        setHasMoreBooks(false);
      }

      if (reset) {
        setBooks(booksData);
        setPage(1);
      } else {
        setBooks((prevBooks) => [...prevBooks, ...booksData]);
        setPage((prevPage) => prevPage + 1);
      }
    }

    setLoading(false);
  };

  // Infinite scroll logic inside the scrollable div
  const handleMainScroll = () => {
    if (scrollableMainRef.current) {
      const div = scrollableMainRef.current;
      if (div.scrollTop + div.clientHeight >= div.scrollHeight) {
        fetchBooks();
      }
    }
  };
  const handleSideScroll = () => {
    if (scrollableSideRef.current) {
      const div = scrollableSideRef.current;
      if (div.scrollTop + div.clientHeight >= div.scrollHeight) {
        fetchBooks();
      }
    }
  };

  // Add event listener for scroll inside the div
  useEffect(() => {
    let div1, div2;
    if (scrollableMainRef.current) {
      div1 = scrollableMainRef.current;
      div1.addEventListener("scroll", handleMainScroll);
    }
    if (scrollableSideRef.current) {
      div2 = scrollableSideRef.current;
      div2.addEventListener("scroll", handleSideScroll);
    }
    return () => {
      div1 && div1.removeEventListener("scroll", handleMainScroll);
      div2 && div2.removeEventListener("scroll", handleSideScroll);
    };
  }, [books, loading]);

  const getRewrites = async (chapterid) => {
    let chapterData = { id: chapterid };
    let resultRewrites = await fetch("/api/getrewrites", {
      method: "POST",
      body: JSON.stringify(chapterData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    resultRewrites = await resultRewrites.json();

    if (!resultRewrites.error) {
      setRewrites(resultRewrites.rewrites);
    }

    let initialChapter = true;
    resultRewrites.rewrites.map((item) => {
      if (item.is_active) initialChapter = false;
    });
    setInitialChapter(initialChapter);
  };

  const handleReadBook = async (id) => {
    setBookLoading(true);
    await stopEditing();
    localStorage.setItem("activeBookId", id);

    let bookData = { id };
    let result = await fetch("/api/readbook", {
      method: "POST",
      body: JSON.stringify(bookData),
      headers: { "Content-Type": "application/json" },
    });
    result = await result.json();

    if (!result.error) {
      if (!result.chapters || result.chapters.length === 0) {
        console.warn("No chapters found for book", id);
        setBookHtml("");
        setChapters([]);
        setRewrites([]);
        setActiveBookId(id);
        setActiveChapterId(null);
        setShowChapterList(true);
        setSelectedBookId(id);
        setBookLoading(false);
        return;
      }

      const firstChapter = result.chapters[0];
      localStorage.setItem("activeChapterId", firstChapter.id);
      setBookHtml(firstChapter.html);
      setBook(result.book);
      setTitle(result.book.title);
      setAbout(result.book.about);
      setKeypoints(result.book.keypoints);
      setCategory(parseInt(result.book.category));
      setLanguage(result.book.language);
      setChapters(result.chapters);
      setActiveBookId(id);
      setActiveChapterId(firstChapter.id);
      setShowChapterList(true);
      setActiveChapterIndex(0);
      setSelectedBookId(id);

      getRewrites(firstChapter.id);
    } else {
      console.error("Failed to load book:", result.error);
    }

    setBookLoading(false);
  };

  const handleReadChapter = async (id) => {
    await stopEditing();

    localStorage.setItem("activeChapterId", id);

    const item = chapters.find((chapter) => chapter.id === id);

    setBookHtml(item.html);
    setActiveBookId(item.book_id);
    setActiveChapterId(id);

    const index = chapters.findIndex((chapter) => chapter.id === id);
    setActiveChapterIndex(index);

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0 });
    }

    getRewrites(id);
  };

  const rewrite = async () => {
    if (isRewriting) {
      bookObject.abort();
      return false;
    }

    setIsRewriting(true);

    const index = chapters.findIndex(
      (chapter) => chapter.id === activeChapterId
    );
    const chapter = chapters[index];

    const data = await bookObject.rewrite({
      prompt: rewritePrompt,
      category: book.category,
      bookTitle: book.title,
      bookTagline: book.tagline,
      bookIdea: book.idea,
      bookPlan: book.plan,
      tableOfContent: book.toc,
      chapterTitle: chapter.title,
      chapterSummary: chapter.summary,
      chapterContent: chapter.content,
      containsMath: book.contains_math === 1 ? true : false,
      chapters: chapters,
      index: index,
    });
    if (!data) {
      setIsRewriting(false);
      return false;
    }

    let chapterData = {
      id: activeChapterId,
      content: data.content,
      html: data.html,
      credit: data.cost * creditConversion,
      cost: data.cost,
      prompt: rewritePrompt,
      user_id: userId,
      apiKey: userApiKey,
    };

    let result = await fetch("/api/savechapter", {
      method: "POST",
      body: JSON.stringify(chapterData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    result = await result.json();
    if (!result.error) {
      await handleOpenLastChapter(chapter.book_id, activeChapterId);
    }

    setIsRewriting(false);
    return true;
  };

  const handleCreateBook = async (category, topic, keypoints, language) => {
    if (isGenerating) {
      bookObject.abort();
      return false;
    }

    let catNum = 3;
    if (category === "Programming") catNum = 1;
    if (category === "Story") catNum = 2;
    if (category === "General") catNum = 3;

    setIsGenerating(true);
    setBookHtml("");

    let data = await bookObject.generate(
      {
        about: topic,
        keypoints: keypoints,
        model,
        category: catNum,
        language,
        limit: isDemo ? limit : 1000,
      },
      (status, done) => {
        if (status) {
          setStatus(status);
        }
      }
    );

    if (!data) {
      setIsGenerating(false);
      setStatus("");
      if (activeChapterId) handleReadChapter(activeChapterId);
      return false;
    }

    let tableOfContent = data.tableOfContent || data.toc || [];

    if (!Array.isArray(tableOfContent)) {
      console.warn("tableOfContent is not an array, creating fallback");
      tableOfContent = [];
    }

    if (
      tableOfContent.length === 0 &&
      data.chaptersMarkdown &&
      Array.isArray(data.chaptersMarkdown)
    ) {
      console.warn("No TOC provided, generating fallback TOC");
      tableOfContent = data.chaptersMarkdown.map((_, index) => ({
        title: `Chapter ${index + 1}`,
        summary: "",
        matter_type: 1,
      }));
    }

    const containsMath = data.containsMath ? 1 : 0;
    const containsCode = data.containsCode ? 1 : 0;

    let bookData = {
      title: data.title,
      tagline: data.tagline,
      content: data.bookMarkdown,
      html: data.bookHtml,
      about: data.bookConfig.about,
      keypoints: data.bookConfig.keypoints,
      language: data.bookConfig.language,
      idea: data.idea,
      plan: data.plan,
      tableOfContent,
      toc: tableOfContent,
      contains_math: containsMath,
      contains_code: containsCode,
      intro_content: data.introMarkdown,
      intro_html: data.introHtml,
      credit: data.cost * creditConversion,
      cost: data.cost,
      chaptersMarkdown: data.chaptersMarkdown,
      chaptersHtml: data.chaptersHtml,
      category: data.bookConfig.category,
      model: data.bookConfig.model,
      user_id: userId,
      apiKey: userApiKey,
    };

    let result = await fetch("/api/savebook", {
      method: "POST",
      body: JSON.stringify(bookData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    result = await result.json();

    if (!result.error) {
      const bookId = result.book.id;
      const chapterId =
        data.chaptersHtml.length > 0 ? 1 : result.chapters[0]?.id;

      const insertedBook = {
        id: bookId,
        title: data.title,
        tagline: data.tagline,
      };
      setBooks((prevBooks) => [insertedBook, ...prevBooks]);

      await handleOpenLastChapter(bookId, chapterId);

      localStorage.setItem("activeBookId", bookId);
      localStorage.setItem("activeChapterId", chapterId);
    }

    setIsGenerating(false);
    setStatus("");

    return true;
  };

  const handleDeleteBook = async (id) => {
    let bookData = { id };
    let result = await fetch("/api/deletebook", {
      method: "POST",
      body: JSON.stringify(bookData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    result = await result.json();
    if (!result.error) {
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));

      setShowChapterList(false);
      setBookHtml("");

      localStorage.removeItem("activeBookId");
      localStorage.removeItem("activeChapterId");
    }
  };

  const handleDeleteSelectedBooks = async () => {
    if (selectedBooks.length === 0) return;

    // Delete all selected books
    for (const bookId of selectedBooks) {
      await handleDeleteBook(bookId);
    }

    // Clear selection and exit select mode
    setSelectedBooks([]);
    setIsSelectMode(false);
  };

  const handleSelectBook = (bookId) => {
    setSelectedBooks((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBooks.length === books.length) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(books.map((book) => book.id));
    }
  };

  async function handleBookUpdated(title) {
    let bookData = {
      id: activeBookId,
      title: title,
      apiKey: userApiKey,
    };

    let result = await fetch("/api/updatebook", {
      method: "POST",
      body: JSON.stringify(bookData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    result = await result.json();
    if (!result.error) {
      setBooks((prevBooks) =>
        prevBooks.map((book) =>
          book.id === activeBookId ? { ...book, title: title } : book
        )
      );

      setTitle(title);
    }
  }

  const handleOpenLastChapter = async (id, chapterid) => {
    let bookData = { id };
    let result = await fetch("/api/readbook", {
      method: "POST",
      body: JSON.stringify(bookData),
      headers: { "Content-Type": "application/json" },
    });
    result = await result.json();

    if (!result.error) {
      if (!result.chapters || result.chapters.length === 0) {
        console.warn("No chapters found when opening last chapter");
        setBookHtml("");
        setChapters([]);
        setActiveChapterId(parseInt(chapterid) || null);
        setBookLoading(false);
        return;
      }

      const chapterIdNum = Number(chapterid);
      const item = result.chapters.find(
        (chapter) => Number(chapter.id) === chapterIdNum
      );

      if (!item) {
        console.error("Chapter not found:", chapterid, "in book", id);
        setBookHtml("");
        setBookLoading(false);
        return;
      }

      setBookHtml(item.html);
      setBook(result.book);
      setTitle(result.book.title);
      setAbout(result.book.about);
      setKeypoints(result.book.keypoints);
      setCategory(parseInt(result.book.category));
      setLanguage(result.book.language);
      setChapters(result.chapters);
      setActiveBookId(id);
      setActiveChapterId(chapterIdNum);
      setShowChapterList(true);
      const index = result.chapters.findIndex(
        (chapter) => Number(chapter.id) === chapterIdNum
      );
      setActiveChapterIndex(index);
      setSelectedBookId(id);

      getRewrites(chapterIdNum);
    }

    setBookLoading(false);
  };

  const hasFetchedBooks = useRef(false);
  useEffect(() => {
    if (!hasFetchedBooks.current && userApiKey) {
      hasFetchedBooks.current = true;

      const loadData = async () => {
        await fetchBooks();

        const savedBookId = localStorage.getItem("activeBookId");
        const savedChapterId = localStorage.getItem("activeChapterId");

        if (savedBookId && savedChapterId) {
          await handleOpenLastChapter(savedBookId, savedChapterId);
        }
        setReady(true);

        if (topicRef.current) topicRef.current.focus();
      };

      loadData();
    }
  }, [userApiKey]);

  const focusPrompt = () => {
    setTimeout(() => {
      if (promptRef.current) promptRef.current.focus();
    }, 0);
  };

  const handleSetVersion = async (rewriteid) => {
    setVersionLoading(true);

    let data = {
      id: rewriteid,
      chapter_id: activeChapterId,
      user_id: userId,
    };
    let result = await fetch("/api/setchapter", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    result = await result.json();
    if (!result.error) {
      handleOpenLastChapter(activeBookId, activeChapterId);
      setVersionLoading(false);
    }
  };

  function wrapContentWithDOMParser(content) {
    if (content.includes('class="row"') && content.includes('class="column"')) {
      return content.trim();
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");

    const fragment = document.createDocumentFragment();

    doc.body.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "row";

        const columnDiv = document.createElement("div");
        columnDiv.className = "column";

        columnDiv.appendChild(node.cloneNode(true));
        rowDiv.appendChild(columnDiv);

        fragment.appendChild(rowDiv);
      }
    });

    const tempDiv = document.createElement("div");
    tempDiv.appendChild(fragment);

    return tempDiv.innerHTML.trim();
  }

  // BookCard Component using shadcn
  const BookCard = ({
    book,
    handleReadBook,
    isSelectMode,
    isSelected,
    onSelect,
  }) => (
    <Card
      className={`w-64 h-40 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 relative ${
        isSelected ? "border-primary bg-primary/5" : "hover:border-primary/20"
      }`}
      onClick={() =>
        isSelectMode ? onSelect(book.id) : handleReadBook(book.id)
      }
    >
      {isSelectMode && (
        <div className="absolute top-2 right-2 z-10">
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              isSelected
                ? "bg-primary border-primary"
                : "bg-background border-muted-foreground hover:border-primary"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(book.id);
            }}
          >
            {isSelected && (
              <svg
                className="w-3 h-3 text-primary-foreground"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start gap-2">
          <BookOpen className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg leading-tight line-clamp-2">
              {book.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      {book.tagline && (
        <CardContent className="pt-0">
          <CardDescription className="text-sm line-clamp-3">
            {book.tagline}
          </CardDescription>
        </CardContent>
      )}
    </Card>
  );

  // BookList Component using shadcn
  const BookList = ({ books, handleReadBook }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-2">
        <BookOpen className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">My Books</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="space-y-2 pr-4">
          {books.map((book) => (
            <Card
              key={book.id}
              className="cursor-pointer hover:shadow-md transition-shadow duration-200 border hover:border-primary/30"
              onClick={() => handleReadBook(book.id)}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-base leading-tight line-clamp-2">
                  {book.title}
                </CardTitle>
                {book.tagline && (
                  <CardDescription className="text-sm line-clamp-2">
                    {book.tagline}
                  </CardDescription>
                )}
              </CardHeader>
            </Card>
          ))}
          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // ChapterList Component using shadcn
  const ChapterList = ({
    bookTitle,
    chapters,
    activeChapterId,
    handleReadChapter,
    credit,
    cost,
    showCredit,
    showCost,
    handleBookUpdated,
  }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold line-clamp-2">{bookTitle}</h2>
        </div>

        {(showCredit || showCost) && (
          <div className="px-2 space-y-1">
            {showCost && (
              <Badge variant="secondary" className="text-xs">
                Cost: ${cost?.toFixed(4) || "0.0000"}
              </Badge>
            )}
            {showCredit && (
              <Badge variant="outline" className="text-xs">
                Credits: {credit || 0}
              </Badge>
            )}
          </div>
        )}
      </div>

      <Separator />

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-1 pr-4">
          {chapters.map((chapter, index) => (
            <Button
              key={chapter.id}
              variant={activeChapterId === chapter.id ? "default" : "ghost"}
              className="w-full justify-start h-auto p-3 text-left"
              onClick={() => handleReadChapter(chapter.id)}
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium line-clamp-2">
                  {chapter.title}
                </div>
                {chapter.summary && (
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {chapter.summary}
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <>
      <Head>
        <title>My Books</title>
      </Head>

      <ApiKeyManager onApiKeySet={setUserApiKey} position="bottom-left" />

  {/* Powered by + logo (bottom-left, above API Key badge) */}
{userApiKey && !showChapterList && !isGenerating && !bookLoading && (
  <div className="fixed left-4 bottom-10 z-40">
    <div className="text-[11px] text-muted-foreground mb-1">Powered by</div>
    <a
      href="https://www.productised.ai/"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center"
      aria-label="productised.ai"
    >
      <img
        src="/full%20logo%20no%20back.png"
        alt="productised."
        className="h-4 md:h-5 w-auto max-w-[120px] object-contain"
      />
    </a>
  </div>
)}

      {userApiKey && (
        <>
          {(!ready || loading) && (
            <div className="flex justify-center items-center fixed inset-0 bg-background/80 backdrop-blur-sm text-lg z-10">
              <div className="flex items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span>Loading...</span>
              </div>
            </div>
          )}

          {books.length === 0 && ready && (
            <div className="flex justify-center items-center w-full min-h-screen">
              <div className="flex flex-col p-8 w-full max-w-2xl">
                <CreateBookFormInitial
                  topicRef={topicRef}
                  handleCreateBook={handleCreateBook}
                  isGenerating={isGenerating}
                  status={status}
                />
              </div>
            </div>
          )}

          {books.length > 0 && ready && (
            <div className="relative flex h-full w-full overflow-hidden transition-colors z-0">
              {/* Chapter List Sidebar - only show when viewing a specific book */}
              {showChapterList && (
                <div className="flex-shrink-0 overflow-x-hidden w-80 h-screen p-4 bg-muted/30 border-r">
                  <Button
                    variant="ghost"
                    className="w-full justify-start mb-4 h-auto p-2"
                    onClick={async () => {
                      await stopEditing();
                      setShowChapterList(false);
                      localStorage.removeItem("activeBookId");
                      localStorage.removeItem("activeChapterId");
                    }}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Books
                  </Button>

                  <ChapterList
  bookTitle={title}
  chapters={chapters}
  activeChapterId={activeChapterId}
  handleReadChapter={handleReadChapter}
  credit={book.credit}
  cost={book.cost}
  showCredit={showCredit}
  showCost={showCost}
  handleBookUpdated={handleBookUpdated}
/>

{/* Powered by + logo */}
<div className="mt-6 px-2">
  <div className="text-[11px] text-muted-foreground mb-1">Powered by</div>
  <a
    href="https://www.productised.ai/"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex"
    aria-label="productised.ai"
  >
    {/* use URL-encoded path since the filename has spaces */}
    <img
      src="/full%20logo%20no%20back.png"
      alt="productised."
      className="h-5 w-auto"
    />
  </a>
</div>

<div className="mt-4 space-y-2">
  <PrintBookButton chapters={chapters} title={title} />

  {!isEditing && (
    <DeleteBookButton
      handleDeleteBook={handleDeleteBook}
      selectedBookId={selectedBookId}
    />
  )}
</div>
                </div>
              )}

              {/* Main Content */}
              <div className="flex-1">
                {/* Book Cards Grid */}
                {!showChapterList && !isGenerating && !bookLoading && (
                  <ScrollArea className="w-full h-screen">
                    <div className="p-12">
                      <div className="flex items-center justify-between mb-8">
                        <h1 className="text-4xl font-bold">My Books</h1>

                        <div className="flex items-center gap-3">
                          {!isSelectMode ? (
                            <Button
                              variant="outline"
                              onClick={() => setIsSelectMode(true)}
                              disabled={books.length === 0}
                            >
                              Select
                            </Button>
                          ) : (
                            <>
                              <div className="text-sm text-muted-foreground">
                                {selectedBooks.length} of {books.length}{" "}
                                selected
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSelectAll}
                              >
                                {selectedBooks.length === books.length
                                  ? "Deselect All"
                                  : "Select All"}
                              </Button>

                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDeleteSelectedBooks}
                                disabled={selectedBooks.length === 0}
                              >
                                Delete ({selectedBooks.length})
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setIsSelectMode(false);
                                  setSelectedBooks([]);
                                }}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-6">
                        {books.map((book) => (
                          <BookCard
                            key={book.id}
                            book={book}
                            handleReadBook={handleReadBook}
                            isSelectMode={isSelectMode}
                            isSelected={selectedBooks.includes(book.id)}
                            onSelect={handleSelectBook}
                          />
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                )}

                {/* Chapter Content */}
                {showChapterList && !isGenerating && (
                  <div
                    className="w-full overflow-y-auto h-screen"
                    ref={scrollContainerRef}
                  >
                    {!isEditing && (
                      <>
                        {bookHtml && (
                          <>
                            <div
                              className={`max-w-3xl mx-auto w-full relative px-[1rem] mt-24 ${
                                activeChapterId === chapters[0]?.id
                                  ? "text-6xl font-semibold leading-none"
                                  : "text-sm"
                              }`}
                            >
                              {title}
                            </div>
                            {book.contains_math ? (
                              <MathContentWrapper bookHtml={bookHtml} />
                            ) : (
                              <div
                                className="container max-w-3xl mx-auto w-full relative mt-10"
                                style={{ marginBottom: "500px" }}
                                dangerouslySetInnerHTML={{
                                  __html: wrapContentWithDOMParser(bookHtml),
                                }}
                              />
                            )}
                          </>
                        )}

                        {!isDemo && !bookHtml && (
                          <div
                            className="container max-w-3xl mx-auto w-full relative"
                            style={{
                              marginTop: "156px",
                              marginBottom: "500px",
                            }}
                          >
                            <Alert>
                              <BookOpen className="h-4 w-4" />
                              <AlertDescription className="text-lg font-semibold">
                                This is a sample (preview) book.
                              </AlertDescription>
                              <AlertDescription>
                                Only the first few chapters have been generated
                                in this sample. To generate the full book,
                                please use the generate form.
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}

                        {isDemo && !bookHtml && (
                          <div
                            className="container max-w-3xl mx-auto w-full relative"
                            style={{
                              marginTop: "156px",
                              marginBottom: "500px",
                            }}
                          >
                            <Alert>
                              <BookOpen className="h-4 w-4" />
                              <AlertDescription className="text-lg font-semibold">
                                Demo Info
                              </AlertDescription>
                              <AlertDescription>
                                This demo allows you to generate only the first
                                few chapters. The full version lets you generate
                                the entire book.
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}
                      </>
                    )}

                    {/* ContentBuilder editing area - keep this untouched */}
                    {isEditing && (
                      <div
                        className="container max-w-3xl mx-auto w-full relative"
                        style={{ marginTop: "156px", marginBottom: "500px" }}
                      ></div>
                    )}
                  </div>
                )}

                {/* Loading Status */}
                {isGenerating && (
                  <div
                    className={`flex justify-center items-center fixed inset-0 bg-background/80 backdrop-blur-sm text-lg ${
                      isRewriting ? "z-10" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 bg-card p-6 rounded-lg border shadow-lg">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-foreground">{status}</span>
                    </div>
                  </div>
                )}

                {/* Add Book Component - keep original functionality */}
                {!isEditing && (
                  <AddBook
                    topicRef={topicRef}
                    handleCreateBook={handleCreateBook}
                    isGenerating={isGenerating}
                    status={status}
                  />
                )}

                {/* Edit & Rewrite Chapter Controls */}
                {showChapterList && activeChapterId && !isEditing && (
                  <div className="fixed top-6 right-7 z-20 flex items-center gap-2">
                    {((bookHtml && !isDemo) ||
                      (isDemo && bookHtml && activeChapterIndex <= limit)) && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-full"
                          onClick={() => startEditing()}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>

                        {/* Keep original popover components for rewrite and versions */}
                        <RewriteChapterPopover
                          rewritePrompt={rewritePrompt}
                          setRewritePrompt={setRewritePrompt}
                          isRewriting={isRewriting}
                          rewrite={rewrite}
                          focusPrompt={focusPrompt}
                          promptRef={promptRef}
                        />

                        <ChapterVersionsPopover
                          rewrites={rewrites}
                          handleSetVersion={handleSetVersion}
                          initialChapter={initialChapter}
                          versionLoading={versionLoading}
                        />
                      </>
                    )}
                  </div>
                )}

                {/* Save/Back Button when editing */}
                {isEditing && (
                  <div className="fixed top-6 right-6 z-20">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-full"
                      onClick={() => stopEditing()}
                    >
                      <ArrowUturnLeftIcon className="w-4 h-4 mr-2" />
                      Save & Back
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
