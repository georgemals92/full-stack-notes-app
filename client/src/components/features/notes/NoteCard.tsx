import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Note } from "@/lib/note";
import { Pen, Trash } from "lucide-react";

interface NoteProps {
  note: Note;
  onEdit(n: Note): void;
  onDelete(id: String): Promise<void>;
}

function NoteCard({ note, onEdit, onDelete }: NoteProps) {
  return (
    <Card key={note._id} className="py-0 gap-4">
      <img
        className="w-full h-30 object-cover rounded-t-xl p-0"
        src="https://www.notion.so/images/page-cover/webb4.jpg"
        alt="note image default"
      />
      <CardHeader className="py-0 px-4 flex flex-col gap-2">
        <CardTitle className="">{note.title}</CardTitle>
        {/* 
        <div>  
            {Array.isArray(note.categories) ? note.categories.map(
                (c, id) => <Badge variant="default" key={id} className='mx-0.5'>{c.name}</Badge>) 
                : note.categories
            }
        </div> 
        */}
        <div className="h-10">
          {Array.isArray(note.tags)
            ? note.tags.map((t, id) => (
              <Badge variant="outline" key={id} className="mx-0.5">
                {t.name}
              </Badge>
            ))
            : note.tags}
        </div>
      </CardHeader>
      <CardContent className="text-sm h-15 overflow-y-hidden">
        {note.body}
      </CardContent>
      <CardFooter className="pt-2 py-4 items-baseline justify-between">
        <div className="text-xs">
          {/* Converts date to date object and handles format */}
          {new Date(note.createdAt).toLocaleString()}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={() => onEdit(note)}
          >
            <Pen />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon-sm"
              >
                <Trash />
              </Button>
            </DialogTrigger>
            <DialogContent showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>Delete note?</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                  The note will be deleted permanently and cannot be restored.
              </DialogDescription>
              <DialogFooter>
                <Button 
                  variant="destructive"
                  onClick={() => onDelete(note._id)}
                >
                  Delete
                </Button>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  );
}

export default NoteCard;