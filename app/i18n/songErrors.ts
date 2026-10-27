import type { Language } from './translations';

// Why a song failed, in the window's language. The service sends a code and fields beside
// its English text (crates/music-server/src/song_errors.rs); here is a template for each
// code. The service's test `every_code_has_a_translation_in_every_language` checks that each
// code has a line in all five languages. The codes are the same in every music studio.

type ErrorTexts = Record<string, string>;

const EN: ErrorTexts = {
  prompt_too_long: 'The caption and lyrics are {tokens} tokens, over the model\'s limit of {limit}: shorten the caption or the lyrics by {over} tokens.',
  kv_cache_short: 'This song needs {needed} places in the language model\'s cache ({tokens} tokens of caption and lyrics and {frames} frames for {seconds} s of music), but Settings → Local engine limits that cache (LM KV cache, --max-seq) to {max_seq}. Set it to {suggest} or more, or clear the field to use the model\'s full length.',
  training_on_card: 'A LoRA is training on the graphics card; make songs once it finishes.',
  lost_vram: 'The graphics card ran out of memory on this song and the engine restarted, so the song was lost. Choose a smaller model set in Settings → Models or a shorter song, and close whatever else uses the card; a card below the smallest set cannot make songs.',
  lost_ram: 'The computer ran out of memory (RAM) on this song and the engine restarted, so the song was lost. Close other programs that take memory, or choose a smaller model set in Settings → Models or a shorter song.',
  lost_device: 'The graphics card failed during this song ({detail}) and the engine restarted, so the song was lost. The engine log is in Settings → Local engine.',
  lost_device_on_card: 'The graphics card failed during this song ({detail}) on {card}, compute {compute}, driver {driver}, {build} build, and the engine restarted, so the song was lost. The engine log is in Settings → Local engine.',
  lost_device_silent: 'The graphics card failed during this song (a CUDA or driver error) and the engine restarted, so the song was lost. The engine log is in Settings → Local engine.',
  lost_at_line: 'The engine stopped during this song and restarted, so the song was lost; its last line was {line}. The engine log is in Settings → Local engine.',
  lost: 'The engine stopped during this song and restarted, so the song was lost. The engine log is in Settings → Local engine.',
  lost_exit: 'The engine stopped during this song ({meaning}, exit code {exit}) and restarted, so the song was lost. The engine log is in Settings → Local engine.',
  lost_port_set: 'The engine could not listen on port {port}, which MINIMAX_MM_SERVER_PORT sets, so the song was lost: another program holds it. Close that program or set another port.',
  lost_port_taken: 'The engine could not listen on port {port}, so the song was lost: another program took the port after the studio chose it. Restart the studio: it chooses a free port at start.',
  lost_exit_at_line: 'The engine stopped during this song ({meaning}, exit code {exit}) and restarted, so the song was lost; its last line was {line}. The engine log is in Settings → Local engine.',
  exit_access_violation: 'a crash: an access violation',
  exit_illegal_instruction: 'an instruction this processor does not have',
  exit_aborted: 'a crash: the engine aborted',
  exit_stack_overflow: 'a crash: a stack overflow',
  exit_heap_corruption: 'a crash: corrupted memory',
  exit_library_missing: 'a library of the engine did not load',
  exit_out_of_memory: 'the computer ran out of memory',
  exit_other: 'it closed',
  load_vram: 'The graphics card ran out of memory while the engine was loading the models. Choose a smaller quantisation in Settings → Models, or close whatever else is using the card — the writing assistant holds several gigabytes of its own.',
  load_ram: 'The computer ran out of memory (RAM) while the engine was loading the models. Close other programs that take memory, or choose a smaller quantisation in Settings → Models.',
  engine_fatal: 'The engine stopped this song: {line}',
  engine_failed: 'The engine stopped this song; its log in Settings → Local engine has the reason.',
  engine_unreachable: 'The engine stopped answering about this song: {detail}',
  import_failed: 'The engine finished the song, but the studio could not take it into the library: {detail}',
  openrouter_no_model: 'Choose a music model from the refreshed OpenRouter catalog.',
  openrouter_catalog_stale: 'Refresh the OpenRouter catalog before making music in the cloud.',
  openrouter_failed: 'OpenRouter could not make the song: {detail}',
};

