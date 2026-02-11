export interface BookListDTO {
  id: string;
  title: string;
  author: string;
  language: string;
  imageUrl?: string;
  wordCount?: number;
}

export interface BookDetailDTO extends BookListDTO {
  description?: string;
  subjects: string[];
}

export interface PaginatedBooksDTO {
  data: BookListDTO[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
