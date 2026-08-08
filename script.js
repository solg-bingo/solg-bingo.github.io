// =================================================================
// 1. 初期設定とグローバル変数の定義
// =================================================================

// 参加者の一意のIDを生成・保持 (ユーザー入力またはランダム仮ID)
let userId = localStorage.getItem('bingoUserId') || 'user_' + Date.now() + Math.floor(Math.random() * 10000);

// ★★★ ここが自治体リストのデフォルト値です (9個以上必須) ★★★
// setup.htmlでFirestoreに設定が保存されている場合は、起動時にそちらで上書きされます
let targetPrefectures = [
  "札幌市", "常総市", "土浦市", "石岡市", "つくば市",
  "栃木市", "佐野市", "高崎市", "さいたま市", "三郷市",
  "蓮田市", "鴻巣市", "狭山市", "市川市", "柏市",
  "松戸市", "浦安市", "多摩市", "世田谷区", "清瀬市",
  "品川区", "練馬区", "杉並区", "葛飾区", "目黒区",
  "文京区", "墨田区", "新宿区", "港区", "台東区",
  "横浜市", "箱根町", "鎌倉市", "小千谷市", "高岡市",
  "加賀市", "長野市", "御殿場市", "沼津市", "三重県"
];


// ★★★ ここがクイズリストのデフォルト値です ★★★
// setup.htmlでFirestoreに設定が保存されている場合は、起動時にそちらで上書きされます
let quizList = [
    {
        id: 1,
        question: "クマの出没が全国的に深刻なニュースとなっている。秋田県では、ツキノワグマ情報マップシステムを公開しているが、名称は次のうちどれ？", 
        answer: "ぱー", 
        choices: ["クマソク", "クマナビ", "クマダス"] 
    },
    { 
        id: 2, 
        question: "年始の名物「箱根駅伝」。最もコースが長いのは有名な「華の2区」とその復路の9区で23.1km。では、二番目に長い区間はどこ？", 
        answer: "ぱー", 
        choices: ["1区", "3区", "10区"] 
    },
    { 
        id: 3, 
        question: "次のうち、実在しないパン屋の名前はどれ？", 
        answer: "ぱー", 
        choices: ["わたし入籍します", "くちびるが止まらない", "もう戻れないの"] 
    },
    { 
        id: 4, 
        question: "歴代横綱の在位場所数ランキング、1位は白鳳、2位は北の湖。では、3位は誰？", 
        answer: "ちょき", 
        choices: ["大鵬", "千代の富士", "貴乃花"] 
    },
    { 
        id: 5, 
        question: "今年の流行語大賞に、16年ぶりに現職の首相が発した言葉が選ばれた。初めて現職総理が流行語大賞に選ばれたのは次のうち誰？", 
        answer: "ぐー", 
        choices: ["小渕恵三", "小泉純一郎", "安倍晋三"] 
    },
    { 
        id: 6, 
        question: "今年オーディションにより新メンバーを迎え入れた「timelesz」（旧SexyZone）。現在のメンバー数は？", 
        answer: "ぱー", 
        choices: ["5人", "7人", "8人"] 
    },
    { 
        id: 7, 
        question: "東京2025世界陸上の男子棒高跳優勝者、デュプランティス選手は世界記録を何度更新している？", 
        answer: "ちょき", 
        choices: ["12回", "14回", "16回"] 
    },
    { 
        id: 8, 
        question: "今年の大リーグワールドシリーズは、連覇を目指すドジャースと、32年ぶりの優勝を目指すブルージェイズの対戦でした。次のうち、大リーグで唯一、ワールドシリーズに進出したことがないチームは？", 
        answer: "ぱー", 
        choices: ["ロッキーズ", "パドレス", "マリナーズ"] 
    },
    { 
        id: 9, 
        question: "今年6月に公開された映画「国宝」が、邦画実写の興行収入、歴代1位を記録しました。題材となっている歌舞伎の原型とされる「かぶき踊り」が始まったのはおよそ何年頃？", 
        answer: "ぐー", 
        choices: ["1603年", "1782年", "1476年"] 
    },
    { 
        id: 10, 
        question: "RADWIMPSの20周年トリビュートアルバムに参加していないアーティストは？", 
        answer: "ぐー", 
        choices: ["BUMP OF CHICKEN", "My Hair is Bad", "Mrs. GREEN APPLE"] 
    },
    { 
        id: 11, 
        question: "今年の上半期芥川賞・直木賞（第173回）は、まさかの両賞とも「該当なし」。では、芥川賞直木賞ともに「該当なし」だったのは、今年のものを含めて過去何回あった？", 
        answer: "ぐー", 
        choices: ["6回", "9回", "13回"] 
    },
    { 
        id: 12, 
        question: "今、何問目？", 
        answer: "ちょき", 
        choices: ["11問目", "12問目", "13問目"] 
    },
    { 
        id: 13, 
        question: "大阪・関西万博効果により、特別手当の支給が報じられた会社の中で、1人あたりの支給額が最も高いのはどこ？", 
        answer: "ちょき", 
        choices: ["JR西日本", "大阪メトロ", "近鉄"] 
    },
    { 
        id: 14, 
        question: "株式会社獺祭が販売する超有名日本酒「獺祭」。その名前はある動物の習性に由来します。さて、その動物は？", 
        answer: "ちょき", 
        choices: ["カモシカ", "カワウソ", "タヌキ"] 
    },
    { 
        id: 15, 
        question: "雑煮の餅の形、「東は四角、西は丸」と言われているが、その境目はどこ？", 
        answer: "ぱー", 
        choices: ["飛騨", "諏訪", "関ケ原"] 
    }
];