const RU: ErrorTexts = {
  prompt_too_long: 'Описание и текст — {tokens} токенов, больше предела модели ({limit}): сократите описание или текст на {over} токенов.',
  kv_cache_short: 'Этой песне нужно {needed} мест в кеше языковой модели ({tokens} токенов описания и текста и {frames} кадров на {seconds} с музыки), а в Настройках → Локальный движок этот кеш (KV-кеш LM, --max-seq) ограничен {max_seq}. Поставьте не меньше {suggest} или очистите поле, чтобы модель брала свою полную длину.',
  training_on_card: 'На видеокарте идёт обучение LoRA: песни можно делать, когда оно закончится.',
  lost_vram: 'На этой песне у видеокарты кончилась память, движок перезапустился, и песня потеряна. Выберите набор моделей поменьше в Настройках → Модели или песню короче и закройте всё, что ещё занимает видеокарту; на карте слабее самого маленького набора песни не делаются.',
  lost_ram: 'На этой песне у компьютера кончилась оперативная память (RAM), движок перезапустился, и песня потеряна. Закройте программы, которые занимают память, или выберите набор моделей поменьше в Настройках → Модели или песню короче.',
  lost_device: 'Во время этой песни видеокарта дала сбой ({detail}), движок перезапустился, и песня потеряна. Лог движка — в Настройках → Локальный движок.',
  lost_device_on_card: 'Во время этой песни видеокарта дала сбой ({detail}) — {card}, compute {compute}, драйвер {driver}, сборка {build}; движок перезапустился, и песня потеряна. Лог движка — в Настройках → Локальный движок.',
  lost_device_silent: 'Во время этой песни видеокарта дала сбой (ошибка CUDA или драйвера), движок перезапустился, и песня потеряна. Лог движка — в Настройках → Локальный движок.',
  lost_at_line: 'Движок остановился во время этой песни и перезапустился, песня потеряна; его последняя строка: {line}. Лог движка — в Настройках → Локальный движок.',
  lost: 'Движок остановился во время этой песни и перезапустился, песня потеряна. Лог движка — в Настройках → Локальный движок.',
  lost_exit: 'Движок остановился во время этой песни ({meaning}, код выхода {exit}) и перезапустился, песня потеряна. Лог движка — в Настройках → Локальный движок.',
  lost_port_set: 'Движок не смог слушать порт {port}, заданный в MINIMAX_MM_SERVER_PORT, песня потеряна: порт занят другой программой. Закройте её или задайте другой порт.',
  lost_port_taken: 'Движок не смог слушать порт {port}, песня потеряна: порт заняла другая программа после того, как студия его выбрала. Перезапустите студию — при старте она выберет свободный порт.',
  lost_exit_at_line: 'Движок остановился во время этой песни ({meaning}, код выхода {exit}) и перезапустился, песня потеряна; его последняя строка: {line}. Лог движка — в Настройках → Локальный движок.',
  exit_access_violation: 'сбой: нарушение доступа к памяти',
  exit_illegal_instruction: 'инструкция, которой нет у этого процессора',
  exit_aborted: 'сбой: движок прервал работу',
  exit_stack_overflow: 'сбой: переполнение стека',
  exit_heap_corruption: 'сбой: повреждена память',
  exit_library_missing: 'не загрузилась библиотека движка',
  exit_out_of_memory: 'у компьютера кончилась память',
  exit_other: 'процесс завершился',
  load_vram: 'У видеокарты кончилась память, пока движок загружал модели. Выберите квантование поменьше в Настройках → Модели или закройте всё, что ещё занимает видеокарту, — помощник по текстам сам держит несколько гигабайт.',
  load_ram: 'У компьютера кончилась оперативная память (RAM), пока движок загружал модели. Закройте программы, которые занимают память, или выберите квантование поменьше в Настройках → Модели.',
  engine_fatal: 'Движок остановил эту песню: {line}',
  engine_failed: 'Движок остановил эту песню; причина — в его логе в Настройках → Локальный движок.',
  engine_unreachable: 'Движок перестал отвечать про эту песню: {detail}',
  import_failed: 'Движок доделал песню, но студия не смогла забрать её в медиатеку: {detail}',
  openrouter_no_model: 'Выберите музыкальную модель из обновлённого каталога OpenRouter.',
  openrouter_catalog_stale: 'Обновите каталог OpenRouter, прежде чем делать музыку в облаке.',
  openrouter_failed: 'OpenRouter не смог сделать песню: {detail}',
};

