import React from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

const RewriteChapterPopover = ({ 
    rewritePrompt, 
    setRewritePrompt, 
    isRewriting, 
    rewrite, 
    focusPrompt, 
    promptRef 
}) => {
  return (
    <Popover className={`text-sm rounded-full bg-gray-200 focus:outline-none z-20 flex items-center`}>
        {({ open, close }) => (
            <>
            <PopoverButton className='flex items-center focus:outline-none p-3 px-4' onClick={() => focusPrompt()}>
                <>
                    <SparklesIcon className="size-4 mr-2" />
                    Rewrite
                </>
            </PopoverButton>
            <PopoverPanel anchor="bottom" transition className="flex flex-col p-8 xl:p-10 2xl:p-14 md:-ml-6 bg-white text-sm shadow-lg w-full sm:w-[600px] rounded-xl
            transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 origin-top-right">
                <div className="font-semibold text-xl">Rewrite Chapter</div>
                <div className="text-base font-medium text-gray-700">You can rewrite multiple times and switch between different versions.</div>
                <Image
                    src="/writing.png"
                    width={500}
                    height={500}
                    className="w-[200px] 2xl:w-[250px] mb-2"
                    alt="Create My Book"
                />
                
                <label htmlFor="inpRewritePrompt" className="text-base font-medium text-gray-700">Describe how you'd like to rewrite this chapter (optional):</label>
                <textarea 
                    id="inpRewritePrompt" 
                    className="mt-2 p-2 border border-gray-300 rounded-md shadow-sm w-full focus:outline-none text-base" 
                    rows="7"
                    value={rewritePrompt}
                    ref={promptRef}
                    onChange={(e) => setRewritePrompt(e.target.value)}></textarea>

                <button
                    onClick={async ()=>{
                        const ok = await rewrite();
                        if(ok) close();
                    }}
                    className={`text-base mt-4 px-4 py-2 ease-in-out duration-200 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md shadow focus:outline-none flex justify-center`}
                    aria-label="Rewrite Chapter"
                    title="Rewrite Chapter">

                    {isRewriting ? (
                        <>
                            <span className="loading-icon">
                                <svg style={{marginTop:'2px'}} className="animate-spin mr-3 w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </span>
                            Abort
                        </>
                    ) : (
                        'Rewrite Chapter'
                    )}
    
                </button>
            </PopoverPanel>
            </>
        )}
    </Popover>
    );
};

export default RewriteChapterPopover;
