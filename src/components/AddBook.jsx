import React from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
import CreateBookForm from './CreateBookForm';

const AddBook = ({ topicRef, handleCreateBook, isGenerating, status }) => {

    const focusTopic = () => {
        setTimeout(()=>{
            if(topicRef.current) topicRef.current.focus(); 
        }, 0)
    }
    return (
        <Popover className={`fixed bottom-6 right-6 z-20 flex items-center`}>
            {({ open, close }) => (
                <>
                    <PopoverButton className={`flex items-center
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                        text-base rounded-full ${open ? 'bg-gray-200 p-3' : 'bg-gray-900 text-white p-2 px-4'}`} onClick={() => focusTopic()}>
                        {!open && (<>
                            <PlusIcon className="size-6 mr-2" />
                            Add Book
                        </>
                        )}
                        {open && (<>
                            <MinusIcon className="size-6" />
                        </>
                        )}
                    </PopoverButton>
                    <PopoverPanel anchor="top" transition className="flex flex-col p-8 xl:p-10 2xl:p-14 md:-ml-6 bg-white rounded-xl text-sm shadow-lg w-full sm:w-[640px] -mt-2
                        transition duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 origin-bottom-right overflow-y-auto" style={{maxWidth: '400px'}}>
                        
                        <CreateBookForm
                            topicRef={topicRef}
                            handleCreateBook={handleCreateBook}
                            isGenerating={isGenerating}
                            close={close}
                            status={status}
                        />

                    </PopoverPanel>
                </>
            )}
        </Popover>
    );
};

export default AddBook;
