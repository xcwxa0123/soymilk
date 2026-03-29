<template>
    <!-- LAYOUT ROOT -->
    <div class="layout-root">

        <!-- MAIN PANEL -->
        <div class="main-panel" :class=" { shrunk: previewChapter !== null } "  v-loading="loading">
            <div class="inner">

                <!-- BOOK HERO -->
                <div class="book-hero">
                    <div class="book-eyebrow">小说详情</div>
                    <h1 class="book-title">{{ bookResult.book_title }}</h1>
                    <div class="book-meta-row">
                        <span class="meta-chip chip-author"><el-icon><EditPen /></el-icon> {{ bookResult.author.author_name }}</span>
                        <span class="meta-chip"
                            :class=" bookResult.publish_state == '0' ? 'chip-status-serial' : 'chip-status-done' ">
                            {{ bookResult.publish_state == '1' ? '连载中' : '已完本' }}
                        </span>
                        <span class="meta-chip chip-update"><el-icon><Timer /></el-icon> {{ bookResult.last_time }}</span>
                        <span class="meta-chip chip-chapters"><el-icon><Memo /></el-icon> 共 {{ bookResult.number_of_episode }} </span>
                    </div>
                    <div class="book-desc-box">
                        <p class="book-desc">{{ bookResult.full_desc }}</p>
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
            <div class="preview-body">
                <div class="preview-text">
                    <p v-for="(para, i) in previewChapter.content" :key=" i ">{{ para }}</p>
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
const router = useRouter()
const route = useRoute()

import { EditPen, Memo, Timer } from '@element-plus/icons-vue'

// ── BOOK DATA ──
const chapContents = {
    default: [
        '周明瑞猛地从床上坐起，大口喘着粗气。窗外的煤气路灯透过薄薄的窗帘投下昏黄的光晕，将这间狭小的公寓照得如同一幅褪色的油画。',
        '他抬起手，看着自己的手掌，感受着它真实的重量与温度。一切都是那么真实，又那么陌生。',
        '桌上那本蓝色封皮的日记仍静静躺在那里，像一个沉默的审判者。他已经不记得自己是第几次将它翻开、又第几次将它合上了。',
        '窗外传来了马车轮子碾过石板路的声音，还有远处礼拜堂沉重的钟声。这不是他的世界，却又是他必须在其中生存下去的世界。',
        '周明瑞深吸一口气，将思绪从混乱中拉回来。他是一个现代人，他知道这个世界未来的走向，他掌握着来自另一个时代的知识。这，就是他最大的武器。',
        '"克莱恩·莫雷蒂，"他轻声念出那个名字，就好像在召唤另一个自己，"你准备好了吗？"',
        '蜡烛轻轻跳动了一下，屋子里的影子随之舞动，像是某种无言的回应。',
    ]
};

const makeContent = (chapTitle: string) => [
    `${ chapTitle }——这一章的故事，就从这里开始。`,
    '晨雾尚未散去，石板路上还留着昨夜雨水的痕迹。克莱恩将衣领竖起，穿过熙熙攘攘的集市，试图在喧嚣中找到某种确定性。',
    '他的脑海中不断回放着那些支离破碎的梦境：高高在上的王座，无尽的黑暗，以及那个反复出现的声音——"高高在上，超然物外。"',
    '前方的街角，一个身穿暗红色长袍的老人正用浑浊的眼睛打量着他。克莱恩本能地放慢了脚步。在这个充满危险的世界里，任何异常都可能是致命的信号。',
    '他悄悄将手伸进外套口袋，指尖触碰到那张叠得整整齐齐的纸——上面写着他通过祈祷得到的神秘序列知识。知识就是力量，在这里更是如此。',
    '老人转过身去，消失在巷口的阴影中。克莱恩慢慢呼出一口气，继续向前走，心中默默盘算着下一步的计划。',
    '这个世界有神，有魔，有无数以人类之躯追逐神性的存在。而他，一个来自另一个世界的普通人，又将在其中留下怎样的印记？',
];

let globalIdx = 1;

const bookResult: any = ref(null);
const episodeResult: any = ref(null);
const getBookDetail = async (bookId: string) => {
    loading.value = true
    const result = await $fetch<{ code: number; data: { bookResult: any; episodeResult: [] }; msg: string }>('/api/getPageDetail', { method: 'POST', body: JSON.stringify({ bookId }) })
    if(result && result.code === 200 && result.data){
        console.log('看看返回=========>', result)
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

const onChapterClick = (vol: any, chap: any) => {
    if (selectMode.value) {
        if (selectedChapters.has(chap.id)) selectedChapters.delete(chap.id);
        else selectedChapters.add(chap.id);
    } else {
        if (previewChapter.value && previewChapter.value.episode_id === chap.episode_id) {
            closePreview();
        } else {
            console.log('进来这里了捏=============>chap', chap)
            console.log('进来这里了捏=============>vol', vol)
            previewChapter.value = chap;
            previewVolTitle.value = vol.list[0].main_title;
        }
    }
};

const closePreview = () => { previewChapter.value = null; };

const downloadSelected = () => {
    if (selectedChapters.size === 0) return;
    showDlDialog.value = true;
};

const confirmDownload = () => {
    showDlDialog.value = false;
    ElMessage({ message: `已将 ${ selectedChapters.size } 章加入下载队列`, type: 'success', duration: 2200 });
};


</script>