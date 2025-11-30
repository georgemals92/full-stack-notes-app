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
import { Category } from "@/lib/category";
import { Tag } from "@/lib/tag";
import { FormEvent } from "react";

interface NoteDialogProps {
  mode: "create" | "edit";
  title: string;
  body: string;
  allCategories: Category[];
  selectedCategoryIds: string[];
  allTags: Tag[];
  selectedTagIds: string[];
  setTitle(t: string): void;
  setBody(b: string): void;
  setSelectedCategoryIds(c: string[]): void;
  setSelectedTagIds(t: string[]): void;
  noteDialogOpen: boolean;
  setNoteDialogOpen(o: boolean): void;
  onSubmit(e: FormEvent<HTMLFormElement>): Promise<void>;
  editingNoteId?: string | null;
  setEditingNoteId(id: string | null): void;
  // setEditingNote(n: EditDraft | null): void;
}

function NoteDialog(props: NoteDialogProps) {
  return (
    <Dialog
      open={props.noteDialogOpen}
      onOpenChange={(open) => {
        props.setNoteDialogOpen(open);

        if (!open) {
          props.setEditingNoteId(null);
          props.setTitle("");
          props.setBody("");
          props.setSelectedCategoryIds([]);
          props.setSelectedTagIds([]);
        }
      }}
    >
      <DialogTrigger asChild>
        {props.mode === "create" && (
          <Button variant="default" size="sm">
            Create note
          </Button>
        )}
      </DialogTrigger>
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
            <Label className="my-2" htmlFor={`title-${props.mode}`}>
              Title
            </Label>
            <Input
              id={`title-${props.mode}`}
              value={props.title ?? ""}
              onChange={(e) => props.setTitle(e.target.value)}
              required
            ></Input>
          </div>
          <div>
            <Label>Categories (multiple selection)</Label>
            <ScrollArea className=" max-h-40 overflow-y-auto">
              {props.allCategories.map((c) => (
                <div key={c._id} className="flex items-center gap-2 h-8">
                  <Checkbox
                    id={`cat-select-${props.mode}-${c._id}`}
                    checked={props.selectedCategoryIds.includes(c._id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        props.setSelectedCategoryIds([
                          ...props.selectedCategoryIds,
                          c._id,
                        ]);
                      } else {
                        props.setSelectedCategoryIds(
                          props.selectedCategoryIds.filter((id) => id !== c._id)
                        );
                      }
                    }}
                  />
                  <Label
                    className="cursor-pointer font-normal"
                    htmlFor={`cat-select-${props.mode}-${c._id}`}
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
                    id={`tag-select-${props.mode}-${t._id}`}
                    checked={props.selectedTagIds.includes(t._id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        props.setSelectedTagIds([
                          ...props.selectedTagIds,
                          t._id,
                        ]);
                      } else {
                        props.setSelectedTagIds(
                          props.selectedTagIds.filter((id) => id !== t._id)
                        );
                      }
                    }}
                  />
                  <Label
                    htmlFor={`tag-select-${props.mode}-${t._id}`}
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
              value={props.body}
              id={`${props.mode}-body`}
              onChange={(e) => props.setBody(e.target.value)}
            />
          </div>
          <Button type="submit" variant="default">
            Save
          </Button>
          <Button
            variant="ghost"
            type="button"
            onClick={() => {
              props.setEditingNoteId(null);
              props.setBody("");
              props.setTitle("");
              props.setSelectedCategoryIds([]);
              props.setSelectedTagIds([]);
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
