<template>

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
                    <div class="search-tags">
                        <span class="search-hint">热门：</span>
                        <span class="search-tag" v-for="tag in hotTags" :key=" tag " @click="quickSearch(tag)">{{ tag
                            }}</span>
                    </div>
                </div>
            </div>
            <div class="search-close" @click=" closeSearch ">✕</div>
        </div>
    </transition>

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

    <!-- HERO -->
    <section class="hero">
        <div>
            <div class="hero-eyebrow">今日热榜</div>
            <h1 class="hero-title">
                好书俯拾皆是，<br>
                <em>遇见属于你的故事。</em>
            </h1>
            <p class="hero-sub">精选十大热门小说，每日更新。免费阅读，一键下载，随心收藏。</p>
            <div class="hero-stats">
                <div class="hero-stat">
                    <div class="hero-stat-num">12,400+</div>
                    <div class="hero-stat-label">收录书目</div>
                </div>
                <div class="hero-stat">
                    <div class="hero-stat-num">380万</div>
                    <div class="hero-stat-label">读者在线</div>
                </div>
                <div class="hero-stat">
                    <div class="hero-stat-num">每日更新</div>
                    <div class="hero-stat-label">实时同步</div>
                </div>
            </div>
        </div>
        <div class="hero-decor">
            <div class="decor-card">
                <div class="decor-card-title">📖 今日新增</div>
                <div class="decor-card-sub">47 本书籍已更新章节</div>
            </div>
            <div class="decor-card">
                <div class="decor-card-title">⭐ 编辑推荐</div>
                <div class="decor-card-sub">九重紫雾·本周精品</div>
            </div>
        </div>
    </section>

    <!-- NOVEL LIST -->
    <main class="section">
        <div class="section-header">
            <div>
                <div class="section-label">RANKING</div>
                <div class="section-title">
                    {{ activeQuery ? `"${ activeQuery }" 搜索结果` : '热度榜 · TOP 10' }}
                </div>
            </div>
            <div class="section-more" @click=" clearSearch " v-if="activeQuery">← 返回榜单</div>
            <div class="section-more" v-else>查看更多 →</div>
        </div>

        <!-- result notice -->
        <div class="result-notice" v-if="activeQuery">
            <span>共找到 <strong>{{ displayedNovels.length }}</strong> 条结果，关键词：<strong>{{ activeQuery }}</strong></span>
            <div class="clear-btn" @click=" clearSearch ">✕ 清除搜索</div>
        </div>

        <!-- list -->
        <transition-group name="list-fade" tag="div" class="novel-list">
            <div class="novel-card" v-for="(novel, index) in displayedNovels" :key=" novel.id "
                :class=" { expanded: novel.expanded } " @click="novel.expanded = !novel.expanded">
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
                        <span class="novel-title">{{ novel.title }}</span>
                        <span class="novel-author">{{ novel.author }}</span>
                        <span class="tag" :class=" novel.serialStatus === '连载中' ? 'tag-serial' : 'tag-complete' ">
                            {{ novel.serialStatus }}
                        </span>
                        <span class="tag tag-genre">{{ novel.genre }}</span>
                    </div>
                    <p class="novel-desc">{{ novel.description }}</p>
                    <div class="novel-meta">
                        <div class="meta-item"><span class="meta-icon">📑</span> {{ novel.chapters }} 章</div>
                        <div class="meta-item"><span class="meta-icon">🕐</span> {{ novel.updateTime }}</div>
                        <div class="meta-item"><span class="meta-icon">👁</span> {{ novel.views }}</div>
                    </div>
                </div>

                <!-- right -->
                <div class="novel-right">
                    <div class="heat-badge">🔥 <span class="heat-val">{{ novel.heat }}</span></div>
                    <button class="download-btn" @click.stop="downloadNovel(novel)">↓ 下载</button>
                </div>
            </div>
        </transition-group>

        <!-- empty -->
        <div class="empty-state" v-if="displayedNovels.length === 0">
            <div class="empty-icon">📚</div>
            <div class="empty-text">暂无匹配结果</div>
            <div class="empty-sub">换个关键词试试，或者浏览热门榜单</div>
        </div>
    </main>

    <hr class="divider" style="max-width:1120px;margin:0 auto 0;">
    <footer>
        <div class="footer-inner">
            <div class="footer-logo">书 阁</div>
            <div class="footer-sub">© 2025 书阁轻阅读 · 仅供学习交流，版权归原作者所有</div>
        </div>
    </footer>
