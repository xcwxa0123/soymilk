<template>
    <div class="chat-layout">

        <!-- MEMBER SIDEBAR -->
        <div class="member-sidebar" :class=" { 'mobile-open': mobileOpen } ">
            <div class="sidebar-head">
                <div class="sidebar-title">在线成员</div>
                <div class="sidebar-count"><strong>{{ memberNum }}</strong> 人在场</div>
            </div>
            <div class="member-list">
                <div class="section-divider">本人</div>
                <div class="member-item is-me">
                    <div class="member-avatar" :class=" me.avClass ">
                        {{ me.emoji }}
                        <span class="member-status-dot status-online"></span>
                    </div>
                    <div class="member-info">
                        <div class="member-name">{{ me.name }}<span class="me-tag">我</span></div>
                        <div class="member-role">{{ me.role }}</div>
                    </div>
                </div>

                <div class="section-divider" style="margin-top:8px">其他人</div>
                <div class="member-item" v-for="m in otherMembers" :key=" m.id ">
                    <div class="member-avatar" :class=" m.avClass ">
                        {{ m.emoji }}
                        <span class="member-status-dot" :class=" m.away ? 'status-away' : 'status-online' "></span>
                    </div>
                    <div class="member-info">
                        <div class="member-name">{{ m.name }}</div>
                        <div class="member-role">{{ m.role }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- CHAT AREA -->
        <div class="chat-area" @click.stop>
            <!-- Chat header -->
            <div class="chat-header">
                <div class="chat-header-left">
                    <!-- <span class="chat-room-icon">💬</span> -->
                    <div>
                        <!-- <div class="chat-room-title">读者聚集地 · 综合讨论</div>
                        <div class="chat-room-desc">畅谈你最爱的书，分享阅读心得</div> -->
                        <div class="chat-room-title">综合讨论</div>
                        <div class="chat-room-desc">尬聊点啥</div>
                    </div>
                </div>
                <!-- <div class="chat-toolbar">
                    <div class="tool-btn" title="搜索记录">🔍</div>
                    <div class="tool-btn" title="通知设置">🔔</div>
                    <div class="tool-btn" title="更多">⋯</div>
                </div> -->
            </div>

            <!-- Messages -->
            <div class="messages-wrap" ref="msgWrap">

                <div class="date-sep"><span>今天</span></div>
                <div class="sys-notice"><span>welcome to test chatroom</span></div>

                <template v-for="(item, idx) in messages as any" :key="item.id">
                    <!-- System message -->
                    <div class="sys-notice" v-if="item.type === 'system'">
                        <span>{{ item.text }}</span>
                    </div>

                    <!-- Chat message -->
                    <div v-else class="msg-row" :class=" {
                        self: item.senderId === me.id,
                        consecutive: isConsecutive(idx as number)
                    } ">
                        <div class="msg-avatar" :class=" getSender(item.senderId).avClass ">
                            {{ getSender(item.senderId).emoji }}
                        </div>
                        <div class="msg-content-col">
                            <div class="msg-nick">{{ getSender(item.senderId).name }}</div>
                            <div class="msg-bubble">{{ item.text }}</div>
                            <div class="msg-time">{{ item.time }}</div>
                        </div>
                    </div>
                </template>

                <!-- Typing indicator -->
                <!-- <div class="typing-row" v-if="someoneTyping">
                    <div class="typing-avatar" :class=" typingMember.avClass ">{{ typingMember.emoji }}</div>
                    <div>
                        <div class="typing-bubble">
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                        </div>
                    </div>
                    <span class="typing-label">{{ typingMember.name }} 正在输入…</span>
                </div> -->

            </div>

            <!-- Input area -->
            <div class="input-area" style="position:relative">
                <!-- Emoji picker -->
                <div class="emoji-picker" v-if="showEmoji" @click.stop>
                    <span class="emoji-item" v-for="e in emojis" :key=" e " @click="insertEmoji(e)">{{ e }}</span>
                </div>

                <div class="input-toolbar">
                    <button class="emoji-btn" @click.stop="showEmoji = !showEmoji" title="表情">😊</button>
                    <!-- <button class="img-btn" title="图片">🖼</button> -->
                </div>

                <div class="input-row">
                    <div class="input-wrap">
                        <el-input ref="inputRef" v-model=" inputText " type="textarea"
                            :autosize=" { minRows: 2, maxRows: 4 } " placeholder="说点什么吧… (Enter 发送，Shift+Enter 换行)"
                            @keydown.enter.exact.prevent=" sendMessage " @keydown.shift.enter.exact=" () => { } "
                            resize="none" />
                    </div>
                    <button class="send-btn" :disabled=" !inputText.trim() " @click=" sendMessage ">
                        <span>发送</span><span style="font-size:15px">↑</span>
                    </button>
                </div>
                <div class="send-hint">Enter 发送 · Shift+Enter 换行</div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
