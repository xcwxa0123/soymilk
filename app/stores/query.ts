import type { Book } from "~/types/book";

export const useQueryStore = defineStore('query', {
    state: () => ({
         searchQuery: '', 
         activeQuery: '',
         allNovels: [] as Book[],
    }),
    // getters: {
    //     // doubleCount: (state) => state.count * 2,
    // },
    // actions: {
    //     increment() {
    //         // this.count++
    //     },
    // },
})