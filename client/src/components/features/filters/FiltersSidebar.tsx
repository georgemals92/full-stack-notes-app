// Imports 
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Category } from "@/lib/category";
import { Tag } from "@/lib/tag";
import { NoteFilterState } from "@/hooks/useNoteFilters";

// Props schema
interface FiltersSidebarProps {
  allTags: Tag[];
  allCategories: Category[];
  noteFilters: NoteFilterState;
  setNoteFilters(f: NoteFilterState): void; 
  onFiltersReset() : void;
  onFiltersApply() : void;
}

// Filters Sidebar Component

function FiltersSidebar({noteFilters, setNoteFilters, allCategories, allTags, onFiltersApply, onFiltersReset}: FiltersSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <h3>Filters & Search</h3>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Search</SidebarGroupLabel>
          <Input
            placeholder="Search..."
            value={noteFilters.search}
            id="search"
            onChange={(e) => setNoteFilters({...noteFilters, search: e.target.value})} //Standard HTML event listener
          ></Input>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Filter by Category</SidebarGroupLabel>
          <ScrollArea className="max-h-40 overflow-y-auto">
            {allCategories.map((c) => (
              <div key={c._id} className="flex items-center gap-2 h-8">
                <Checkbox
                  id={`cat-${c._id}`}
                  checked={noteFilters.categories.includes(c._id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setNoteFilters({...noteFilters, categories: [
                        ...noteFilters.categories,
                        c._id,
                      ]});
                    } else {
                      setNoteFilters(
                        {...noteFilters, categories: noteFilters.categories.filter((id) => id !== c._id)}
                      );
                    }
                  }}
                />
                <Label
                  className="cursor-pointer font-normal"
                  htmlFor={`cat-${c._id}`}
                >
                  {c.name}
                </Label>
              </div>
            ))}
          </ScrollArea>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Filter by Tag</SidebarGroupLabel>
          <ScrollArea className="max-h-40 overflow-y-auto">
            {allTags.map((t) => (
              <div key={t._id} className="flex items-center gap-2 h-8">
                <Checkbox
                  id={`tag-${t._id}`}
                  checked={noteFilters.tags.includes(t._id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setNoteFilters({...noteFilters, tags: [
                        ...noteFilters.tags,
                        t._id,
                      ]});
                    } else {
                      setNoteFilters(
                        {...noteFilters, tags: noteFilters.tags.filter((id) => id !== t._id)}
                      );
                    }
                  }}
                />
                <Label
                  htmlFor={`tag-${t._id}`}
                  className="cursor-pointer font-normal"
                >
                  {t.name}
                </Label>
              </div>
            ))}
          </ScrollArea>
        </SidebarGroup>
        <SidebarGroup className="w-full">
          <SidebarGroupLabel>Sort</SidebarGroupLabel>
          <Select value={noteFilters.sortBy} onValueChange={(v) => setNoteFilters({...noteFilters, sortBy: v})}>
            <SelectTrigger className="w-full my-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
          <Select value={noteFilters.order} onValueChange={(v) => setNoteFilters({...noteFilters, order: v})}>
            <SelectTrigger className="w-full my-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </SidebarGroup>
        <SidebarFooter>
          <Button variant="default" onClick={onFiltersApply}>
            Apply
          </Button>
          <Button
            variant="secondary"
            onClick={onFiltersReset}
          >
            Reset Filters
          </Button>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}

export default FiltersSidebar;
