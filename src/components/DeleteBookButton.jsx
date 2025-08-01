import { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import DeleteBookDialog from './DeleteBookDialog'; 

const DeleteBookButton = ({
    handleDeleteBook,
    selectedBookId
}) => {

    const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

    return (
        <div>
            <button
                className="flex-none w-auto text-sm px-5 pl-4 py-2 bg-gray-200 rounded-full focus:outline-none mt-6 m-4 flex items-center"
                onClick={() => setIsDeleteConfirm(true)}>
                <TrashIcon className="size-4 mr-1" />
                Delete Book
            </button>

            <DeleteBookDialog
                isDeleteConfirm={isDeleteConfirm}
                setIsDeleteConfirm={setIsDeleteConfirm}
                handleDeleteBook={handleDeleteBook}
                selectedBookId={selectedBookId}
            />
        </div>
    );
};

export default DeleteBookButton;