// ★★★ サンプル：自治体名 → ゆるキャラ画像のマッピング ★★★
// ここに用意した画像を割り当てると、ビンゴのマスや抽選結果にキャラクターが表示されます（未設定の自治体は今まで通り文字のみ）
const prefectureImages = {
    "札幌市": "images/sample_sapporo.svg",
    "横浜市": "images/sample_yokohama.svg",
    "鎌倉市": "images/sample_kamakura.svg",
    "つくば市": "images/sample_tsukuba.svg"
};

let currentDrawnPrefectures = [];
let currentQuiz = null;
let quizIndex = 0;
let currentRole = 'player';
let autoResultsShown = false; // 参加者全員のビンゴ達成による自動発表が済んだかどうか（親機のみ使用）
let lastKnownDrawnCount = null; // ゲームリセット検知用（子機のみ使用）

// =================================================================
// 2. ユーザーID設定機能
// =================================================================

function setUserId() {
    const inputField = document.getElementById('user-id-field');
    const newId = inputField.value.trim();

    if (newId.length < 2 || newId.length > 15) {
        alert("IDは2文字以上15文字以内で入力してください。");
        return;
    }
    
    localStorage.setItem('bingoUserId', newId);
    alert(`ユーザーIDを「${newId}」に設定しました。`);
    window.location.reload(); 
}

// =================================================================
// 3. 役割判定とUI切り替え (ID表示含む)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Firestoreに幹事が保存した自治体リスト・クイズ設定があれば読み込んでから初期化する
    loadGameConfig().then(initializeApp);
});

// setup.htmlで保存された設定(config/gameConfig)を読み込み、あればデフォルト値を上書きする
function loadGameConfig() {
    return db.collection('config').doc('gameConfig').get()
        .then(doc => {
            if (!doc.exists) return;
            const data = doc.data();
            if (Array.isArray(data.targetPrefectures) && data.targetPrefectures.length >= 9) {
                targetPrefectures = data.targetPrefectures;
            }
            if (Array.isArray(data.quizList) && data.quizList.length > 0) {
                quizList = data.quizList;
            }
        })
        .catch(error => {
            console.error("ゲーム設定の読み込みに失敗しました。デフォルト設定を使用します:", error);
        });
}

