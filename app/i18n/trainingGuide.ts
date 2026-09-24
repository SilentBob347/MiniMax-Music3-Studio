import type { Language } from './translations';

/**
 * The training guide of MiniMax Music3 Studio, per language. It follows the
 * studio's own training pipeline and the notes of the HOT-Step trainer it runs.
 */

export interface GuideSection {
  title: string;
  text?: string[];
  steps?: string[];
  list?: string[];
  checklist?: string[];
  examples?: { label?: string; body: string }[];
}

export interface Guide {
  title: string;
  intro?: string;
  expandAll: string;
  collapseAll: string;
  close: string;
  resize: string;
  sections: GuideSection[];
}

const CAPTION_SKELETON = `Global Metadata
Basic Attributes: bpm is around 118-124, key is ... (a range is fine when unsure)
Global Emotional Progression: ...
Application Scenarios & Imagery: ...
Sonics & Production Profile: ...

Vocal Details
Vocal Gender & Timbre: Singer A - ...
Vocal Style: ...
Harmony/Backing Vocals: ...
Vocal FX: ...

Arrangement
Instrument Lifecycle Description (Primary/Secondary Layering): ...
Groove & Foundation Progression: ...
Embellishments, Textures & Spatial FX: ...`;

const ru: Guide = {
  title: 'Справка по обучению LoRA',
  intro: 'LoRA — небольшое дополнение к модели, которое учится писать песни как ваши: форма, вокал, аранжировки. В MiniMax учится планировщик — часть модели, которая сочиняет песню. Окно можно двигать за заголовок и растягивать за правый нижний угол.',
  expandAll: 'Раскрыть всё',
  collapseAll: 'Свернуть всё',
  close: 'Закрыть',
  resize: 'Потяните, чтобы изменить размер',
  sections: [
    {
      title: 'Порядок работы',
      steps: [
        'Скачайте пакет обучения (около 11.3 ГБ, один раз). Нужна NVIDIA RTX 30-й серии или новее с 22 ГБ видеопамяти (RTX 3090, 4090, 5090).',
        'Создайте набор: название и слово-триггер — редкое слово, которого нет в обычных описаниях (например, имя латиницей без пробелов).',
        'Добавьте песни одного исполнителя или одного стиля — из библиотеки или с диска (WAV, MP3, FLAC, OGG, M4A). Песни короче 10 секунд не принимаются, длиннее 6 минут тренер не берёт.',
        'У каждой песни заполните «Текст» и «Описание» (ниже — что писать). Инструментал отметьте галочкой.',
        'Описание обязательно у каждой песни — без него обучение не запустится.',
        'Запустите обучение. Пока оно идёт, генерация, ассистент, караоке и разделение на дорожки недоступны.',
        'Когда запуск закончится, послушайте чекпоинты и нажмите «В LoRA» под лучшим — он появится на странице LoRA.',
      ],
    },
    {
      title: 'Какие песни брать',
      list: [
        'Один исполнитель, лучше один альбом или одна эпоха. Рецепт настроен на «клон альбома»: сходство важнее универсальности.',
        'Обычно берут от 5 до 20 песен. Автор тренера не заметил надёжной разницы между 10 и 20 треками; плотные по тексту или разностилевые альбомы учатся тяжелее.',
        'Ровное качество записей: студийные версии, без концертных шумов, джинглов и обрезанных фрагментов.',
        'Целые песни, с началом и концовкой: модель учит форму песни, включая то, как она заканчивается.',
      ],
    },
    {
      title: 'Описание — что писать',
      text: [
        'Своё описание для каждой песни, на английском, примерно 250–450 слов, в трёх частях: Global Metadata, Vocal Details, Arrangement.',
        'Одно общее описание на весь альбом делать нельзя: у автора тренера с ним песни переставали нормально заканчиваться (0 естественных концовок из 6 против 4 из 6 с описаниями по песням).',
        'Не цитируйте и не пересказывайте текст песни и не пишите её название — текст идёт отдельным полем.',
        'Точные BPM и тональность пишите, только если знаете их (из анализатора или базы треков); иначе диапазон: «bpm is around 118-124».',
        'Слово-триггер писать не нужно — студия сама поставит его первым в Global Metadata.',
      ],
      examples: [{ label: 'Каркас', body: CAPTION_SKELETON }],
    },
    {
      title: 'Кнопки «Описать» и «Описать все»',
      text: [
        'Ассистент (тот, что выбран в настройках ассистента: локальный, скачанный студией или OpenRouter) пишет описание в нужном формате из того, что уже есть в поле описания, названия и текста песни.',
        'Он не слушает песню. Он не измеряет BPM и тональность — ставит диапазон или словесный темп. Всё, что он пишет о звуке, берётся из вашей строчки и текста.',
        'Поэтому сначала впишите в поле хотя бы коротко, что слышно: жанр, вокал, главные инструменты, настроение, темп. Потом нажмите «Описать» и проверьте результат на слух.',
        'Кнопка перезаписывает поле описания целиком. «Описать все» идёт по песням по одной и останавливается на первой ошибке.',
        'Автор тренера делает описания моделями, которые слушают аудио (MOSS, Gemini): так точнее всего.',
      ],
    },
    {
      title: 'Текст песни',
      list: [
        'Точно те слова, что поются, — без аккордов, ссылок и примечаний. Текст с сайтов обязательно сверьте с записью.',
        'Размечайте части: [verse], [chorus], [bridge], [outro] — каждая часть с новой строки.',
        'Файл .txt или .lrc с тем же именем, что и аудио, подхватывается при добавлении; таймкоды из .lrc убираются.',
        'Кнопка с микрофоном распознаёт текст: отделяет вокал (если установлен разделитель), распознаёт речь (движок выбирается в «Настройки → Караоке») и раскладывает строки по частям. Результат всегда проверяйте.',
        'Осторожно: песня без текста сразу считается инструменталом, и «Распознать все тексты» её пропустит. Снимите галочку «Инструментал» или нажмите микрофон у этой песни.',
      ],
    },
    {
      title: 'Что студия делает сама',
      list: [
        'Переводит всё в WAV и готовит для тренера коды звука.',
        'Ставит слово-триггер первым в Global Metadata каждого описания, а при генерации — в описание, когда вы выбираете эту LoRA.',
        'Оборачивает описание без заголовков в Global Metadata, так что строчка из YuE2 Studio тоже подойдёт — но лучше нажать «Описать все».',
        'Сохраняет чекпоинты каждые 100 шагов.',
      ],
    },
    {
      title: 'Что нужно сделать самому',
      list: [
        'Подобрать песни и проверить их качество.',
        'Дать каждой песне описание: написать самому или вписать коротко, что слышно, и нажать «Описать».',
        'Проверить описания: ассистент песню не слышал.',
        'Проверить и поправить тексты.',
        'Выбрать чекпоинт на слух — по графику ошибки выбирать нельзя.',
      ],
    },
    {
      title: 'Настройки запуска',
      text: ['Настройки по умолчанию — рецепт «Balanced» автора тренера HOT-Step. Без причины их лучше не трогать.'],
      list: [
        'Шагов 600. У автора есть ещё быстрый вариант на 300 и основательный на 900.',
        'HOT-PiZZA, ранг 128, alpha 128, выключение ранга 0.1, AdamW, скорость 8e-5. Скорость не повышайте: у автора все варианты с удвоенной скоростью звучали хуже, один спланировал песню совсем без вокала.',
        'Окно 1536 кадров — около 61 секунды песни за раз. Большее окно лучше учит форму песни и концовки, но просит больше памяти; 9000 — песня целиком, нужна карта на 32 ГБ.',
        'Сохранять каждые 100 шагов.',
      ],
    },
    {
      title: 'Выбор чекпоинта и генерация',
      list: [
        'Выбирайте на слух: сгенерируйте одну и ту же песню с разными чекпоинтами. У автора тренера лучший по графику ошибки чекпоинт был в 1–8 раз раньше того, что звучит правильно.',
        'Чем больше шагов, тем больше сходство, но тем меньше связность: вокал может стать сбивчивым.',
        'Нажмите «В LoRA» под нужным шагом — LoRA появится на странице LoRA с именем «запуск · шаг».',
        'При выборе LoRA на странице «Создать» триггер подставится сам. Сила по умолчанию 1; на «пережаренном» чекпоинте начните с 0.5–0.75.',
        'Пишите текст на целую песню, даже если нужен короткий трек. Неровные по длине строки в манере исполнителя работают лучше аккуратных четверостиший.',
      ],
    },
    {
      title: 'Если что-то не так',
      list: [
        'Песни рано обрываются, гудящие вступления, вокал разваливается — LoRA перетренирована: возьмите более ранний чекпоинт или уменьшите силу. Ошибка обучения ниже примерно 1 — признак заучивания.',
        'LoRA почти ничего не меняет — возьмите более поздний чекпоинт, проверьте описания, добавьте песен.',
        'Песни перестали нормально заканчиваться — проверьте, что у каждой песни своё описание, а не одно на всех.',
        'Не хватает видеопамяти — закройте всё, что занимает видеокарту, или уменьшите окно кадров.',
      ],
    },
    {
      title: 'Чеклист перед запуском',
      checklist: [
        'Песни одного исполнителя или альбома, 5–20 штук, хорошего качества, целиком.',
        'Нет дублей и обрезков, песни не длиннее 6 минут.',
        'У каждой песни своё описание в трёх частях, проверенное на слух.',
        'В описаниях нет цитат из текста и названий песен.',
        'Тексты сверены с записью и размечены [verse] / [chorus].',
        'Инструменталы отмечены галочкой, у песен с вокалом галочка снята.',
        'Задано редкое слово-триггер.',
        'Свободно около 22 ГБ видеопамяти, генерация остановлена.',
      ],
    },
  ],
};

