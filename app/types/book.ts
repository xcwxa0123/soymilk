import type { Author } from "./author";
export interface Book {
    author: Author,
    book_desc: string,
    book_id: string,
    book_title: string,
    full_desc: string,
    hot_rank: number,
    last_time: string,
    number_of_episode: string,
    publish_state: number
}