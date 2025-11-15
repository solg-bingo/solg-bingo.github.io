// =================================================================
// 1. 初期設定とグローバル変数の定義
// =================================================================

// 参加者の一意のIDを生成・保持 (ユーザー入力またはランダム仮ID)
let userId = localStorage.getItem('bingoUserId') || 'user_' + Date.now() + Math.floor(Math.random() * 10000);

// ★★★ ここが自治体リストです (9個以上必須) ★★★
const targetPrefectures = [
  "千代田区", "中央区", "港区", "新宿区", "渋谷区", "世田谷区", 
  "横浜市", "川崎市", "相模原市", 
  "さいたま市", "川越市", "船橋市", 
  "水戸市", "宇都宮市", "前橋市"
]; 

const quizList = [
    { id: 1, question: "じゃんけん！次に勝つのはどれ？", answer: "ぐー", hint: "最初に親が出す手は「ちょき」です" },
    { id: 2, question: "じゃんけん！次に勝つのはどれ？", answer: "ちょき", hint: "最初に親が出す手は「ぱー」です" },
    { id: 3, question: "じゃんけん！次に勝つのはどれ？", answer: "ぱー", hint: "最初に親が出す手は「ぐー」です" }
];

let currentDrawnPrefectures = [];
let currentQuiz = null;
let quizIndex = 0;
let currentRole = 'player'; 

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
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');

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
    // ★★★ 紐づけ処理終わり ★★★
});

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
            handlePlayerQuizUI(data);
            markCardAutomatically(drawnFromFirebase); 
        }
    }
});

function updateHistoryDisplay(drawn) {
    const historyDiv = document.getElementById('history-list');
    if(historyDiv) historyDiv.textContent = drawn.join(' / ') + (drawn.length > 0 ? ' / ' : '');
    const currentDrawElement = document.getElementById('current-draw');
    if(currentDrawElement) currentDrawElement.textContent = drawn[drawn.length - 1] || '---';
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
        
        // ボタンを有効化し、ブロッカーを隠す
        buttons.forEach(btn => btn.disabled = false); 
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

function generateNewCard() {
    const bingoCardElements = create3x3BingoCard();
    drawBingoCard3x3(bingoCardElements);
    markCardAutomatically(currentDrawnPrefectures); 
}

function markCardAutomatically(drawn) {
    checkBingoAuto();
}

function manualMarkCell(cell) {
    const prefecture = cell.textContent;
    if (cell.classList.contains('marked')) return;

    if (currentDrawnPrefectures.includes(prefecture)) {
        cell.classList.add('marked');
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
        alert(`🎉 ビンゴ達成！合計 ${bingoCount} ラインです！景品と交換！`);
        table.dataset.bingoAnnounced = true;
    }
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

// ★★★ 修正箇所：前回のクイズ結果表示をクリア ★★★
    document.getElementById('quiz-result').textContent = "";
    document.getElementById('first-answer-display').textContent = "";
    // ★★★ 修正ここまで ★★★
    
    // UIの更新
    document.getElementById('quiz-area').style.display = 'block';
    document.getElementById('quiz-question').textContent = currentQuiz.question;
    document.getElementById('quiz-hint').textContent = `（ヒント: ${currentQuiz.hint}）`; 
    
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
  if (!currentQuiz) { 
        console.warn("判定エラー: 現在出題中のクイズがありません。");
        document.getElementById('quiz-result').textContent = "⚠️ 判定を実行できませんでした。クイズが出題されていません。";
        // 判定ボタンが押された場合に備え、状態をリセットして次の抽選を可能にする
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
        const correctMark = currentQuiz.answer;

        allAnswers.forEach(answer => {
            if (answer.answer === correctMark) { 
                correctAnswers.push(answer);
            }
        });
        
        document.getElementById('first-answer-display').textContent = `回答総数: ${allAnswers.length}件。正解者数: ${correctAnswers.length}人。`;

        // 3. 抽選ロジックと結果表示
        if (correctAnswers.length > 0) {
            const winnerIndex = Math.floor(Math.random() * correctAnswers.length);
            const winner = correctAnswers[winnerIndex];
            
            resultElement.textContent = `🎉 正解者の中から抽選！🎉 当選者ID: ${winner.userId}！ボーナス権利獲得！`;
            resultElement.style.color = 'green';
            
            document.getElementById('quiz-control-section').style.display = 'none'; 
            document.getElementById('bonus-section').style.display = 'block';
        } else {
            resultElement.textContent = `❌ 正解者はいませんでした... (正解: ${correctMark})`;
            resultElement.style.color = 'red';

            document.getElementById('quiz-trigger-button').disabled = false;
            document.getElementById('draw-next-button').disabled = false;
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
    if (!confirm("警告：抽選履歴とクイズの回答履歴が消去されます。本当にリセットしますか？")) {
        return;
    }
    
    gameRef.set({
        drawnPrefectures: [], 
        isQuizActive: false,  
        fastestAnswer: [],    
    }, { merge: true })
    .then(() => {
        currentQuiz = null;
        quizIndex = 0;
        alert("抽選履歴がクリアされました。");
        window.location.reload(); 
    })
    .catch(error => {
        console.error("ゲームリセット失敗:", error);
    });
}