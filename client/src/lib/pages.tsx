import { Search, Library, Bookmark } from "lucide-react";

export const PAGES = [
  {
    title: "Explore",
    url: "/explore",
    icon: Search,
  },
  {
    title: "Library",
    url: "/library",
    icon: Library,
  },
  {
    title: "Vocabulary",
    url: "/vocabulary",
    icon: Bookmark,
  },
] as const;
