// =================================================================
// 幹事用セットアップページのロジック
// Firestore(config/gameConfig)に保存されている設定を読み込み・編集・保存する
// =================================================================

// 初回利用時（Firestoreにまだ設定が無いとき）の初期値。前回のビンゴ大会の内容をベースにしている
const DEFAULT_PREFECTURES = [
  "札幌市", "常総市", "土浦市", "石岡市", "つくば市",
  "栃木市", "佐野市", "高崎市", "さいたま市", "三郷市",
  "蓮田市", "鴻巣市", "狭山市", "市川市", "柏市",
  "松戸市", "浦安市", "多摩市", "世田谷区", "清瀬市",
  "品川区", "練馬区", "杉並区", "葛飾区", "目黒区",
  "文京区", "墨田区", "新宿区", "港区", "台東区",
  "横浜市", "箱根町", "鎌倉市", "小千谷市", "高岡市",
  "加賀市", "長野市", "御殿場市", "沼津市", "三重県"
];

const DEFAULT_QUIZLIST = [
    { id: 1, question: "クマの出没が全国的に深刻なニュースとなっている。秋田県では、ツキノワグマ情報マップシステムを公開しているが、名称は次のうちどれ？", answer: "ぱー", choices: ["クマソク", "クマナビ", "クマダス"] },
    { id: 2, question: "年始の名物「箱根駅伝」。最もコースが長いのは有名な「華の2区」とその復路の9区で23.1km。では、二番目に長い区間はどこ？", answer: "ぱー", choices: ["1区", "3区", "10区"] },
    { id: 3, question: "次のうち、実在しないパン屋の名前はどれ？", answer: "ぱー", choices: ["わたし入籍します", "くちびるが止まらない", "もう戻れないの"] },
    { id: 4, question: "歴代横綱の在位場所数ランキング、1位は白鳳、2位は北の湖。では、3位は誰？", answer: "ちょき", choices: ["大鵬", "千代の富士", "貴乃花"] },
    { id: 5, question: "今年の流行語大賞に、16年ぶりに現職の首相が発した言葉が選ばれた。初めて現職総理が流行語大賞に選ばれたのは次のうち誰？", answer: "ぐー", choices: ["小渕恵三", "小泉純一郎", "安倍晋三"] },
    { id: 6, question: "今年オーディションにより新メンバーを迎え入れた「timelesz」（旧SexyZone）。現在のメンバー数は？", answer: "ぱー", choices: ["5人", "7人", "8人"] },
    { id: 7, question: "東京2025世界陸上の男子棒高跳優勝者、デュプランティス選手は世界記録を何度更新している？", answer: "ちょき", choices: ["12回", "14回", "16回"] },
    { id: 8, question: "今年の大リーグワールドシリーズは、連覇を目指すドジャースと、32年ぶりの優勝を目指すブルージェイズの対戦でした。次のうち、大リーグで唯一、ワールドシリーズに進出したことがないチームは？", answer: "ぱー", choices: ["ロッキーズ", "パドレス", "マリナーズ"] },
    { id: 9, question: "今年6月に公開された映画「国宝」が、邦画実写の興行収入、歴代1位を記録しました。題材となっている歌舞伎の原型とされる「かぶき踊り」が始まったのはおよそ何年頃？", answer: "ぐー", choices: ["1603年", "1782年", "1476年"] },
    { id: 10, question: "RADWIMPSの20周年トリビュートアルバムに参加していないアーティストは？", answer: "ぐー", choices: ["BUMP OF CHICKEN", "My Hair is Bad", "Mrs. GREEN APPLE"] },
    { id: 11, question: "今年の上半期芥川賞・直木賞（第173回）は、まさかの両賞とも「該当なし」。では、芥川賞直木賞ともに「該当なし」だったのは、今年のものを含めて過去何回あった？", answer: "ぐー", choices: ["6回", "9回", "13回"] },
    { id: 12, question: "今、何問目？", answer: "ちょき", choices: ["11問目", "12問目", "13問目"] },
    { id: 13, question: "大阪・関西万博効果により、特別手当の支給が報じられた会社の中で、1人あたりの支給額が最も高いのはどこ？", answer: "ちょき", choices: ["JR西日本", "大阪メトロ", "近鉄"] },
    { id: 14, question: "株式会社獺祭が販売する超有名日本酒「獺祭」。その名前はある動物の習性に由来します。さて、その動物は？", answer: "ちょき", choices: ["カモシカ", "カワウソ", "タヌキ"] },
    { id: 15, question: "雑煮の餅の形、「東は四角、西は丸」と言われているが、その境目はどこ？", answer: "ぱー", choices: ["飛騨", "諏訪", "関ケ原"] }
];

let unlockedPassword = null; // 認証に使った（＝これから保存する）パスワード
let quizRowCounter = 0;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('unlock-button').addEventListener('click', tryUnlock);
    document.getElementById('password-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') tryUnlock();
    });
    document.getElementById('add-quiz-button').addEventListener('click', () => addQuizRow(null));
    document.getElementById('save-button').addEventListener('click', saveConfig);
});

