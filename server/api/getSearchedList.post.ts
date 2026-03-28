export default defineEventHandler(async event => {
    const dataBody = await readBody(event)
    try {
        const result: string = await kakuyomuApi().getSearchedList(dataBody.searchName, dataBody.pageIndex)
        const resData = JSON.parse(result)
        return autoResponseBody({ ...resData })
    } catch (error) {
        return autoResponseBody({ data: {}, code: 500, msg: String(error) })
    }
})