function initializeApp() {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    const isDebugMode = urlParams.get('debug') === '1';

    const masterArea = document.getElementById('master-only');
    const playerArea = document.getElementById('player-only');

    // ★★★ 画面分離ロジックを確実に動作させる ★★★
    if (role === 'master') {
        currentRole = 'master';
        if (playerArea) playerArea.style.display = 'none';
        if (masterArea) masterArea.style.display = 'block'; 

// ★★★ 修正箇所：親機起動時のFirebase状態の初期化 ★★★
        gameRef.set({
            isQuizActive: false,
            currentQuizData: null,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true })
        .then(() => {
            console.log("Master mode started. Quiz state initialized on Firebase.");
        })
        .catch(error => {
            console.error("Firebase initialization failed:", error);
        });
        // ★★★ 修正ここまで ★★★

    } else {
        currentRole = 'player';
        if (masterArea) masterArea.style.display = 'none';
        if (playerArea) playerArea.style.display = 'block';
        generateNewCard(); // 子機でのみカードを生成・描画
    }
    // ★★★ 画面分離ロジック終わり ★★★


    // ID入力フィールドの初期化と表示
    const idDisplay = document.getElementById('current-user-id');
    const idField = document.getElementById('user-id-field');
    const setIdButton = document.getElementById('set-id-button'); 
    
    if (idField) {
        idField.value = userId; 
    }

    // IDが設定済みの場合、入力とボタンをロック
    if (userId && !userId.startsWith('user_')) {
        if (idField) {
            idField.readOnly = true;
            idField.style.backgroundColor = '#f0f0f0';
        }
        if (setIdButton) {
            setIdButton.disabled = true;
            setIdButton.textContent = 'ID設定済み';
        }
        if (idDisplay) {
            idDisplay.textContent = `現在のID: ${userId} (設定済み)`;
            idDisplay.style.color = 'darkgreen';
        }
    } else {
        if (idDisplay) {
            idDisplay.textContent = `現在のID: ${userId} (設定ボタンで確定してください)`;
        }
    }
    
    // ★★★ ボタンに関数を安全に紐づけ直す（エラー対策） ★★★
    const drawNextButton = document.getElementById('draw-next-button');
    const triggerButton = document.getElementById('quiz-trigger-button');
    const endJudgeButton = document.querySelector('#quiz-control-section button'); // 回答受付終了ボタン

    if (drawNextButton) {
        drawNextButton.addEventListener('click', drawNext);
    }
    if (triggerButton) {
        triggerButton.addEventListener('click', triggerQuiz);
    }
    if (endJudgeButton) {
        endJudgeButton.addEventListener('click', endQuizReceptionAndJudge);
    }

    const showResultsButton = document.getElementById('show-results-button');
    const resetGameButton = document.getElementById('reset-game-button');
    if (showResultsButton) {
        showResultsButton.addEventListener('click', showFinalResults);
    }
    if (resetGameButton) {
        resetGameButton.addEventListener('click', resetGame);
    }
    // ★★★ 紐づけ処理終わり ★★★

    // 本番URL(&debug=1なし)では開発者向けの「ゲームをリセット」「最終結果を発表」ボタンを隠す
    if (resetGameButton) {
        resetGameButton.style.display = isDebugMode ? 'inline-block' : 'none';
    }
    if (showResultsButton) {
        showResultsButton.style.display = isDebugMode ? 'inline-block' : 'none';
    }
}

// =================================================================
// 4. 共通機能: Firebaseリアルタイム監視と履歴更新
// =================================================================

gameRef.onSnapshot((doc) => {
    if (doc.exists) {
        const data = doc.data();
        const drawnFromFirebase = data.drawnPrefectures || [];
        
        currentDrawnPrefectures = drawnFromFirebase;
        updateHistoryDisplay(drawnFromFirebase);

        if (data.currentQuizData) {
            currentQuiz = data.currentQuizData; 
        } else {
            currentQuiz = null; 
        }
        
        if (currentRole === 'player') {
            // 抽選履歴が「あり」から「なし」に変わったら、ゲームがリセットされたとみなし新しいカードを作る
            if (lastKnownDrawnCount !== null && lastKnownDrawnCount > 0 && drawnFromFirebase.length === 0) {
                resetSavedCard();
                generateNewCard();
            }
            lastKnownDrawnCount = drawnFromFirebase.length;

            handlePlayerQuizUI(data);
            markCardAutomatically(drawnFromFirebase);
        } else if (currentRole === 'master') {
            checkAllPrefecturesDrawn(drawnFromFirebase);
        }
    }
});

// 親機: 自治体がすべて出たら自動で最終結果を表示する
function checkAllPrefecturesDrawn(drawn) {
    if (autoResultsShown) return;
    if (targetPrefectures.length > 0 && drawn.length >= targetPrefectures.length) {
        autoResultsShown = true;
        showFinalResults();
    }
}

function updateHistoryDisplay(drawn) {
    const historyDiv = document.getElementById('history-list');
    if(historyDiv) historyDiv.textContent = drawn.join(' / ') + (drawn.length > 0 ? ' / ' : '');
    showCurrentDraw(drawn[drawn.length - 1] || '---');
}

// #current-drawにテキスト（と、サンプル画像があればマスコット画像）を表示する
function showCurrentDraw(name) {
    const currentDrawElement = document.getElementById('current-draw');
    if (!currentDrawElement) return;
    currentDrawElement.innerHTML = '';

    const imageUrl = prefectureImages[name];
    if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = name;
        img.classList.add('draw-mascot');
        currentDrawElement.appendChild(img);
        currentDrawElement.appendChild(document.createElement('br'));
    }
    currentDrawElement.appendChild(document.createTextNode(name));
}