function tryUnlock() {
    const enteredPassword = document.getElementById('password-input').value;
    const messageEl = document.getElementById('password-message');

    if (!enteredPassword) {
        messageEl.textContent = "パスワードを入力してください。";
        return;
    }

    configRef.get().then(doc => {
        const data = doc.exists ? doc.data() : null;
        const savedPassword = data && data.setupPassword ? data.setupPassword : null;

        if (savedPassword && savedPassword !== enteredPassword) {
            messageEl.textContent = "パスワードが違います。";
            return;
        }

        // savedPasswordが無い（初回利用）場合は、入力したパスワードをそのまま今後の合言葉として扱う
        unlockedPassword = enteredPassword;
        messageEl.textContent = "";
        document.getElementById('password-gate').style.display = 'none';
        document.getElementById('setup-form-area').style.display = 'block';

        populateForm(data);
    }).catch(error => {
        console.error("設定の読み込みに失敗しました:", error);
        messageEl.textContent = "読み込みに失敗しました。通信環境を確認してください。";
    });
}

function populateForm(data) {
    const loadMessage = document.getElementById('load-message');
    const prefectures = (data && Array.isArray(data.targetPrefectures) && data.targetPrefectures.length > 0)
        ? data.targetPrefectures
        : DEFAULT_PREFECTURES;
    const quizList = (data && Array.isArray(data.quizList) && data.quizList.length > 0)
        ? data.quizList
        : DEFAULT_QUIZLIST;

    loadMessage.textContent = data
        ? "保存済みの設定を読み込みました。"
        : "まだ設定が保存されていないため、前回大会の内容を初期値として表示しています。";

    document.getElementById('prefectures-textarea').value = prefectures.join('\n');

    const listEl = document.getElementById('quiz-editor-list');
    listEl.innerHTML = '';
    quizRowCounter = 0;
    quizList.forEach(quiz => addQuizRow(quiz));
}

function addQuizRow(quiz) {
    quizRowCounter++;
    const template = document.getElementById('quiz-row-template');
    const fragment = template.content.cloneNode(true);
    const rowEl = fragment.querySelector('.quiz-row');

    rowEl.querySelector('.quiz-row-title').textContent = `クイズ ${quizRowCounter}`;
    rowEl.querySelector('.quiz-question').value = quiz ? quiz.question : '';

    const choices = quiz && Array.isArray(quiz.choices) ? quiz.choices : ['', '', ''];
    rowEl.querySelectorAll('.quiz-choice').forEach((input, index) => {
        input.value = choices[index] || '';
    });

    rowEl.querySelector('.quiz-answer').value = (quiz && quiz.answer) ? quiz.answer : 'ぐー';

    rowEl.querySelector('.remove-quiz-button').addEventListener('click', () => {
        rowEl.remove();
        renumberQuizRows();
    });

    document.getElementById('quiz-editor-list').appendChild(fragment);
}

function renumberQuizRows() {
    document.querySelectorAll('#quiz-editor-list .quiz-row').forEach((rowEl, index) => {
        rowEl.querySelector('.quiz-row-title').textContent = `クイズ ${index + 1}`;
    });
}

function saveConfig() {
    const saveMessage = document.getElementById('save-message');

    const prefectures = document.getElementById('prefectures-textarea').value
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    if (prefectures.length < 9) {
        saveMessage.style.color = 'red';
        saveMessage.textContent = `自治体リストは9個以上必要です（現在${prefectures.length}個）。`;
        return;
    }

    const quizRows = document.querySelectorAll('#quiz-editor-list .quiz-row');
    const quizList = [];
    for (let i = 0; i < quizRows.length; i++) {
        const rowEl = quizRows[i];
        const question = rowEl.querySelector('.quiz-question').value.trim();
        const choices = Array.from(rowEl.querySelectorAll('.quiz-choice')).map(input => input.value.trim());
        const answer = rowEl.querySelector('.quiz-answer').value;

        if (!question || choices.some(c => !c)) {
            saveMessage.style.color = 'red';
            saveMessage.textContent = `クイズ ${i + 1} の質問文または選択肢が空欄です。`;
            return;
        }

        quizList.push({ id: i + 1, question, answer, choices });
    }

    const newPasswordInput = document.getElementById('new-password-input').value.trim();
    const passwordToSave = newPasswordInput || unlockedPassword;

    saveMessage.style.color = 'black';
    saveMessage.textContent = "保存中...";

    configRef.set({
        targetPrefectures: prefectures,
        quizList: quizList,
        setupPassword: passwordToSave
    }, { merge: true })
    .then(() => {
        unlockedPassword = passwordToSave;
        document.getElementById('new-password-input').value = '';
        saveMessage.style.color = 'green';
        saveMessage.textContent = "✅ 保存しました！次に参加者がページを開いたときから新しい内容が反映されます。";
    })
    .catch(error => {
        console.error("設定の保存に失敗しました:", error);
        saveMessage.style.color = 'red';
        saveMessage.textContent = "保存に失敗しました。通信環境を確認してください。";
    });
}
