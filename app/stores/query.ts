export const useQueryStore = defineStore('query', {
    state: () => ({
         searchQuery: '', 
         activeQuery: '' 
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