const en: Guide = {
  title: 'LoRA training guide',
  intro: 'A LoRA is a small add-on to the model that learns to write songs like yours: the form, the vocals, the arrangements. In MiniMax the planner is what learns — the part of the model that composes the song. Drag this window by its title and resize it from the bottom-right corner.',
  expandAll: 'Expand all',
  collapseAll: 'Collapse all',
  close: 'Close',
  resize: 'Drag to resize',
  sections: [
    {
      title: 'Workflow',
      steps: [
        'Download the training pack (about 11.3 GB, once). It needs an NVIDIA RTX 30-series card or newer with 22 GB of VRAM (RTX 3090, 4090, 5090).',
        'Create a dataset: a name and a trigger word — a rare word that never appears in ordinary descriptions (for example a name in Latin letters, no spaces).',
        'Add songs of one artist or one style, from the library or from disk (WAV, MP3, FLAC, OGG, M4A). Songs shorter than 10 seconds are refused; the trainer skips songs longer than 6 minutes.',
        'Fill in Lyrics and Caption for every song (what to write is below). Tick Instrumental for instrumentals.',
        'Every song needs a caption — without one the run will not start.',
        'Start training. While it runs, generation, the assistant, karaoke and stem separation are unavailable.',
        'When the run ends, listen to the checkpoints and press "To LoRA" under the best one — it appears on the LoRA page.',
      ],
    },
    {
      title: 'Which songs to use',
      list: [
        'One artist, ideally one album or one era. The recipe is tuned to clone an album: likeness matters more than range.',
        'Usually 5 to 20 songs. The trainer\'s author saw no reliable difference between 10 and 20 tracks; lyric-dense or mixed-style albums are harder to learn.',
        'Even recording quality: studio versions, no live noise, jingles or cut-off fragments.',
        'Whole songs, with their start and end: the model learns the form of a song, including how it ends.',
      ],
    },
    {
      title: 'Caption — what to write',
      text: [
        'A caption of its own for every song, in English, about 250–450 words, in three parts: Global Metadata, Vocal Details, Arrangement.',
        'Do not use one caption for the whole album: for the trainer\'s author it stopped songs from ending properly (0 natural endings out of 6, against 4 out of 6 with per-song captions).',
        'Do not quote or paraphrase the lyrics and do not name the song — the lyrics go in their own field.',
        'Give an exact BPM and key only when you know them (from an analyser or a track database); otherwise a range: "bpm is around 118-124".',
        'Do not write the trigger word — the studio puts it first in Global Metadata itself.',
      ],
      examples: [{ label: 'Skeleton', body: CAPTION_SKELETON }],
    },
    {
      title: 'The Describe and Describe all buttons',
      text: [
        'The assistant (the one chosen in the assistant settings: local, downloaded by the studio, or OpenRouter) writes the caption in the right format from what is already in the caption field, the title and the lyrics.',
        'It does not listen to the song. It does not measure BPM or key — it writes a range or a word for the tempo. Everything it says about the sound comes from your line and the lyrics.',
        'So first write in the field, briefly, what you hear: genre, vocals, main instruments, mood, tempo. Then press Describe and check the result against the song.',
        'The button overwrites the whole caption. Describe all goes through the songs one by one and stops at the first error.',
        'The trainer\'s author writes captions with models that listen to the audio (MOSS, Gemini): that is the most accurate way.',
      ],
    },
    {
      title: 'Lyrics',
      list: [
        'Exactly the words that are sung — no chords, links or notes. Lyrics from websites must be checked against the recording.',
        'Mark the parts: [verse], [chorus], [bridge], [outro], each on its own line.',
        'A .txt or .lrc file with the same name as the audio is picked up when adding; .lrc timestamps are removed.',
        'The microphone button recognises the lyrics: it separates the vocals (when the separator is installed), transcribes them (the engine is chosen in Settings → Karaoke) and lays the lines out by part. Always check the result.',
        'Careful: a song without lyrics counts as instrumental at once, and "Recognise all lyrics" skips it. Untick Instrumental or press the microphone on that song.',
      ],
    },
    {
      title: 'What the studio does itself',
      list: [
        'Converts everything to WAV and prepares the sound codes the trainer reads.',
        'Puts the trigger word first in Global Metadata of every caption, and into the caption at generation when you pick this LoRA.',
        'Wraps a caption without headings into Global Metadata, so a line from YuE2 Studio works too — but Describe all is better.',
        'Saves a checkpoint every 100 steps.',
      ],
    },
    {
      title: 'What you have to do yourself',
      list: [
        'Choose the songs and check their quality.',
        'Give every song a caption: write it yourself, or write briefly what you hear and press Describe.',
        'Check the captions: the assistant never heard the song.',
        'Check and fix the lyrics.',
        'Pick the checkpoint by ear — never by the loss chart.',
      ],
    },
    {
      title: 'Run settings',
      text: ['The defaults are the Balanced recipe of the HOT-Step trainer\'s author. Leave them alone without a reason.'],
      list: [
        '600 steps. The author also has a fast variant of 300 and a thorough one of 900.',
        'HOT-PiZZA, rank 128, alpha 128, rank dropout 0.1, AdamW, learning rate 8e-5. Do not raise the rate: for the author every doubled-rate variant sounded worse, and one planned a song with no vocals at all.',
        'A window of 1536 frames — about 61 seconds of a song at a time. A larger window teaches the song form and endings better but needs more memory; 9000 is the whole song and needs a 32 GB card.',
        'Save every 100 steps.',
      ],
    },
    {
      title: 'Choosing a checkpoint and generating',
      list: [
        'Choose by ear: generate the same song with different checkpoints. For the trainer\'s author the checkpoint with the best loss came 1–8 times earlier than the one that sounded right.',
        'More steps bring more likeness but less coherence: the vocal can start to stumble.',
        'Press "To LoRA" under the step you want — the LoRA appears on the LoRA page as "run · step".',
        'When you pick the LoRA on the Create page, the trigger is added by itself. The strength is 1 by default; with an over-baked checkpoint start at 0.5–0.75.',
        'Write lyrics for a whole song even when you want a short track. Lines of uneven length in the artist\'s manner work better than tidy quatrains.',
      ],
    },
    {
      title: 'When something is wrong',
      list: [
        'Songs end early, intros drone, the vocal falls apart — the LoRA is overtrained: take an earlier checkpoint or lower the strength. A training loss below about 1 is a sign of memorising.',
        'The LoRA changes almost nothing — take a later checkpoint, check the captions, add songs.',
        'Songs stopped ending properly — check that every song has its own caption, not one shared by all.',
        'Out of VRAM — close whatever uses the card, or lower the frame window.',
      ],
    },
    {
      title: 'Checklist before a run',
      checklist: [
        'Songs of one artist or album, 5–20 of them, of good quality, whole.',
        'No duplicates or fragments, no song longer than 6 minutes.',
        'Every song has its own three-part caption, checked against the song.',
        'No lyric quotes or song titles in the captions.',
        'Lyrics checked against the recording and marked [verse] / [chorus].',
        'Instrumentals ticked, songs with vocals unticked.',
        'A rare trigger word is set.',
        'About 22 GB of VRAM free, generation stopped.',
      ],
    },
  ],
};

