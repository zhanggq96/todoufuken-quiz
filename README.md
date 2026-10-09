# 都道府県よみクイズ

Japanese geography quiz created by Claude. Link: [https://zhanggq96.github.io/todoufuken-quiz/](https://zhanggq96.github.io/todoufuken-quiz/)

47都道府県を3つのモードで答えるブラウザゲームです。

- **漢字から読みを答える** — 都道府県名の読みをひらがな・カタカナで入力
- **地図から名前を答える** — 地図で色がついた都道府県を答える（全国／地方別）
- **県庁所在地を答える** — 都道府県庁所在地を漢字か読みで入力

スタート画面には、都道府県名つきの学習用地図があります。

## 公開方法（GitHub Pages）

1. このフォルダの中身をリポジトリのルートに置いて push します。
2. リポジトリの **Settings → Pages** で、Source を「Deploy from a branch」、ブランチを `main`、フォルダを `/ (root)` に設定します。

ビルドは不要です。`index.html` をブラウザで直接開いても動きます。

## ファイル構成

```
index.html        画面
css/style.css     スタイル
js/map-data.js    地図の形状データとラベル位置
js/app.js         ゲームのロジック
```

## 地図データ

[jpn-atlas](https://github.com/biskwikman/jpn-atlas)（BSD 3-Clause License, Copyright (c) 2018, Dan Henri）のデータを簡略化・加工して使用しています。
元データ：国土地理院「[地球地図日本](https://www.gsi.go.jp/kankyochiri/gm_jpn.html)」(2016)。