const ZH: ErrorTexts = {
  prompt_too_long: '描述和歌词共 {tokens} 个 token，超过模型上限 {limit}：请把描述或歌词缩短 {over} 个 token。',
  kv_cache_short: '这首歌需要语言模型缓存中的 {needed} 个位置（描述和歌词 {tokens} 个 token，{seconds} 秒音乐 {frames} 帧），但“设置 → 本地引擎”把该缓存（LM KV 缓存，--max-seq）限制为 {max_seq}。请设为 {suggest} 或更大，或清空该字段以使用模型的完整长度。',
  training_on_card: '显卡正在训练 LoRA，训练结束后再生成歌曲。',
  lost_vram: '生成这首歌时显卡显存耗尽，引擎已重启，这首歌丢失了。请在“设置 → 模型”中选择更小的模型组合或更短的歌曲，并关闭其他占用显卡的程序；显卡低于最小组合时无法生成歌曲。',
  lost_ram: '生成这首歌时电脑内存（RAM）耗尽，引擎已重启，这首歌丢失了。请关闭占用内存的程序，或在“设置 → 模型”中选择更小的模型组合或更短的歌曲。',
  lost_device: '生成这首歌时显卡出错（{detail}），引擎已重启，这首歌丢失了。引擎日志在“设置 → 本地引擎”。',
  lost_device_on_card: '生成这首歌时显卡出错（{detail}）——{card}，compute {compute}，驱动 {driver}，{build} 版本；引擎已重启，这首歌丢失了。引擎日志在“设置 → 本地引擎”。',
  lost_device_silent: '生成这首歌时显卡出错（CUDA 或驱动错误），引擎已重启，这首歌丢失了。引擎日志在“设置 → 本地引擎”。',
  lost_at_line: '生成这首歌时引擎停止并已重启，这首歌丢失了；它的最后一行是 {line}。引擎日志在“设置 → 本地引擎”。',
  lost: '生成这首歌时引擎停止并已重启，这首歌丢失了。引擎日志在“设置 → 本地引擎”。',
  lost_exit: '生成这首歌时引擎停止（{meaning}，退出代码 {exit}）并已重启，这首歌丢失了。引擎日志在“设置 → 本地引擎”。',
  lost_port_set: '引擎无法监听 MINIMAX_MM_SERVER_PORT 指定的端口 {port}，这首歌丢失了：该端口被其他程序占用。请关闭该程序或设置其他端口。',
  lost_port_taken: '引擎无法监听端口 {port}，这首歌丢失了：工作室选定该端口后被其他程序占用。请重启工作室，它会在启动时选择空闲端口。',
  lost_exit_at_line: '生成这首歌时引擎停止（{meaning}，退出代码 {exit}）并已重启，这首歌丢失了；它的最后一行是 {line}。引擎日志在“设置 → 本地引擎”。',
  exit_access_violation: '崩溃：内存访问冲突',
  exit_illegal_instruction: '这台处理器不支持的指令',
  exit_aborted: '崩溃：引擎中止',
  exit_stack_overflow: '崩溃：栈溢出',
  exit_heap_corruption: '崩溃：内存损坏',
  exit_library_missing: '引擎的某个库未能加载',
  exit_out_of_memory: '电脑内存不足',
  exit_other: '进程已退出',
  load_vram: '引擎加载模型时显卡显存耗尽。请在“设置 → 模型”中选择更小的量化，或关闭其他占用显卡的程序——写作助手本身就占用数 GB。',
  load_ram: '引擎加载模型时电脑内存（RAM）耗尽。请关闭占用内存的程序，或在“设置 → 模型”中选择更小的量化。',
  engine_fatal: '引擎停止了这首歌：{line}',
  engine_failed: '引擎停止了这首歌；原因见“设置 → 本地引擎”中的日志。',
  engine_unreachable: '引擎不再回应这首歌的状态：{detail}',
  import_failed: '引擎已完成这首歌，但工作室未能将其放入媒体库：{detail}',
  openrouter_no_model: '请从刷新后的 OpenRouter 目录中选择一个音乐模型。',
  openrouter_catalog_stale: '在云端生成音乐之前，请先刷新 OpenRouter 目录。',
  openrouter_failed: 'OpenRouter 未能生成这首歌：{detail}',
};

