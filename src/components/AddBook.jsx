import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import CreateBookForm from "./CreateBookForm";

const AddBook = ({ topicRef, handleCreateBook, isGenerating, status }) => {
  const [open, setOpen] = React.useState(false);

  const focusTopic = () => {
    setTimeout(() => {
      if (topicRef.current) topicRef.current.focus();
    }, 0);
  };

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (isOpen) {
      focusTopic();
    }
  };

  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-20 flex items-center">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className={`rounded-full h-14 shadow-lg transition-all duration-200 ${
              open ? "bg-muted text-foreground hover:bg-muted/80 px-4" : "px-6"
            }`}
            onClick={() => !open && focusTopic()}
          >
            {!open ? (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Add Book
              </>
            ) : (
              <X className="w-6 h-6" />
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <CreateBookForm
            topicRef={topicRef}
            handleCreateBook={handleCreateBook}
            isGenerating={isGenerating}
            close={closeDialog}
            status={status}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddBook;
