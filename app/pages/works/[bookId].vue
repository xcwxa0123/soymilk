<template>
    <!-- LAYOUT ROOT -->
    <div class="layout-root" v-loading="loading">

        <!-- MAIN PANEL -->
        <div class="main-panel" :class=" { shrunk: previewChapter !== null } ">
            <div class="inner">

                <!-- BOOK HERO -->
                <div class="book-hero">
                    <div class="book-eyebrow">小说详情</div>
                    <h1 class="book-title">{{ bookResult?.book_title }}</h1>
                    <div class="book-meta-row">
                        <span class="meta-chip chip-author"><el-icon><EditPen /></el-icon> {{ bookResult?.author?.author_name }}</span>
                        <span class="meta-chip"
                            :class=" bookResult?.publish_state == '0' ? 'chip-status-serial' : 'chip-status-done' ">
                            {{ bookResult?.publish_state == '1' ? '连载中' : '已完本' }}
                        </span>
                        <span class="meta-chip chip-update"><el-icon><Timer /></el-icon> {{ bookResult?.last_time }}</span>
                        <span class="meta-chip chip-chapters"><el-icon><Memo /></el-icon> 共 {{ bookResult?.number_of_episode }} </span>
                    </div>
                    <div class="book-desc-box">
                        <p class="book-desc">{{ bookResult?.full_desc }}</p>
                    </div>
                </div>

                <hr class="divider" />

                <!-- ACTION BAR -->
                <!-- 先做单选 -->
                <div class="action-bar">
                    <div class="action-left">
                        <button class="select-btn" :class=" { active: selectMode } " @click=" toggleSelectMode ">
                            <span>{{ selectMode ? '✓' : '☐' }}</span>
                            <span>{{ selectMode ? '退出选择' : '选择模式' }}</span>
                        </button>
                        <transition name="fade">
                            <div class="select-info" v-if="selectMode">
                                <div class="select-count">{{ selectedChapters.size }}</div>
                                <span>已选章节</span>
                                <button class="download-sel-btn" v-if="selectedChapters.size > 0"
                                    @click=" downloadSelected ">
                                    ↓ 下载选中
                                </button>
                            </div>
                        </transition>
                    </div>
                    <div class="action-right">
                        <span>{{ episodeResult.length }} 章</span>
                        <span>·</span>
                        <span>{{ bookResult.number_of_episode }} </span>
                    </div>
                </div>

                <!-- CHAPTER SECTION -->
                <div class="chapter-section">
                    <div class="volume-block" v-for="(vol, vi) in episodeResult" :key=" vol.chapter_key ">
                        <!-- VOLUME HEADER -->
                        <!-- <div class="volume-header" :class=" {
                            open: vol.expanded && !selectMode,
                            selected: selectMode && isVolumeSelected(vol),
                            'sel-mode': selectMode
                        } " @click="onVolumeClick(vol)"> -->
                         <div class="volume-header" :class=" {
                            open: vol.expanded && !selectMode,
                            selected: selectMode && isVolumeSelected(vol),
                            'sel-mode': selectMode
                        } " @click="onVolumeClick(vol)">
                            <span class="volume-expand-icon" v-if="!selectMode">▶</span>
                            <span class="vol-num">VOL.{{ String((vi as number) + 1).padStart(2, '0') }}</span>
                            <span class="vol-title">{{ vol.list[0].main_title }}</span>
                            <span class="vol-meta">{{ vol.list.length }} 章</span>
                            <!-- <div class="sel-check" v-if="selectMode" :class=" { checked: isVolumeSelected(vol) } ">
                                <span v-if="isVolumeSelected(vol)">✓</span>
                            </div> -->
                        </div>

                        <!-- CHAPTERS -->
                        <div class="chapters-container" :class=" { open: vol.expanded || selectMode } ">
                            <div class="chapters-grid">
                                <div class="chapter-item" v-for="(chap, ci) in vol.list" :key=" chap.episode_id " :class=" {
                                    selected: selectMode && selectedChapters.has(chap.episode_id),
                                    'preview-active': !selectMode && previewChapter && previewChapter.id === chap.episode_id
                                } " @click="onChapterClick(vol, chap)">
                                    <span class="chap-num">{{ String(chap.global_index + 1).padStart(3, '0') }}</span>
                                    <span class="chap-title" :title=" chap.sub_title ">{{ chap.sub_title }}</span>
                                    <div class="chap-sel-check" v-if="selectMode"
                                        :class=" { checked: selectedChapters.has(chap.episode_id) } ">
                                        <span v-if="selectedChapters.has(chap.episode_id)">✓</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- PREVIEW PANEL -->
        <div class="preview-panel" v-if="previewChapter">
            <div class="preview-head">
                <div class="preview-close-btn">
                    <button class="close-btn" @click=" closePreview " title="关闭预览">✕</button>
                </div>
                <div class="preview-vol-label">{{ previewVolTitle }}</div>
                <div class="preview-chap-title">{{ previewChapter.sub_title }}</div>
                <div class="preview-meta">
                    <span><el-icon><Timer /></el-icon> {{ previewChapter.refresh_time }}</span>
                    <span>· 第 {{ previewChapter.global_index + 1 }} 章</span>
                </div>
            </div>
            <div class="preview-body" v-loading="textLoading">
                <div class="preview-text">
                     <span>{{ previewChapter.content }}</span>
                </div>
            </div>
        </div>

    </div>

    <!-- DOWNLOAD CONFIRMATION DIALOG -->
    <transition name="overlay">
        <div class="dl-dialog-overlay" v-if="showDlDialog" @click.self="showDlDialog = false">
            <div class="dl-dialog">
                <div class="dl-dialog-head">
                    <div>
                        <div class="dl-dialog-title">确认下载</div>
                        <div class="dl-dialog-subtitle">共选中 {{ selectedChapters.size }} 章，请确认以下内容</div>
                    </div>
                    <button class="close-btn" @click="showDlDialog = false">✕</button>
                </div>
                <div class="dl-dialog-body">
                    <div class="dl-vol-block" v-for="group in dlGroups" :key=" group.volId ">
                        <div class="dl-vol-title">
                            <span class="dl-vol-badge">{{ group.volNum }}</span>
                            <span class="dl-vol-name">{{ group.volTitle }}</span>
                            <span class="dl-vol-count">{{ group.chapters.length }} 章</span>
                        </div>
                        <div class="dl-chaps">
                            <span class="dl-chap-tag" v-for="chap in group.chapters" :key=" chap.episode_id ">
                                {{ chap.sub_title }}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="dl-dialog-foot">
                    <button class="dl-cancel-btn" @click="showDlDialog = false">取消</button>
                    <button class="dl-confirm-btn" @click=" confirmDownload ">↓ 确认下载</button>
                </div>
            </div>
        </div>
    </transition>