</template>
<script setup>
// import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
const searchOpen = ref(false);
const searchQuery = ref('');
const activeQuery = ref('');
const searchInputEl = ref(null);
const scrolled = ref(false);

const hotTags = ['玄幻', '修仙', '都市', '言情', '历史', '悬疑', '系统流'];

const allNovels = ref([
    {
        id: 1,
        title: '万古神帝',
        author: '飞天鱼',
        serialStatus: '连载中',
        genre: '玄幻',
        chapters: 8472,
        updateTime: '2025-03-25 22:14',
        views: '1.2亿',
        heat: '9.8万',
        description: '张若尘被未婚妻杀死，却意外重生三百年前，成为武道废柴少年。他携带神秘石碑，一步步踏上武道巅峰，笑傲苍穹，成就万古神帝之名。热血战斗与柔情并存，一段波澜壮阔的修炼传奇就此展开。',
        expanded: false,
    },
    {
        id: 2,
        title: '诡秘之主',
        author: '爱潜水的乌贼',
        serialStatus: '已完本',
        genre: '悬疑奇幻',
        chapters: 1432,
        updateTime: '2024-08-15 10:00',
        views: '8600万',
        heat: '9.5万',
        description: '蒸汽与神秘并存的维多利亚时代，落魄的大学毕业生周明瑞意外获得一本日记，由此踏入充满神明、异能与黑暗秘密的诡秘世界。他以克莱恩·莫雷蒂的身份，一点点揭开这个世界背后的真相。公认的近年最佳奇幻小说之一。',
        expanded: false,
    },
    {
        id: 3,
        title: '遮天',
        author: '辰东',
        serialStatus: '已完本',
        genre: '修仙',
        chapters: 3116,
        updateTime: '2023-11-20 18:30',
        views: '7800万',
        heat: '9.2万',
        description: '一块形似鳄鱼的石头中，沉睡着太古的秘密。少年叶凡自禁地走出，脚踏万古日月，拳打神话宇宙，一路逆伐仙途，只为打破命运的枷锁，证得那遮天盖地的无上大道。',
        expanded: false,
    },
    {
        id: 4,
        title: '全职高手',
        author: '蝴蝶蓝',
        serialStatus: '已完本',
        genre: '竞技电竞',
        chapters: 1728,
        updateTime: '2024-01-10 09:00',
        views: '7200万',
        heat: '8.9万',
        description: '网游荣耀的传奇人物叶修被俱乐部扫地出门，于草根网吧重新出发。他凭借着多年积累的绝顶技巧与智谋，带领一群野路子玩家，再度叩响职业赛场的大门，缔造最强荣耀传说。',
        expanded: false,
    },
    {
        id: 5,
        title: '赘婿',
        author: '愤怒的香蕉',
        serialStatus: '连载中',
        genre: '穿越历史',
        chapters: 2891,
        updateTime: '2025-03-25 20:00',
        views: '6500万',
        heat: '8.7万',
        description: '现代人宁毅穿越成苏家上门女婿，本想着安稳度日，却卷入了波澜壮阔的历史洪流。他以温文尔雅之姿，行雷霆万钧之事，在礼法森严的古代书写着另类的传奇人生。',
        expanded: false,
    },
    {
        id: 6,
        title: '斗破苍穹',
        author: '天蚕土豆',
        serialStatus: '已完本',
        genre: '玄幻',
        chapters: 1647,
        updateTime: '2023-03-30 00:00',
        views: '6100万',
        heat: '8.5万',
        description: '天才少年萧炎，因功法突变沦为废材，三年后觉醒，携老师纳戒重回巅峰。纵横大陆，笑傲苍穹，斗气化翼，破尽苍穹！一段热血燃情的成长逆袭传奇，陪伴了无数读者的青春岁月。',
        expanded: false,
    },
    {
        id: 7,
        title: '大奉打更人',
        author: '卖报小郎君',
        serialStatus: '已完本',
        genre: '历史悬疑',
        chapters: 1876,
        updateTime: '2024-06-01 11:20',
        views: '5800万',
        heat: '8.4万',
        description: '许七安，一个从现代穿越而来的小小打更人，凭借着超越时代的知识与智慧，在庙堂与江湖之间游走。他一边破案，一边卷入修炼界的惊天大局，笑看风云，步步为营。',
        expanded: false,
    },
    {
        id: 8,
        title: '择天记',
        author: '猫腻',
        serialStatus: '已完本',
        genre: '修仙',
        chapters: 1342,
        updateTime: '2023-09-14 15:00',
        views: '5200万',
        heat: '8.1万',
        description: '陈长生自幼体弱，命格与天书相逆，注定无法修行。然而他带着族谱中的秘密来到天权神都，在机缘与努力之下，踏上了一条逆天改命的道路，书写属于自己的天命篇章。',
        expanded: false,
    },
    {
        id: 9,
        title: '雪中悍刀行',
        author: '烽火戏诸侯',
        serialStatus: '已完本',
        genre: '武侠历史',
        chapters: 2166,
        updateTime: '2023-07-08 08:00',
        views: '4900万',
        heat: '7.8万',
        description: '北凉世子徐凤年，从纨绔子弟历练成绝世高手，三出北凉，一路见识人间冷暖，江湖险恶。文字浑厚有力，人物鲜活，江湖庙堂两相照，被誉为近年武侠小说翘楚。',
        expanded: false,
    },
    {
        id: 10,
        title: '将夜',
        author: '猫腻',
        serialStatus: '已完本',
        genre: '玄幻修仙',
        chapters: 1097,
        updateTime: '2023-01-20 00:00',
        views: '4400万',
        heat: '7.6万',
        description: '书院后山学生宁缺与婢女桑桑历尽艰辛来到长安，为报多年前的血仇，也为追寻命运的答案。夫子、书院、天道……将夜之时，谁执烛火照山河？一段情深义重、气势磅礴的修行故事。',
        expanded: false,
    },
]);

const displayedNovels = computed(() => {
    if (!activeQuery.value) return allNovels.value;
    const q = activeQuery.value.toLowerCase();
    return allNovels.value.filter(n =>
        n.title.includes(q) ||
        n.author.includes(q) ||
        n.genre.includes(q) ||
        n.description.includes(q)
    );
});

const openSearch = async () => {
    searchOpen.value = true;
    await nextTick();
    searchInputEl.value?.focus();
};

const closeSearch = () => {
    searchOpen.value = false;
};

const doSearch = () => {
    if (searchQuery.value.trim()) {
        activeQuery.value = searchQuery.value.trim();
    }
    closeSearch();
};

const quickSearch = (tag) => {
    searchQuery.value = tag;
    activeQuery.value = tag;
    closeSearch();
};

const clearSearch = () => {
    activeQuery.value = '';
    searchQuery.value = '';
};

const downloadNovel = (novel) => {
    ElMessage({
        message: `《${ novel.title }》已加入下载队列`,
        type: 'success',
        duration: 2200,
    });
};

const handleScroll = () => { scrolled.value = window.scrollY > 10; };

onMounted(() => window.addEventListener('scroll', handleScroll));
onUnmounted(() => window.removeEventListener('scroll', handleScroll));

</script>