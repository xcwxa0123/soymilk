<template>
    <!-- LAYOUT ROOT -->
    <div class="layout-root">

        <!-- MAIN PANEL -->
        <div class="main-panel" :class=" { shrunk: previewChapter !== null } "  v-loading="loading">
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
                <!-- <div class="action-bar">
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
                </div> -->

                <!-- CHAPTER SECTION -->
                <div class="chapter-section">
                    <div class="volume-block" v-for="(vol, vi) in episodeResult" :key=" vol.chapter_key ">
                        <!-- VOLUME HEADER -->
                        <div class="volume-header" :class=" {
                            open: vol.expanded && !selectMode,
                            selected: selectMode && isVolumeSelected(vol),
                            'sel-mode': selectMode
                        } " @click="onVolumeClick(vol)">
                            <span class="volume-expand-icon" v-if="!selectMode">▶</span>
                            <span class="vol-num">VOL.{{ String((vi as number) + 1).padStart(2, '0') }}</span>
                            <span class="vol-title">{{ vol.list[0].main_title }}</span>
                            <span class="vol-meta">{{ vol.list.length }} 章</span>
                            <div class="sel-check" v-if="selectMode" :class=" { checked: isVolumeSelected(vol) } ">
                                <span v-if="isVolumeSelected(vol)">✓</span>
                            </div>
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
                    <!-- <p v-for="(para, i) in previewChapter.content" :key=" i ">{{ para }}</p> -->
                     <span>{{ previewChapter.content }}</span>
                </div>
            </div>
        </div>

    </div>

    <!-- DOWNLOAD CONFIRMATION DIALOG -->
    <!-- <transition name="overlay">
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
                            <span class="dl-chap-tag" v-for="chap in group.chapters" :key=" chap.id ">{{ chap.title
                            }}</span>
                        </div>
                    </div>
                </div>
                <div class="dl-dialog-foot">
                    <button class="dl-cancel-btn" @click="showDlDialog = false">取消</button>
                    <button class="dl-confirm-btn" @click=" confirmDownload ">↓ 确认下载</button>
                </div>
            </div>
        </div>
    </transition> -->
</template>
<style>
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
let polling: any = null


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
// const dlGroups = computed(() => {
//     if (!episodeResult.value) return [];
//     return episodeResult.value
//         .map((vol, vi) => ({
//             volId: vol.id,
//             volNum: `VOL.${ String(vi + 1).padStart(2, '0') }`,
//             volTitle: vol.title,
//             chapters: vol.chapters.filter(c => selectedChapters.has(c.id)),
//         }))
//         .filter(g => g.chapters.length > 0);
// });

const toggleSelectMode = () => {
    selectMode.value = !selectMode.value;
    if (!selectMode.value) {
        selectedChapters.clear();
    }
};

const isVolumeSelected = (vol: any) => vol.chapters.every((c: any) => selectedChapters.has(c.chapter_key));

const onVolumeClick = (vol: any) => {
    if (selectMode.value) {
        const allSel = isVolumeSelected(vol);
        vol.chapters.forEach((c: any) => {
            if (allSel) selectedChapters.delete(c.chapter_key);
            else selectedChapters.add(c.chapter_key);
        });
    } else {
        vol.expanded = !vol.expanded;
    }
};

const getEpisodeText = async (bookId: string, episodeId: string) => {
    const result = await $fetch<{
            code: number; 
            data: { file_content: string, file_name: string }; 
            msg: string 
    }>('/api/getEpisodeText', { method: 'POST', body: JSON.stringify({ bookId, episodeId }) })
    
    if(result && result.code === 200 && result.data){
        console.log('看看返回=========>', result)
        previewChapter.value.content = result.data.file_content
        // bookResult.value = result.data.bookResult
        // episodeResult.value = result.data.episodeResult
    } else {
        ElMessage({
            message: result?.msg || '请求失败',
            type: 'error',
            duration: 2200,
        });
        // toast.add({ severity: 'info', summary: 'Info', detail: result.msg || 'request fail', life: 3000 });
    }
    return result
}

const getEpisodeAddr = async (episodeId: string) => {
    const result = await $fetch<{
            code: number; 
            data: { file_addr: string, file_name: string }; 
            msg: string 
    }>('/api/getEpisodeAddr', { method: 'POST', body: JSON.stringify({ episodeId }) })
    
    // if(result && result.code === 200 && result.data){
    //     console.log('看看返回=========>', result)
    //     return result.data.file_addr
    //     // bookResult.value = result.data.bookResult
    //     // episodeResult.value = result.data.episodeResult
    // } else {
    //     ElMessage({
    //         message: result?.msg || '请求失败',
    //         type: 'error',
    //         duration: 2200,
    //     });
    // }
    return result
}

const onChapterClick = async (vol: any, chap: any) => {
    if (selectMode.value) {
        if (selectedChapters.has(chap.id)) selectedChapters.delete(chap.id);
        else selectedChapters.add(chap.id);
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
            await getEpisodeText(route.params.bookId as string, chap.episode_id)
            polling = await createPolling(() => getEpisodeAddr(chap.episode_id))
            polling.start(0, route.params.bookId as string, chap.episode_id)
            // const promise = new Promise(async res => {
            //     const result = await polling.start()
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

    const start = async (delay = 0, para1: any, para2: any) => {
        stopped = false;

        const loop = async (cDelay: number) => {
            console.log('轮询中，当前间隔：', cDelay)
            if (stopped) return;
            console.log('开始设置计时器')
            timerId = setTimeout(async () => {
                const result = await fn();
                if (result && result.code === 200 && result.data.file_addr) {
                    console.log('轮询成功，结果：', result)
                    stop();
                    textLoading.value = false
                    return;
                } else if (result?.code === 500){
                    // 失败了，继续轮询
                    const errMsg = result?.msg || '请求失败';
                    ElMessage({
                        message: `获取章节内容失败，${ errMsg }，正在重试...`,
                        type: 'error',
                        duration: 1000,
                    });
                }
                await loop(Math.min(cDelay + 500, 5000));
            }, cDelay);
        };

        const result = await loop(delay);
        return result;
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
    polling.stop()
};

const downloadSelected = () => {
    if (selectedChapters.size === 0) return;
    showDlDialog.value = true;
};

const confirmDownload = () => {
    showDlDialog.value = false;
    ElMessage({ message: `已将 ${ selectedChapters.size } 章加入下载队列`, type: 'success', duration: 2200 });
};

onUnmounted( () => { if(polling) polling.stop() } )

</script>