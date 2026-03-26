<template>
    <div>
        <!-- HEADER -->
        <header :class=" { scrolled: scrolled } ">
            <div class="logo-area">
                <div class="logo-cn"><span class="logo-dot"></span>书阁</div>
                <div class="logo-en">Shuge · Reading</div>
            </div>
            <nav>
                <div class="nav-link active">首页</div>
                <div class="nav-link">排行榜</div>
                <div class="nav-link">分类</div>
                <div class="nav-link">完本</div>
            </nav>
            <div class="header-right">
                <button class="search-btn" @click=" openSearch " title="搜索">🔍</button>
            </div>
        </header>


        <!-- SEARCH OVERLAY -->
        <transition name="overlay">
            <div class="search-overlay" v-if="searchOpen" @click.self=" closeSearch ">
                <div class="search-box">
                    <div class="search-inner">
                        <div class="search-input-row">
                            <span style="font-size:17px;color:var(--ink-faint)">🔍</span>
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

        <slot />

        <hr class="divider" style="max-width:1120px;margin:0 auto 0;">
        <footer>
            <div class="footer-inner">
                <div class="footer-logo">书 阁</div>
                <div class="footer-sub">© 2025 书阁轻阅读 · 仅供学习交流，版权归原作者所有</div>
            </div>
        </footer>
    </div>
</template>
<script setup>
// -TODO 拆分组件
// -TODO 检索后删除searchQuery activeQuery


const queryStore = useQueryStore()
const { searchQuery, activeQuery } = storeToRefs(queryStore)

const hotTags = ['玄幻', '修仙', '都市', '言情', '历史', '悬疑', '系统流'];
const searchInputEl = ref(null);
const searchOpen = ref(false);

const scrolled = ref(false);

const doSearch = () => {
    if (searchQuery.value.trim()) {
        activeQuery.value = searchQuery.value.trim();
    }
    closeSearch();
};

// 依赖tag检索，暂时不做
// const quickSearch = (tag) => {
//     searchQuery.value = tag;
//     activeQuery.value = tag;
//     closeSearch();
// };

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