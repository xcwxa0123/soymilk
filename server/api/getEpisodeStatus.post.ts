export default defineEventHandler(async event => {
    const dataBody = await readBody(event)
    try {
        const result: any = await kakuyomuApi().getEpisodeStatus(dataBody.episodeId)
        const resData = JSON.parse(result)
        return autoResponseBody(resData)
    } catch (error) {
        return autoResponseBody({ data: {}, code: 500, msg: String(error) })
    }
})