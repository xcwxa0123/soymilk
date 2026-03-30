// type kakuyomuApiText = keyof KakuyomuApiClass
class KakuyomuApiClass{
    // API_BASE_URL = process.env.API_BASE_URL || 'http://www.yuri.services';
    API_BASE_URL = useRuntimeConfig().public.apiBaseUrl;
    // 获取book列表
    public async getTitleList(): Promise<any>{
        return await $fetch(`${this.API_BASE_URL}/implapi/books/list`, { method: 'GET' })
    }

    // 获取book详情
    public async getBookDetail(book_id: string): Promise<any>{
        return await $fetch(`${this.API_BASE_URL}/implapi/books/list/${book_id}`, { method: 'GET' })
    }

    // 获取episode列表
    public async getEpisodeList(book_id: string): Promise<any>{
        return await $fetch(`${this.API_BASE_URL}/implapi/episode/viewlist/?book=${book_id}`, { method: 'GET' })
    }

    // 获取episode文本
    public async getEpisodeText(book_id: string, episode_id: string): Promise<any>{
        return await $fetch(`${this.API_BASE_URL}/implapi/episode/text?bookId=${book_id}&episodeId=${episode_id}`, { method: 'GET' })
    }
    // 获取episode文件
    public async getEpisodeFile(book_id: string, episode_id: string): Promise<any>{
        return await $fetch(`${this.API_BASE_URL}/implapi/episode/getFile?bookId=${book_id}&episodeId=${episode_id}`, { method: 'GET', responseType: 'blob' })
        // return `${process.env.API_BASE_URL}/implapi/episode/getFile?bookId=${book_id}&episodeId=${episode_id}`
    }
        // 获取episode地址
    public async getEpisodeAddr(episode_id: string): Promise<any>{
        return await $fetch(`${this.API_BASE_URL}/implapi/episode/getAddr?episodeId=${episode_id}`, { method: 'GET' })
        // return `${process.env.API_BASE_URL}/implapi/episode/getFile?bookId=${book_id}&episodeId=${episode_id}`
    }
    // 刷新book的episode列表，同时刷book的full_des
    public async uploadEpisode(book_id: string): Promise<any>{
        return await $fetch(`${this.API_BASE_URL}/implapi/episode/updateEpisode`, { method: 'POST', body: JSON.stringify({ bookId: book_id }) })
    }
    // 获取搜索列表
    public async getSearchedList(search_name: string, page_index: number): Promise<any>{
        return await $fetch(`${this.API_BASE_URL}/implapi/books/getSearchedList?searchName=${search_name}&pageIndex=${page_index}`, { method: 'GET' })
    }
    // 获取搜索列表
    public async getSearchedBook(book_data: object): Promise<any>{
        return await $fetch(`${this.API_BASE_URL}/implapi/books/getSearchedBook`, { method: 'POST', body: JSON.stringify({ bookData: book_data }) })
    }
}
export default () => {
    return new KakuyomuApiClass()
}