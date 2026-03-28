export default defineEventHandler(async event => {
    const config = useRuntimeConfig()
    try {
        // const result: { results?: any } = await kakuyomuApi().getTitleList()
        // // console.log('看看到这的result是啥', result)
        // const resData = {
        //     data: result['results'],
        //     code: 200,
        //     msg: 'success'
        // }
        return "testData"
    } catch (error) {
        return { data: { apiAdress: config.public.apiBaseUrl }, code: 500, msg: String(error) }
    }
})