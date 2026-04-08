import { Search, Library, Bookmark, BarChart3 } from "lucide-react";

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
  {
    title: "Progress",
    url: "/stats",
    icon: BarChart3,
  },
] as const;
