import React, { useState, useEffect } from 'react';
import { Select } from '@headlessui/react';
import Image from 'next/image';

const CreateBookForm = ({ topicRef, handleCreateBook, isGenerating, close, status }) => {
    const [topic, setTopic] = useState('');
    const [keypoints, setKeypoints] = useState('');
    const [language, setLanguage] = useState('English');
    const [languages, setLanguages] = useState([]);
    const [isTouched, setIsTouched] = useState(false);

    useEffect(() => {
        // Predefined list of ISO 639-1 language codes
        const identifiers = [
            'af', 'sq', 'am', 'ar', 'hy', 'az', 'eu', 'be', 'bn', 'bs', 'bg', 'ca', 'ceb', 
            'zh', 'co', 'hr', 'cs', 'da', 'nl', 'en', 'eo', 'et', 'fi', 'fr', 'fy', 'gl', 
            'ka', 'de', 'el', 'gu', 'ht', 'ha', 'haw', 'he', 'hi', 'hmn', 'hu', 'is', 
            'ig', 'id', 'ga', 'it', 'ja', 'jw', 'kn', 'kk', 'km', 'rw', 'ko', 'ku', 'ky', 
            'lo', 'la', 'lv', 'lt', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'mi', 'mr', 'mn', 
            'my', 'ne', 'no', 'ny', 'or', 'ps', 'fa', 'pl', 'pt', 'pa', 'ro', 'ru', 'sm', 
            'gd', 'sr', 'st', 'sn', 'sd', 'si', 'sk', 'sl', 'so', 'es', 'su', 'sw', 'sv', 
            'tl', 'tg', 'ta', 'tt', 'te', 'th', 'tr', 'tk', 'uk', 'ur', 'ug', 'uz', 'vi', 
            'cy', 'xh', 'yi', 'yo', 'zu'
        ];
  
        const locale = 'en-US'; // Define the locale for which you want to get the display names
  
        let languages = [];
        
        identifiers.forEach((identifier, index) => {
            const name = new Intl.DisplayNames([locale], { type: 'language' }).of(identifier);
            languages.push({
                id: identifier,
                name: name
            });
        });
        setLanguages(languages);
    }, []);

    const handleGenerateClick = async () => {

        setIsTouched(true);

        if (!topic) {
            return;
        }

        return await handleCreateBook(topic, keypoints, language);
    };

    return (
        <>
            {isGenerating && (
                <>
                    <div className="font-semibold text-xl mb-4 h-6">{status?status:'Please wait...'}</div>
                </>
            )}
            
            {!isGenerating && (
                <>
                <div className="font-semibold text-xl mb-4 h-6">Create My Book</div>
                <Image
                    priority={true} 
                    src="/writing.png"
                    width={500}
                    height={500}
                    className="mb-3 w-[200px] 2xl:w-[300px] h-auto hidden xl:block"
                    alt="Create My Book"
                />
                
                <div className="mt-2 mb-1 text-xs">Example topics:</div>
                <div className="flex flex-wrap gap-3 mb-4">
                    <button 
                        onClick={(e) => {
                            setTopic(e.target.textContent);
                            setIsTouched(true);
                        }}
                        className="w-40 rounded-xl border border-gray-300 p-3 text-sm shadow-xs transition hover:bg-gray-50">
                        How to build a modern JavaScript library from scratch.
                    </button>
                    <button 
                        onClick={(e) => {
                            setTopic(e.target.textContent);
                            setIsTouched(true);
                        }}
                        className="w-36 rounded-2xl border border-gray-300 p-3 text-sm shadow-xs transition hover:bg-gray-50">
                            Authentic and traditional recipes from world cuisines.
                    </button>
                    <button 
                        onClick={(e) => {
                            setTopic(e.target.textContent);
                            setIsTouched(true);
                        }}
                        className="w-48 rounded-2xl border border-gray-300 p-3 text-sm shadow-xs transition hover:bg-gray-50">
                        A love story of a time traveler who embarks on a thrilling historical adventure.
                    </button>
                </div>
                <label htmlFor="inpTopic" className="text-base font-medium text-gray-700 mb-1">Topic:</label>
                <input 
                    type="text" 
                    id="inpTopic" 
                    className={`inp-about ${isTouched && topic.trim() === '' ? 'outline outline-orange-400 outline-2 outline-offset-2' : ''} p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none text-base`}
                    value={topic} 
                    ref={topicRef}
                    onChange={(e) => setTopic(e.target.value)} />
                

                <label htmlFor="inpKeypoints" className="mt-3 text-base font-medium text-gray-700 mb-1">What you want to include in the book (optional):</label>
                <textarea 
                    id="inpKeypoints" 
                    className="inp-keypoints p-2 border border-gray-300 rounded-md shadow-sm w-full focus:outline-none text-base min-h-[60px]" 
                    rows="6"
                    value={keypoints}
                    onChange={(e) => setKeypoints(e.target.value)}></textarea>

                <label htmlFor="inpLanguage" className="mt-3 text-base font-medium text-gray-700 mb-1">Book Language:</label>
                <Select id="inpLanguage" aria-label="Select language" 
                    className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none text-base bg-white"
                    onChange={(event) => setLanguage(event.target.value)}
                    value={language}>
                    {languages.map((item) => (
                        <option key={item.id} value={item.name}>
                            {item.name}
                        </option>
                    ))}
                </Select>
                </>
            )}

            
            <button 
                className={`btn-generate text-base mt-4 px-4 py-2 ease-in-out duration-200 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md shadow focus:outline-none flex justify-center`}
                onClick={async ()=>{
                    const ok = await handleGenerateClick();
                    if(ok && close) close();
                }}>
                {isGenerating ? (
                    <>
                        <span className="loading-icon">
                            <svg style={{marginTop:'2px'}} className="animate-spin mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </span>
                        Abort
                    </>
                ) : (
                    'Create My Book'
                )}
            </button>
        </>
    );
};

export default CreateBookForm;
