import Head from 'next/head';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { PopoverGroup } from '@headlessui/react'
import { PencilIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline'
import ContentBuilder from '@innovastudio/contentbuilder';
// import ContentBuilder from '../contentbuilder/contentbuilder'; // If you have ContentBuilder source code
import BookCreatorAI from "bookcreatorai";
import CreateBookFormInitial from '../components/CreateBookFormInitial';
import ChapterVersionsPopover from '../components/ChapterVersionsPopover';
import RewriteChapterPopover from '../components/RewriteChapterPopover';
import BookCard from '../components/BookCard';
import ChapterList from '../components/ChapterList';
import AddBook from '../components/AddBook';
import BookList from '../components/BookList';
import DeleteBookButton from '../components/DeleteBookButton';
import PrintBookButton from '../components/PrintBookButton';
import MathContentWrapper from '../components/MathContentWrapper';

export default function CreateBook() {

    // --- settings ---
    const [isDemo, setIsDemo] = useState(false); // If true (demo mode), the number of generated chapters is limited by 'limit'
    const [limit, setLimit] = useState(2);// Number of chapters generated in demo mode
    const [model, setModel] = useState('gpt-4o-mini'); // AI model to use; options are 'gpt-4o-mini' (default) or 'gpt-4o'
    const [showCost, setShowCost] = useState(false); // If true, displays the cost of generating each book
    const [creditConversion, setCreditConversion] = useState(60); // Conversion rate for credits (default = 60)
    const [showCredit, setShowCredit] = useState(false); // Credit = cost × creditConversion (for demonstrating usage amount)
    // --- /settings ---

    // See the handleCreateBook() function for an example of how BookCreatorAI.js is used to generate a book

    const [loading, setLoading] = useState(true);
    const [ready, setReady] = useState(false);
    const [rewritePrompt, setRewritePrompt] = useState('');
    const [status, setStatus] = useState(''); 
    const [bookHtml, setBookHtml] = useState(''); 
    const [books, setBooks] = useState([]); 
    const [book, setBook] = useState([]); 
    const [chapters, setChapters] = useState([]);
    const [rewrites, setRewrites] = useState([]);
    const [initialChapter, setInitialChapter] = useState(false);
    const [title, setTitle] = useState(''); 
    const [about, setAbout] = useState('');
    const [keypoints, setKeypoints] = useState('');
    const [category, setCategory] = useState(3);
    const [language, setLanguage] = useState('English');
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

    const topicRef = useRef(null);
    const promptRef = useRef(null);
    const scrollContainerRef = useRef(null);

    function startEditing() {
        if(builderObject) return;

        setIsEditing(true); // this shows div.container (the editable area)

        setTimeout(()=>{ // give time for div.container to render

            const builder = new ContentBuilder({
                container: '.container',
                snippetModal: true
            });
    
            builder.loadSnippets('assets/minimalist-blocks/content.js'); // Load snippet file

            const wrappedContent = wrapContentWithDOMParser(bookHtml); // wrap content in grid (div.row & div.column)

            builder.loadHtml(wrappedContent); // load content
            
            setBuilderObject(builder);

        }, 0);
    }

    async function getChapterTitle(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const h2 = doc.querySelector('h2');
        if(h2) {
            const s = h2.innerText;
            // const title = s.replace(/^\d+\.\s*/, '');
            const title = s.replace(/^\D*\d+[:\.]\s*/, '');
            return title;
        } else {
            const index = chapters.findIndex(chapter => chapter.id === activeChapterId);
            const title = chapters[index].title;
            return title;
        }
    }

    async function stopEditing() {
        if(builderObject) {

            const html = builderObject.html();

            const title = await getChapterTitle(html);

            // Save
            let chapterData = { 
                id: activeChapterId,
                html,
                title
            };

            let result = await fetch('/api/updatechapter', {
                method:'POST',
                body: JSON.stringify(chapterData),
                header: {
                    'Content-Type': 'application/json'
                }
            });

            // Quit editing
            builderObject.destroy();
            setBuilderObject(false);

            setIsEditing(false);

            // Refresh
            let bookData = { 
                id: activeBookId
            };
            result = await fetch('/api/readbook', {
                method:'POST',
                body: JSON.stringify(bookData),
                header: {
                    'Content-Type': 'application/json'
                }
            });
            result = await result.json();
            if(!result.error) { 
                const item = result.chapters.find(chapter => chapter.id+'' === activeChapterId+'');
                setBookHtml(item.html); 
                setChapters(result.chapters); 
            }
        }
    }

    // Function to fetch books in batches (pagination)
    const [page, setPage] = useState(0);
    const [hasMoreBooks, setHasMoreBooks] = useState(true);  // New flag for checking if more books are available
    const scrollableMainRef = useRef(null); 
    const scrollableSideRef = useRef(null); 
    const fetchBooks = async (reset = false) => {
        if (!hasMoreBooks && !loading) return;

        // Reset
        if (reset) {
            localStorage.removeItem('activeBookId');
            localStorage.removeItem('activeChapterId');
        }

        const BATCH_SIZE = 20;  // Number of books to load per batch
        const offset = page * BATCH_SIZE;

        setLoading(true);

        let result = await fetch('/api/getbooks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ offset, limit: BATCH_SIZE }) 
        });
        result = await result.json();
        if (!result.error) {
            let booksData = result.books;
            // console.log(booksData);

            // Check if there are no more books to fetch
            if (booksData.length < BATCH_SIZE) {
                setHasMoreBooks(false);  // No more books available
            }

            // setBooks(booksData);
            setBooks((prevBooks) => [...prevBooks, ...booksData]);  // Append new books
            setPage((prevPage) => prevPage + 1);  // Increment page number
        }

        setLoading(false);
    };

    // Infinite scroll logic inside the scrollable div
    const handleMainScroll = () => {
        if(scrollableMainRef.current) {
            const div = scrollableMainRef.current;
            if (div.scrollTop + div.clientHeight >= div.scrollHeight) { // If scrolled to bottom, fetch more books
                fetchBooks();
            }
        }
    };
    const handleSideScroll = () => {
        if(scrollableSideRef.current) {
            const div = scrollableSideRef.current;
            if (div.scrollTop + div.clientHeight >= div.scrollHeight) { // If scrolled to bottom, fetch more books
                fetchBooks();
            }
        }
    };

    // Add event listener for scroll inside the div
    useEffect(() => {    
        let div1, div2;    
        if(scrollableMainRef.current) {
            div1 = scrollableMainRef.current;
            div1.addEventListener('scroll', handleMainScroll);
        }
        if(scrollableSideRef.current) {
            div2 = scrollableSideRef.current;
            div2.addEventListener('scroll', handleSideScroll);
        }
        return () =>{
            div1 && div1.removeEventListener('scroll', handleMainScroll);
            div2 && div2.removeEventListener('scroll', handleSideScroll);
        }
    }, [books, loading]);  // Dependencies include session, books, and loading

    const fetchBooks_bak = async (reset) => {
        // Reset
        if(reset) {
            localStorage.removeItem('activeBookId');
            localStorage.removeItem('activeChapterId');
        }

        let result = await fetch('/api/getbooks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        result = await result.json();
        if (!result.error) {
            setBooks(result.books);
        }
    };

    const getRewrites = async (chapterid) => {
        // Read chapter rewrites
        let chapterData = { 
            id: chapterid
        };
        let resultRewrites = await fetch('/api/getrewrites', {
            method:'POST',
            body: JSON.stringify(chapterData),
            header: {
                'Content-Type': 'application/json'
            }
        });
        resultRewrites = await resultRewrites.json();

        if(!resultRewrites.error) { 
            setRewrites(resultRewrites.rewrites);
        }

        let initialChapter = true;
        resultRewrites.rewrites.map(item=>{
            if(item.is_active) initialChapter=false;
        });
        setInitialChapter(initialChapter);
    }

    const handleReadBook = async (id) => {

        setBookLoading(true);

        await stopEditing();

        localStorage.setItem('activeBookId', id);

        let bookData = { 
            id
        };
        let result = await fetch('/api/readbook', {
            method:'POST',
            body: JSON.stringify(bookData),
            header: {
                'Content-Type': 'application/json'
            }
        });
        result = await result.json();
        if(!result.error) { 
            localStorage.setItem('activeChapterId', result.chapters[0].id);

            setBookHtml(result.chapters[0].html); 
            setBook(result.book);
            setTitle(result.book.title);
            setAbout(result.book.about);
            setKeypoints(result.book.keypoints);
            setCategory(parseInt(result.book.category));
            setLanguage(result.book.language);
            setChapters(result.chapters); 

            setActiveBookId(id); 
            setActiveChapterId(result.chapters[0].id); // set active chapter
            setShowChapterList(true); 

            setActiveChapterIndex(0);

            setSelectedBookId(id); // Store the selected book ID

            // console.log(result.book);
            // console.log(result.chapters);
        }

        getRewrites(result.chapters[0].id);

        setBookLoading(false);
    };
    
    const handleReadChapter = async (id) => {

        await stopEditing();

        localStorage.setItem('activeChapterId', id);

        const item = chapters.find(chapter => chapter.id === id);

        setBookHtml(item.html); 
        setActiveBookId(item.book_id); 
        setActiveChapterId(id); // set active chapter

        const index = chapters.findIndex(chapter => chapter.id === id);
        setActiveChapterIndex(index);

        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0 });
        }

        getRewrites(id);
    };

    const rewrite = async () => {

        if(isRewriting) {
            bookObject.abort();
            return false;
        }
        
        setIsRewriting(true); // Start re-generating

        const index = chapters.findIndex(chapter => chapter.id === activeChapterId);
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
            containsMath: book.contains_math===1?true:false,
            chapters: chapters, 
            index: index // 0 = Introduction | 1 = Chapter 1 (Preparation) | 2, 3, 4 = Chapter 2 or other chapters
        });
        if(!data) {
            // aborted
            setIsRewriting(false); // Stop re-generating
            return false;
        }

        let chapterData = { 
            id: activeChapterId,
            content: data.content, 
            html: data.html,
            credit: data.cost * creditConversion,
            cost: data.cost,
            prompt: rewritePrompt
        };

        let result = await fetch('/api/savechapter', {
            method:'POST',
            body: JSON.stringify(chapterData),
            header: {
                'Content-Type': 'application/json'
            }
        });
        result = await result.json();
        if(!result.error) { 
            await handleOpenLastChapter(chapter.book_id, activeChapterId);
        }

        setIsRewriting(false); // Stop re-generating
        return true;
    }

    useEffect(() => {
        const book = new BookCreatorAI({
            sendCommandUrl: '/api/sendcommand', 
            demo: false // Ensure you have purchased a license before setting this to false.
        });
        setBookObject(book);
    }, []);

    const handleCreateBook = async (category, topic, keypoints, language) => {   

        if(isGenerating) {
            bookObject.abort();
            return false;
        }

        let catNum = 3;
        if(category==='Programming') catNum = 1;
        if(category==='Story') catNum = 2;
        if(category==='General') catNum = 3;

        setIsGenerating(true); // Start generating
        setBookHtml('');

        let data = await bookObject.generate({
            about: topic,
            keypoints: keypoints, 
            model,
            category: catNum, // 1 = Tech Books, 2 = Story, 3 = General, Not specified => will use AI to decide. 
            // If not in Programming or Story, will use custom prompts & rewritePrompts (must be specified). 
            language,
            limit: isDemo?limit:1000, // limit only 2 chapters to return
        }, (status, done)=>{
            if(status) {
                setStatus(status); 
            }
        });

        if(!data) {
            // aborted
            setIsGenerating(false); // Stop generating
            setStatus(''); 
            if(activeChapterId) handleReadChapter(activeChapterId); // Shows back currently opened chapter
            return false;
        }

        let bookData = { 
            title: data.title, 
            tagline: data.tagline, 
            intro: data.intro, 
            content: data.bookMarkdown, 
            html: data.bookHtml, 
            about: data.bookConfig.about, 
            keypoints: data.bookConfig.keypoints,
            language: data.bookConfig.language,
            idea: data.idea, 
            plan: data.plan, 
            tableOfContent: data.tableOfContent, 
            credit: data.cost * creditConversion,
            cost: data.cost,
            toc: data.toc,
            contains_math: data.containsMath,
            contains_code: data.containsCode,
            intro_content: data.introMarkdown,
            intro_html: data.introHtml,
            chaptersMarkdown: data.chaptersMarkdown,
            chaptersHtml: data.chaptersHtml,
            category: data.bookConfig.category, //catNum,
            model: data.bookConfig.model //model,
        };

        let result = await fetch('/api/savebook', {
            method:'POST',
            body: JSON.stringify(bookData),
            header: {
                'Content-Type': 'application/json'
            }
        });
        result = await result.json();

        if(!result.error) { 
            const bookId = result.book.id;
            
            // await fetchBooks(true);
            let insertedBook = {
                id: bookId,
                title: data.title, 
                tagline: data.tagline, 
            }
            setBooks((prevBooks) => [insertedBook, ...prevBooks]);  // Add to the top

            await handleReadBook(bookId);
        }

        setIsGenerating(false); // Stop generating
        setStatus(''); 

        return true;
    };

    const handleDeleteBook = async (id) => {
        let bookData = { 
            id
        };
        let result = await fetch('/api/deletebook', {
            method:'POST',
            body: JSON.stringify(bookData),
            header: {
                'Content-Type': 'application/json'
            }
        });
        result = await result.json();
        if(!result.error) { 
            // await fetchBooks(true);
            setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id)); // Remove the deleted book from the current books list
            
            setShowChapterList(false);
            setBookHtml('');

            localStorage.removeItem('activeBookId');
            localStorage.removeItem('activeChapterId');
        }
    };
    
    async function handleBookUpdated(title) {

        let bookData = { 
            id: activeBookId,
            title: title, 
        };

        let result = await fetch('/api/updatebook', {
            method:'POST',
            body: JSON.stringify(bookData),
            header: {
                'Content-Type': 'application/json'
            }
        });
        result = await result.json();
        if(!result.error) { 
            
            // await fetchBooks();
            setBooks((prevBooks) =>
                prevBooks.map((book) =>
                book.id === activeBookId ? { ...book, title: title } : book
                )
            );

            setTitle(title);

        }
    }

    const handleOpenLastChapter = async (id, chapterid) => { // similar to handleReadBook
        let bookData = { 
            id
        };
        let result = await fetch('/api/readbook', {
            method:'POST',
            body: JSON.stringify(bookData),
            header: {
                'Content-Type': 'application/json'
            }
        });
        result = await result.json();

        if(!result.error) { 
            const item = result.chapters.find(chapter => chapter.id+'' === chapterid+'');

            console.log(result.book);
            console.log(result.chapters);

            setBookHtml(item.html); 
            setBook(result.book);
            setTitle(result.book.title)
            setAbout(result.book.about);
            setKeypoints(result.book.keypoints);
            setCategory(parseInt(result.book.category));
            setLanguage(result.book.language);
            setChapters(result.chapters);

            setActiveBookId(id); 
            setActiveChapterId(parseInt(chapterid)); // set active chapter
            setShowChapterList(true); 

            const index = result.chapters.findIndex(chapter => chapter.id+'' === chapterid+'');
            setActiveChapterIndex(index);

            setSelectedBookId(id); // Store the selected book ID
        }

        getRewrites(chapterid);
    };

    const hasFetchedBooks = useRef(false);
    useEffect(() => {
        if (!hasFetchedBooks.current) {
            hasFetchedBooks.current = true;

            const loadData = async () => {
                
                await fetchBooks();

                const savedBookId = localStorage.getItem('activeBookId');
                const savedChapterId = localStorage.getItem('activeChapterId');

                if (savedBookId && savedChapterId) {
                    await handleOpenLastChapter(savedBookId, savedChapterId);
                } 
                setReady(true);

                if(topicRef.current) topicRef.current.focus(); 
            }
            
            loadData();
        }
    }, []); 
    
    const focusPrompt = () => {
        setTimeout(()=>{
            if(promptRef.current) promptRef.current.focus(); 
        }, 0)
    }

    const handleSetVersion = async (rewriteid) => {
        setVersionLoading(true);

        let data = { 
            id: rewriteid, 
            chapter_id: activeChapterId
        };
        let result = await fetch('/api/setchapter', {
            method:'POST',
            body: JSON.stringify(data),
            header: {
                'Content-Type': 'application/json'
            }
        });
        result = await result.json();
        if(!result.error) { 
            handleOpenLastChapter(activeBookId, activeChapterId);
            setVersionLoading(false);
        }
    }

    function wrapContentWithDOMParser(content) {
        if (content.includes('class="row"') && content.includes('class="column"')) {
            return content.trim(); // No further processing needed
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
    
        const fragment = document.createDocumentFragment();
    
        doc.body.childNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {

                const rowDiv = document.createElement('div');
                rowDiv.className = 'row';
                
                const columnDiv = document.createElement('div');
                columnDiv.className = 'column';
    
                columnDiv.appendChild(node.cloneNode(true));
                rowDiv.appendChild(columnDiv);
    
                fragment.appendChild(rowDiv);
            }
        });
    
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(fragment);
        
        return tempDiv.innerHTML.trim();
    }

    return (
        <>
        <Head>
            <title>My Books</title>
        </Head>
        
        {(!ready || loading) && (
            <div className={`div-status flex justify-center items-center fixed inset-0 bg-white bg-opacity-10 text-lg z-10`}>
                <span className="loading-icon">
                    <svg style={{marginTop:'2px'}} className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </span>
            </div>
       )} 

        {books.length===0 && ready && (
            <div className={`flex justify-center items-center w-full min-h-screen`}>
                <div className="max-w-[1200px] w-full flex flex-row justify-center">
                    <div className="hidden md:flex flex-col justify-center p-0 lg:p-8">
                        <Image
                            src="/writing.png"
                            width={550}
                            height={550}
                            alt="Create My Book"
                        />
                    </div>
                    <div className="flex flex-col p-8 w-full sm:w-[490px] lg:w-[540px] xl:w-[590px] flex-none">
                        <CreateBookFormInitial
                            topicRef={topicRef}
                            handleCreateBook={handleCreateBook}
                            isGenerating={isGenerating}
                            status={status}
                        />
                    </div>
                </div>
            </div>
        )}

        {books.length>0 && ready && (
            <div className={`relative flex h-full w-full overflow-hidden transition-colors z-0`}>

                {/* Book List */}
                {!showChapterList  && (
                <div ref={scrollableSideRef} className={`flex-shrink-0 overflow-x-hidden w-80 h-screen p-4 bg-gray-100`}>
                    <BookList books={books} handleReadBook={handleReadBook} />
                </div>
                )}
                
                {/* Chapter List */}
                {showChapterList  && (
                <div className={`flex-shrink-0 flex flex-col justify-between overflow-x-hidden w-80 h-screen p-4 bg-gray-100`}>
                    <div>
                        <button
                            className="w-full text-left text-sm rounded-sm px-4 py-2 hover:bg-gray-200 focus:outline-none"
                            onClick={async () => {
                                await stopEditing();
                                setShowChapterList(false);

                                localStorage.removeItem('activeBookId');
                                localStorage.removeItem('activeChapterId');
                            }}>
                            &larr; Back
                        </button>

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

                        <PrintBookButton 
                            chapters={chapters}
                            title={title}
                        />

                    </div>

                    {!isEditing && (
                        <DeleteBookButton
                            handleDeleteBook={handleDeleteBook}
                            selectedBookId={selectedBookId}
                        />
                    )}
                </div>
                )}

                <div className="flex-1">

                    {/* Book Cards */}
                    {!showChapterList && !isGenerating && !bookLoading && (
                        <>
                            <div ref={scrollableMainRef} className="w-full overflow-y-auto h-screen p-12">
                                <h1 className="text-4xl">My Books</h1>
                                <div className="mt-12 flex flex-wrap gap-10">
                                {books.map((book) => (
                                    <BookCard key={book.id} book={book} handleReadBook={handleReadBook} />
                                ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Content */}
                    {showChapterList && !isGenerating && (
                    <div className="w-full overflow-y-auto h-screen" ref={scrollContainerRef}>
                        {!isEditing && (
                            <>
                                {/* {((!isDemo && bookHtml) || (isDemo && bookHtml && activeChapterIndex<=limit)) && ( */}
                                {bookHtml && (
                                    <>
                                        <div className={`max-w-3xl mx-auto w-full relative px-[1rem] mt-24 ${activeChapterId === chapters[0].id ? 'text-6xl font-semibold leading-none' : 'text-sm'}`}>{title}</div>
                                        {
                                            book.contains_math  ?
                                            <MathContentWrapper bookHtml={bookHtml} />
                                            :
                                            <div className="container max-w-3xl mx-auto w-full relative mt-10" style={{ marginBottom: '500px' }} dangerouslySetInnerHTML={{ __html: wrapContentWithDOMParser(bookHtml) }} />
                                        }
                                    </>

                                )}
                                
                                { !isDemo && !bookHtml && (
                                    <div className={`container max-w-3xl mx-auto w-full relative`} style={{marginTop: '156px', marginBottom: '500px'}}>
                                        <div className="border border-2 p-14 py-8 border-gray-900 rounded-xl">
                                            <p className="text-2xl font-semibold">This is a sample (preview) book.</p>
                                            <p className="text-base">Only the first few chapters have been generated in this sample. To generate the full book, please use the generate form.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {isDemo && !bookHtml && (
                                    <div className={`container max-w-3xl mx-auto w-full relative`} style={{marginTop: '156px', marginBottom: '500px'}}>
                                        <div className="border border-2 p-14 py-8 border-gray-900 rounded-xl">
                                            <p className="text-2xl font-semibold">Demo Info</p>
                                            <p className="text-base">This demo allows you to generate only the first few chapters. The full version lets you generate the entire book.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {isEditing && (
                            <div className={`container max-w-3xl mx-auto w-full relative`} style={{marginTop: '156px', marginBottom: '500px'}}>
                            </div>
                        )}
                    </div>
                    )}

                    {/* Status */}
                    {(isGenerating) && (
                        <div className={`div-status flex justify-center items-center fixed inset-0 bg-gray-600 bg-opacity-10 text-lg ${isRewriting?'z-10':''}`}>
                            {status}
                        </div>
                    )}

                    {/* Add Book */}
                    {!isEditing && (
                        <AddBook
                            topicRef={topicRef}
                            handleCreateBook={handleCreateBook}
                            isGenerating={isGenerating} // or whatever value you want to pass
                            status={status}
                            />
                    )}

                    {/* Edit & Rewrite Chapter */}
                    {showChapterList && activeChapterId && !isEditing && (

                    <PopoverGroup className={`fixed top-6 right-7 text-sm rounded-full bg-gray-200 z-20 flex items-center`}>

                        {((bookHtml && !isDemo) || (isDemo && bookHtml && activeChapterIndex<=limit)) && (
                            <>
                            <button
                                className={`flex items-center p-3 px-4 rounded-full mr-2
                                    focus:outline-none`}
                                aria-label="Edit"
                                title="Edit" onClick={() => startEditing()}>
                                    <>
                                        <PencilIcon className="size-4 mr-2" />
                                        Edit
                                    </>
                            </button>

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
                        

                    </PopoverGroup>
                    )}

                    {/* Quit Editing */}
                    {isEditing && (
                    <>
                        <div className={`fixed top-6 right-6 text-sm rounded-full bg-gray-200 z-20 flex items-center`}>
                            <button
                                className={`flex items-center focus:outline-none p-2 px-4`}
                                aria-label="Save"
                                title="Save" onClick={() => stopEditing()}>
                                    <>
                                        <ArrowUturnLeftIcon className="size-4 mr-2" />
                                        Back
                                    </>
                            </button>
                        </div>
                    </>
                    )}
                </div>

            </div>
        )}
        </>
    )
}