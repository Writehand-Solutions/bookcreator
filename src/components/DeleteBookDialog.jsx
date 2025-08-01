import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import { useState } from 'react';

const DeleteBookDialog = ({ isDeleteConfirm, setIsDeleteConfirm, handleDeleteBook, selectedBookId }) => {

    const [deleting, setDeleting] = useState(false);
    return (
        <Dialog open={isDeleteConfirm} onClose={() => setIsDeleteConfirm(false)} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-black/10" />
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                <DialogPanel className="max-w-lg space-y-4 border bg-white p-12 pb-8 rounded-lg">
                    <DialogTitle className="font-semibold text-2xl">Delete book</DialogTitle>
                    <Description className="text-base">Are you sure you want to delete your book?</Description>
                    <p className="text-base">This will permanently delete your book.</p>
                    <div className="flex gap-4 pt-4">
                        <button className="text-base flex items-center focus:outline-none p-2 pl-0 pr-4 underline" onClick={() => setIsDeleteConfirm(false)}>Cancel</button>
                        <button className="text-base rounded-full bg-gray-800 text-white flex items-center focus:outline-none p-2 px-8" onClick={async () => {
                            if(deleting) return;
                            setDeleting(true);
                            await handleDeleteBook(selectedBookId);
                            setDeleting(false);
                            setIsDeleteConfirm(false)
                        }}>
                            {deleting ? (
                                <>
                                        <span className="loading-icon">
                                            <svg style={{marginTop:'2px'}} className="animate-spin mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </span>
                                        Deleting..
                                </>
                            ) : (
                                'Delete'
                            )}
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default DeleteBookDialog;