const JA: ErrorTexts = {
  prompt_too_long: '説明と歌詞は {tokens} トークンで、モデルの上限 {limit} を超えています：説明か歌詞を {over} トークン短くしてください。',
  kv_cache_short: 'この曲には言語モデルのキャッシュが {needed} 必要です（説明と歌詞 {tokens} トークン、{seconds} 秒の音楽に {frames} フレーム）が、「設定 → ローカルエンジン」でこのキャッシュ（LM KV キャッシュ、--max-seq）が {max_seq} に制限されています。{suggest} 以上にするか、欄を空にしてモデル本来の長さを使ってください。',
  training_on_card: 'グラフィックカードで LoRA の学習中です。終わってから曲を作ってください。',
  lost_vram: 'この曲でグラフィックカードのメモリが足りなくなり、エンジンが再起動したため曲は失われました。「設定 → モデル」で小さいモデルセットか短い曲を選び、カードを使っている他のものを閉じてください。最小のセットに満たないカードでは曲を作れません。',
  lost_ram: 'この曲でパソコンのメモリ（RAM）が足りなくなり、エンジンが再起動したため曲は失われました。メモリを使う他のプログラムを閉じるか、「設定 → モデル」で小さいモデルセットか短い曲を選んでください。',
  lost_device: 'この曲の途中でグラフィックカードが失敗し（{detail}）、エンジンが再起動したため曲は失われました。エンジンのログは「設定 → ローカルエンジン」にあります。',
  lost_device_on_card: 'この曲の途中でグラフィックカードが失敗し（{detail}、{card}、compute {compute}、ドライバー {driver}、{build} ビルド）、エンジンが再起動したため曲は失われました。エンジンのログは「設定 → ローカルエンジン」にあります。',
  lost_device_silent: 'この曲の途中でグラフィックカードが失敗し（CUDA またはドライバーのエラー）、エンジンが再起動したため曲は失われました。エンジンのログは「設定 → ローカルエンジン」にあります。',
  lost_at_line: 'この曲の途中でエンジンが止まって再起動し、曲は失われました。最後の行：{line}。エンジンのログは「設定 → ローカルエンジン」にあります。',
  lost: 'この曲の途中でエンジンが止まって再起動し、曲は失われました。エンジンのログは「設定 → ローカルエンジン」にあります。',
  lost_exit: 'この曲の途中でエンジンが止まり（{meaning}、終了コード {exit}）、再起動したため曲は失われました。エンジンのログは「設定 → ローカルエンジン」にあります。',
  lost_port_set: 'エンジンが MINIMAX_MM_SERVER_PORT で指定したポート {port} で待ち受けできず、曲は失われました。別のプログラムがそのポートを使っています。そのプログラムを閉じるか、別のポートを指定してください。',
  lost_port_taken: 'エンジンがポート {port} で待ち受けできず、曲は失われました。スタジオが選んだ後に別のプログラムがそのポートを使い始めました。スタジオを再起動してください。起動時に空いているポートを選びます。',
  lost_exit_at_line: 'この曲の途中でエンジンが止まり（{meaning}、終了コード {exit}）、再起動したため曲は失われました。最後の行：{line}。エンジンのログは「設定 → ローカルエンジン」にあります。',
  exit_access_violation: 'クラッシュ：アクセス違反',
  exit_illegal_instruction: 'このプロセッサにない命令',
  exit_aborted: 'クラッシュ：エンジンが中断',
  exit_stack_overflow: 'クラッシュ：スタックオーバーフロー',
  exit_heap_corruption: 'クラッシュ：メモリ破損',
  exit_library_missing: 'エンジンのライブラリが読み込めなかった',
  exit_out_of_memory: 'コンピューターのメモリ不足',
  exit_other: 'プロセスが終了',
  load_vram: 'エンジンがモデルを読み込む間にグラフィックカードのメモリが足りなくなりました。「設定 → モデル」で小さい量子化を選ぶか、カードを使っている他のものを閉じてください。作詞アシスタントだけでも数 GB を使います。',
  load_ram: 'エンジンがモデルを読み込む間にパソコンのメモリ（RAM）が足りなくなりました。メモリを使う他のプログラムを閉じるか、「設定 → モデル」で小さい量子化を選んでください。',
  engine_fatal: 'エンジンがこの曲を止めました：{line}',
  engine_failed: 'エンジンがこの曲を止めました。理由は「設定 → ローカルエンジン」のログにあります。',
  engine_unreachable: 'エンジンがこの曲について応答しなくなりました：{detail}',
  import_failed: 'エンジンは曲を仕上げましたが、スタジオがライブラリに取り込めませんでした：{detail}',
  openrouter_no_model: '更新した OpenRouter カタログから音楽モデルを選んでください。',
  openrouter_catalog_stale: 'クラウドで音楽を作る前に OpenRouter カタログを更新してください。',
  openrouter_failed: 'OpenRouter で曲を作れませんでした：{detail}',
};

