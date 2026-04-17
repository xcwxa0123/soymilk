<template>
  <div class="page-body">

    <!-- HERO -->
    <div class="page-hero">
      <div class="page-eyebrow">AI IMAGE ANALYSIS</div>
      <h1 class="page-title">测试用解析deemo</h1>
      <!-- <p class="page-sub">test</p> -->
      <p class="page-sub">测试用</p>
    </div>

    <!-- MAIN GRID -->
    <div class="main-grid">

      <!-- ── UPLOAD PANEL ── -->
      <div class="panel upload-panel">
        <div class="panel-head">
          <div>
            <div class="panel-label">UPLOAD</div>
            <div class="panel-title">图片上传</div>
          </div>
          <!-- <span style="font-size:20px;opacity:0.5">🖼</span> -->
        </div>
        <div class="upload-body">

          <!-- Drop zone -->
          <div
            class="drop-zone"
            :class="{ 'has-image': imageUrl, dragging: isDragging }"
            @click="!imageUrl && triggerUpload()"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
          >
            <template v-if="!imageUrl">
              <div class="drop-icon">📂</div>
              <div class="drop-text">点击或拖拽图片到此处</div>
              <div class="drop-hint">支持从剪贴板粘贴（Ctrl+V）</div>
              <div class="drop-types">
                <span class="type-tag">JPG</span>
                <span class="type-tag">PNG</span>
                <span class="type-tag">WEBP</span>
                <span class="type-tag">GIF</span>
                <span class="type-tag">BMP</span>
              </div>
            </template>
            <template v-else>
              <img :src="imageUrl" class="preview-img" alt="preview"/>
              <div class="img-overlay">
                <span style="font-size:28px">🔄</span>
                <div class="overlay-text">点击更换图片</div>
              </div>
            </template>
          </div>

          <!-- File meta -->
          <transition name="fade">
            <div class="img-meta" v-if="imageFile">
              <img :src="imageUrl" class="img-thumb" alt="thumb" ref="imgRef"/>
              <div class="img-meta-info">
                <div class="img-meta-name">{{ imageFile.name }}</div>
                <div class="img-meta-size">{{ fileSize }} · {{ imgDimension }}</div>
              </div>
              <button class="remove-btn" @click.stop="removeImage" title="移除">✕</button>
            </div>
          </transition>

          <!-- Buttons -->
          <div class="upload-row">
            <button class="upload-btn" @click="triggerUpload">
              <span>📁</span><span>选择文件</span>
            </button>
            <button
              class="analyze-btn"
              :disabled="!imageUrl || analyzing"
              @click="startAnalyze"
            >
              <div class="spin" v-if="analyzing"></div>
              <span v-else>🔍</span>
              <span>{{ analyzing ? '分析中…' : '开始分析' }}</span>
            </button>
          </div>

          <!-- Tips -->
          <div style="padding:14px 16px;background:rgba(232,220,200,0.25);border:1px solid rgba(180,160,120,0.18);border-radius:10px;">
            <div style="font-size:11px;letter-spacing:2px;color:var(--warm-dark);margin-bottom:8px;font-weight:500;">TIPS</div>
            <div style="font-size:12px;color:var(--ink-light);line-height:1.8;">
              · 图片分辨率越高，识别越精准<br>
              · 支持含文字的图片进行 OCR 提取<br>
              · 书籍封面、插图、场景图均可解析
            </div>
          </div>

        </div>
        <input ref="fileInput" type="file" class="input-file" accept="image/*" @change="handleFileChange"/>
      </div>

      <!-- ── RESULT PANEL ── -->
      <div class="panel result-panel">
        <div class="panel-head">
          <div>
            <div class="panel-label">RESULT</div>
            <div class="panel-title">分析结果</div>
          </div>
          <!-- <button
            v-if="result"
            style="padding:5px 14px;border-radius:16px;font-size:12px;border:1.5px solid rgba(180,160,120,0.25);background:transparent;cursor:pointer;color:var(--ink-light);font-family:'Noto Sans SC',sans-serif;transition:all 0.2s;"
            @click="copyResult"
            onmouseover="this.style.background='var(--sky-light)';this.style.color='var(--sky-accent)'"
            onmouseout="this.style.background='transparent';this.style.color='var(--ink-light)'"
          >复制</button> -->
        </div>
        <div class="result-body">

          <!-- Empty -->
          <div class="result-empty" v-if="!analyzing && !result">
            <div class="result-empty-icon">🔬</div>
            <div class="result-empty-text">尚未分析任何图片</div>
            <div class="result-empty-sub">上传图片后点击「开始分析」</div>
          </div>

          <!-- Loading -->
          <div class="result-loading" v-else-if="analyzing">
            <div class="loading-ring"></div>
            <div class="loading-text">{{ loadingMsg }}</div>
            <div class="loading-dots">
              <div class="loading-dot"></div>
              <div class="loading-dot"></div>
              <div class="loading-dot"></div>
            </div>
          </div>

          <!-- Result -->
          <div class="result-content" v-else-if="result">
            <div class="result-status-bar">
              <span class="status-chip chip-done">✓ 分析完成</span>
              <span class="result-time">{{ result.time }}</span>
            </div>

            <!-- Overview -->
            <!-- <div class="result-section">
              <div class="res-sec-head">
                <div class="res-sec-icon">📋</div>
                <div class="res-sec-title">概述</div>
              </div>
              <div class="res-sec-body">{{ result.overview }}</div>
            </div> -->

            <!-- Tags -->
            <!-- <div class="result-section">
              <div class="res-sec-head">
                <div class="res-sec-icon">🏷</div>
                <div class="res-sec-title">关键词标签</div>
              </div>
              <div class="res-sec-body">
                <div class="res-tags">
                  <span class="res-tag sky" v-for="t in result.tags" :key="t">{{ t }}</span>
                </div>
              </div>
            </div> -->

            <!-- Scene -->
            <!-- <div class="result-section">
              <div class="res-sec-head">
                <div class="res-sec-icon">🌄</div>
                <div class="res-sec-title">场景与氛围</div>
              </div>
              <div class="res-sec-body">{{ result.scene }}</div>
            </div> -->

            <!-- Scores -->
            <div class="result-section">
              <div class="res-sec-head">
                <div class="res-sec-icon">📊</div>
                <div class="res-sec-title">维度评分</div>
              </div>
              <div class="res-sec-body">
                <div class="score-item" v-for="s in result.scores" :key="s.label">
                  <div class="score-label">{{ s.label }}</div>
                  <div class="score-bar">
                    <div class="score-fill" :style="`width:${s.val}%;background:${s.color}`"></div>
                  </div>
                  <div class="score-val">{{ s.val }}%</div>
                </div>
              </div>
            </div>

            <!-- OCR -->
            <!-- <div class="result-section" v-if="result.ocr">
              <div class="res-sec-head">
                <div class="res-sec-icon">📝</div>
                <div class="res-sec-title">文字识别 (OCR)</div>
              </div>
              <div class="res-sec-body" style="font-family:'Noto Serif SC',serif;white-space:pre-line;font-size:13px;">{{ result.ocr }}</div>
            </div> -->

            <!-- Suggestion -->
            <!-- <div class="result-section">
              <div class="res-sec-head">
                <div class="res-sec-icon">💡</div>
                <div class="res-sec-title">延伸建议</div>
              </div>
              <div class="res-sec-body">{{ result.suggestion }}</div>
            </div> -->
          </div>

        </div>
      </div>

      <!-- ── HISTORY PANEL ── -->
      <div class="panel history-panel">
        <div class="panel-head">
          <div>
            <div class="panel-label">HISTORY</div>
            <div class="panel-title">历史记录</div>
          </div>
          <button
            v-if="history.length > 0"
            style="font-size:11px;color:var(--ink-faint);background:transparent;border:none;cursor:pointer;letter-spacing:1px;font-family:'Noto Sans SC',sans-serif;"
            @click="history = []"
          >清空</button>
        </div>
        <div class="history-body">
          <div class="history-empty" v-if="history.length === 0">暂无历史记录</div>
          <div
            class="history-item"
            v-for="(h, i) in history"
            :key="h.id"
            :class="{ active: activeHistoryId === h.id }"
            @click="loadHistory(h)"
          >
            <img :src="h.thumb" class="history-thumb" alt=""/>
            <div class="history-info">
              <div class="history-name">{{ h.name }}</div>
              <div class="history-time">{{ h.time }}</div>
            </div>
            <span class="history-status hs-done">完成</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
