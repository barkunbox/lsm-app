"use client";

import { Search } from "lucide-react"
import { Input } from "./ui/input"
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter, usePathname } from "next/navigation";
import qs from "query-string";

interface SearchInputProps {
  initialValue?: string;
  initialCategoryId?: string;
}

export const SearchInput = ({ 
  initialValue = "", 
  initialCategoryId = "" 
}: SearchInputProps) => {
  const [value, setValue] = useState(initialValue);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const debouncedValue = useDebounce(value);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const url = qs.stringifyUrl({
      url: pathname,
      query: {
        categoryId: categoryId,
        title: debouncedValue,
      },
    }, { skipEmptyString: true, skipNull: true });
    
    router.push(url);
  }, [debouncedValue, categoryId, router, pathname]);

  // Update categoryId if it changes from parent
  useEffect(() => {
    setCategoryId(initialCategoryId);
  }, [initialCategoryId]);

  return (
    <div className="relative">
      <Search 
        className="h-4 w-4 absolute top-3 left-3 text-slate-600"
      />
      <Input 
        onChange={(e) => setValue(e.target.value)}
        value={value}
        className="w-full md:w-[300px] pl-9 rounded-full bg-slate-100 focus-visible:ring-slate-200"
        placeholder="Search for a course"
      />
    </div>
  )
}