const msgWrap = ref<HTMLElement | null>(null);
const inputRef = ref<any>(null);
const inputText = ref('');
const showEmoji = ref(false);
const mobileOpen = ref(false);
// const someoneTyping = ref(false);
// const typingMember: any = ref(null);
const memberNum = ref(0)
let ws: WebSocket;
let me: any = ref({});

const memclass = reactive(['av-sage', 'av-lav', 'av-warm', 'av-sand', 'av-rose', 'av-sky']);
const headIcon = reactive(['🌿', '🌙', '🍵', '✨', '🌸', '⚔️']);

function send(msg: string) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.warn('WebSocket is not open, cannot send message')
        return
    }
    ws.send(JSON.stringify({ senderId: me.value.id, text: msg, time: nowTime(), msgtype: 'msg' }))
}



// ── SELF ──
// const me = {
//     id: 'me',
//     name: '云上行者',
//     emoji: '🦉',
//     avClass: 'av-sky',
//     role: '书虫 · Lv.12',
// };

// ── OTHER MEMBERS ──
const members: any = ref([
    // { id: 'u1', name: '匿名1', emoji: '🌿', avClass: 'av-sage', role: 'role1', away: false },
    // { id: 'u2', name: '匿名2', emoji: '🌙', avClass: 'av-lav', role: 'role2', away: false },
    // { id: 'u3', name: '匿名3', emoji: '🍵', avClass: 'av-warm', role: 'role3', away: false },
    // { id: 'u4', name: '匿名4', emoji: '✨', avClass: 'av-sand', role: 'role4', away: true },
    // { id: 'u5', name: '匿名5', emoji: '🌸', avClass: 'av-rose', role: 'role5', away: false },
    // { id: 'u6', name: '匿名6', emoji: '⚔️', avClass: 'av-sky', role: 'role6', away: false },
]);

// const names = reactive(['匿名1', '匿名2', '匿名3', '匿名4', '匿名5', '匿名6']);



const otherMembers = computed(() => members.value);

const allUsers = computed(() => {
    const map: any = {};
    map[me.value.id] = me.value;
    members.value.forEach((m: any) => { map[m.id] = m; });
    console.log('看看allUsers===========>', map)
    return map;
});

const getSender = (id: string) => allUsers.value[id] || { name: '未知', emoji: '👤', avClass: 'av-warm' };

// ── MESSAGES ──
let msgIdCounter = 1;
const makeMsg = (senderId: string, text: string, time?: string) => ({
    id: msgIdCounter++, type: 'msg', senderId, text,
    time: time || nowTime()
});

const nowTime = () => {
    const d = new Date();
    return `${ String(d.getHours()).padStart(2, '0') }:${ String(d.getMinutes()).padStart(2, '0') }`;
};

// let messages = ref([
//     makeMsg('u1', '大家好！今天又来刷诡秘了 😄', '09:12'),
//     makeMsg('u2', '诡秘是神作啊，世界观太宏大了！我昨晚看到凌晨三点…', '09:13'),
//     makeMsg('u3', '喝口茶，慢慢看才是人生 🍵', '09:14'),
//     makeMsg('u1', '哈哈哈茶香姐每次都这样说，然后自己也是通宵', '09:14'),
//     { id: msgIdCounter++, type: 'system', text: '银河漫步者 暂时离开了' },
//     makeMsg('u5', '我最近在看遮天，辰东的文笔真的太好了，每次翻开就停不下来', '09:18'),
//     makeMsg('u6', '雪中悍刀行也超推荐！徐凤年的成长线写得真的很细腻', '09:19'),
//     makeMsg('me', '同意！烽火的文字有一种很独特的厚重感，读起来特别有味道', '09:20'),
//     makeMsg('u2', '云上行者品味不错嘛，感觉你喜欢有文学性的那种？', '09:21'),
//     makeMsg('me', '对，我觉得好的小说除了有趣，文字本身也应该是享受的', '09:21'),
//     makeMsg('me', '就像诡秘，那种蒸汽朋克的语言氛围营造得特别好 📖', '09:21'),
//     makeMsg('u3', '说到推荐，有没有人看过大奉打更人？最近在追', '09:25'),
//     makeMsg('u1', '卖报小郎君的！超好看，许七安太讨喜了', '09:25'),
//     makeMsg('u6', '已完结了放心入坑，结局很满意', '09:26'),
// ]);
let messages: any = ref([])

