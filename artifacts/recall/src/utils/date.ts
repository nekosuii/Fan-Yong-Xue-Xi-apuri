// ソートやCSVで時差によるずれが生じないよう、保存はUTCのISO形式に統一します。
export function now(): string { return new Date().toISOString(); }
// ネイティブで外部の暗号APIを必要としない、ローカルデータ用の識別子を作ります。
export function newId(): string { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`; }
// 表示だけを端末の言語・タイムゾーンに合わせます。
export function displayDate(date: string | null): string { return date ? new Date(date).toLocaleString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'まだ変更されていません'; }
