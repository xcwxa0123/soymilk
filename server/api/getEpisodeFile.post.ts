export default defineEventHandler(async event => {
    
    const dataBody = await readBody(event)
    try {
        const result = await kakuyomuApi().getEpisodeFile(dataBody.bookId, dataBody.episodeId)
        const buffer = Buffer.from(await result.arrayBuffer())
        event.node.res.setHeader('Content-Type', 'application/octet-stream')
        event.node.res.end(buffer)
        // 文件流形式，不需要组装

    } catch (error) {
        console.log('error============>', error)
        return autoResponseBody({ data: {}, code: 500, msg: String(error) })
        // return new ArrayBuffer(0)
    }
})