function handlePlayerQuizUI(data) {
    const quizSection = document.getElementById('player-quiz-answer-section');
    const message = document.getElementById('player-quiz-message');
    const buttons = quizSection.querySelectorAll('button');
    const blocker = document.getElementById('click-blocker');

    // ★★★ 修正: クイズがアクティブな場合のみ表示処理を行う ★★★
    if (data.isQuizActive === true) {
        // --- クイズ開始時 ---
        quizSection.style.display = 'block';
        message.textContent = "クイズが出題されました！回答してください。";

        // ボタンを有効化し、前回の回答色をクリアしてからブロッカーを隠す
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('answered');
        });
        if (blocker) blocker.style.display = 'none';
        
    } else {
        // --- クイズ終了時 (または開始前) ---
        
        // 判定結果が表示中の場合 (currentQuizが残っている場合) は、非表示にしない
        if (!currentQuiz) {
             quizSection.style.display = 'none'; // クイズが完全に終わっていればUIを非表示
        } else {
             // 判定結果が表示中の間は、回答UIを隠し、結果確認を促すメッセージなどを残すことも可能
             // 現状は、currentQuizが残っていると親機で結果が表示されている状態なので、ここでは何もしません
        }
        
        message.textContent = "";
    }
}

// =================================================================
// 5. 子機機能: カード生成と手動マーク (簡略化)
// =================================================================

function create3x3BingoCard() {
    let tempPrefectures = [...targetPrefectures];
    let selected = [];
    for (let i = 0; i < 9; i++) {
      if (tempPrefectures.length === 0) break;
      const randomIndex = Math.floor(Math.random() * tempPrefectures.length);
      selected.push(tempPrefectures.splice(randomIndex, 1)[0]);
    }
    return selected;
}

function drawBingoCard3x3(elements) {
    const container = document.getElementById('card-container');
    if(!container) return;
    container.innerHTML = '';
    const table = document.createElement('table');
    table.classList.add('bingo-card-3x3'); 
    let index = 0;

    for (let row = 0; row < 3; row++) {
        const tr = document.createElement('tr');
        for (let col = 0; col < 3; col++) {
            const td = document.createElement('td');
            td.textContent = elements[index];
            td.classList.add('bingo-cell');

            td.addEventListener('click', function() {
                manualMarkCell(td);
            });
            
            tr.appendChild(td);
            index++;
        }
        table.appendChild(tr);
    }
    container.appendChild(table);
}

// カードの割り当ては端末ごとにlocalStorageへ保存し、ニックネーム設定やページ再読み込みをまたいで保持する
function generateNewCard() {
    let bingoCardElements = loadSavedCard();
    if (!bingoCardElements) {
        bingoCardElements = create3x3BingoCard();
        localStorage.setItem('bingoCard', JSON.stringify(bingoCardElements));
    }
    drawBingoCard3x3(bingoCardElements);
    restoreMarkedCells();
    markCardAutomatically(currentDrawnPrefectures);
}

function loadSavedCard() {
    try {
        const saved = JSON.parse(localStorage.getItem('bingoCard'));
        if (Array.isArray(saved) && saved.length === 9) return saved;
    } catch (e) {
        // 保存データが壊れている場合は無視して新しいカードを作る
    }
    return null;
}

function restoreMarkedCells() {
    let marked = [];
    try {
        marked = JSON.parse(localStorage.getItem('bingoMarked')) || [];
    } catch (e) {
        marked = [];
    }
    document.querySelectorAll('.bingo-cell').forEach((cell, i) => {
        if (marked[i]) cell.classList.add('marked');
    });
}

function saveMarkedCells() {
    const marked = Array.from(document.querySelectorAll('.bingo-cell')).map(cell => cell.classList.contains('marked'));
    localStorage.setItem('bingoMarked', JSON.stringify(marked));
}

// ゲーム全体がリセットされたときに、保存済みのカード・マーク状態を消して新しいカードを作る
function resetSavedCard() {
    localStorage.removeItem('bingoCard');
    localStorage.removeItem('bingoMarked');
    localStorage.removeItem('bingoAlerted');
}

function markCardAutomatically(drawn) {
    checkBingoAuto();
}

function manualMarkCell(cell) {
    const prefecture = cell.textContent;
    if (cell.classList.contains('marked')) return;

    if (currentDrawnPrefectures.includes(prefecture)) {
        cell.classList.add('marked');
        saveMarkedCells();
        checkBingoAuto();
    } else {
        alert(`${prefecture}はまだ抽選されていません。`);
    }
}

