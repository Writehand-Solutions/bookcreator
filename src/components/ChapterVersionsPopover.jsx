import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Bars3BottomLeftIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const ChapterVersionPopover = ({ rewrites, handleSetVersion, initialChapter, versionLoading }) => {
    const [rewriteId, setRewriteId] = useState('');
    return (
        <Popover className={`text-sm rounded-full bg-gray-200 focus:outline-none z-20 flex items-center`}>
            <PopoverButton className='flex items-center focus:outline-none p-3 pl-4 pr-5'>
                <>
                    <Bars3BottomLeftIcon className="size-5" />
                </>
            </PopoverButton>
            <PopoverPanel anchor="bottom" transition className="flex flex-col p-14 bg-white text-sm shadow-lg w-full sm:w-[450px] -ml-6 rounded-xl
                transition duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 origin-top-right">
                <div className="mb-3 text-base font-semibold flex items-center">
                    Select Chapter Version:
                </div>
                {rewrites.map((rewrite) => (
                    <button
                        key={rewrite.id}
                        className={`flex flex-row w-full text-left text-sm px-2 py-2 hover:bg-gray-200 rounded-sm focus:outline-none ${rewrite.is_active ? 'bg-gray-200' : ''}`}
                        onClick={() => {
                            setRewriteId(rewrite.id);
                            handleSetVersion(rewrite.id);
                        }}>
                        Rewrite at {rewrite.created_at?new Date(rewrite.created_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit', 
                            minute: '2-digit'
                        }):''} 
                        {/* (cost: ${rewrite.cost.toFixed(5)}) */}
                        {
                            (rewriteId===rewrite.id && versionLoading) ?
                                <span>
                                    <svg style={{marginTop:'2px'}} className="animate-spin ml-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </span>
                            :
                            <></>
                        }
                    </button>
                ))}
                <button
                    className={`flex flex-row w-full text-left text-sm px-2 py-2 hover:bg-gray-200 rounded-sm focus:outline-none ${initialChapter ? 'bg-gray-200' : ''}`}
                    onClick={() =>{
                        setRewriteId(0);
                        handleSetVersion(0)
                    }}>
                    Initial Version
                    {(rewriteId===0 && versionLoading) ?
                        <span>
                            <svg style={{marginTop:'2px'}} className="animate-spin ml-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </span>
                    :
                    <></>}
                </button>
            </PopoverPanel>
        </Popover>
    );
};

export default ChapterVersionPopover;