const zh: Guide = {
  title: 'LoRA 训练指南',
  intro: 'LoRA 是模型的一个小附加件，它学习像你的歌曲那样写歌：结构、人声、编曲。在 MiniMax 中学习的是规划器——模型中负责创作歌曲的部分。可以拖动标题栏移动窗口，拖动右下角调整大小。',
  expandAll: '全部展开',
  collapseAll: '全部收起',
  close: '关闭',
  resize: '拖动以调整大小',
  sections: [
    {
      title: '操作流程',
      steps: [
        '下载训练包（约 11.3 GB，只需一次）。需要 NVIDIA RTX 30 系列或更新、22 GB 显存的显卡（RTX 3090、4090、5090）。',
        '创建数据集：名称和触发词——一个普通描述里不会出现的罕见词（例如拉丁字母、无空格的名字）。',
        '添加同一艺人或同一风格的歌曲，可来自曲库或磁盘（WAV、MP3、FLAC、OGG、M4A）。短于 10 秒的会被拒绝，超过 6 分钟的训练器不会使用。',
        '为每首歌填写“歌词”和“描述”（写法见下文）。纯音乐请勾选“纯音乐”。',
        '每首歌都必须有描述——没有描述训练无法开始。',
        '开始训练。训练期间无法生成歌曲、使用助手、卡拉OK和分轨。',
        '训练结束后试听各检查点，在最好的一个下点击“加入 LoRA”——它会出现在 LoRA 页面。',
      ],
    },
    {
      title: '选择哪些歌曲',
      list: [
        '同一位艺人，最好是同一张专辑或同一时期。这个配方的目标是“克隆一张专辑”：相似度比通用性更重要。',
        '通常 5 到 20 首。训练器作者没有发现 10 首和 20 首之间有可靠差别；歌词密集或风格混杂的专辑更难学。',
        '录音质量一致：录音室版本，不要现场噪音、片头或截断的片段。',
        '完整的歌曲，有开头也有结尾：模型会学习歌曲的结构，包括如何结束。',
      ],
    },
    {
      title: '描述——写什么',
      text: [
        '每首歌各写一份英文描述，约 250–450 词，分三部分：Global Metadata、Vocal Details、Arrangement。',
        '不要整张专辑共用一份描述：训练器作者这样做时歌曲不再正常结束（6 首中 0 首自然结束，而逐首描述时是 6 首中 4 首）。',
        '不要引用或转述歌词，也不要写歌名——歌词在单独的字段里。',
        '只有确实知道时才写准确的 BPM 和调性（来自分析工具或曲库）；否则写范围：“bpm is around 118-124”。',
        '不用写触发词——工作室会自动把它放在 Global Metadata 的最前面。',
      ],
      examples: [{ label: '框架', body: CAPTION_SKELETON }],
    },
    {
      title: '“描述”和“全部描述”按钮',
      text: [
        '助手（在助手设置中选择的：本地、工作室下载的或 OpenRouter）会根据描述字段中已有的内容、歌名和歌词，按正确格式写出描述。',
        '它不会听这首歌，也不会测量 BPM 和调性——只写范围或文字形式的速度。它对声音的所有描述都来自你写的那一行和歌词。',
        '所以请先在字段里简单写下你听到的：流派、人声、主要乐器、情绪、速度。然后点击“描述”，再对照歌曲检查结果。',
        '按钮会覆盖整个描述字段。“全部描述”逐首进行，遇到第一个错误就停止。',
        '训练器作者使用能听音频的模型（MOSS、Gemini）来写描述：这是最准确的方式。',
      ],
    },
    {
      title: '歌词',
      list: [
        '只写实际唱出的词——不要和弦、链接或注释。来自网站的歌词必须对照录音核对。',
        '标注段落：[verse]、[chorus]、[bridge]、[outro]，每段单独一行。',
        '与音频同名的 .txt 或 .lrc 文件会在添加时自动读取；.lrc 的时间戳会被去掉。',
        '麦克风按钮会识别歌词：分离人声（已安装分离器时）、转写（引擎在“设置 → 卡拉OK”中选择），并按段落排列。请务必检查结果。',
        '注意：没有歌词的歌曲会立即被视为纯音乐，“识别全部歌词”会跳过它。请取消“纯音乐”勾选，或对这首歌点击麦克风。',
      ],
    },
    {
      title: '工作室自动完成的事',
      list: [
        '把所有音频转成 WAV，并准备训练器读取的声音编码。',
        '把触发词放在每份描述的 Global Metadata 最前面；选用此 LoRA 生成时也会加入描述。',
        '没有标题的描述会被包进 Global Metadata，所以 YuE2 Studio 的一行风格也能用——但最好点击“全部描述”。',
        '每 100 步保存一个检查点。',
      ],
    },
    {
      title: '需要你自己做的事',
      list: [
        '挑选歌曲并检查质量。',
        '为每首歌提供描述：自己写，或简单写下听到的内容后点击“描述”。',
        '检查描述：助手从没听过这首歌。',
        '检查并修改歌词。',
        '凭耳朵选择检查点——绝不要看损失曲线来选。',
      ],
    },
    {
      title: '训练设置',
      text: ['默认值是 HOT-Step 训练器作者的“Balanced”配方。没有理由时不要改动。'],
      list: [
        '600 步。作者还有快速版 300 步和充分版 900 步。',
        'HOT-PiZZA，秩 128，alpha 128，秩丢弃 0.1，AdamW，学习率 8e-5。不要提高学习率：作者试过的所有加倍学习率版本听起来都更差，有一个甚至规划出完全没有人声的歌。',
        '窗口 1536 帧——一次约 61 秒的歌曲。更大的窗口能更好地学习歌曲结构和结尾，但需要更多显存；9000 表示整首歌，需要 32 GB 的显卡。',
        '每 100 步保存一次。',
      ],
    },
    {
      title: '选择检查点与生成',
      list: [
        '凭耳朵选择：用不同检查点生成同一首歌对比。训练器作者发现，损失最低的检查点比听起来正确的那个早 1–8 倍。',
        '步数越多越相似，但连贯性越差：人声可能开始磕绊。',
        '在想要的步数下点击“加入 LoRA”——它会以“训练 · 步数”的名字出现在 LoRA 页面。',
        '在“创建”页选择这个 LoRA 时，触发词会自动加入。强度默认为 1；对于“练过头”的检查点，从 0.5–0.75 开始。',
        '即使只想要短曲，也写整首歌的歌词。按艺人风格写长短不一的句子，比整齐的四行诗效果更好。',
      ],
    },
    {
      title: '出现问题时',
      list: [
        '歌曲过早结束、前奏嗡嗡作响、人声散架——LoRA 训练过头了：换更早的检查点或降低强度。训练损失低于约 1 是死记硬背的迹象。',
        'LoRA 几乎没有变化——换更晚的检查点，检查描述，增加歌曲。',
        '歌曲不再正常结束——检查是否每首歌都有自己的描述，而不是共用一份。',
        '显存不足——关闭占用显卡的程序，或减小帧窗口。',
      ],
    },
    {
      title: '开始训练前的检查清单',
      checklist: [
        '同一艺人或专辑的歌曲 5–20 首，质量良好，完整。',
        '没有重复或残缺片段，没有超过 6 分钟的歌。',
        '每首歌都有自己的三段式描述，并已对照歌曲检查。',
        '描述中没有歌词引用和歌名。',
        '歌词已对照录音核对，并标注 [verse] / [chorus]。',
        '纯音乐已勾选，有人声的歌未勾选。',
        '已设置罕见的触发词。',
        '约 22 GB 显存空闲，已停止生成。',
      ],
    },
  ],
};

