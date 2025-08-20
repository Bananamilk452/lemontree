"use client";

import { SearchIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { cn } from "~/utils";

interface SearchBarProps {
  searchInput?: string;
  semanticSearchEnabled?: boolean;
  sortOrder?: string;
  onSearch: ({
    searchInput,
    semanticSearch,
    sort,
  }: {
    searchInput: string;
    semanticSearch: boolean;
    sort: string;
  }) => void;
}

export function SearchBar(props: SearchBarProps) {
  const [searchInput, setSearchInput] = useState(props.searchInput || "");
  const [semanticSearchEnabled, setSemanticSearchEnabled] = useState<boolean>(
    props.semanticSearchEnabled ?? true,
  );
  const [sortOrder, setSortOrder] = useState(props.sortOrder ?? "accuracy");

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "rounded-md p-[2px] transition-colors",
          semanticSearchEnabled
            ? "bg-linear-to-r from-[#FFFF42] from-60% to-green-400"
            : "bg-border",
        )}
      >
        <Input
          className="rounded-[6px] border-transparent bg-white"
          placeholder="검색어를 입력하세요"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              props.onSearch({
                searchInput,
                semanticSearch: semanticSearchEnabled,
                sort: sortOrder,
              });
            }
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="semantic-search"
              checked={semanticSearchEnabled}
              onCheckedChange={setSemanticSearchEnabled}
            />
            <Label htmlFor="semantic-search" className="shrink-0">
              시맨틱 검색
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger id="sort" className="">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="accuracy">정확도순</SelectItem>
                  <SelectItem value="latest">최신순</SelectItem>
                  <SelectItem value="oldest">오래된순</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={() =>
            props.onSearch({
              searchInput,
              semanticSearch: semanticSearchEnabled,
              sort: sortOrder,
            })
          }
        >
          <SearchIcon />
          검색
        </Button>
      </div>
    </div>
  );
}
