export default defineEventHandler(async event => {
    const config = useRuntimeConfig()
    try {
        const result: { results?: any } = await kakuyomuApi().getTitleList()
        const resData = {
            data: result['results'] as unknown,
            code: 200,
            msg: 'success'
        }
        return resData
    } catch (error) {
        return { data: { apiAdress: config.public.apiBaseUrl }, code: 500, msg: String(error) }
    }
})