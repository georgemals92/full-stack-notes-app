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

// Props schema
interface FiltersSidebarProps {
  searchQuery: string;
  setSearchQuery(q: string): void;
  allCategories: Category[];
  filterCategories: string[];
  setFilterCategories(c: string[]): void;
  allTags: Tag[];
  filterTags: string[];
  setFilterTags(t: string[]): void;
  order: string;
  setOrder(o: string): void;
  sortBy: string;
  setSortBy(s: string): void;
  onFiltersReset() : void;
  onFiltersApply() : void;
}

// Filters Sidebar Component

function FiltersSidebar(props: FiltersSidebarProps) {
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
            value={props.searchQuery}
            id="search"
            onChange={(e) => props.setSearchQuery(e.target.value)} //Standard HTML event listener
          ></Input>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Filter by Category</SidebarGroupLabel>
          <ScrollArea className="max-h-40 overflow-y-auto">
            {props.allCategories.map((c) => (
              <div key={c._id} className="flex items-center gap-2 h-8">
                <Checkbox
                  id={`cat-${c._id}`}
                  checked={props.filterCategories.includes(c._id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      props.setFilterCategories([
                        ...props.filterCategories,
                        c._id,
                      ]);
                    } else {
                      props.setFilterCategories(
                        props.filterCategories.filter((id) => id !== c._id)
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
            {props.allTags.map((t) => (
              <div key={t._id} className="flex items-center gap-2 h-8">
                <Checkbox
                  id={`tag-${t._id}`}
                  checked={props.filterTags.includes(t._id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      props.setFilterTags([...props.filterTags, t._id]);
                    } else {
                      props.setFilterTags(
                        props.filterTags.filter((id) => id !== t._id)
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
          <Select value={props.sortBy} onValueChange={props.setSortBy}>
            <SelectTrigger className="w-full my-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
          <Select value={props.order} onValueChange={props.setOrder}>
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
          <Button variant="default" onClick={props.onFiltersApply}>
            Apply
          </Button>
          <Button
            variant="secondary"
            onClick={props.onFiltersReset
              // To check: Here we call the loadNote function without accounting for state, might lead to inconsistency.
              // If we call loadNotes(buildQuery()) it takes two clicks to reset
              // Thought: might need to add the filters as a dependency in useEffect Hook? --> currently called only during initial render
            }
          >
            Reset Filters
          </Button>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}

export default FiltersSidebar;
