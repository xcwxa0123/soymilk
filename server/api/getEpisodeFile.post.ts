export default defineEventHandler(async event => {
    const API_BASE_URL = useRuntimeConfig().public.apiBaseUrl;
    const dataBody = await readBody(event)
    console.log('看看dataBody是什么=========>', dataBody.episodeId);
    try {
        const result: any = await fetch(`${API_BASE_URL}/implapi/episode/getFile?episodeId=${dataBody.episodeId}`, {
            method: 'GET',
            // raw: true
            // responseType: 'blob' 
        })
        // const result = await kakuyomuApi().getEpisodeFile(dataBody.episodeId)
        console.log('看看直接返回出来的result是什么=========>', result);
        const blob = await result.blob()
        console.log('看看直接返回出来的blob是什么=========>', blob);
        // const buffer = Buffer.from(await blob.arrayBuffer())
        // event.node.res.setHeader('Content-Type', 'application/octet-stream')
        // event.node.res.setHeader('Content-Disposition', result.headers.get('content-disposition'))
        // event.node.res.end(buffer)
        // 文件流形式，不需要组装
        return new Response(blob, {
            headers: {
                'Content-Type': result.headers.get('content-type') || 'application/octet-stream',
                'Content-Disposition' : result.headers.get('content-disposition')
            }
        })

    } catch (error) {
        console.log('error============>', error)
        return autoResponseBody({ data: {}, code: 500, msg: String(error) })
        // return new ArrayBuffer(0)
    }
})