const ja: Guide = {
  title: 'LoRA 学習ガイド',
  intro: 'LoRA はモデルへの小さな追加で、あなたの曲のような曲の作り方（構成、ボーカル、アレンジ）を学びます。MiniMax で学習するのはプランナー、つまり曲を作曲する部分です。タイトルバーをドラッグして移動、右下の角でサイズを変えられます。',
  expandAll: 'すべて開く',
  collapseAll: 'すべて閉じる',
  close: '閉じる',
  resize: 'ドラッグでサイズ変更',
  sections: [
    {
      title: '作業の流れ',
      steps: [
        '学習パックをダウンロード（約 11.3 GB、一度だけ）。NVIDIA RTX 30 シリーズ以降で VRAM 22 GB のカード（RTX 3090、4090、5090）が必要です。',
        'データセットを作成：名前とトリガーワード（普通の説明には出てこない珍しい単語。例：スペースなしのローマ字の名前）。',
        '同じアーティストか同じスタイルの曲を、ライブラリかディスクから追加（WAV、MP3、FLAC、OGG、M4A）。10 秒未満は受け付けず、6 分を超える曲は学習器が使いません。',
        '各曲の「歌詞」と「キャプション」を記入（書き方は下記）。インストは「インスト」にチェック。',
        'キャプションはすべての曲に必要です。なければ学習は始まりません。',
        '学習を開始。学習中は生成、アシスタント、カラオケ、ステム分離が使えません。',
        '終わったらチェックポイントを聴き比べ、一番良いものの下で「LoRA に追加」を押すと LoRA ページに表示されます。',
      ],
    },
    {
      title: 'どの曲を使うか',
      list: [
        '一人のアーティスト、できれば一枚のアルバムか一つの時期。このレシピは「アルバムの複製」向けで、幅より似ていることを重視します。',
        '通常 5〜20 曲。学習器の作者は 10 曲と 20 曲で確かな差を見ていません。歌詞の多いアルバムや作風がばらばらなアルバムは学びにくいです。',
        '録音品質をそろえる：スタジオ版で、ライブの雑音、ジングル、途切れた断片は避けます。',
        '始まりと終わりのある曲をまるごと：モデルは曲の構成、終わり方まで学びます。',
      ],
    },
    {
      title: 'キャプション — 何を書くか',
      text: [
        '曲ごとに自分の説明を英語で、約 250〜450 語、三つの部分に分けて：Global Metadata、Vocal Details、Arrangement。',
        'アルバム全体で一つの説明にしないでください。学習器の作者の場合、曲がきちんと終わらなくなりました（自然な終わりが 6 曲中 0 曲、曲ごとの説明では 6 曲中 4 曲）。',
        '歌詞を引用・言い換えせず、曲名も書きません。歌詞は別の欄に入れます。',
        '正確な BPM とキーは、分かっているとき（解析ツールや曲データベース）だけ書き、そうでなければ範囲で：「bpm is around 118-124」。',
        'トリガーワードは書かないでください。スタジオが Global Metadata の先頭に自動で入れます。',
      ],
      examples: [{ label: 'ひな形', body: CAPTION_SKELETON }],
    },
    {
      title: '「説明を書く」と「すべて説明」ボタン',
      text: [
        'アシスタント（アシスタント設定で選んだもの：ローカル、スタジオがダウンロードしたもの、OpenRouter）が、説明欄にすでにある内容、曲名、歌詞から正しい形式の説明を書きます。',
        '曲は聴きません。BPM やキーも測らず、範囲か言葉でテンポを書きます。音について書くことはすべて、あなたの一行と歌詞が元です。',
        'だからまず、聴こえるものを欄に短く書いてください：ジャンル、ボーカル、主な楽器、ムード、テンポ。それから「説明を書く」を押し、結果を曲と照らし合わせます。',
        'ボタンは説明欄をまるごと上書きします。「すべて説明」は一曲ずつ進み、最初のエラーで止まります。',
        '学習器の作者は、音声を聴けるモデル（MOSS、Gemini）で説明を作っています。それが最も正確です。',
      ],
    },
    {
      title: '歌詞',
      list: [
        '実際に歌われている言葉だけ。コード、リンク、注釈は入れません。サイトの歌詞は必ず録音と照らし合わせます。',
        'パートを付ける：[verse]、[chorus]、[bridge]、[outro]、それぞれ別の行に。',
        '音声と同じ名前の .txt / .lrc は追加時に読み込まれ、.lrc のタイムスタンプは取り除かれます。',
        'マイクボタンで歌詞を認識：ボーカルを分離し（分離器がある場合）、文字起こしして（エンジンは「設定 → カラオケ」で選択）、パートごとに並べます。結果は必ず確認してください。',
        '注意：歌詞のない曲はすぐインスト扱いになり、「すべての歌詞を認識」で飛ばされます。「インスト」のチェックを外すか、その曲のマイクを押してください。',
      ],
    },
    {
      title: 'スタジオが自動でやること',
      list: [
        'すべて WAV に変換し、学習器が読む音のコードを用意します。',
        '各説明の Global Metadata の先頭にトリガーワードを入れ、この LoRA を選んで生成するときも説明に入れます。',
        '見出しのない説明は Global Metadata に包むので、YuE2 Studio の一行も使えます。ただし「すべて説明」の方が良いです。',
        '100 ステップごとにチェックポイントを保存します。',
      ],
    },
    {
      title: '自分でやること',
      list: [
        '曲を選び、品質を確認する。',
        '各曲に説明を付ける：自分で書くか、聴こえるものを短く書いて「説明を書く」を押す。',
        '説明を確認する：アシスタントは曲を聴いていません。',
        '歌詞を確認・修正する。',
        'チェックポイントを耳で選ぶ。損失グラフで選んではいけません。',
      ],
    },
    {
      title: '学習の設定',
      text: ['既定値は HOT-Step 学習器の作者の「Balanced」レシピです。理由がなければ変えないでください。'],
      list: [
        '600 ステップ。作者には速い 300 と念入りな 900 もあります。',
        'HOT-PiZZA、ランク 128、alpha 128、ランクドロップアウト 0.1、AdamW、学習率 8e-5。学習率は上げないでください：作者が試した倍の学習率はどれも音が悪く、一つはボーカルのない曲を作りました。',
        'ウィンドウ 1536 フレーム — 一度に約 61 秒。大きいほど曲の構成と終わり方をよく学びますが、メモリを多く使います。9000 は曲全体で、32 GB のカードが必要です。',
        '100 ステップごとに保存。',
      ],
    },
    {
      title: 'チェックポイントの選び方と生成',
      list: [
        '耳で選びます：同じ曲を別々のチェックポイントで生成して比べます。学習器の作者の場合、損失が一番良いチェックポイントは、正しく聴こえるものより 1〜8 倍早い時点でした。',
        'ステップが多いほど似ますが、まとまりは落ち、ボーカルがつまずき始めることがあります。',
        '選んだステップの下で「LoRA に追加」を押すと、「実行 · ステップ」という名前で LoRA ページに出ます。',
        '「作成」ページでこの LoRA を選ぶと、トリガーは自動で加わります。強さの既定は 1。学習しすぎのチェックポイントは 0.5〜0.75 から始めます。',
        '短い曲が欲しくても、曲全体の歌詞を書いてください。アーティストらしい長さの不ぞろいな行の方が、きれいな四行詩よりうまくいきます。',
      ],
    },
    {
      title: 'うまくいかないとき',
      list: [
        '曲が早く終わる、イントロがうなり続ける、ボーカルが崩れる — 学習しすぎです。前のチェックポイントにするか強さを下げます。学習損失が約 1 を下回るのは暗記のサインです。',
        'LoRA でほとんど変わらない — 後のチェックポイントにし、説明を確認し、曲を増やします。',
        '曲がきちんと終わらなくなった — 全曲共通の説明ではなく、曲ごとの説明になっているか確認します。',
        'VRAM が足りない — カードを使っているものを閉じるか、フレームウィンドウを小さくします。',
      ],
    },
    {
      title: '開始前のチェックリスト',
      checklist: [
        '同じアーティストかアルバムの曲が 5〜20 曲、品質良好、まるごと。',
        '重複や断片がなく、6 分を超える曲がない。',
        '各曲に三部構成の自分の説明があり、曲と照らし合わせて確認した。',
        '説明に歌詞の引用や曲名がない。',
        '歌詞を録音と照合し、[verse] / [chorus] を付けた。',
        'インストにはチェック、ボーカル曲はチェックなし。',
        '珍しいトリガーワードを設定した。',
        'VRAM が約 22 GB 空いていて、生成は止めてある。',
      ],
    },
  ],
};

