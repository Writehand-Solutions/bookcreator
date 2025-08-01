import React from 'react';
import { SunIcon } from '@heroicons/react/24/outline'
const BookCard = ({ book, handleReadBook }) => {
    const handleKeyPress = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            handleReadBook(book.id);
        }
    };
    return (
        <div className="relative">
            <div 
            role="button" tabIndex="0"
            key={book.id}
            className="cursor-pointer rounded w-[225px] h-[280px] shadow-[6px_5px_0px_0px_rgba(239,241,248,1)] 
            p-6 flex flex-col justify-end relative border border-solid border-gray-400/75 overflow-hidden
            focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            onClick={() => handleReadBook(book.id)}
            onKeyPress={handleKeyPress}
            aria-label={`Book: ${book.title}`} 
            >
                <SunIcon className="absolute top-32 left-16 size-64 z-0 text-gray-100" />

                <div className="absolute top-0 left-[0px] w-[12px] h-full bg-gray-100 z-0 flex items-end"></div>

                <div className="absolute top-6 left-0 w-full h-auto z-0 p-3 pl-10 pr-8 flex flex-col">
                    <div className="text-[17px] leading-tight font-semibold relative">{book.title}</div>
                </div>
                <div className="text-[10px] pl-4 leading-tight text-gray-700 relative">{book.tagline}</div>
            </div>
        </div>
    );
};

export default BookCard;