</template>
<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateX(-8px);
}
</style>
<script setup lang="ts">

const selectMode = ref(false);
const selectedChapters = reactive(new Set());
// -TODO
const previewChapter: any = ref(null);
const previewVolTitle = ref('');
const showDlDialog = ref(false);
const loading = ref(false)
const textLoading = ref(false)
const router = useRouter()
const route = useRoute()
let textPolling: any = null
let downloadPolling: any = null
const cEpiId = ref<string | null>(null) // 当前章节id
// const cEpititle = ref<string | null>(null) // 当前章节标题
// const cChapTitle = ref<string | null>(null) // 当前卷标题


import { EditPen, Memo, Timer } from '@element-plus/icons-vue'


const bookResult: any = ref({});
const episodeResult: any = ref([]);
const getBookDetail = async (bookId: string) => {
    loading.value = true
    const result = await $fetch<{ code: number; data: { bookResult: any; episodeResult: [] }; msg: string }>('/api/getPageDetail', { method: 'POST', body: JSON.stringify({ bookId }) })
    if(result && result.code === 200 && result.data){
        bookResult.value = result.data.bookResult
        episodeResult.value = result.data.episodeResult
    } else {
        ElMessage({
            message: result?.msg || '请求失败',
            type: 'error',
            duration: 2200,
        });
        // toast.add({ severity: 'info', summary: 'Info', detail: result.msg || 'request fail', life: 3000 });
    }
    loading.value = false
}

await getBookDetail(route.params.bookId as string)

// Build grouped list for the dialog
const dlGroups = computed(() => {
    if (!episodeResult.value) return [];
    return episodeResult.value
        .map((vol: any, vi: any) => ({
            volId: vol.chapter_key,
            volNum: `VOL.${ String(vi + 1).padStart(2, '0') }`,
            volTitle: vol.main_title,
            chapters: vol.list.filter((c: any) => selectedChapters.has(c.episode_id)),
        }))
        .filter((g: any) => g.chapters.length > 0);
});

const toggleSelectMode = () => {
    selectMode.value = !selectMode.value;
    // if (!selectMode.value) {
    selectedChapters.clear();
    if(cEpiId.value){
        selectedChapters.add(cEpiId.value)
    }
    // }
};

const isVolumeSelected = (vol: any) => vol.list.every((c: any) => selectedChapters.has(c.episode_id));

// 先做单选
const onVolumeClick = (vol: any) => {
    // if (selectMode.value) {
    //     const allSel = isVolumeSelected(vol);
    //     vol.list.forEach((c: any) => {
    //         if (allSel) selectedChapters.delete(c.episode_id);
    //         else selectedChapters.add(c.episode_id);
    //     });
    // } else {
        vol.expanded = !vol.expanded;
    // }
};

const getEpisodeText = async (bookId: string, episodeId: string) => {
    const result = await $fetch<{
            code: number; 
            data: { file_content: string, file_name: string, status: string }; 
            msg: string 
    }>('/api/getEpisodeText', { method: 'POST', body: JSON.stringify({ bookId, episodeId }) })
    
    return result
}

const getEpisodeStatus = async (episodeId: string) => {
    const result = await $fetch<{
            code: number; 
            data: { status: string }; 
            msg: string 
    }>('/api/getEpisodeStatus', { method: 'POST', body: JSON.stringify({ episodeId }) })
    
    return result
}

