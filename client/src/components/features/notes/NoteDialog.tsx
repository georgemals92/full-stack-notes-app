import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { idleNoteEditor, NoteEditorState } from "@/hooks/useNoteEditor";
import { FormEvent } from "react";
import { Tag } from "@/lib/tag";
import { Category } from "@/lib/category";

interface NoteDialogProps {
  noteEditor: NoteEditorState;
  setNoteEditor(e: NoteEditorState): void;
  mode: "create" | "edit";
  allTags: Tag[];
  allCategories: Category[];
  noteDialogOpen: boolean;
  setNoteDialogOpen(o: boolean): void;
  onSubmit(e: FormEvent<HTMLFormElement>): Promise<void>;
}

function NoteDialog({ noteEditor, setNoteEditor, ...props }: NoteDialogProps) {
  return (
    <Dialog
      open={props.noteDialogOpen}
      onOpenChange={(open) => {
        props.setNoteDialogOpen(open);

        if (!open) {
          setNoteEditor(idleNoteEditor); //check
        }
      }}
    >
      <DialogContent className="w-[550px] flex flex-col gap-y-4">
        <DialogHeader>
          <DialogTitle>
            {props.mode === "create" ? "Create note" : "Edit note"}
          </DialogTitle>
        </DialogHeader>
        {/* Create new note form */}
        <form
          onSubmit={props.onSubmit}
          className="w-full flex flex-col gap-y-3"
        >
          <div>
            {/* check */}
            <Label className="my-2" htmlFor={`title-${props.mode}`}>
              Title
            </Label>
            <Input
              id={`title-${props.mode}`} //check
              value={noteEditor.title ?? ""}
              onChange={(e) =>
                setNoteEditor({ ...noteEditor, title: e.target.value })
              }
              required
            ></Input>
          </div>
          <div>
            <Label>Categories (multiple selection)</Label>
            <ScrollArea className=" max-h-40 overflow-y-auto">
              {props.allCategories.map((c) => (
                <div key={c._id} className="flex items-center gap-2 h-8">
                  <Checkbox
                    id={`cat-select-${props.mode}-${c._id}`} //check
                    checked={noteEditor.categories.includes(c._id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setNoteEditor({
                          ...noteEditor,
                          categories: [...noteEditor.categories, c._id],
                        });
                      } else {
                        setNoteEditor({
                          ...noteEditor,
                          categories: noteEditor.categories.filter(
                            (id: string) => id !== c._id
                          ),
                        });
                      }
                    }}
                  />
                  <Label
                    className="cursor-pointer font-normal"
                    htmlFor={`cat-select-${props.mode}-${c._id}`} //check
                  >
                    {c.name}
                  </Label>
                </div>
              ))}
            </ScrollArea>
          </div>
          <div>
            <Label>Tags (multiple selection)</Label>
            <ScrollArea className="max-h-40 overflow-y-auto">
              {props.allTags.map((t) => (
                <div key={t._id} className="flex items-center gap-2 h-8">
                  <Checkbox
                    id={`tag-select-${props.mode}-${t._id}`} //check
                    checked={noteEditor.tags.includes(t._id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setNoteEditor({
                          ...noteEditor,
                          tags: [...noteEditor.tags, t._id],
                        });
                      } else {
                        setNoteEditor({
                          ...noteEditor,
                          tags: noteEditor.tags.filter(
                            (id: string) => id !== t._id
                          ),
                        });
                      }
                    }}
                  />
                  <Label
                    htmlFor={`tag-select-${props.mode}-${t._id}`} //check
                    className="cursor-pointer font-normal"
                  >
                    {t.name}
                  </Label>
                </div>
              ))}
            </ScrollArea>
          </div>
          <div>
            <Textarea
              placeholder="Body (optional)"
              value={noteEditor.body}
              id={`${props.mode}-body`} // check
              onChange={(e) =>
                setNoteEditor({ ...noteEditor, body: e.target.value })
              }
            />
          </div>
          <Button type="submit" variant="default">
            Save
          </Button>
          <Button
            variant="ghost"
            type="button"
            onClick={() => {
              setNoteEditor(idleNoteEditor); //check
              props.setNoteDialogOpen(false);
            }}
          >
            Cancel
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default NoteDialog;
