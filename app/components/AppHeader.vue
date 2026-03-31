<template>
    
    <!-- HEADER -->
    <header :class=" { scrolled: scrolled } ">
        <div class="logo-area" @click="$router.push('/')">
            <div class="logo-cn"><span class="logo-dot"></span>多喝温水</div>
            <div class="logo-en">More drink nukumizu</div>
        </div>
        <nav>
            <!-- <div class="nav-link active">首页</div> -->
            <!-- <div class="nav-link">排行榜</div> -->
            <!-- <div class="nav-link">分类</div> -->
            <!-- <div class="nav-link">完本</div> -->
        </nav>
        <div class="header-right">
            <button class="search-btn" @click=" openSearch " title="搜索"><el-icon><Search /></el-icon></button>
        </div>
    </header>


    <!-- SEARCH OVERLAY -->
    <transition name="overlay">
        <div class="search-overlay" v-if="searchOpen" @click.self=" closeSearch ">
            <div class="search-box">
                <div class="search-inner">
                    <div class="search-input-row">
                        <span style="font-size:17px;color:var(--ink-faint)"><el-icon><Search /></el-icon></span>
                        <input ref="searchInputEl" v-model=" searchQuery " placeholder="搜索书名、作者、类型…"
                            @keyup.enter=" doSearch " @keyup.esc=" closeSearch " />
                        <button class="search-go" @click=" doSearch ">搜索</button>
                    </div>
                    <!-- 依赖tag检索，暂时不做 -->
                    <!-- <div class="search-tags">
                        <span class="search-hint">热门：</span>
                        <span class="search-tag" v-for="tag in hotTags" :key=" tag " @click="quickSearch(tag)">{{tag}}</span>
                    </div> -->
                </div>
            </div>
            <div class="search-close" @click=" closeSearch ">✕</div>
        </div>
    </transition>
</template>
<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'

const queryStore = useQueryStore()
const { searchQuery, activeQuery } = storeToRefs(queryStore)

const searchInputEl = ref<HTMLElement | null>(null);
const searchOpen = ref(false);
const router = useRouter()

const scrolled = ref(false);

// const hotTags = ['玄幻', '修仙', '都市', '言情', '历史', '悬疑', '系统流'];
const doSearch = () => {
    if (searchQuery.value.trim()) {
        activeQuery.value = searchQuery.value.trim();
        router.push({ path: '/' });
    }
    closeSearch();
};
const openSearch = async () => {
    searchOpen.value = true;
    await nextTick();
    searchInputEl.value?.focus();
};

const closeSearch = () => {
    searchOpen.value = false;
};

const handleScroll = () => { scrolled.value = window.scrollY > 10; };

onMounted(() => window.addEventListener('scroll', handleScroll));
onUnmounted(() => window.removeEventListener('scroll', handleScroll));
</script>