export interface Book {
  id: string;
  title: string;
  author: string;
  language: string;
  wordCount?: number;
}

export interface BookDetail extends Book {
  description?: string;
  subjects: string[];
}

export interface PaginatedBooks {
  data: Book[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
