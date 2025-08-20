"use client";

import { useRouter } from "next/navigation";

import { SearchBar } from "~/components/search/SearchBar";

interface SearchParams {
  searchInput: string;
  semanticSearch: boolean;
  sort: string;
}

export function SearchPage() {
  const router = useRouter();

  function onSearch({ searchInput, semanticSearch, sort }: SearchParams) {
    const searchParams = new URLSearchParams();
    searchParams.set("q", searchInput);
    searchParams.set("semantic", String(semanticSearch));
    searchParams.set("sort", sort);

    router.push(`/diary/search/1?${searchParams.toString()}`);
  }

  return (
    <>
      <SearchBar onSearch={onSearch} />

      <hr className="my-6" />
    </>
  );
}