const ko: Guide = {
  title: 'LoRA 학습 안내',
  intro: 'LoRA는 모델에 붙는 작은 추가 파일로, 당신의 곡처럼 곡을 쓰는 법(구성, 보컬, 편곡)을 배웁니다. MiniMax에서 배우는 것은 플래너, 즉 곡을 작곡하는 부분입니다. 제목 표시줄을 끌어 옮기고, 오른쪽 아래 모서리로 크기를 바꿀 수 있습니다.',
  expandAll: '모두 펼치기',
  collapseAll: '모두 접기',
  close: '닫기',
  resize: '끌어서 크기 조절',
  sections: [
    {
      title: '작업 순서',
      steps: [
        '학습 팩을 내려받습니다(약 11.3 GB, 한 번만). NVIDIA RTX 30 시리즈 이상, VRAM 22 GB 카드(RTX 3090, 4090, 5090)가 필요합니다.',
        '데이터셋을 만듭니다: 이름과 트리거 단어(일반 설명에 나오지 않는 드문 단어, 예: 띄어쓰기 없는 로마자 이름).',
        '같은 아티스트나 같은 스타일의 곡을 라이브러리나 디스크에서 추가합니다(WAV, MP3, FLAC, OGG, M4A). 10초보다 짧은 곡은 받지 않고, 6분보다 긴 곡은 학습기가 쓰지 않습니다.',
        '각 곡의 「가사」와 「캡션」을 채웁니다(작성법은 아래). 연주곡은 「연주곡」에 체크합니다.',
        '모든 곡에 캡션이 있어야 합니다. 없으면 학습이 시작되지 않습니다.',
        '학습을 시작합니다. 학습 중에는 생성, 어시스턴트, 가라오케, 스템 분리를 쓸 수 없습니다.',
        '끝나면 체크포인트를 들어 보고 가장 좋은 것 아래의 「LoRA에 추가」를 누르면 LoRA 페이지에 나타납니다.',
      ],
    },
    {
      title: '어떤 곡을 쓸까',
      list: [
        '한 아티스트, 가능하면 한 앨범이나 한 시기. 이 레시피는 「앨범 복제」에 맞춰져 있어 폭보다 닮음이 중요합니다.',
        '보통 5~20곡. 학습기 제작자는 10곡과 20곡 사이에 뚜렷한 차이를 보지 못했습니다. 가사가 빽빽하거나 스타일이 섞인 앨범은 배우기 더 어렵습니다.',
        '녹음 품질을 고르게: 스튜디오 버전, 라이브 잡음·징글·잘린 조각은 제외합니다.',
        '시작과 끝이 있는 곡을 통째로: 모델은 곡의 구성, 끝나는 방식까지 배웁니다.',
      ],
    },
    {
      title: '캡션 — 무엇을 쓸까',
      text: [
        '곡마다 자기 설명을 영어로, 약 250~450 단어, 세 부분으로: Global Metadata, Vocal Details, Arrangement.',
        '앨범 전체에 설명 하나를 쓰지 마세요. 학습기 제작자의 경우 곡이 제대로 끝나지 않게 되었습니다(자연스러운 끝 6곡 중 0곡, 곡별 설명일 때는 6곡 중 4곡).',
        '가사를 인용하거나 바꿔 쓰지 말고 곡 제목도 쓰지 마세요. 가사는 따로 들어갑니다.',
        '정확한 BPM과 조성은 알 때만(분석 도구나 곡 데이터베이스) 쓰고, 아니면 범위로: 「bpm is around 118-124」.',
        '트리거 단어는 쓰지 마세요. 스튜디오가 Global Metadata 맨 앞에 알아서 넣습니다.',
      ],
      examples: [{ label: '뼈대', body: CAPTION_SKELETON }],
    },
    {
      title: '「설명 쓰기」와 「모두 설명」 버튼',
      text: [
        '어시스턴트(어시스턴트 설정에서 고른 것: 로컬, 스튜디오가 받은 것, OpenRouter)가 설명 칸에 이미 있는 내용, 제목, 가사로 올바른 형식의 설명을 씁니다.',
        '곡을 듣지 않습니다. BPM과 조성도 재지 않고 범위나 말로 템포를 씁니다. 소리에 대한 모든 내용은 당신이 쓴 한 줄과 가사에서 나옵니다.',
        '그러니 먼저 들리는 것을 칸에 짧게 적으세요: 장르, 보컬, 주요 악기, 분위기, 템포. 그다음 「설명 쓰기」를 누르고 결과를 곡과 대조하세요.',
        '버튼은 설명 칸 전체를 덮어씁니다. 「모두 설명」은 곡을 하나씩 처리하고 첫 오류에서 멈춥니다.',
        '학습기 제작자는 오디오를 듣는 모델(MOSS, Gemini)로 설명을 만듭니다. 그것이 가장 정확합니다.',
      ],
    },
    {
      title: '가사',
      list: [
        '실제로 부르는 말만. 코드, 링크, 메모는 넣지 않습니다. 사이트에서 가져온 가사는 반드시 녹음과 대조합니다.',
        '파트를 표시합니다: [verse], [chorus], [bridge], [outro] — 각각 새 줄에.',
        '오디오와 같은 이름의 .txt / .lrc 파일은 추가할 때 읽히며, .lrc 타임스탬프는 제거됩니다.',
        '마이크 버튼은 가사를 인식합니다: 보컬을 분리하고(분리기가 있을 때), 받아 적고(엔진은 「설정 → 가라오케」에서 선택), 파트별로 정리합니다. 결과는 꼭 확인하세요.',
        '주의: 가사가 없는 곡은 바로 연주곡으로 간주되어 「모든 가사 인식」에서 건너뜁니다. 「연주곡」 체크를 풀거나 그 곡의 마이크를 누르세요.',
      ],
    },
    {
      title: '스튜디오가 알아서 하는 일',
      list: [
        '모두 WAV로 바꾸고 학습기가 읽는 소리 코드를 준비합니다.',
        '모든 설명의 Global Metadata 맨 앞에 트리거 단어를 넣고, 이 LoRA로 생성할 때도 설명에 넣습니다.',
        '제목이 없는 설명은 Global Metadata로 감싸므로 YuE2 Studio의 한 줄도 쓸 수 있습니다. 다만 「모두 설명」이 더 좋습니다.',
        '100 스텝마다 체크포인트를 저장합니다.',
      ],
    },
    {
      title: '직접 해야 하는 일',
      list: [
        '곡을 고르고 품질을 확인합니다.',
        '곡마다 설명을 줍니다: 직접 쓰거나, 들리는 것을 짧게 적고 「설명 쓰기」를 누릅니다.',
        '설명을 확인합니다: 어시스턴트는 곡을 들은 적이 없습니다.',
        '가사를 확인하고 고칩니다.',
        '체크포인트를 귀로 고릅니다. 손실 그래프로 고르면 안 됩니다.',
      ],
    },
    {
      title: '학습 설정',
      text: ['기본값은 HOT-Step 학습기 제작자의 「Balanced」 레시피입니다. 이유 없이 바꾸지 마세요.'],
      list: [
        '600 스텝. 제작자에게는 빠른 300과 꼼꼼한 900도 있습니다.',
        'HOT-PiZZA, 랭크 128, alpha 128, 랭크 드롭아웃 0.1, AdamW, 학습률 8e-5. 학습률을 올리지 마세요: 제작자가 시험한 두 배 학습률은 모두 더 나빴고, 하나는 보컬이 전혀 없는 곡을 만들었습니다.',
        '창 1536 프레임 — 한 번에 약 61초. 창이 클수록 곡의 구성과 끝을 더 잘 배우지만 메모리가 더 듭니다. 9000은 곡 전체로 32 GB 카드가 필요합니다.',
        '100 스텝마다 저장.',
      ],
    },
    {
      title: '체크포인트 고르기와 생성',
      list: [
        '귀로 고르세요: 같은 곡을 여러 체크포인트로 생성해 비교합니다. 학습기 제작자의 경우 손실이 가장 좋은 체크포인트는 제대로 들리는 것보다 1~8배 이른 시점이었습니다.',
        '스텝이 많을수록 더 닮지만 짜임새는 떨어지고, 보컬이 더듬기 시작할 수 있습니다.',
        '원하는 스텝 아래의 「LoRA에 추가」를 누르면 「실행 · 스텝」 이름으로 LoRA 페이지에 나타납니다.',
        '「만들기」 페이지에서 이 LoRA를 고르면 트리거가 알아서 들어갑니다. 강도 기본값은 1이고, 과하게 학습된 체크포인트는 0.5~0.75부터 시작하세요.',
        '짧은 곡을 원해도 곡 전체의 가사를 쓰세요. 아티스트다운 길이가 들쭉날쭉한 줄이 깔끔한 4행보다 잘 됩니다.',
      ],
    },
    {
      title: '문제가 있을 때',
      list: [
        '곡이 일찍 끝나거나, 인트로가 웅웅거리거나, 보컬이 무너지면 과학습입니다. 더 이른 체크포인트를 쓰거나 강도를 낮추세요. 학습 손실이 약 1 아래면 암기의 신호입니다.',
        'LoRA가 거의 아무것도 바꾸지 않으면 더 늦은 체크포인트를 쓰고, 설명을 확인하고, 곡을 늘리세요.',
        '곡이 제대로 끝나지 않게 되었다면 모든 곡이 공용 설명이 아니라 자기 설명을 가졌는지 확인하세요.',
        'VRAM이 부족하면 카드를 쓰는 프로그램을 닫거나 프레임 창을 줄이세요.',
      ],
    },
    {
      title: '시작 전 체크리스트',
      checklist: [
        '같은 아티스트나 앨범의 곡 5~20곡, 좋은 품질, 통째로.',
        '중복이나 잘린 조각이 없고, 6분보다 긴 곡이 없음.',
        '모든 곡에 세 부분으로 된 자기 설명이 있고, 곡과 대조해 확인함.',
        '설명에 가사 인용이나 곡 제목이 없음.',
        '가사를 녹음과 대조하고 [verse] / [chorus]를 표시함.',
        '연주곡은 체크, 보컬 곡은 체크 해제.',
        '드문 트리거 단어를 정함.',
        'VRAM 약 22 GB 여유, 생성은 멈춤.',
      ],
    },
  ],
};

export const trainingGuide: Record<Language, Guide> = { en, ru, zh, ja, ko };