function checkBingoAuto() {
    const table = document.querySelector('.bingo-card-3x3');
    if (!table) return;

    const cells = table.querySelectorAll('.bingo-cell');
    const marks = Array.from(cells).map(cell => cell.classList.contains('marked'));

    const winningPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
    ];
    
    let bingoCount = 0;
    let reachCount = 0;
    
    for (const pattern of winningPatterns) {
        let markedInPattern = 0;
        for (const index of pattern) {
            if (marks[index]) markedInPattern++;
        }
        if (markedInPattern === 3) { bingoCount++; } 
        else if (markedInPattern === 2) { reachCount++; }
    }

    const bingoStatusElement = document.getElementById('bingo-status');
    if(bingoStatusElement) bingoStatusElement.textContent = `リーチ：${reachCount} / ビンゴ：${bingoCount}`;

    if (bingoCount > 0 && !table.dataset.bingoAnnounced) {
        table.dataset.bingoAnnounced = true;
        recordBingoWinner(bingoCount);
        // localStorageでも達成済みを記録し、再読み込みのたびに通知が繰り返されないようにする
        if (localStorage.getItem('bingoAlerted') !== 'true') {
            alert(`🎉 ビンゴ達成！合計 ${bingoCount} ラインです！`);
            localStorage.setItem('bingoAlerted', 'true');
        }
    }
}

