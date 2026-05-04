import {
  Search,
  Library,
  Bookmark,
  BarChart3,
  GraduationCap,
} from "lucide-react";

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
    title: "Exercises",
    url: "/exercises",
    icon: GraduationCap,
  },
  {
    title: "Progress",
    url: "/stats",
    icon: BarChart3,
  },
] as const;
