import React from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useState } from 'react';

const ChapterList = ({ bookTitle, chapters, activeChapterId, handleReadChapter, credit, cost, showCredit, showCost, handleBookUpdated }) => {

    const [openDialog, setOpenDialog] = useState(false);
    const [title, setTitle] = useState(bookTitle);

    function handleEditTitle() {
        setOpenDialog(true);
    }

    let isAddIntro = chapters[0].matter_type === 1; // has introduction

    return (
        <>
        <div className="relative w-[270px] text-xl px-4 py-2 pr-0 mt-1 mb-2">
            {bookTitle}
            <button
                className={`absolute -right-[22px] bottom-[6px] p-2`}
                onClick={() => handleEditTitle()}>
                <PencilIcon className="size-4" />
            </button>
        </div>
        <div>
            {chapters.map((chapter, index) => (
                <button
                key={chapter.id}
                className={`flex gap-2 w-full text-left text-sm px-4 py-2 hover:bg-gray-200 rounded-sm 
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                    ${activeChapterId === chapter.id ? 'bg-gray-200' : ''}`}
                onClick={() => handleReadChapter(chapter.id)}>
                {
                    (chapter.matter_type === 1) ?
                    <><span>{chapter.title}</span></>
                :
                    isAddIntro?
                    <><span className='w-4'>{index}.</span><span>{chapter.title}</span></>
                    :
                    <><span className='w-4'>{index + 1}.</span><span>{chapter.title}</span></>
                }
                </button>
            ))}
            <div className="mt-4"></div>
            {showCredit && (
                <div className="text-sm px-4 py-2 font-semibold">Credits used: {parseFloat(credit).toFixed(3)}</div>
            )}
            {showCost && (
                <div className="text-sm px-4 py-2 font-semibold">Writing Cost: ${parseFloat(cost).toFixed(3)}</div>
            )}
        </div>

        <Dialog open={openDialog} onClose={() => {
                setTitle(bookTitle);
                setOpenDialog(false);
            }} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-black/10" />
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                <DialogPanel className="max-w-lg border bg-white p-12 pb-10 flex flex-col rounded-lg">
                    <DialogTitle className="font-semibold text-2xl mb-3">Edit Book</DialogTitle>

                    <label htmlFor="inpFullName" className="text-base font-medium text-gray-700 mt-3 mb-1">Title:</label>
                    {/* <input 
                        type="text" 
                        id="inpFullName" 
                        className="w-96 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none text-base"
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} /> */}
                    <textarea
                        id="inpFullName"
                        className="w-96 h-28 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none text-lg resize-none"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <div className="flex gap-4 pt-4">
                        <button className="text-base rounded-full bg-gray-800 text-white flex items-center focus:outline-none mt-3 p-2 px-8" onClick={() => {
                            handleBookUpdated(title);

                            setOpenDialog(false);
                        }}>Update</button>
                    </div>

                </DialogPanel>
            </div>
        </Dialog>
        </>
    );
};

export default ChapterList;