<script setup lang="ts">
import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'
import '@tensorflow/tfjs-backend-webgl'
let model: any = null

const fileInput = ref(null as any);
const imageFile = ref(null as any);
const imageUrl = ref('');
const imgRef = ref(null as any)
const isDragging = ref(false);
const analyzing = ref(false);
const result = ref(null as any);
const imgDimension = ref('');
const history = ref([] as any);
const activeHistoryId = ref(null as any);
const loadingMsgIdx = ref(0);

const loadingMsgs = ['正在解析图像内容…', '识别场景与元素…', '提取关键词信息…', '生成分析报告…'];
const loadingMsg = computed(() => loadingMsgs[loadingMsgIdx.value]);

const fileSize = computed(() => {
    if (!imageFile.value) return '';
    const b = imageFile.value.size;
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b/1024).toFixed(1)} KB`;
    return `${(b/1024/1024).toFixed(2)} MB`;
});

const triggerUpload = () => fileInput.value?.click();

const loadImage = (file: any) => {
    if (!file || !file.type.startsWith('image/')) {
    ElMessage({ message: '请选择有效的图片文件', type: 'warning' }); return;
    }
    imageFile.value = file;
    result.value = null;
    activeHistoryId.value = null;
    const reader = new FileReader();
    reader.onload = (e: any) => {
    imageUrl.value = e.target.result;
    const img = new Image();
    img.onload = () => { imgDimension.value = `${img.width} × ${img.height}`; };
    img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

const handleFileChange = (e: any) => {
    const f = e.target.files[0];
    if (f) loadImage(f);
    e.target.value = '';
};

const handleDrop = (e: any) => {
    isDragging.value = false;
    const f = e.dataTransfer.files[0];
    if (f) loadImage(f);
};

const removeImage = () => {
    imageFile.value = null;
    imageUrl.value = '';
    result.value = null;
    imgDimension.value = '';
    activeHistoryId.value = null;
};

// ── MOCK ANALYSIS ──
// const mockResults = [
    // {
    // // overview: '图片呈现了一处充满东方古典韵味的书房场景。画面中央摆放着一张深色木质书桌，桌上散放着数册线装古籍，一盏烛台燃着明火，光晕柔和而温暖。背景书架上整齐排列着大量典籍，氛围宁静悠远，极具人文气息。',
    // // tags: ['书房', '古典', '东方', '典籍', '烛光', '人文', '宁静', '木质家具', '线装书'],
    // // scene: '室内场景，光线以暖黄烛光为主，色调偏暖棕，营造出一种沉静、博学的古典书斋氛围。整体构图平衡，视觉焦点集中于书桌与烛台，层次感丰富，背景深邃而不杂乱。',
    // scores: [
    //     // { label: '清晰度', val: 88, color: 'linear-gradient(90deg,#7ab3d9,#4a90c4)' },
    //     // { label: '色彩', val: 76, color: 'linear-gradient(90deg,#c9b99a,#8c7355)' },
    //     // { label: '构图', val: 92, color: 'linear-gradient(90deg,#8ab48a,#5a8a5a)' },
    //     // { label: '信息量', val: 84, color: 'linear-gradient(90deg,#d4a0a0,#b86060)' },
    //     { label: '', val: 0, color: '' },
    // ],
    // // ocr: '己所不欲，勿施于人。\n学而时习之，不亦说乎？',
    // // suggestion: '该图片风格与书阁网站的人文调性高度契合，适合作为书籍介绍页的配图或首页 Banner 背景。建议裁剪为 16:9 比例以适配宽屏展示，并可配合「传统文化」「古典文学」分类标签进行内容关联。',
    // },
// ];
let mockResults = reactive<{ scores: any[] }>({ scores: [] });
const colorArr = [
    'linear-gradient(90deg,#7ab3d9,#4a90c4)',
    'linear-gradient(90deg,#c9b99a,#8c7355)',
    'linear-gradient(90deg,#8ab48a,#5a8a5a)',
    'linear-gradient(90deg,#d4a0a0,#b86060)'
]
let historyCounter = 1;

const startAnalyze = async  () => {
    if (!imageUrl.value || analyzing.value) return;
    await analyzeImg()
    analyzing.value = true;
    result.value = null;
    loadingMsgIdx.value = 0;

    const interval = setInterval(() => {
    loadingMsgIdx.value = (loadingMsgIdx.value + 1) % loadingMsgs.length;
    }, 700);

    setTimeout(() => {
    clearInterval(interval);
    analyzing.value = false;
    // const r = mockResults[Math.floor(Math.random() * mockResults.length)];
    const r = mockResults;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    result.value = { ...r, time: timeStr };

    // Add to history
    const hid = historyCounter++;
    history.value.unshift({
        id: hid,
        name: imageFile.value?.name || `图片_${hid}`,
        thumb: imageUrl.value,
        time: timeStr,
        result: result.value,
    });
    activeHistoryId.value = hid;
    if (history.value.length > 12) history.value.pop();

    ElMessage({ message: '分析完成！', type: 'success', duration: 1800 });
    }, 3000);
};

const loadHistory = (h: any) => {
    imageUrl.value = h.thumb;
    result.value = h.result;
    activeHistoryId.value = h.id;
    imageFile.value = { name: h.name, size: 0 };
    imgDimension.value = '';
};

const copyResult = () => {
    if (!result.value) return;
    const r = result.value;
    const text = [
    `【书阁图像解析报告】${r.time}`,
    `\n概述：\n${r.overview}`,
    `\n关键词：${r.tags.join('、')}`,
    `\n场景：\n${r.scene}`,
    r.ocr ? `\nOCR识别：\n${r.ocr}` : '',
    `\n延伸建议：\n${r.suggestion}`,
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(text).then(() => {
    ElMessage({ message: '已复制到剪贴板', type: 'success', duration: 1600 });
    }).catch(() => {
    ElMessage({ message: '复制失败，请手动选取', type: 'warning' });
    });
};

const analyzeImg = async () => {
    console.log('进来分析了看看mode============>', model)
    console.log('进来分析了看看file============>', imgRef.value)
    if (!model || !imgRef.value) return
    const analyzeRes = await model.classify(imgRef.value)
    console.log('看看analyzeRes=============>', analyzeRes)
    if (analyzeRes && analyzeRes.length) {
        analyzeRes.forEach((element: any) => {
            mockResults.scores.push({
                label: element.className, 
                val: `${ Math.floor(element.probability * 100) }`, 
                color: colorArr[Math.floor(Math.random() * analyzeRes.length)]
            })
        });
    }
    
}


// Paste from clipboard
onMounted(async () => {

    model = await mobilenet.load()
    console.log('onMounted==>看看model=========>', model)
    await tf.setBackend('webgl')
    await tf.ready()

    window.addEventListener('paste', (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
            loadImage(item.getAsFile());
            break;
            }
        }
    });
});

</script>