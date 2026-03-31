<template>

    <!-- HERO -->
    <section class="hero">
        <div>
            <div class="hero-eyebrow">今天喝水了吗</div>
            <h1 class="hero-title">
                多喝水，<br>
                <em>多喝温水。</em>
            </h1>
            <p class="hero-sub">别等到口渴才喝水，口渴了更要喝水。</p>
            <div class="hero-stats">
                <div class="hero-stat">
                    <div class="hero-stat-num">喝水</div>
                    <div class="hero-stat-label">不会长肉</div>
                </div>
                <div class="hero-stat">
                    <div class="hero-stat-num">运动</div>
                    <div class="hero-stat-label">之后别喝冰水</div>
                </div>
                <div class="hero-stat">
                    <div class="hero-stat-num">每日</div>
                    <div class="hero-stat-label">喝水不少于8杯</div>
                </div>
            </div>
        </div>
        <div class="hero-decor">
            <div class="decor-card">
                <div class="decor-card-title"><el-icon><Mug /></el-icon> 今日新喝</div>
                <div class="decor-card-sub">2 杯水共计500ML</div>
            </div>
            <div class="decor-card">
                <div class="decor-card-title"><el-icon><Star /></el-icon> 今日推荐</div>
                <div class="decor-card-sub">100ML 开水兑 400ML 室温凉水</div>
            </div>
        </div>
    </section>

    <!-- NOVEL LIST -->
    <main class="section" v-loading="loading">
        <div class="section-header">
            <div>
                <div class="section-label">RANKING</div>
                <div class="section-title">
                    {{ activeQuery ? `"${ activeQuery }" 搜索结果` : '当前Tag · TOP 10' }}
                </div>
            </div>
            <div class="section-more" @click=" clearSearch " v-if="activeQuery">← 返回榜单</div>
            <div class="section-more" v-else>查看更多 →</div>
        </div>

        <!-- result notice -->
        <div class="result-notice" v-if="activeQuery">
            <span>共找到 <strong>{{ displayedNovels?.length }}</strong> 条结果，关键词：<strong>{{ activeQuery }}</strong></span>
            <div class="clear-btn" @click=" clearSearch ">✕ 清除搜索</div>
        </div>

        <!-- list -->
        <transition-group name="list-fade" tag="div" class="novel-list">
            <div class="novel-card" v-for="(novel, index) in displayedNovels" :key=" novel.book_id "
                :class=" { expanded: true } " @click="() => diveIntoNovel(novel.book_id)">
                <!-- rank -->
                <div class="rank-col">
                    <div class="rank-num"
                        :class=" index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'rank-other' ">
                        {{ index + 1 }}
                    </div>
                    <div class="rank-bar"
                        :style=" `color:${ index === 0 ? 'var(--sky-accent)' : index === 1 ? 'var(--warm-mid)' : index === 2 ? 'var(--green-accent)' : 'var(--ink-faint)' }` ">
                    </div>
                </div>

                <!-- main -->
                <div class="novel-main">
                    <div class="novel-top">
                        <span class="novel-title">{{ novel.book_title }}</span>
                        <span class="novel-author">{{ novel.author.author_name }}</span>
                        <span class="tag" :class=" novel.publish_state == 0 ? 'tag-serial' : 'tag-complete' ">
                            {{ novel.publish_state == 1 ? '連載中': '完結済' }}
                        </span>
                        <!-- <span class="tag tag-genre">{{ novel.genre }}</span> -->
                    </div>
                    <p class="novel-desc">{{ novel.book_desc }}</p>
                    <div class="novel-meta">
                        <div class="meta-item"><span class="meta-icon"><el-icon><Memo /></el-icon></span> {{ novel.number_of_episode }}</div>
                        <div class="meta-item"><span class="meta-icon"><el-icon><Timer /></el-icon></span> {{ novel.last_time }}</div>
                        <!-- <div class="meta-item"><span class="meta-icon">👁</span> {{ novel.views }}</div> -->
                    </div>
                </div>

                <!-- right -->
                <div class="novel-right">
                    <!-- <div class="heat-badge">🔥 <span class="heat-val">{{ novel.heat }}</span></div> -->
                    <!-- <button class="download-btn" @click.stop="downloadNovel(novel)">↓ 下载</button> -->
                </div>
            </div>
        </transition-group>

        <!-- empty -->
        <div class="empty-state" v-if="displayedNovels?.length === 0">
            <div class="empty-icon">📚</div>
            <div class="empty-text">暂无匹配结果</div>
            <div class="empty-sub">换个关键词试试，或者浏览热门榜单</div>
        </div>
    </main>

</template>
<script setup lang="ts">
import { Mug, Star, Memo, Timer } from '@element-plus/icons-vue'
import type { Book } from '~/types/book'
const loading = ref(false)
const queryStore = useQueryStore()
const { activeQuery } = storeToRefs(queryStore)

let allNovels = reactive<Array<Book>>([]);
const router = useRouter()


const clearSearch = () => {
    queryStore.activeQuery = '';
    queryStore.searchQuery = '';
};

const fetchNovelList = async () => {
    console.log('进来了=======>')
    loading.value = true
    try {
        const { data, status, error } = await useFetch('/api/getTitleList', { method: 'POST' })
        if(status.value === 'success'){
            if(data.value?.code === 200){
                // console.log('请求成功，看看data', data.value)
                allNovels = data.value.data
            } else {
                ElMessage({
                    message: data.value?.msg || 'request fail',
                    type: 'error',
                    duration: 2200,
                });
            }
        } else {
            ElMessage({
                message: error.value?.message || 'request fail',
                type: 'error',
                duration: 2200,
            });
        }
    } catch (error) {
        
    }
    loading.value = false
}

const downloadNovel = (novel: Book) => {
    ElMessage({
        message: `《${ novel.book_title }》已加入下载队列`,
        type: 'success',
        duration: 2200,
    });
};
const diveIntoNovel = async (bookId: string) => {
    // loading.value = true
    router.push(`/works/${ bookId }`)
    // loading.value = false
}

await fetchNovelList()

const displayedNovels = computed(() => {
    if (!activeQuery.value) return allNovels || [];
    const q = activeQuery.value.toLowerCase();
    return allNovels?.filter(n =>
        n.book_title?.includes(q) || // 标题包含搜索
        n.author.author_name?.includes(q) // 作者名字包含搜索
        // n.genre.includes(q) || // tag包含搜索
        // n.book_desc.includes(q) // 描述包含搜索
    );
});

</script>