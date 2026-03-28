export default defineEventHandler(async event => {
    const dataBody = await readBody(event)
    // try {
    //     const result: string = await kakuyomuApi().uploadEpisode(dataBody.bookId)
    //     getEpisodeList
    //     const resData = JSON.parse(result)
    //     return { ...resData }
    // } catch (error) {
    //     return { data: {}, code: 500, msg: String(error) }
    // }
    const config = useRuntimeConfig()
    try {
        await kakuyomuApi().uploadEpisode(dataBody.bookId)
        console.log('服务端更新走了=======>')
        const result: { results?: any } = await kakuyomuApi().getEpisodeList(dataBody.bookId)
        console.log('服务端拿列表=======>', result)
        const resData = {
            data: result as unknown,
            code: 200,
            msg: 'success'
        }
        return resData
    } catch (error) {
        return { data: { apiAdress: config.public.apiBaseUrl }, code: 500, msg: String(error) }
    }
})