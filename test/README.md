#  Alert System - 数値モニター

リアルタイムで数値を監視し、基準値を超えた場合にメール通知を送信するシステムです。

##  機能一覧

### 1. データの取得
- データベースから最新の数値を取得
- RESTful API経由でのデータアクセス

### 2. データの表示
- リアルタイムでの数値表示
- 美しいUIでの視覚化

### 3. データの更新
- データ入力サイトからの自動更新
- リアルタイムでの画面更新

### 4. データの記録
- 過去の数値をグラフで表示
- ユーザー設定可能なデータポイント数

### 5. 基準値の実装
- ユーザーが自由に基準値を設定可能
- リアルタイムでの基準値チェック

### 6. 通知の実装
- 基準値オーバー時の画面表示
- 自動メール通知機能（hiro0507mu@icloud.com）

##  システム構成

```
alert/
├── backend/                 # Spring Boot バックエンド
│   ├── src/main/java/
│   │   └── com/example/alert/
│   │       ├── controller/  # REST API コントローラー
│   │       ├── service/     # ビジネスロジック
│   │       ├── repository/  # データアクセス層
│   │       └── entity/      # データベースエンティティ
│   └── src/main/resources/
│       └── application.properties
├── frontend/                # メイン監視画面
│   ├── index.html
│   └── app.js
├── data-input/              # データ入力サイト
│   └── index.html
├── db/                      # データベース初期化
│   └── init.sql
├── docker-compose.yml       # Docker構成
└── README.md
```

##  起動方法

### 前提条件
- Docker
- Docker Compose

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd alert
```

### 2. アプリケーションの起動
```bash
docker-compose up -d
```

### 3. アクセス
- **メイン監視画面**: http://localhost:80
- **データ入力サイト**: http://localhost/data-input/index.html
- **API エンドポイント**: http://localhost:8081

##  使用方法

### メイン監視画面
1. ブラウザで http://localhost:80 にアクセス
2. 基準値を設定
3. グラフ表示データ数を調整
4. 更新間隔を設定
5. リアルタイムで数値を監視

### データ入力サイト
1. ブラウザで http://localhost/data-input/index.html にアクセス
2. 数値を入力
3. 「データを送信」ボタンをクリック
4. メイン監視画面で自動更新を確認

## 🔧 API エンドポイント

### GET /value
最新の数値を取得
```bash
curl http://localhost:8081/value
```

### POST /value
新しい数値を保存
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"value":150,"timestamp":"2024-01-01T12:00:00"}' \
  http://localhost:8081/value
```

### GET /history?limit=20
データ履歴を取得
```bash
curl http://localhost:8081/history?limit=20
```

### POST /alert
アラートメールを送信
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"value":150,"threshold":100,"timestamp":"2024-01-01T12:00:00"}' \
  http://localhost:8081/alert
```

## ⚙️ 設定

### メール設定
`backend/src/main/resources/application.properties` でメール設定を変更：

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### データベース設定
```properties
spring.datasource.url=jdbc:mysql://db:3306/alertdb
spring.datasource.username=root
spring.datasource.password=password
```

##  開発環境

### 技術スタック
- **バックエンド**: Spring Boot 3.1.1, Java 17
- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **データベース**: MySQL 8.0
- **グラフ**: Chart.js
- **コンテナ**: Docker, Docker Compose

### 開発用コマンド
```bash
# ログ確認
docker-compose logs backend

# アプリケーション再起動
docker-compose restart backend

# 完全リビルド
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

##  注意事項

1. **メール機能**: 実際のメール送信には、有効なSMTP設定が必要です
2. **データ永続化**: データベースのデータは永続化されます
3. **セキュリティ**: 本番環境では適切なセキュリティ設定を行ってください

##  貢献

プルリクエストやイシューの報告を歓迎します。

##  ライセンス

このプロジェクトはMITライセンスの下で公開されています。 