// ── CHECK CONSECUTIVE ──
const isConsecutive = (idx: number) => {
    if (idx === 0) return false;
    const cur: any = messages.value[idx];
    const prev: any = messages.value[idx - 1];
    if (!cur || !prev) return false;
    if (cur.type === 'system' || prev.type === 'system') return false;
    return cur.senderId === prev.senderId && cur.time === prev.time;
};

// ── SEND ──
const sendMessage = () => {
    const text = inputText.value.trim();
    if (!text) return;
    // messages.value.push(makeMsg(me.value.id, text));
    inputText.value = '';
    // scrollToBottom();

    // simulate reply after short delay
    // const repliers = ['u1', 'u2', 'u3', 'u5', 'u6'];
    // const replies = [
    //     '说得对，完全赞同！',
    //     '哈哈，我也是这样想的 😄',
    //     '你说的这本我也看过，确实不错',
    //     '看来大家品味相近～',
    //     '同推！书阁上就能下载，我昨天刚下完',
    //     '等下分享一下书单嗷？',
    //     '书荒中，再推几本呗 🙏',
    // ];
    // const randomReplier: any = repliers[Math.floor(Math.random() * repliers.length)];
    // typingMember.value = getSender(randomReplier);
    // someoneTyping.value = true;
    scrollToBottom();
    send(text)
    // setTimeout(() => {
    //     someoneTyping.value = false;
    //     const reply: any = replies[Math.floor(Math.random() * replies.length)];
    //     messages.value.push(makeMsg(randomReplier, reply));
    //     scrollToBottom();
    // }, 1800 + Math.random() * 1000);
};

// ── EMOJI ──
const emojis = ['😄', '😂', '🤣', '😍', '🥰', '😎', '🤔', '😮', '😭', '🙌', '👍', '❤️', '🔥', '📖', '✨', '🍵', '🌙', '🌿', '⚔️', '🦉', '🎉', '💫', '🌸', '📚', '🤩', '😊', '🥹', '😏'];

const insertEmoji = (e: string) => {
    inputText.value += e;
    showEmoji.value = false;
    inputRef.value?.focus();
};

const closePickers = () => { showEmoji.value = false; };

// ── SCROLL ──
const scrollToBottom = () => {
    nextTick(() => {
        if (msgWrap.value) {
            msgWrap.value.scrollTop = msgWrap.value.scrollHeight;
        }
    });
};

const SOCKET_BASE_URL = useRuntimeConfig().public.socketBaseUrl;

// const getNum = async () => {
//     const result = await useFetch(`${API_BASE_URL}/implapi/membernum`, { method: 'GET' })
//     return result;
// }

onMounted(async () => {
    // const num = await getNum()
    const uid = Math.floor(Math.random() * 100)
    me.value = {
        id: `u${ uid }`,
        name: `匿名${ uid }`,
        emoji: headIcon[Math.floor(Math.random() * headIcon.length)],
        avClass: memclass[Math.floor(Math.random() * memclass.length)],
        role: `role${ uid }`,
        away: false
    }
    scrollToBottom();
    ws = new WebSocket(`${ SOCKET_BASE_URL }`)
    ws.onopen = () => {
        ws.send(JSON.stringify({ msgtype: 'join', ...me.value }))
    }
    // ws.onclose = () => {
    //     ws.send(JSON.stringify({ msgtype: 'exit', id: me.value.id }))
    // }
    // members.value.push(me)
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log("看看接受了啥=========>", data)
        console.log("看看type=========>", data.msgtype)
        switch (data.msgtype) {
            case 'num':
                memberNum.value = data.clientsnum
            case 'users':
                // console.log('进这里了捏===========>', data.userlist)
                members.value = data.userlist ? data.userlist.filter((item: any) => item.id != me.value.id) : []
                break;
            case 'history':
                console.log('进这里了捏===========>', data)
                messages.value = data.msghistory
                scrollToBottom();
                // members.value = data.userlist ? data.userlist.filter((item: any) => item.id != me.value.id) : []
                break;
        
            default:
                break;
        }
        // const li = document.createElement("li")
        // li.innerText = event.data
        // document.getElementById("list").appendChild(li)
    }
})

onUnmounted(() => {
    if (ws) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.close(1000, 'Component unmounted')
        } else {
            ws.close()
        }
        ws = undefined as any;
    }
})

</script>