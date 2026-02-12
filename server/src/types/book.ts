export interface BookDTO {
  id: string;
  title: string;
  author: string;
  language: string;
  imageUrl?: string;
  wordCount?: number;
}

export interface BookDetailDTO extends BookDTO {
  description?: string;
  subjects: string[];
}

export interface PaginatedBooksDTO {
  data: BookDTO[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
