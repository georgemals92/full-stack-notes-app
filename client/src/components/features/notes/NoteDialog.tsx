import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  idleNoteEditor,
  NoteEditorState
} from "@/hooks/useNoteEditor";
import { FormEvent } from "react";
import { Tag } from "@/lib/tag";
import { Category } from "@/lib/category";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";

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
        <form
          onSubmit={props.onSubmit}
          className="w-full flex flex-col gap-y-3"
        >
          <Field>
            <FieldLabel className="my-2" htmlFor={`title-${props.mode}`}>
              Title
            </FieldLabel>
            <Input
              id={`title-${props.mode}`} //check
              value={noteEditor.title ?? ""}
              onChange={(e) =>
                setNoteEditor({ ...noteEditor, title: e.target.value })
              }
              required
            ></Input>
          </Field>
          <FieldSet>
            <ScrollArea className=" max-h-40 overflow-y-auto">
              <FieldGroup className="gap-3">
                <FieldLegend variant="label">
                  Categories (multiple selection)
                </FieldLegend>
                {props.allCategories.map((c) => (
                  <Field key={c._id} orientation="horizontal" className="">
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
                    <FieldLabel
                      className="cursor-pointer font-normal"
                      htmlFor={`cat-select-${props.mode}-${c._id}`} //check
                    >
                      {c.name}
                    </FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
            </ScrollArea>
          </FieldSet>
          <FieldSet>
            <FieldLegend variant="label">Tags (multiple selection)</FieldLegend>
            <ScrollArea className="max-h-40 overflow-y-auto">
              <FieldGroup className="gap-3">
                {props.allTags.map((t) => (
                  <Field key={t._id} orientation="horizontal">
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
                    <FieldLabel
                      htmlFor={`tag-select-${props.mode}-${t._id}`} //check
                      className="cursor-pointer font-normal"
                    >
                      {t.name}
                    </FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
            </ScrollArea>
          </FieldSet>
          <Field>
            <FieldLabel htmlFor={`${props.mode}-body`}>
              Body
            </FieldLabel>
            <Textarea
              placeholder="Start typing your note"
              value={noteEditor.body}
              id={`${props.mode}-body`}
              onChange={(e) =>
                setNoteEditor({ ...noteEditor, body: e.target.value })
              }
            />
          </Field>
          <Button type="submit" variant="default">
            Save
          </Button>
          <Button
            variant="ghost"
            type="button"
            onClick={() => {
              props.setNoteDialogOpen(false);
              setNoteEditor(idleNoteEditor);
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
