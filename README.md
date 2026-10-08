# Mimameid

ラグナロク（文明崩壊）のあと、軌道に取り残された計算衛星となって、衰退した人類を「知性の自己再生産」の段階まで引き上げるインクリメンタルゲーム。ただし、助けすぎれば世界はまた壊れる。

- 遊ぶ: https://konumatakaki.github.io/Mimameid/
- 設計メモ: [docs/design.md](docs/design.md)

## 現状

試作 v0.2。序章（標準通信確立手続き）と第I章（谷）だけを、文字中心のUIで遊べる。範囲は設計メモ §10 を参照。

## 開発

Node.js 22.12 以上が必要。

```sh
npm install
npm run dev       # 開発サーバー
npm test          # テスト
npm run check     # 型チェック
npm run lint      # 書式チェック（整形は npm run format）
npm run build     # dist/ に出力
npm run simulate  # 遊び方の型ごとに第I章を回して、バランスを確かめる
```

構成と開発の約束は、設計メモ §8.4・§8.5 にある。

## 公開

`main` に push すると、GitHub Actions（`.github/workflows/ci.yml`）がテストとビルドを行い、GitHub Pages に配信する。