const getEpisodeFile = async (episodeId: string) => {
    console.log('看看你点了啥===========>episodeId', episodeId)
    const result: any = await fetch('/api/getEpisodeFile', {
        method: 'POST',
        body: JSON.stringify({ episodeId }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const disposition = result.headers.get('content-disposition') || ''
    console.log('看看下载接口的disposition是什么=========>', disposition)
    let filename = 'default.txt'
    const match = disposition.match(/filename\*?=(?:UTF-8'')?"?(.+?)"?$/)
    if (match && match[1]) filename = decodeURIComponent(match[1])

    // const blob = new Blob([result], {
    //     type: 'application/octet-stream'
    // });
    const blob = await result.blob()
    console.log('看看下载接口的blob是什么=========>', blob)

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    loading.value = false;
    ElMessage({
        message: '下载成功',
        type: 'success',
        duration: 2200,
    });
}

const onChapterClick = async (vol: any, chap: any) => {
    cEpiId.value = chap.episode_id
    // cEpititle.value = chap.sub_title
    // cChapTitle.value = vol.list[0].main_title
    if (selectMode.value) {
        if (selectedChapters.has(chap.episode_id)) {
            selectedChapters.delete(chap.episode_id);
        } else {
            // selectedChapters.add(chap.episode_id);
            // 先做单选
            selectedChapters.clear();
            selectedChapters.add(chap.episode_id);
        }
    } else {
        if (previewChapter.value && previewChapter.value.episode_id === chap.episode_id) {
            closePreview();
        } else {
            console.log('进来这里了捏=============>chap', chap)
            console.log('进来这里了捏=============>vol', vol)
            // 发预览了捏
            previewChapter.value = chap;
            previewVolTitle.value = vol.list[0].main_title;
            textLoading.value = true

            // 通讯，看结果，如果结果有值就放上去，没有值就开启轮询
            // await getEpisodeText(route.params.bookId as string, chap.episode_id)
            textPolling = await createPolling(async () => await getEpisodeText(route.params.bookId as string, chap.episode_id))
            await textPolling.start(0,
                (result: any) => {
                    console.log('看看返回=========>', result)
                    // 如果完成了就拉，然后终止，不然继续轮询
                    if(result.data.status == 'done'){
                        console.log('轮询成功，结果：', result)
                        previewChapter.value.content = result.data.file_content
                        textLoading.value = false
                        textPolling.stop();
                    }
                }, 
                () =>{
                    ElMessage({
                        message: '通讯失败',
                        type: 'info',
                        duration: 1000,
                    })
                    textPolling.stop();
                }
            )
            // const promise = new Promise(async res => {
            //     const result = await textPolling.start()
            //     console.log('轮询结果=========>', result)
            //     res(result)
            // })
            // promise.then(async () => { 
            //     await getEpisodeText(route.params.bookId as string, chap.episode_id) 
            //     textLoading.value = false
            // })
        }
    }
};

const createPolling = async (fn: Function) => {
    let timerId: any = null;
    let stopped = false;

    const start = async (delay = 0, resolve: Function, reject: Function) => {
        stopped = false;

        const loop = async (cDelay: number) => {
            console.log('轮询中，当前间隔：', cDelay)
            if (stopped) return;
            console.log('开始设置计时器')
            timerId = setTimeout(async () => {
                const result = await fn();
                console.log('轮询函数返回：', result)
                if(result && result.code === 200 && result.data){
                    resolve(result)
                } else {
                    ElMessage({
                        message: result?.msg || '请求失败',
                        type: 'error',
                        duration: 2200,
                    });
                    reject()
                }
                await loop(Math.min(cDelay + 500, 5000));
            }, cDelay);
        };

        await loop(delay);
    }

    const stop = () => {
        stopped = true;
        if (timerId) {
            clearTimeout(timerId);
            timerId = null;
        }
    };

    return { start, stop };
}


const closePreview = () => {
    previewChapter.value = null; 
    textPolling.stop()
    cEpiId.value = null
};

const downloadSelected = () => {
    if (selectedChapters.size === 0) return;
    showDlDialog.value = true;
};

const confirmDownload = async () => {
    showDlDialog.value = false;
    if (!cEpiId.value) return;
    loading.value = true;
    ElMessage({ message: `已将 ${ selectedChapters.size } 章加入下载队列`, type: 'success', duration: 2200 });
    downloadPolling = await createPolling(async () => await getEpisodeStatus(cEpiId.value as string))
    await downloadPolling.start(0,
        async (result: any) => {
            if(result.data.status == 'done'){
                downloadPolling.stop();
                // 直接下载
                console.log('看看到这个位置参数怎么样了=======>', cEpiId.value)
                await getEpisodeFile(cEpiId.value as string)
            } else {
                ElMessage({
                    message: '章节内容正在下载中，请稍候...',
                    type: 'info',
                    duration: 1000,
                })
            }

        }, 
        () =>{
            ElMessage({
                message: '章节内容正在下载中，请稍候...',
                type: 'info',
                duration: 1000,
            })
        }
    )
};

onUnmounted( () => {
    if(textPolling) textPolling.stop() 
    if(downloadPolling) downloadPolling.stop() 
    cEpiId.value = null
} )

</script>