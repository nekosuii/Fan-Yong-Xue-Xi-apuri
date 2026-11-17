import type { StudyData, Question } from '../types/question';
// 初回データはサンプルであることを画面に明記します。削除後に勝手に復元しません。
export function createSampleData(): StudyData {
  const date = new Date().toISOString();
  const collections = [
    { id: 'sample-english', name: '英語の基礎', color: '0', createdAt: date, updatedAt: date },
    { id: 'sample-it', name: 'IT・テクノロジー', color: '1', createdAt: date, updatedAt: date },
    { id: 'sample-general', name: '日々の教養', color: '2', createdAt: date, updatedAt: date },
  ];
  const categories = collections.map(x => ({ id: `${x.id}-basics`, collectionId: x.id, name: '基礎知識', createdAt: date, updatedAt: date }));
  const rows: [number, string, string[], string, string][] = [
    [0, '「習慣」を意味する英単語はどれ？', ['habit', 'hobby', 'hope', 'home'], '0', 'habit は「習慣」、hobby は「趣味」、hope は「希望」を意味します。'],
    [0, '「彼女は毎日、本を読む。」の英文として正しいものは？', ['She read books every day.', 'She reads books every day.', 'She reading books every day.'], '1', '現在形で主語が三人称単数のとき、一般動詞には s を付けます。'],
    [0, '「information」は通常、数えられない名詞として使う。', [], 'true', 'information は不可算名詞です。「1つの情報」は a piece of information と表現します。'],
    [1, 'CPUの主な役割はどれ？', ['長期的なデータ保存', '演算と制御', '画像の印刷', '電力の供給'], '1', 'CPUは中央処理装置です。プログラムの命令を読み取り、演算と制御を行います。'],
    [1, '1バイトは8ビットである。', [], 'true', 'ビットは0または1を表す単位で、8ビットをまとめて1バイトと呼びます。'],
    [1, 'HTTPSの通信は暗号化される。', [], 'true', 'HTTPSはTLSを使い、通信内容を暗号化して盗聴や改ざんのリスクを下げます。'],
    [2, '日本国憲法が施行されたのは何年？', ['1945年', '1946年', '1947年', '1948年'], '2', '日本国憲法は1946年11月3日に公布され、1947年5月3日に施行されました。'],
    [2, '地球の大気に最も多く含まれる気体は？', ['酸素', '二酸化炭素', '窒素', '水素'], '2', '乾燥した空気の約78%は窒素、約21%は酸素です。'],
    [2, '水は標準気圧のもとでは約100℃で沸騰する。', [], 'true', '沸点は気圧によって変わります。標準気圧では約100℃ですが、高い山では低くなります。'],
  ];
  const questions: Question[] = rows.map(([i, questionText, choices, correctAnswer, explanation], n) => ({
    id: `sample-q-${n}`, collectionId: collections[i].id, categoryId: categories[i].id,
    questionType: choices.length ? 'multipleChoice' : 'trueFalse', questionText, choices,
    correctAnswer, explanation, status: 'unset', statusUpdatedAt: null, createdAt: date, updatedAt: date,
  }));
  return { collections, categories, questions };
}