const KO: ErrorTexts = {
  prompt_too_long: '설명과 가사가 {tokens} 토큰으로 모델 한도 {limit}을(를) 넘습니다: 설명이나 가사를 {over} 토큰 줄이세요.',
  kv_cache_short: '이 곡에는 언어 모델 캐시가 {needed} 칸 필요합니다(설명과 가사 {tokens} 토큰, {seconds}초 음악에 {frames} 프레임). 그런데 "설정 → 로컬 엔진"에서 이 캐시(LM KV 캐시, --max-seq)가 {max_seq}(으)로 제한되어 있습니다. {suggest} 이상으로 설정하거나 칸을 비워 모델의 전체 길이를 쓰세요.',
  training_on_card: '그래픽카드에서 LoRA 학습 중입니다. 학습이 끝난 뒤 곡을 만드세요.',
  lost_vram: '이 곡에서 그래픽카드 메모리가 부족해 엔진이 다시 시작되었고 곡을 잃었습니다. "설정 → 모델"에서 더 작은 모델 세트나 더 짧은 곡을 고르고, 카드를 쓰는 다른 것을 닫으세요. 가장 작은 세트보다 약한 카드로는 곡을 만들 수 없습니다.',
  lost_ram: '이 곡에서 컴퓨터 메모리(RAM)가 부족해 엔진이 다시 시작되었고 곡을 잃었습니다. 메모리를 쓰는 다른 프로그램을 닫거나 "설정 → 모델"에서 더 작은 모델 세트나 더 짧은 곡을 고르세요.',
  lost_device: '이 곡을 만드는 중 그래픽카드에 오류가 나서({detail}) 엔진이 다시 시작되었고 곡을 잃었습니다. 엔진 로그는 "설정 → 로컬 엔진"에 있습니다.',
  lost_device_on_card: '이 곡을 만드는 중 그래픽카드에 오류가 나서({detail}, {card}, compute {compute}, 드라이버 {driver}, {build} 빌드) 엔진이 다시 시작되었고 곡을 잃었습니다. 엔진 로그는 "설정 → 로컬 엔진"에 있습니다.',
  lost_device_silent: '이 곡을 만드는 중 그래픽카드에 오류가 나서(CUDA 또는 드라이버 오류) 엔진이 다시 시작되었고 곡을 잃었습니다. 엔진 로그는 "설정 → 로컬 엔진"에 있습니다.',
  lost_at_line: '이 곡을 만드는 중 엔진이 멈췄다가 다시 시작되어 곡을 잃었습니다. 마지막 줄: {line}. 엔진 로그는 "설정 → 로컬 엔진"에 있습니다.',
  lost: '이 곡을 만드는 중 엔진이 멈췄다가 다시 시작되어 곡을 잃었습니다. 엔진 로그는 "설정 → 로컬 엔진"에 있습니다.',
  lost_exit: '이 곡을 만드는 중 엔진이 멈췄다가({meaning}, 종료 코드 {exit}) 다시 시작되어 곡을 잃었습니다. 엔진 로그는 "설정 → 로컬 엔진"에 있습니다.',
  lost_port_set: '엔진이 MINIMAX_MM_SERVER_PORT에 지정된 포트 {port}에서 대기할 수 없어 곡을 잃었습니다. 다른 프로그램이 그 포트를 쓰고 있습니다. 그 프로그램을 닫거나 다른 포트를 지정하세요.',
  lost_port_taken: '엔진이 포트 {port}에서 대기할 수 없어 곡을 잃었습니다. 스튜디오가 포트를 고른 뒤 다른 프로그램이 그 포트를 차지했습니다. 스튜디오를 다시 시작하세요. 시작할 때 빈 포트를 고릅니다.',
  lost_exit_at_line: '이 곡을 만드는 중 엔진이 멈췄다가({meaning}, 종료 코드 {exit}) 다시 시작되어 곡을 잃었습니다. 마지막 줄: {line}. 엔진 로그는 "설정 → 로컬 엔진"에 있습니다.',
  exit_access_violation: '충돌: 메모리 접근 위반',
  exit_illegal_instruction: '이 프로세서에 없는 명령',
  exit_aborted: '충돌: 엔진이 중단됨',
  exit_stack_overflow: '충돌: 스택 오버플로',
  exit_heap_corruption: '충돌: 메모리 손상',
  exit_library_missing: '엔진 라이브러리를 불러오지 못함',
  exit_out_of_memory: '컴퓨터 메모리 부족',
  exit_other: '프로세스가 종료됨',
  load_vram: '엔진이 모델을 불러오는 동안 그래픽카드 메모리가 부족했습니다. "설정 → 모델"에서 더 작은 양자화를 고르거나 카드를 쓰는 다른 것을 닫으세요. 작사 도우미만으로도 몇 GB를 씁니다.',
  load_ram: '엔진이 모델을 불러오는 동안 컴퓨터 메모리(RAM)가 부족했습니다. 메모리를 쓰는 다른 프로그램을 닫거나 "설정 → 모델"에서 더 작은 양자화를 고르세요.',
  engine_fatal: '엔진이 이 곡을 멈췄습니다: {line}',
  engine_failed: '엔진이 이 곡을 멈췄습니다. 이유는 "설정 → 로컬 엔진"의 로그에 있습니다.',
  engine_unreachable: '엔진이 이 곡에 대해 더 이상 응답하지 않습니다: {detail}',
  import_failed: '엔진은 곡을 완성했지만 스튜디오가 라이브러리로 가져오지 못했습니다: {detail}',
  openrouter_no_model: '새로 고친 OpenRouter 카탈로그에서 음악 모델을 고르세요.',
  openrouter_catalog_stale: '클라우드에서 음악을 만들기 전에 OpenRouter 카탈로그를 새로 고치세요.',
  openrouter_failed: 'OpenRouter가 곡을 만들지 못했습니다: {detail}',
};

const BY_LANGUAGE: Record<Language, ErrorTexts> = { en: EN, ru: RU, zh: ZH, ja: JA, ko: KO };

/** A failed song as the service sent it: its English text and, when the reason has a kind, a code with fields. */
export interface SongFailure {
  message?: string | null;
  code?: string | null;
  params?: Record<string, unknown> | null;
}

/** Why a song failed, in the window's language. Without a code, the service's text as it is: it shows there is no translation. */
export function songErrorText(failure: SongFailure | null | undefined, language: Language): string {
  const raw = failure?.message ?? '';
  const template = failure?.code ? BY_LANGUAGE[language][failure.code] : undefined;
  if (!template) return raw;
  const params = failure?.params ?? {};
  const texts = BY_LANGUAGE[language];
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = params[key];
    if (value === undefined || value === null) return match;
    // what an exit code means comes as a key and is said in the window's language
    if (key === 'meaning') return texts[`exit_${String(value)}`] ?? String(value);
    return String(value);
  });
}
