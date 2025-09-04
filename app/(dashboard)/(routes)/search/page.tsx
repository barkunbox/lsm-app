import { db } from "@/lib/db";
import { Categories } from "./_components/categories";
import { SearchInput } from "@/components/search-input";
import { getCourses } from "@/actions/get-courses";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CoursesList } from "@/components/courses-list";

interface SearchPageProps {
  searchParams: Promise<{
    title: string;
    categoryId: string;
  }>
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }

  const categories = await db.categories.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const resolvedParams = await searchParams;
  const courses = await getCourses({
    userId,
    ...resolvedParams,
  });

  return (
    <>
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <SearchInput 
          initialValue={resolvedParams.title} 
          initialCategoryId={resolvedParams.categoryId}
        />
      </div>
      <div className="p-6 space-y-4">
        <Categories items={categories} />
        <CoursesList items={courses} />
      </div>    
    </>
  );
}
 
export default SearchPage;