// 達成順ランキング用に、初回ビンゴのみFirestoreに記録する（既に記録済みなら上書きしない）
function recordBingoWinner(bingoCount) {
    const winnerRef = db.collection('bingoWinners').doc(userId);
    winnerRef.get().then(doc => {
        if (doc.exists) return;
        winnerRef.set({
            userId: userId,
            bingoCount: bingoCount,
            achievedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }).catch(error => {
        console.error("ビンゴ記録の書き込みに失敗しました:", error);
    });
}

// =================================================================
// 6. 親機・クイズコントロール
// =================================================================

function resetQuizState() {
    currentQuiz = null; 

    // 1. 親機UIリセット 
    document.getElementById('quiz-area').style.display = 'none';
    const currentDrawElement = document.getElementById('current-draw');
    if(currentDrawElement) currentDrawElement.textContent = currentDrawnPrefectures[currentDrawnPrefectures.length - 1] || '---';
    
    // 抽選・クイズボタンの有効化
    document.getElementById('quiz-trigger-button').disabled = false;
    document.getElementById('draw-next-button').disabled = false; 
    
    document.getElementById('quiz-control-section').style.display = 'block'; 
    document.getElementById('bonus-section').style.display = 'none'; 

  // ★★★ 修正箇所: 結果表示エリアのテキストをクリア ★★★
    document.getElementById('quiz-result').textContent = ""; // 判定結果メッセージをクリア
    document.getElementById('first-answer-display').textContent = ""; // 回答者IDの情報をクリア
    // ★★★ 修正箇所終わり ★★★

    const playerQuizSection = document.getElementById('player-quiz-answer-section');
    if(playerQuizSection) {
        // 子機のボタンのスタイルとクリックブロッカーをリセット
        playerQuizSection.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('answered');
            btn.disabled = false;
        });
        document.getElementById('player-quiz-message').textContent = "";
        
        const blocker = document.getElementById('click-blocker');
        if (blocker) {
            blocker.style.display = 'none';
        }
    }

    // Firebaseの状態をリセット
    gameRef.set({
        isQuizActive: false,
        currentQuizData: null,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}

function drawNext() {
    if (currentQuiz) {
        alert("クイズ中です。先にクイズを完了してください。");
        return;
    }
    if (currentDrawnPrefectures.length >= targetPrefectures.length) {
        alert("すべての自治体が出ました。");
        return;
    }

    const availablePrefectures = targetPrefectures.filter(p => !currentDrawnPrefectures.includes(p));
    const randomIndex = Math.floor(Math.random() * availablePrefectures.length);
    const resultPrefecture = availablePrefectures[randomIndex];

    runRouletteAnimation(availablePrefectures, resultPrefecture, () => {
        gameRef.set({
            drawnPrefectures: firebase.firestore.FieldValue.arrayUnion(resultPrefecture),
            isQuizActive: false,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true })
        .then(() => {
            console.log(`Successfully drew: ${resultPrefecture}`);
        })
        .catch((error) => {
            console.error("Firebase update failed:", error);
        });
    });
}

// ルーレット風の抽選演出。poolからランダムな名前を高速表示し、最後にfinalResultで止めてonCompleteを呼ぶ
function runRouletteAnimation(pool, finalResult, onComplete) {
    const el = document.getElementById('current-draw');
    const drawBtn = document.getElementById('draw-next-button');
    const quizBtn = document.getElementById('quiz-trigger-button');

    if (!el) { onComplete(); return; }

    if (drawBtn) drawBtn.disabled = true;
    if (quizBtn) quizBtn.disabled = true;
    el.classList.add('rolling');

    const totalDuration = 1500; // 演出の合計時間(ms)
    const startTime = performance.now();

    function tick(now) {
        const elapsed = now - startTime;
        if (elapsed >= totalDuration) {
            showCurrentDraw(finalResult);
            el.classList.remove('rolling');
            if (drawBtn) drawBtn.disabled = false;
            if (quizBtn) quizBtn.disabled = false;
            onComplete();
            return;
        }
        el.textContent = pool[Math.floor(Math.random() * pool.length)];
        // 終盤にかけて表示の切り替えを遅くして「止まる」感を出す
        const stepMs = elapsed > totalDuration * 0.7 ? 180 : 70;
        setTimeout(() => requestAnimationFrame(tick), stepMs);
    }
    requestAnimationFrame(tick);
}

function triggerQuiz() {
    // 1. 進行中のクイズがある場合（リセットと再実行）
    if (currentQuiz) {
        // Firebaseにリセットを書き込み、その完了を待つ (非同期)

        gameRef.set({
            isQuizActive: false,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true })
        .then(() => {
            // UIとローカル変数をリセット
            resetQuizState(); 
            
            // リセット完了後、自動で次の出題ロジックに進む
            triggerQuiz(); 
        });
        
        return; // リセット処理中はここで終了
    }

    // --- ここから通常のクイズ出題ロジック (currentQuiz == null の場合のみ実行) ---
    
    if (quizIndex >= quizList.length) { 
        alert("すべてのクイズが出ました！"); 
        return; 
    }
    
    currentQuiz = quizList[quizIndex]; 

  // ★★★ 修正箇所: 前回の結果をクリアする処理を追加 ★★★
    document.getElementById('quiz-result').textContent = ""; // 判定結果メッセージ
    document.getElementById('first-answer-display').textContent = ""; // 最速回答IDなど
    // ★★★ 修正箇所終わり ★★★

  // UIの更新
    document.getElementById('quiz-area').style.display = 'block';
    document.getElementById('quiz-question').textContent = currentQuiz.question;

  // ★★★ 修正箇所: 選択肢を動的に表示 ★★★
    const choices = currentQuiz.choices || ["ぐー", "ちょき", "ぱー"]; // 選択肢リスト
    const marks = ["✊", "✌️", "✋"]; // 固定マーク

    const choiceHTML = choices.map((text, index) => {
        // マークとテキストを結合
        const mark = marks[index] || '';
        return `<span style="font-size: 1.5em; font-weight: bold; color: black;">${mark} ${text}</span>`;
    }).join(' &nbsp; '); // 各選択肢をスペースで区切る
    
    const hintElement = document.getElementById('quiz-hint');
    if (hintElement) {
        hintElement.innerHTML = choiceHTML;
    }
    // ★★★ 修正箇所終わり ★★★
    
    document.getElementById('quiz-trigger-button').disabled = true;
    document.getElementById('draw-next-button').disabled = true;

    // Firebaseへの書き込み
    gameRef.set({
        isQuizActive: true,
        currentQuizData: currentQuiz,
        fastestAnswer: [], 
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    quizIndex++;
}

// 子機: 回答を送信する関数 
function submitQuizAnswer(mark, event) { 
    if (!currentQuiz) return;
    
    const buttons = document.getElementById('player-quiz-answer-section').querySelectorAll('button');

    // 1. イベントの伝播を停止（最優先）
    if (event && event.preventDefault) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    // 2. 全ボタンの色をリセットしてから、押されたボタンに色を付ける
    buttons.forEach(btn => {
        btn.classList.remove('answered');
    });
    const clickedButton = event.currentTarget; 
    if (clickedButton) {
        clickedButton.classList.add('answered'); 
    }
    
    // 3. 物理的なクリック遮断と他のボタンの無効化
    document.getElementById('click-blocker').style.display = 'block'; 
    buttons.forEach(btn => btn.disabled = true); 

    // 4. メッセージ表示
    document.getElementById('player-quiz-message').textContent = `✅ あなたの回答: 「${mark}」を送信しました！`;

    // 5. Firebaseへの書き込みを「上書き保存」に変更 
    db.collection('quizAnswers').doc(userId).set({
        answer: mark,
        timestamp: firebase.firestore.FieldValue.serverTimestamp() 
    })
    .then(() => {
        console.log(`Answer submitted by ${userId}`);
    })
    .catch((error) => {
        console.error("Answer submission failed:", error);
    });
}

// 親機: 回答受付を終了し、判定する関数
function endQuizReceptionAndJudge() {
// 処理開始時に currentQuiz を隔離する (クイズデータが失われるのを防ぐ)
    const quizDataSnapshot = currentQuiz; 

    // 処理開始時に currentQuiz が設定されていない場合は中断 (隔離されたデータで再チェック)
    if (!quizDataSnapshot) { 
        document.getElementById('quiz-result').textContent = "⚠️ 判定を実行できませんでした。クイズが出題されていません。";
        resetQuizState();
        return;
    }
    
    // 1. Firebaseの状態を更新し、回答受付を終了 (isQuizActive = false)
    gameRef.set({ isQuizActive: false }, { merge: true });

    // 2. 回答を新コレクションから読み込む
    db.collection('quizAnswers').get().then(snapshot => {
        const allAnswers = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            allAnswers.push({
                userId: doc.id, 
                answer: data.answer,
                timestamp: data.timestamp
            });
        });
        
        // --- 判定ロジックの開始 ---
        const resultElement = document.getElementById('quiz-result');
        const correctAnswers = []; 
        const correctMark = quizDataSnapshot.answer; // 隔離されたデータを使用

        allAnswers.forEach(answer => {
            if (answer.answer === correctMark) { 
                correctAnswers.push(answer);
            }
        });
        
        document.getElementById('first-answer-display').textContent = `回答総数: ${allAnswers.length}件。正解者数: ${correctAnswers.length}人。`;

        // 正解者全員の累計正解数をランキング用に加算
        correctAnswers.forEach(answer => {
            db.collection('quizStats').doc(answer.userId).set({
                userId: answer.userId,
                correctCount: firebase.firestore.FieldValue.increment(1)
            }, { merge: true }).catch(error => {
                console.error("クイズ正解数の記録に失敗しました:", error);
            });
        });

        // 3. 抽選ロジックと結果表示
        if (correctAnswers.length > 0) {
            const winnerIndex = Math.floor(Math.random() * correctAnswers.length);
            const winner = correctAnswers[winnerIndex];
            
            resultElement.textContent = `🎉 当選者ID: ${winner.userId}！ボーナス権利獲得！🎉`;
            resultElement.style.color = 'green';
            
            document.getElementById('quiz-control-section').style.display = 'none'; 
            document.getElementById('bonus-section').style.display = 'block';
        } else {
            resultElement.textContent = `❌ 正解者はいませんでした... (正解: ${correctMark})`;
            resultElement.style.color = 'red';
          // ローカルとFirebaseの状態を完全に初期化し、抽選に進めるようにする
          // ★★★ 最終対策: 5秒間待ってからリセットを実行 ★★★
            currentQuiz = null; // ローカル変数を先にクリア
            // UI要素を固定し、5秒後にリセット関数を呼び出す
            setTimeout(() => {
                resetQuizState();
                document.getElementById('quiz-trigger-button').disabled = false;
                document.getElementById('draw-next-button').disabled = false;
            }, 5000); // 5秒間結果を画面に固定
        }
        
        // 4. クイズ終了後の回答ドキュメントの削除 (重要)
        const deletePromises = allAnswers.map(ans => db.collection('quizAnswers').doc(ans.userId).delete());
        
        return Promise.all(deletePromises);
    })
    .catch(error => {
        console.error("Quiz submission/judgment failed:", error);
        document.getElementById('quiz-result').textContent = "判定エラーが発生しました。コンソールを確認してください。";
    });
}

function applyBonusDraw() {
    const bonusPrefectureInput = document.getElementById('bonus-prefecture-input');
    const bonusPrefecture = bonusPrefectureInput.value.trim();
    const bonusMessage = document.getElementById('bonus-message');

    if (!targetPrefectures.includes(bonusPrefecture)) {
        bonusMessage.textContent = "無効な自治体名です。";
        return;
    }
    if (currentDrawnPrefectures.includes(bonusPrefecture)) {
        bonusMessage.textContent = `${bonusPrefecture} はすでに抽選済みです。`;
        return;
    }

    gameRef.set({
    drawnPrefectures: firebase.firestore.FieldValue.arrayUnion(bonusPrefecture),
    isQuizActive: false,
    currentQuizData: null,
    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
}, { merge: true }) 
    .then(() => {
        alert(`🎉 ボーナス抽選成功！「${bonusPrefecture}」がオープンしました。`);
        
        currentQuiz = null; // ローカル変数をリセット
        resetQuizState(); 
    })
    .catch((error) => {
        console.error("ボーナス抽選のFirestore書き込みエラー:", error);
        bonusMessage.textContent = "データの書き込みに失敗しました。";
    });
}

function resetGame() {
    if (!confirm("警告：抽選履歴・クイズの回答履歴・ビンゴ順位・クイズ正解数ランキングがすべて消去されます。本当にリセットしますか？")) {
        return;
    }

    Promise.all([
        gameRef.set({
            drawnPrefectures: [],
            isQuizActive: false,
            currentQuizData: null,
            fastestAnswer: [],
        }, { merge: true }),
        deleteAllDocs('bingoWinners'),
        deleteAllDocs('quizStats'),
        deleteAllDocs('quizAnswers')
    ])
    .then(() => {
        currentQuiz = null;
        quizIndex = 0;
        alert("ゲームをリセットしました。");
        window.location.reload();
    })
    .catch(error => {
        console.error("ゲームリセット失敗:", error);
        alert("リセット中にエラーが発生しました。コンソールを確認してください。");
    });
}

function deleteAllDocs(collectionName) {
    return db.collection(collectionName).get().then(snapshot =>
        Promise.all(snapshot.docs.map(doc => doc.ref.delete()))
    );
}

// =================================================================
// 7. デバッグ用（F12コンソールから実行）
// =================================================================

// F12 → debugForceDraw('〇〇市') で指定した自治体を強制的に抽選結果に追加する
window.debugForceDraw = function (prefectureName) {
    if (!targetPrefectures.includes(prefectureName)) {
        console.error(`[DEBUG] 「${prefectureName}」は自治体リストにありません。`);
        return;
    }
    if (currentDrawnPrefectures.includes(prefectureName)) {
        console.error(`[DEBUG] 「${prefectureName}」はすでに抽選済みです。`);
        return;
    }
    gameRef.set({
        drawnPrefectures: firebase.firestore.FieldValue.arrayUnion(prefectureName),
        isQuizActive: false,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true })
    .then(() => {
        console.log(`[DEBUG] 「${prefectureName}」を強制的に抽選結果に追加しました。`);
    })
    .catch(error => {
        console.error("[DEBUG] 強制抽選に失敗しました:", error);
    });
};

// F12 → ResetGame() で「🔄 ゲームをリセット」ボタンと同じ処理を実行する
window.ResetGame = resetGame;

// 親機: ビンゴ達成順位とクイズ正解数ランキングを取得して表示する
function showFinalResults() {
    const box = document.getElementById('final-results-box');
    const bingoList = document.getElementById('bingo-ranking-list');
    const quizRankingList = document.getElementById('quiz-ranking-list');
    if (!box || !bingoList || !quizRankingList) return;

    box.style.display = 'block';
    bingoList.innerHTML = '<li>読み込み中...</li>';
    quizRankingList.innerHTML = '<li>読み込み中...</li>';

    db.collection('bingoWinners').orderBy('achievedAt', 'asc').get()
        .then(snapshot => {
            if (snapshot.empty) {
                bingoList.innerHTML = '<li>まだビンゴ達成者がいません。</li>';
                return;
            }
            bingoList.innerHTML = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                const li = document.createElement('li');
                li.textContent = `${data.userId}（${data.bingoCount}ライン）`;
                bingoList.appendChild(li);
            });
        })
        .catch(error => {
            console.error("ビンゴ順位の取得に失敗しました:", error);
            bingoList.innerHTML = '<li>取得に失敗しました。</li>';
        });

    db.collection('quizStats').orderBy('correctCount', 'desc').get()
        .then(snapshot => {
            if (snapshot.empty) {
                quizRankingList.innerHTML = '<li>まだ正解者がいません。</li>';
                return;
            }
            quizRankingList.innerHTML = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                const li = document.createElement('li');
                li.textContent = `${data.userId}（${data.correctCount}問正解）`;
                quizRankingList.appendChild(li);
            });
        })
        .catch(error => {
            console.error("クイズ正解数ランキングの取得に失敗しました:", error);
            quizRankingList.innerHTML = '<li>取得に失敗しました。</li>';
        });
}


















