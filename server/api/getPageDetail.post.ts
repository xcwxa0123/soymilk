export default defineEventHandler(async event => {
    const dataBody = await readBody(event)
    try {
        const bookResult = await kakuyomuApi().getBookDetail(dataBody.bookId)
        const episodeResult = await kakuyomuApi().getEpisodeList(dataBody.bookId)
        const resData = {
            data: { bookResult, episodeResult },
            code: 200,
            msg: 'success'
        }
        return autoResponseBody({ ...resData })
    } catch (error) {
        return autoResponseBody({ data: {}, code: 500, msg: String(error) })
    }
})