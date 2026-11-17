// 今回は課金も制限も有効にしません。将来はここを購入状態の取得処理へ差し替えます。
export const entitlementConfig = { enforceLimits: false, freeCollections: 3, freeQuestions: 30 };
export type Entitlement = 'development' | 'free' | 'paid';
// 利用権限はUIから切り離し、将来の買い切り購入に置き換えられるようにします。
export function getEntitlement(): Entitlement { return 'development'; }
// 無料枠を変更する際は上記の設定値だけを編集します。現時点では全機能を利用できます。
export function assertCanCreate(kind: 'collection' | 'question', currentCount: number): void {
  if (!entitlementConfig.enforceLimits || getEntitlement() !== 'free') return;
  const limit = kind === 'collection' ? entitlementConfig.freeCollections : entitlementConfig.freeQuestions;
  if (currentCount >= limit) throw new Error('無料版の登録上限に達しました。');
}
