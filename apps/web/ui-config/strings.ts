import { Constants } from "@courselit/common-models";

/**
 * This file provides application wide strings.
 */
export const ERR_ALL_FIELDS_REQUIRED = "すべての項目を入力してください。";
export const ERR_PASSWORDS_DONT_MATCH = "パスワードが一致しません。";
export const SIGNUP_SUCCESS = "登録が完了しました。ログインしてください。";
export const ERR_COURSE_TITLE_REQUIRED = "タイトルを入力してください。";
export const ERR_COURSE_COST_REQUIRED = "価格を入力してください。";

// Replies from the backend
export const RESP_API_USER_CREATED = "ユーザーを作成しました";

// Placeholder texts
export const CREATOR_AREA_LINK_TEXT = "作成";
export const CREATOR_AREA_PAGE_TITLE = "管理画面";
export const GENERIC_TITLE = "講座サイト";
export const GENERIC_SUBTITLE = "新しいことを学びましょう";
export const GENERIC_LOGO_PATH = "";
export const GENERIC_SIGNIN_TEXT = "ログイン";
export const GENERIC_SIGNUP_TEXT = "新規登録";
export const GENERIC_SIGNOUT_TEXT = "ログアウト";
export const GENERIC_CURRENCY_UNIT = "";
export const GENERIC_STRIPE_PUBLISHABLE_KEY_TEXT = "";
export const GENERIC_CURRENCY_ISO_CODE = "";
export const GENERIC_PAYMENT_METHOD = "";
export const GENERIC_CODE_INJECTION_HEAD = "";

// UI texts
export const BTN_LOAD_MORE = "もっと表示";
export const MEDIA_UPLOAD_BUTTON_TEXT = "アップロード";
export const MEDIA_UPLOADING = "アップロード中…";
export const MEDIA_ADD_NEW_BUTTON_TEXT = "新規追加";
export const BUTTON_CANCEL_TEXT = "キャンセル";
export const BUTTON_CONFIRM_TEXT = "確認";
export const BUTTON_CANCEL_SCHEDULED_MAIL = "配信を取り消す";
export const MEDIA_SEARCH_INPUT_PLACEHOLDER = "ファイルを検索";
export const LOAD_MORE_TEXT = "もっと表示";
export const MANAGE_MEDIA_BUTTON_TEXT = "ファイルを挿入";
export const MANAGE_COURSES_PAGE_HEADING = "講座・商品";
export const COURSE_CUSTOMERS_PAGE_HEADING = "受講者・購入者";
export const MANAGE_COMMUNITIES_PAGE_HEADING = "コミュニティ";
export const MANAGE_PAGES_PAGE_HEADING = "ページ";
export const BREADCRUMBS_EDIT_LESSON_COURSE_NAME = "講座・商品";
export const NEW_PAGE_HEADING = "新しいページ";
export const USERS_MANAGER_PAGE_HEADING = "ユーザー";
export const BTN_MANAGE_TAGS = "タグを管理";
export const USERS_TAG_HEADER = "タグ";
export const USERS_TAG_NEW_HEADER = "新しいタグ";
export const TAG_TABLE_HEADER_NAME = "タグ名";
export const BTN_NEW_TAG = "新しいタグ";
export const TAG_TABLE_HEADER_SUBS_COUNT = "タグ付きユーザー数";
export const TAGS_TABLE_CONTEXT_MENU_DELETE_PRODUCT = "タグを削除";
export const TAGS_TABLE_CONTEXT_MENU_UNTAG = "ユーザーのタグを外す";
export const UNTAG_POPUP_DESC =
    "このタグが付いているすべてのユーザーからタグを外します。ユーザーは削除されません。";
export const UNTAG_POPUP_HEADER = "次のタグをユーザーから外す：";
export const DELETE_TAG_POPUP_HEADER = "タグを削除";
export const DELETE_TAG_POPUP_DESC =
    "ユーザーからこのタグを外し、タグを削除します。ユーザーは削除されません。";
export const NEW_COURSE_PAGE_HEADING = "講座を追加";
export const EDIT_PRODUCT_HEADER = "講座・商品を編集";
export const EDIT_BLOG = "ブログを編集";
export const EDIT_EMAIL = "メールを編集";
export const MEDIA_MANAGER_DIALOG_TITLE = "ファイルを追加";
export const BUTTON_NEW_COURSE = "新規作成";
export const BUTTON_DONE_TEXT = "完了";
export const DIALOG_TITLE_FEATURED_IMAGE = "ファイルを選択";
export const BUTTON_SET_FEATURED_IMAGE = "選択";
export const BUTTON_SELECT_MEDIA = "ファイルを選択";
export const FORM_FIELD_FEATURED_IMAGE = "アイキャッチ画像";
export const BTN_DELETE_COURSE = "講座・商品を削除";
export const BTN_EXIT_COURSE = "閉じる";
export const BTN_EXIT_COURSE_TOOLTIP = "講座を閉じる";
export const BTN_TOGGLE_THEME = "表示テーマを切り替え";
export const BTN_ADD_VIDEO = "追加";
export const ADD_VIDEO_DIALOG_TITLE = "動画を埋め込む";
export const LABEL_NEW_PASSWORD = "新しいパスワード";
export const BUTTON_SAVE = "保存";
export const BUTTON_SAVING = "保存中…";
export const GROUP_SETTINGS_HEADER = "設定";
export const GROUP_LESSONS_HEADER = "レッスン";
export const BUTTON_DELETE_GROUP = "章を削除";
export const BTN_RESET = "リセット";
export const SWITCH_ACCOUNT_ACTIVE = "アカウントを有効にする";
export const LABEL_CONF_PASSWORD = "パスワードを確認";
export const HEADER_BLOG_POSTS_SECTION = "ブログ";
export const HEADER_COURSES_SECTION = "講座";
export const HEADER_TAG_SECTION = "タグ付きコンテンツ：";
export const SITE_SETTINGS_TITLE = "タイトル";
export const SITE_SETTINGS_SUBTITLE = "サブタイトル";
export const SITE_SETTINGS_CURRENCY = "通貨";
export const SITE_SETTINGS_LOGO = "ロゴ";
export const SITE_SETTINGS_DEFAULT_TITLE = "CourseLit";
export const SITE_SETTINGS_COURSELIT_BRANDING_CAPTION =
    "CourseLitのブランド表示を非表示にする";
export const SITE_SETTINGS_COURSELIT_BRANDING_SUB_CAPTION = "講座とサイトの「Powered by CourseLit」を非表示にします。";
export const SITE_SETTINGS_PAGE_HEADING = "設定";
export const HEADER_COURSELIT = "CourseLitについて";
export const MEDIA_SELECTOR_UPLOAD_BTN_CAPTION = "画像をアップロード";
export const MEDIA_SELECTOR_REMOVE_BTN_CAPTION = "画像を外す";
export const SITE_ADMIN_SETTINGS_STRIPE_SECRET = "Stripeシークレットキー";
export const SITE_ADMIN_SETTINGS_RAZORPAY_SECRET = "Razorpayシークレットキー";
export const SITE_ADMIN_SETTINGS_RAZORPAY_WEBHOOK_SECRET =
    "Razorpay Webhookシークレット";
export const SITE_ADMIN_SETTINGS_PAYPAL_SECRET = "PayPalシークレットキー";
export const SITE_ADMIN_SETTINGS_PAYTM_SECRET = "Paytmシークレットキー";
export const SITE_SETTINGS_SECTION_GENERAL = "基本情報・ブランド";
export const SITE_SETTINGS_SECTION_PAYMENT = "決済";
export const SITE_SETTINGS_SECTION_MAILS = "メール";
export const SITE_ADMIN_SETTINGS_PAYMENT_METHOD = "決済方法";
export const SITE_SETTINGS_STRIPE_PUBLISHABLE_KEY_TEXT =
    "Stripe公開キー";
export const SITE_SETTINGS_RAZORPAY_KEY_TEXT = "Razorpayキー";
export const SITE_SETTINGS_LEMONSQUEEZY_KEY_TEXT = "Lemon Squeezyキー";
export const SITE_SETTINGS_LEMONSQUEEZY_STOREID_TEXT = "Lemon SqueezyストアID";
export const SITE_SETTINGS_LEMONSQUEEZY_ONETIME_TEXT = "一括払いのバリアントID";
export const SITE_SETTINGS_LEMONSQUEEZY_SUB_MONTHLY_TEXT =
    "月額定期払いのバリアントID";
export const SITE_SETTINGS_LEMONSQUEEZY_SUB_YEARLY_TEXT =
    "年額定期払いのバリアントID";
export const SITE_SETTINGS_PAYMENT_METHOD_NONE_LABEL = "なし";
export const SITE_SETTINGS_PAYMENT_METHOD_RESET_BUTTON = "リセット";
export const SITE_SETTINGS_PAYMENT_METHOD_RESET_TOOLTIP =
    "現在の決済方法を解除します。保存済みの接続情報は保持します。";
export const SITE_SETTINGS_PAYMENT_METHOD_RESET_CONFIRM_TITLE =
    "決済方法をリセットしますか？";
export const SITE_SETTINGS_PAYMENT_METHOD_RESET_CONFIRM_DESCRIPTION =
    "リセットすると、すべての有料プランで決済できなくなります。無料プランは引き続き利用できます。";
export const SITE_SETTINGS_PAYMENT_METHOD_RESET_CONFIRM_ACTION = "リセット";
export const FREE_COST = "無料";
export const SIDEBAR_TEXT_COURSE_ABOUT = "はじめに";
export const SIDEBAR_TEXT_COURSE_DISCUSSIONS = "質問・コメント";
export const COURSE_DISCUSSIONS_TITLE = "質問・コメント";
export const COURSE_DISCUSSIONS_TOOLTIP = "質問・コメント";
export const COURSE_DISCUSSIONS_DESCRIPTION =
    "この講座のレッスンごとに質問・コメントを有効にします";
export const DISCUSSIONS_DISABLED_MESSAGE =
    "この講座・商品では質問・コメントが無効になっています。";
export const DISCUSSIONS_ENABLED_MESSAGE =
    "この講座・商品では質問・コメントが有効になっています。";
export const COURSE_DISCUSSIONS_VIEW_ALL = "質問・コメントをすべて見る";
export const COURSE_DISCUSSIONS_EMPTY = "まだ質問・コメントはありません";
export const COURSE_DISCUSSIONS_COMMENT_PLACEHOLDER = "コメントを入力…";
export const COURSE_DISCUSSIONS_REPLY_PLACEHOLDER = "返信を入力…";
export const COURSE_DISCUSSIONS_POST_COMMENT = "コメントを投稿";
export const COURSE_DISCUSSIONS_POST_REPLY = "返信を投稿";
export const COURSE_DISCUSSIONS_REPLY = "返信";
export const COURSE_DISCUSSIONS_REPORT = "報告";
export const COURSE_DISCUSSIONS_DELETE = "削除";
export const COURSE_DISCUSSIONS_DELETED = "削除済み";
export const COURSE_DISCUSSIONS_DELETE_CONFIRM_TITLE = "質問・コメントを削除";
export const COURSE_DISCUSSIONS_DELETE_CONFIRM =
    "本当に削除しますか？";
export const COURSE_DISCUSSIONS_DELETE_CONFIRM_DESCRIPTION =
    "この操作は取り消せません。";
export const COURSE_DISCUSSIONS_DELETE_CANCEL = "キャンセル";
export const COURSE_DISCUSSIONS_REPORT_REASON = "報告する理由を教えてください";
export const COURSE_DISCUSSIONS_REPORTED = "報告済み";
export const COURSE_DISCUSSIONS_CONTENT_REQUIRED = "コメントを入力してください。";
export const COURSE_DISCUSSIONS_CONTENT_TOO_LONG =
    "コメントが長すぎます。";
export const COURSE_DISCUSSIONS_ADMIN_REPORTS = "報告";
export const COURSE_DISCUSSIONS_ADMIN_VIEW_REPORTS = "報告された内容を管理";
export const COURSE_DISCUSSIONS_ADMIN_NO_REPORTS = "報告はありません";
export const COURSE_DISCUSSIONS_ADMIN_NO_REPORTS_DESCRIPTION =
    "報告された質問・コメントがここに表示されます。";
export const COURSE_DISCUSSIONS_ADMIN_STATUS = "状態";
export const COURSE_DISCUSSIONS_ADMIN_REASON = "理由";
export const COURSE_DISCUSSIONS_ADMIN_TARGET = "対象";
export const COURSE_DISCUSSIONS_ADMIN_REPORTED_BY = "報告者";
export const COURSE_DISCUSSIONS_ADMIN_LESSON = "レッスン";
export const COURSE_DISCUSSIONS_ADMIN_CONTENT = "内容";
export const COURSE_DISCUSSIONS_ADMIN_AUTHOR = "投稿者";
export const COURSE_DISCUSSIONS_ADMIN_DATE = "日付";
export const COURSE_DISCUSSIONS_ADMIN_FILTER_ALL = "すべて";
export const COURSE_DISCUSSIONS_ADMIN_STATUS_PENDING = "pending";
export const COURSE_DISCUSSIONS_ADMIN_STATUS_ACCEPTED = "accepted";
export const COURSE_DISCUSSIONS_ADMIN_STATUS_REJECTED = "rejected";
export const COURSE_DISCUSSIONS_ADMIN_REJECTION_REASON_DEFAULT =
    "管理者によって却下されました";
export const COURSE_DISCUSSIONS_ADMIN_REJECTION_DIALOG_TITLE =
    "却下する理由を入力";
export const COURSE_DISCUSSIONS_ADMIN_REJECTION_DIALOG_DESCRIPTION =
    "報告を却下する理由を入力してください。任意の項目です。";
export const COURSE_DISCUSSIONS_ADMIN_REJECTION_DIALOG_LABEL = "理由";
export const COURSE_DISCUSSIONS_REPORT_DIALOG_TITLE = "投稿を報告";
export const COURSE_DISCUSSIONS_REPORT_DIALOG_DESCRIPTION =
    "この投稿を報告する理由を入力してください。";
export const COURSE_DISCUSSIONS_REPORT_DIALOG_PLACEHOLDER =
    "報告する理由…";
export const COURSE_DISCUSSIONS_REPORT_DIALOG_SUBMIT = "送信";
export const COURSE_DISCUSSIONS_EDIT = "編集";
export const COURSE_DISCUSSIONS_EDITED_LABEL = "編集済み";
export const COURSE_DISCUSSIONS_SAVE = "保存";
export const COURSE_DISCUSSIONS_CANCEL = "キャンセル";
export const REACT_COMPONENT_CRASHED =
    "コンテンツの表示中に問題が発生しました";
export const CHECKOUT_PAGE_TITLE = "購入手続き";
export const PAYMENT_MODAL_PAYMENT_DETAILS_HEADER = "決済情報";
export const PAYMENT_MODAL_COST_PREFIX = "価格";
export const PAYMENT_MODAL_PAY_NOW_BUTTON_CAPTION = "支払う";
export const PAYMENT_INITIATION_FAILED =
    "決済処理に失敗しました。この画面を閉じて、もう一度お試しください。";
export const PAYMENT_VERIFICATION_FAILED =
    "決済を確認できませんでした。もう一度お試しください。";
export const STRIPE_PUBLISHABLE_KEY_EMPTY =
    "Stripeの設定に問題があります。サイト管理者にお問い合わせください。";
export const CAPTION_TRY_AGAIN = "もう一度試す";
export const CAPTION_CLOSE = "閉じる";
export const LOADING = "読み込み中";
export const WORKING = "処理中…";
export const BUTTON_NEW_LESSON_TEXT = "レッスンを追加";
export const BUTTON_NEW_LESSON_TEXT_DOWNLOAD = "ファイルを追加";
export const EDIT_LESSON_TEXT = "レッスンを編集";
export const BUTTON_LESSON_DOWNLOAD = "新しいタブで開く";
export const BUTTON_NEW_GROUP_TEXT = "新しい章";
export const BUTTON_MANAGE_LESSONS_TEXT = "レッスンを管理";
export const BUTTON_LESSON_VIEW_GO_BACK = "講座の詳細へ戻る";
export const BUTTON_DELETE_LESSON_TEXT = "削除";
export const COURSE_SETTINGS_CARD_HEADER = "設定";
export const DANGER_ZONE_HEADER = "重要な操作";
export const DANGER_ZONE_DESCRIPTION = "この操作は元に戻せません。";
export const DELETE_COURSE_POPUP_HEADER = "講座を削除しますか？";
export const POPUP_OK_ACTION = "削除";
export const POPUP_CANCEL_ACTION = "キャンセル";
export const BTN_BACK_TO_CONTENT = "コンテンツへ戻る";
export const LOGIN_SECTION_HEADER = "ログイン";
export const LABEL_GROUP_NAME = "名前";
export const LABEL_DRIP_EMAIL_SUBJECT = "件名";
export const LABEL_DRIP_DELAY = "前回の配信からの日数";
export const LABEL_DRIP_DATE = "日付";
export const BTN_LOGIN = "続ける";
export const BTN_LOGIN_NO_CODE = "再送する";
export const LOGIN_FORM_LABEL =
    "メールアドレスを入力してログイン・新規登録してください";
export const LOGIN_NO_CODE = "認証コードが届かない場合";
export const BTN_LOGIN_GET_CODE = "認証コードを送信";
export const LOGIN_CODE_INTIMATION_MESSAGE =
    "メールに届いた認証コードを入力してください";
export const LOGIN_FORM_DISCLAIMER = "送信すると次の規約に同意したものとみなされます：";
export const SIGNUP_SECTION_HEADER = "アカウントを作成";
export const SIGNUP_SECTION_BUTTON = "参加する";
export const MEDIA_MANAGER_PAGE_HEADING = "ファイル";
export const BUTTON_SEARCH = "検索";
export const BUTTON_ADD_FILE = "ファイルを選択";
export const FILE_UPLOAD_SUCCESS = "ファイルをアップロードしました";
export const HEADER_YOUR_MEDIA = "保存済みファイル";
export const BLOG_POST_SWITCH = "投稿";
export const DOWNLOADABLE_SWITCH = "ダウンロード可";
export const TYPE_DROPDOWN = "種類";
export const LESSON_CONTENT_HEADER = "本文";
export const COURSE_CONTENT_HEADER = "内容";
export const LESSON_CONTENT_EMBED_HEADER = "リンク";
export const LESSON_CONTENT_EMBED_PLACEHOLDER = "YouTubeなどの動画リンク";
export const CONTENT_URL_LABEL = "メディアファイル";
export const MEDIA_MANAGER_YOUR_MEDIA_HEADER = "保存済みファイル";
export const DIALOG_SELECT_BUTTON = "選択";
export const LESSON_PREVIEW = "プレビュー";
export const LESSON_PREVIEW_TOOLTIP =
    "このレッスンは受講登録なしで閲覧できます。";
export const LESSON_VISIBILITY = "公開状態";
export const LESSON_VISIBILITY_TOOLTIP =
    "非公開のレッスンは受講者にも表示されません。";
export const DELETE_LESSON_POPUP_HEADER = "レッスンを削除";
export const APP_MESSAGE_COURSE_DELETED = "講座・商品を削除しました";
export const APP_MESSAGE_LESSON_DELETED = "レッスンを削除しました";
export const APP_MESSAGE_LESSON_SAVED = "レッスンを保存しました";
export const APP_MESSAGE_COURSE_SAVED = "変更を保存しました";
export const ENROLL_IN_THE_COURSE =
    "このレッスンを閲覧するには受講登録が必要です。";
export const NOT_ENROLLED_HEADER = "受講登録が必要です";
export const USER_ERROR_HEADER = "問題が発生しました";
export const ENROLL_BUTTON_TEXT = "購入する";
export const CHECKOUT_BUTTON_TEXT = "購入を完了する";
export const BUTTON_DELETE_MEDIA = "削除";
export const DELETE_MEDIA_POPUP_HEADER = "このファイルを削除しますか？";
export const HEADER_EDITING_MEDIA = "ファイルを編集";
export const MEDIA_EDITOR_HEADER_EDIT_DETAILS = "詳細";
export const HEADER_MEDIA_PREVIEW = "プレビュー";
export const PREVIEW_PDF_FILE = "新しいタブでプレビュー";
export const APP_MESSAGE_MEDIA_DELETED = "ファイルを削除しました";
export const APP_MESSAGE_MEDIA_UPDATED = "ファイル情報を更新しました";
export const PAGE_HEADER_ALL_COURSES = "講座";
export const PAGE_HEADER_ALL_POSTS = "ブログ";
export const COURSE_TYPE_BLOG = "ブログ";
export const BACK_TO_BLOG = "ブログ一覧へ戻る";
export const COURSE_TYPE_COURSE = "講座";
export const COURSE_CREATOR_PREFIX = "講師：";
export const APP_MESSAGE_SETTINGS_SAVED = "設定を保存しました";
export const ENROLLED_COURSES_HEADER = "受講中の講座";
export const SITE_APIKEYS_SETTING_HEADER = "APIキー";
export const SITE_MAILS_HEADER = "メール";
export const BROADCASTS = "一斉配信";
export const SEQUENCES = "ステップ配信";
export const TEMPLATES = "テンプレート";
export const SITE_MAILING_ADDRESS_SETTING_HEADER = "郵送先住所";
export const SITE_MAILING_ADDRESS_SETTING_EXPLANATION =
    "CAN-SPAM法への対応として必要な項目です。";
export const MAIL_REQUEST_RECEIVED =
    "申請を更新しました。確認後にご連絡します。";
export const MAIL_REQUEST_FORM_SUBMIT_INITIAL_REQUEST_TEXT = "利用を申請";
export const MAIL_REQUEST_FORM_SUBMIT_UPDATE_REQUEST_TEXT = "申請理由を更新";
export const SITE_CUSTOMISATIONS_SETTING_HEADER = "コード挿入";
export const SITE_MISCELLANEOUS_SETTING_HEADER = "その他";
export const ALPHA_LABEL = "アルファ版";
export const BETA_LABEL = "ベータ版";
export const SITE_CUSTOMISATIONS_SETTING_CODEINJECTION_HEAD =
    "<head>へのコード挿入";
export const SITE_CUSTOMISATIONS_SETTING_CODEINJECTION_BODY =
    "<body>へのコード挿入";
export const DISCARD_COURSE_CHANGES_POPUP_HEADER =
    "講座への変更を破棄しますか？";
export const FEATURED_SECTION_HEADER = "おすすめコンテンツ";
export const CARD_HEADER_PAGE_LAYOUT = "レイアウト";
export const CARD_HEADER_THEME = "テーマ";
export const CARD_DESCRIPTION_PAGE_LAYOUT =
    "「＋」ボタンで、ページの各部分に必要なコンポーネントを追加できます。";
export const ADD_COMPONENT_POPUP_HEADER = "ブロックを追加";
export const APP_MESSAGE_CHANGES_SAVED = "変更を保存しました";
export const SUBHEADER_COURSES_SECTION =
    "講座で新しいスキルを学びましょう。";
export const SUBHEADER_FEATURED_SECTION =
    "おすすめの教材をご紹介します。";
export const SUBHEADER_THEME_ADD_THEME = "新しいテーマ";
export const SUBHEADER_THEME_ADDED_THEME = "インストール済みテーマ";
export const SUBHEADER_THEME_ADD_THEME_INPUT_LABEL = "テーマ編集";
export const SUBHEADER_THEME_ADD_THEME_INPUT_PLACEHOLDER =
    "JSONをここに貼り付けてください";
export const BUTTON_GET_THEMES = "テーマを探す";
export const BUTTON_THEME_APPLY = "適用";
export const BUTTON_THEME_UNINSTALL = "アンインストール";
export const BUTTON_THEME_INSTALL = "インストール";
export const BUTTON_THEME_REMIX = "複製して編集";
export const DELETE_THEME_POPUP_HEADER = "テーマをアンインストール";
export const APPLY_THEME_POPUP_HEADER = "テーマを適用";
export const REMIXED_THEME_PREFIX = "複製して編集";
export const APP_MESSAGE_THEME_COPIED = "テーマを編集できます";
export const NO_THEMES_INSTALLED = "インストール済みテーマはありません";
export const APP_MESSAGE_THEME_INSTALLED = "テーマをインストールしました";
export const APP_MESSAGE_THEME_APPLIED = "テーマを適用しました";
export const APP_MESSAGE_THEME_UNINSTALLED = "テーマをアンインストールしました";
export const HEADER_SECTION_PAYMENT_CONFIRMATION_WEBHOOK =
    "決済Webhook URL";
export const SUBHEADER_SECTION_PAYMENT_CONFIRMATION_WEBHOOK =
    "決済サービスからの購入通知を受け取るためのURLです。購入状況を正しく反映するため、決済サービスのWebhook設定にコピーしてください。";
export const PURCHASE_STATUS_PAGE_HEADER = "購入状況";
export const MAIN_MENU_ITEM_DASHBOARD = "管理画面";
export const MAIN_MENU_ITEM_PROFILE = "プロフィール";
export const MAIN_MENU_ITEM_NOTIFICATIONS = "通知";
export const LAYOUT_SECTION_MAIN_CONTENT = "メインコンテンツ";
export const LAYOUT_SECTION_FOOTER_LEFT = "左側";
export const LAYOUT_SECTION_FOOTER_RIGHT = "右側";
export const LAYOUT_SECTION_TOP = "上部";
export const LAYOUT_SECTION_FOOTER = "フッター";
export const LAYOUT_SECTION_BOTTOM = "下部";
export const LAYOUT_SECTION_ASIDE = "サイドバー";
export const TRANSACTION_STATUS_SUCCESS = "お支払いを確認しました。";
export const TRANSACTION_STATUS_SUCCESS_DETAILS =
    "ありがとうございます。講座を開いて学習を始められます。";
export const TRANSACTION_STATUS_INITIATED = "お支払いをまだ確認できていません。";
export const TRANSACTION_STATUS_FAILED = "お支払いに失敗しました。";
export const TRANSACTION_STATUS_FAILED_DETAILS =
    "決済サービスでお支払いを処理できませんでした。戻ってもう一度お試しください。";
export const VISIT_COURSE_BUTTON = "講座を開く";
export const VERIFY_PAYMENT_BUTTON = "支払い状況を再確認";
export const PURCHASE_ID_HEADER = "購入ID";
export const PAGE_HEADER_FEATURED = "おすすめコンテンツ";
export const BTN_VIEW_ALL = "すべて見る";
export const EMPTY_COURSES_LIST_ADMIN =
    "右上の「＋」ボタンから最初の講座を作成できます。";
export const HEADER_RESET_PASSWORD = "パスワードをリセット";
export const HEADER_DESIGN = "サイト";
export const HEADER_YOUR_PROFILE = "プロフィール";
export const PROFILE_PAGE_MESSAGE_NOT_LOGGED_IN = "プロフィールを表示するにはログインしてください。";
export const PROFILE_PAGE_HEADER = "プロフィール";
export const MY_CONTENT_HEADER = "受講中のコンテンツ";
export const MY_CONTENT_PRODUCTS_TAB = "講座・商品";
export const MY_CONTENT_FEED_TAB = "フィード";
export const MY_CONTENT_EMPTY_PRODUCTS =
    "まだ受講・購入した講座や商品はありません。";
export const MY_CONTENT_EMPTY_COMMUNITIES =
    "まだ参加しているコミュニティはありません。";
export const MY_CONTENT_BROWSE_PRODUCTS = "講座・商品を見る";
export const MY_CONTENT_BROWSE_COMMUNITIES = "コミュニティを見る";
export const MY_CONTENT_FEED_EMPTY_TITLE = "まだ投稿はありません";
export const MY_CONTENT_FEED_EMPTY_DESCRIPTION =
    "コミュニティに参加すると、ここに投稿が表示されます。";
export const MY_CONTENT_FEED_COMMUNITIES_TITLE = "参加中のコミュニティ";
export const MY_CONTENT_FEED_COMMUNITIES_EMPTY =
    "まだ参加しているコミュニティはありません。";
export const NOTIFICATION_SETTINGS_PAGE_HEADER = "通知";
export const NOTIFICATION_SETTINGS_PAGE_DESCRIPTION =
    "各操作に関する通知の受け取り方を設定します。";
export const NOTIFICATION_SETTINGS_RESOURCE_TEXT = "通知を設定";
export const NOTIFICATION_SETTINGS_COLUMN_ACTIVITY = "活動";
export const NOTIFICATION_SETTINGS_EMPTY_STATE =
    "このアカウントで設定できる通知はありません。";
export const NOTIFICATION_SETTINGS_GROUP_GENERAL = "一般";
export const NOTIFICATION_SETTINGS_GROUP_PRODUCT_MANAGEMENT = "講座・商品";
export const NOTIFICATION_SETTINGS_GROUP_USER_MANAGEMENT = "ユーザー";
export const NOTIFICATION_SETTINGS_GROUP_COMMUNITY_MANAGEMENT = "コミュニティ";
export const PROFILE_EMAIL_PREFERENCES = "メールの受信設定";
export const PROFILE_SECTION_DETAILS = "個人情報";
export const PROFILE_SECTION_DETAILS_NAME = "名前";
export const PROFILE_SECTION_DETAILS_EMAIL = "メールアドレス";
export const PROFILE_SECTION_DETAILS_BIO = "自己紹介";
export const PROFILE_SECTION_DISPLAY_PICTURE = "プロフィール画像";
export const PROFILE_EMAIL_PREFERENCES_NEWSLETTER_OPTION_TEXT =
    "ニュースレター・案内メールを受け取る";
export const BTN_PUBLISH = "公開";
export const BTN_UNPUBLISH = "非公開にする";
export const PERM_SECTION_HEADER = "権限";
export const USER_BASIC_DETAILS_HEADER = "基本情報";
export const USER_EMAIL_SUBHEADER = "メールアドレス";
export const USER_NAME_SUBHEADER = "名前";
export const USER_FILTER_CLEAR = "絞り込みを解除";
export const USER_FILTER_DROPDOWN_LABEL = "条件を追加";
export const USER_FILTER_BTN_LABEL = "絞り込み";
export const USER_FILTER_CATEGORY_EMAIL = "メールアドレス";
export const USER_FILTER_CATEGORY_PRODUCT = "講座・商品";
export const USER_FILTER_CATEGORY_COMMUNITY = "コミュニティ";
export const USER_FILTER_CATEGORY_LAST_ACTIVE = "最終利用日";
export const USER_FILTER_CATEGORY_SIGNED_UP = "登録日";
export const USER_FILTER_CATEGORY_SUBSCRIPTION = "定期払い";
export const USER_FILTER_CATEGORY_TAGGED = "タグ";
export const USER_FILTER_CATEGORY_PERMISSION = "権限";
export const USER_FILTER_EMAIL_IS_EXACTLY = "完全一致";
export const USER_FILTER_EMAIL_CONTAINS = "含む";
export const USER_FILTER_EMAIL_NOT_CONTAINS = "含まない";
export const USER_FILTER_PRODUCT_HAS = "あり";
export const USER_FILTER_PRODUCT_DOES_NOT_HAVE = "なし";
export const USER_FILTER_COMMUNITY_HAS = "参加している";
export const USER_FILTER_COMMUNITY_DOES_NOT_HAVE = "参加していない";
export const USER_FILTER_APPLY_BTN = "適用";
export const USER_FILTER_SAVE = "新しいセグメントとして保存";
export const USER_FILTER_SAVE_DESCRIPTION =
    "保存したセグメントは「セグメント」メニューから選択できます";
export const USER_SEGMENT_DESCRIPTION = "条件ごとにユーザーをグループ分けします。";
export const USER_FILTER_LABEL_DEFAULT = "すべてのユーザー";
export const USER_FILTER_AGGREGATOR_HEADER = "一致条件";
export const USER_FILTER_AGGREGATOR_ALL = "すべて";
export const USER_FILTER_AGGREGATOR_ANY = "いずれか";
export const USER_FILTER_PRODUCT_DROPDOWN_LABEL = "講座・商品を選択";
export const USER_FILTER_COMMUNITY_DROPDOWN_LABEL = "コミュニティを選択";
export const USER_FILTER_TAGGED_DROPDOWN_LABEL = "タグを選択";
export const USER_FILTER_PERMISSION_DROPDOWN_LABEL = "権限を選択";
export const USER_DELETE_SEGMENT = "セグメントを削除";
export const USER_DELETE_SEGMENT_DESCRIPTION =
    "次の項目を削除しますか：";
export const USER_FILTER_NEW_SEGMENT_NAME = "セグメント名";
export const USER_FILTER_SUBSCRIPTION_SUBSCRIBED = "配信登録済み";
export const USER_FILTER_SUBSCRIPTION_NOT_SUBSCRIBED = "配信未登録";
export const USER_FILTER_CHIP_TOOLTIP = "条件を外す";
export const USER_FILTER_PERMISSION_HAS = "あり";
export const USER_FILTER_PERMISSION_DOES_NOT_HAVE = "なし";
export const USER_FILTER_LAST_ACTIVE_BEFORE = "より前";
export const USER_FILTER_LAST_ACTIVE_AFTER = "より後";
export const USER_FILTER_LAST_ACTIVE_ON = "指定日";
export const USER_FILTER_SIGNED_UP_BEFORE = "より前";
export const USER_FILTER_SIGNED_UP_AFTER = "より後";
export const USER_FILTER_SIGNED_UP_ON = "指定日";
export const USER_FILTER_DATE_RANGE_DROPDOWN_LABEL = "日付を選択";
export const DOCUMENTATION_LINK_LABEL = "詳しく見る";
export const PERM_COURSE_MANAGE = "講座・商品を管理";
export const PERM_COURSE_MANAGE_ANY = "すべての講座・商品を管理";
export const PERM_COURSE_PUBLISH = "コンテンツを公開";
export const PERM_ENROLL_IN_COURSE = "講座・商品を購入";
export const PERM_MEDIA_MANAGE = "ファイルを管理";
export const PERM_MEDIA_MANAGE_ANY = "すべてのファイルを管理";
export const PERM_SITE = "ページを管理";
export const PERM_SETTINGS = "設定を管理";
export const PERM_USERS = "ユーザーを管理";
export const PERM_MANAGE_COMMUNITY = "コミュニティを管理";
export const MEDIA_EDITOR_ORIGINAL_FILE_NAME_HEADER = "ファイル名";
export const GROUP_LESSON_ITEM_UNTITLED = "無題";
export const SECTION_GROUP_HEADER = "章";
export const ERROR_SIGNIN_GENERATING_LINK =
    "ログイン用リンクを作成できませんでした。もう一度お試しください。";
export const ERROR = "問題が発生しました。";
export const SIGNIN_SUCCESS_PREFIX = "ログイン用リンクの送信先：";
export const ERROR_SIGNIN_VERIFYING_LINK =
    "ログインできませんでした。もう一度お試しください。";
export const COURSE_STRUCTURE_SELECT_LESSON =
    "章の一覧からレッスンを選択してください。";
export const ERROR_GROUP_NEW_LESSON_WITHOUT_SAVE =
    "先に章の設定を保存してください";
export const LABEL_GROUP_COLLAPSE = "展開した状態で表示";
export const SEARCH_TEXTBOX_PLACEHOLDER = "検索";
export const PAGE_TITLE_404 = "見つかりませんでした";
export const MEDIA_PUBLIC = "一般公開";
export const MEDIA_DIRECT_URL = "直接リンク";
export const MEDIA_URL_COPIED = "コピーしました";
export const MEDIA_FILE_TYPE = "ファイルの種類";
export const LOGOUT = "ログアウト";
export const LOGOUT_MESSAGE = "ログアウトしますか？";
export const USER_TABLE_HEADER_NAME = "詳細";
export const USER_TABLE_HEADER_STATUS = "状態";
export const USER_TABLE_HEADER_PRODUCTS = "講座・商品";
export const USER_TABLE_HEADER_COMMUNITIES = "コミュニティ";
export const USER_TABLE_HEADER_JOINED = "参加日";
export const USER_TABLE_HEADER_LAST_ACTIVE = "最終ログイン";
export const USER_TABLE_HEADER_EMAIL = "メールアドレス";
export const USER_TABLE_HEADER_NAME_NAME = "名前";
export const USER_SEGMENT_DROPDOWN_LABEL = "セグメント";
export const USER_TYPE_TOOLTIP =
    "役割ごとにユーザーを分けます。受講者は講座を受講できるユーザー、チームは管理権限を持つユーザーです。";
export const DIALOG_DONE_BUTTON = "完了";
export const DIALOG_EDIT_WIDGET_PREFIX = "編集";
export const PRODUCTS_TABLE_HEADER_NAME = "タイトル";
export const PRODUCTS_TABLE_HEADER_TYPE = "種類";
export const PRODUCTS_TABLE_HEADER_STATUS = "状態";
export const PRODUCTS_TABLE_HEADER_STUDENTS = "受講者";
export const PRODUCTS_TABLE_HEADER_SALES = "売上";
export const PRODUCTS_TABLE_HEADER_ACTIONS = "操作";
export const PRODUCT_STATUS_DRAFT = "下書き";
export const PRODUCT_STATUS_PUBLISHED = "公開済み";
export const PRODUCT_TABLE_CONTEXT_MENU_DELETE_PRODUCT = "削除";
export const PRODUCT_TABLE_CONTEXT_MENU_EDIT_PAGE = "ページを編集";
export const PRODUCT_TABLE_CONTEXT_MENU_INVITE_A_CUSTOMER = "受講者・購入者を招待";
export const BTN_INVITE = "招待";
export const BTN_GO_BACK = "戻る";
export const BTN_NEW_PRODUCT = "新しい講座・商品";
export const BTN_NEW_PAGE = "新しいページ";
export const PAGE_HEADER_NEW_PRODUCT = "新しい講座・商品";
export const FORM_NEW_PRODUCT_TITLE = "タイトル";
export const FORM_NEW_PRODUCT_TYPE = "商品の種類";
export const FORM_NEW_PRODUCT_TITLE_PLC = "例：はじめてのAI活用講座";
export const FORM_NEW_PRODUCT_SELECT = "商品の種類";
export const BTN_CONTINUE = "続ける";
export const DELETE_PRODUCT_POPUP_HEADER = "講座・商品を削除";
export const DELETE_PRODUCT_POPUP_TEXT =
    "この操作は元に戻せません。この講座・商品に関連するすべてのデータと分析情報を削除します。";
export const FORM_NEW_PRODUCT_MENU_COURSE_SUBTITLE =
    "画像・動画・テキストなどで構成する講座です。";
export const FORM_NEW_PRODUCT_MENU_DOWNLOADS_SUBTITLE =
    "画像・動画・テキストなどをまとめたZIPファイルです。";
export const NEW_SECTION_HEADER = "新しい章";
export const EDIT_SECTION_DRIP = "順次公開";
export const DRIP_SECTION_STATUS = "順次公開を有効にする";
export const EDIT_SECTION_HEADER = "章を編集";
export const DELETE_SECTION_HEADER = "章を削除";
export const BUTTON_MOVE_SECTION_UP = "章を上に移動";
export const BUTTON_MOVE_SECTION_DOWN = "章を下に移動";
export const PRICING_HEADER = "料金";
export const PRICING_DROPDOWN = "料金体系";
export const PRICING_FREE = Constants.ProductPriceType.FREE;
export const PRICING_FREE_SUBTITLE =
    "ログイン済みのユーザーが無料で利用できます。";
export const PRICING_EMAIL = Constants.ProductPriceType.EMAIL;
export const PRICING_EMAIL_LABEL = "メールで無料配布";
export const PRICING_EMAIL_SUBTITLE =
    "メールでコンテンツを届けます。ユーザーのログインは不要です。";
export const PRICING_PAID = Constants.ProductPriceType.PAID;
export const PRICING_PAID_LABEL = "有料";
export const PRICING_FREE_LABEL = "無料";
export const PAYMENT_PLAN_FREE_LABEL = "無料";
export const PAYMENT_PLAN_ONETIME_LABEL = "一括払い";
export const PAYMENT_PLAN_SUBSCRIPTION_LABEL = "定期払い";
export const PAYMENT_PLAN_EMI_LABEL = "分割払い";
export const PRICING_PAID_SUBTITLE =
    "ログインして一度支払うと利用できます。";
export const PRICING_PAID_NO_PAYMENT_METHOD =
    "この機能を使うには「設定」で決済方法を設定してください。";
export const PUBLISH_TAB_STATUS_TITLE = "状態";
export const PUBLISH_TAB_STATUS_SUBTITLE =
    "講座の公開・非公開を切り替えます。";
export const PUBLISH_TAB_VISIBILITY_TITLE = "公開状態";
export const PUBLISH_TAB_VISIBILITY_SUBTITLE =
    "一覧には表示されず、直接リンクを知っている人だけがアクセスできます。";
export const PAGE_TITLE_EDIT_PAGE = "編集";
export const PAGE_TITLE_VIEW_PAGE = "表示";
export const PAGE_HEADER_EDIT_PAGE = "ページを編集";
export const EDIT_PAGE_MENU_ITEM = "ページを編集";
export const VIEW_PAGE_MENU_ITEM = "ページを見る";
export const PREVIEW_COURSE_MENU_ITEM = "プレビュー";
export const EDIT_PAGE_BUTTON_UPDATE = "公開";
export const EDIT_PAGE_BUTTON_VIEW = "表示";
export const EDIT_PAGE_BUTTON_DONE = "閉じる";
export const EDIT_PAGE_ADD_WIDGET_TITLE = "新しいブロック";
export const EDIT_PAGE_WIDGET_LIST_HEADER = "ページのブロック";
export const THEMES_TABLE_HEADER_NAME = "名前";
export const ACCOUNT_PROGRESS_SUFFIX = "% 完了";
export const CHECKOUT_PAGE_TOTAL = "合計";
export const COURSE_PROGRESS_PREV = "前へ";
export const COURSE_PROGRESS_INTRO = "はじめに";
export const COURSE_PROGRESS_NEXT = "完了して次へ";
export const COURSE_PROGRESS_START = "開始";
export const COURSE_PROGRESS_FINISH = "完了して終了";
export const COURSE_PROGRESS_MARK_COMPLETED = "完了にする";
export const COURSE_PROGRESS_COMPLETED = "完了済み";
export const BTN_NEW_BLOG = "新しいブログ";
export const MANAGE_BLOG_PAGE_HEADING = "ブログ";
export const BLOG_TABLE_HEADER_NAME = "タイトル";
export const PAGE_HEADER_NEW_BLOG = "新しいブログ";
export const MENU_BLOG_VISIT = "ブログを見る";
export const ACCOUNT_NO_PURCHASE_PLACEHOLDER =
    "受講登録した講座がここに表示されます。";
export const EXPORT_CSV = "CSVに出力";
export const GENERIC_FAILURE_MESSAGE = "処理できませんでした。もう一度お試しください。";
export const LESSON_QUIZ_ADD_QUESTION = "問題を追加";
export const LESSON_QUIZ_ADD_OPTION_BTN = "選択肢を追加";
export const LESSON_QUIZ_CONTENT_HEADER = "問題";
export const LESSON_QUIZ_OPTIONS_HEADER = "選択肢";
export const LESSON_QUIZ_QUESTION_PLACEHOLDER = "問題を入力してください";
export const LESSON_QUIZ_OPTION_PLACEHOLDER = "選択肢を入力してください";
export const QUESTION_BUILDER_CORRECT_ANS_TOOLTIP = "正解にする";
export const QUESTION_BUILDER_EXPAND_TOOLTIP = "展開";
export const QUESTION_BUILDER_COLLAPSE_TOOLTIP = "折りたたむ";
export const LESSON_QUIZ_GRADED_TEXT = "このテストには合格点があります";
export const QUIZ_VIEWER_EVALUATE_BTN = "送信";
export const QUIZ_VIEWER_EVALUATE_BTN_LOADING = "確認中…";
export const QUIZ_SCORE_PREFIX_MESSAGE = "得点：";
export const COURSE_STUDENT_REPORT_HEADER = "受講者";
export const COURSE_STUDENT_TABLE_HEADER_PROGRESS = "進捗";
export const COURSE_STUDENT_TABLE_HEADER_DOWNLOAD = "ダウンロード済み";
export const COURSE_STUDENT_TABLE_HEADER_SIGNED_UP_ON = "受講登録日";
export const COURSE_STUDENT_TABLE_HEADER_LAST_ACCESSED_ON = "最終アクセス";
export const COURSE_STUDENT_SEARCH_BY_TEXT = "受講者を検索";
export const COURSE_STUDENT_NO_RECORDS = "受講者が見つかりません";
export const QUESTION_BUILDER_DELETE_TOOLTIP = "問題を削除";
export const PAGE_HEADER_EDIT_MAIL = "メールを作成";
export const PAGE_HEADER_EDIT_TEMPLATE = "テンプレート";
export const PAGE_HEADER_MANAGE = "管理";
export const PAGE_HEADER_EDIT_SEQUENCE = "ステップ配信の詳細";
export const BTN_SEND = "送信";
export const DIALOG_SEND_HEADER = "メールを送信";
export const BTN_SCHEDULE = "予約";
export const ERROR_SUBJECT_EMPTY = "件名を入力してください";
export const ERROR_DELAY_EMPTY = "予約日時は未来の日時を指定してください";
export const FORM_MAIL_SCHEDULE_TIME_LABEL = "送信日時";
export const BTN_SENDING = "送信中";
export const MAIL_SUBJECT_PLACEHOLDER = "件名";
export const MAIL_PREVIEW_TITLE = "プレビューテキスト";
export const COMPOSE_SEQUENCE_FORM_TITLE = "ステップ配信名";
export const COMPOSE_SEQUENCE_ENTRANCE_CONDITION_DATA =
    "開始条件のデータ";
export const COMPOSE_SEQUENCE_FORM_FROM = "送信者";
export const COMPOSE_SEQUENCE_FROM_PLC = "送信者名";
export const COMPOSE_SEQUENCE_ENTRANCE_CONDITION = "開始条件";
export const COMPOSE_SEQUENCE_EDIT_DELAY = "待機時間";
export const MAIL_TO_PLACEHOLDER = "宛先";
export const MAIL_BODY_PLACEHOLDER = "メール本文";
export const PAGE_HEADER_ALL_MAILS = "メール";
export const SIDEBAR_MENU_MAILS = "メール";
export const SIDEBAR_MENU_USERS = "ユーザー";
export const SIDEBAR_MENU_SETTINGS = "設定";
export const SIDEBAR_MENU_PAGES = "ページ";
export const SIDEBAR_MENU_PRODUCTS = "講座・商品";
export const SIDEBAR_MENU_DASHBOARD = "ホーム";
export const SIDEBAR_MENU_BLOGS = "ブログ";
export const PAGE_HEADER_EDIT_USER = "ユーザーを編集";
export const PAGE_HEADER_ALL_USER = "すべてのユーザー";
export const TOAST_MAIL_SENT = "メールの配信を予約しました";
export const PAGE_PLACEHOLDER_MAIL = "メールがここに表示されます";
export const BTN_NEW_MAIL = "新しい一斉配信";
export const BTN_NEW_SEQUENCE = "新しいステップ配信";
export const BTN_NEW_TEMPLATE = "新しいテンプレート";
export const PAGE_HEADER_CHOOSE_TEMPLATE = "テンプレートを選択";
export const BTN_EDIT_TEMPLATE = "テンプレートを編集";
export const BTN_DELETE_TEMPLATE = "テンプレートを削除";
export const TEMPLATE_NAME_LABEL = "テンプレート名";
export const TEMPLATE_NAME_PLACEHOLDER = "無題のテンプレート";
export const TEMPLATE_SETTINGS_DESCRIPTION =
    "テンプレート名をここで変更できます。本文は下のプレビューから編集してください。";
export const TEMPLATE_MANAGE_DESCRIPTION = "テンプレートの設定を管理します";
export const TEMPLATE_PREVIEW_HEADER = "テンプレートのプレビュー";
export const TEMPLATE_PREVIEW_DESCRIPTION =
    "内容を確認し、変更する場合は編集画面を開いてください。";
export const MAIL_TEMPLATE_CHOOSER_HEADING = "テンプレートを選択";
export const MAIL_TEMPLATE_CHOOSER_DESCRIPTION =
    "レイアウトを選び、編集画面で内容を変更できます。";
export const MAIL_TEMPLATE_CHOOSER_SYSTEM_SECTION = "標準";
export const MAIL_TEMPLATE_CHOOSER_SYSTEM_DESCRIPTION =
    "よく使う用途に対応した標準テンプレートです。";
export const MAIL_TEMPLATE_CHOOSER_CUSTOM_SECTION = "保存済みテンプレート";
export const MAIL_TEMPLATE_CHOOSER_CUSTOM_DESCRIPTION =
    "保存したテンプレートを再利用できます。";
export const TEMPLATES_EMPTY_STATE_TITLE = "テンプレートはまだありません";
export const TEMPLATES_EMPTY_STATE_DESCRIPTION =
    "標準テンプレートを編集して、再利用できるテンプレートを作成できます。";
export const TEMPLATES_EMPTY_STATE_CTA = "テンプレートから作成";
export const TEMPLATE_CHOOSER_CUSTOM_EMPTY_STATE_TITLE =
    "保存済みテンプレートはまだありません";
export const TEMPLATE_CHOOSER_CUSTOM_EMPTY_STATE_DESCRIPTION =
    "上の標準テンプレートから作成すると、ここに表示されます。";
export const MAIL_TEMPLATE_CHOOSER_BADGE_SYSTEM = "標準";
export const MAIL_TEMPLATE_CHOOSER_BADGE_CUSTOM = "カスタム";
export const DELETE_TEMPLATE_DIALOG_HEADER = "テンプレートを削除";
export const DELETE_TEMPLATE_DIALOG_DESCRIPTION =
    "テンプレートを完全に削除します。この操作は取り消せません。";
export const TOAST_TEMPLATE_SAVED = "テンプレートを更新しました";
export const TOAST_TEMPLATE_DELETED = "テンプレートを削除しました";
export const MAIL_TABLE_HEADER_SUBJECT = "件名";
export const MAIL_TABLE_HEADER_TITLE = "タイトル";
export const MAIL_TABLE_HEADER_RECEPIENTS = "宛先数";
export const MAIL_SENDER_YOU = "自分";
export const MAIL_TABLE_HEADER_SENDER = "送信者";
export const MAIL_TABLE_HEADER_STATUS = "状態";
export const MAIL_TABLE_HEADER_ENTRANTS = "登録者";
export const MAIL_TABLE_HEADER_SENT_ON = "送信日";
export const TOOLTIP_USER_PAGE_SEND_MAIL = "選択したユーザーへメールを送信";
export const EDIT_PAGE_BUTTON_FONTS = "フォント";
export const EDIT_PAGE_BUTTON_THEME = "テーマ";
export const EDIT_PAGE_BUTTON_SEO = "SEO";
export const SEO_FORM_NAME_LABEL = "タイトル";
export const SEO_FORM_DESC_LABEL = "説明";
export const SEO_FORM_ROBOTS_LABEL = "検索エンジンへの表示";
export const SEO_FORM_SOCIAL_IMAGE_LABEL = "SNS共有用の画像";
export const SEO_FORM_SOCIAL_IMAGE_TOOLTIP =
    "このページをSNSで共有するときに使われる画像です。";
export const EDIT_PAGE_SEO_HEADER = "SEO";
export const EDIT_PAGE_HEADER_ALL_PAGES = "ページ";
export const LOGIN_SECTION_EMAIL_INVALID = "メールアドレスが正しくありません";
export const COMPONENT_MISSING_SUFFIX = "コンポーネントが見つかりません。";
export const LESSON_GROUP_DELETED = "章を削除しました";
export const USER_PERMISSION_AREA_SUBTEXT =
    "このユーザーがスクールで行える操作を設定します。";
export const APIKEY_NEW_BUTTON = "新しいAPIキー";
export const ADD_SSO_PROVIDER_BUTTON = "新しい認証サービス";
export const APIKEY_EXISTING_HEADER = "APIキー";
export const APIKEY_CARD_DESCRIPTION =
    "APIキーを使ってCourseLit APIを操作し、外部サービスと連携できます";
export const SSO_CARD_DESCRIPTION =
    "既存のユーザーがスクールへログインできるようにします";
export const SINGLE_SIGN_ON_HEADER = "シングルサインオン（SSO）";
export const LOGIN_METHODS_HEADER = "ログイン方法";
export const LOGIN_METHODS_CARD_DESCRIPTION =
    "ユーザーがスクールにログインする方法を設定します";
export const LOGIN_PROVIDER_EMAIL_LABEL = "メールアドレス";
export const LOGIN_PROVIDER_GOOGLE_LABEL = "Google";
export const LOGIN_PROVIDER_SSO_LABEL = "SAML SSO";
export const LOGIN_PROVIDER_GOOGLE_BUTTON = "Googleでログイン";
export const LOGIN_PROVIDER_SSO_BUTTON = "SSOでログイン";
export const APIKEY_EXISTING_TABLE_HEADER_CREATED = "作成日";
export const APIKEY_EXISTING_TABLE_HEADER_NAME = "名前";
export const APIKEY_NEW_HEADER = "新しいAPIキー";
export const SSO_PROVIDER_HEADER = "SSO認証サービス";
export const SSO_PROVIDER_CARD_HEADER = "IDPの設定";
export const SSO_PROVIDER_CARD_DESCRIPTION =
    "IDP（Okta、Azure AD、OneLoginなど）の設定値を入力してください";
export const SSO_PROVIDER_SP_EMTPY =
    "IDPの設定を入力すると、ここに設定値が表示されます";
export const SSO_PROVIDER_SP_ACS_LABEL = "SAML ACS URL";
export const SSO_PROVIDER_SP_ENTITY_ID_LABEL = "Audience URI（SPエンティティID）";
export const APIKEY_NEW_LABEL = "名前";
export const SSO_PROVIDER_DOMAIN_LABEL = "ドメイン";
export const SSO_PROVIDER_ENTRY_POINT_LABEL = "エントリーポイント";
export const SSO_PROVIDER_CERT_LABEL = "証明書";
export const SSO_PROVIDER_CALLBACK_URL_LABEL = "コールバックURL";
export const SSO_PROVIDER_IDP_METADATA_LABEL = "IDPメタデータ";
export const SSO_PROVIDER_PROVIDER_ID_LABEL = "認証サービスID";
export const SSO_PROVIDER_SUCCESS_MESSAGE = "SSO認証サービスを追加しました";
export const GOOGLE_PROVIDER_HEADER = "Google";
export const GOOGLE_PROVIDER_CARD_HEADER = "Googleアプリの設定";
export const GOOGLE_PROVIDER_CARD_DESCRIPTION =
    "Google CloudのOAuthアプリの設定値を入力してください";
export const GOOGLE_PROVIDER_SETTINGS_HEADER = "スクール設定";
export const GOOGLE_PROVIDER_SETTINGS_DESCRIPTION =
    "Google OAuthアプリの設定に、この値を使用してください";
export const GOOGLE_PROVIDER_CLIENT_ID_LABEL = "クライアントID";
export const GOOGLE_PROVIDER_CLIENT_SECRET_LABEL = "クライアントシークレット";
export const GOOGLE_PROVIDER_REDIRECT_URI_LABEL = "許可するリダイレクトURI";
export const GOOGLE_PROVIDER_ORIGIN_LABEL = "許可するJavaScriptオリジン";
export const GOOGLE_PROVIDER_SUCCESS_MESSAGE =
    "Googleログインの設定を保存しました";
export const GOOGLE_PROVIDER_REMOVE_DIALOG_HEADER = "Googleログインを解除";
export const GOOGLE_PROVIDER_SECRET_HELPER =
    "空欄にすると、現在のクライアントシークレットを保持します。";
export const GOOGLE_PROVIDER_SECRET_SAVED = "クライアントシークレットは保存済みです。";
export const URL_COPIED_TO_CLIPBOARD = "URLをコピーしました";
export const PROVIDER_RESET_SUCCESS_MESSAGE = "認証サービスをリセットしました";
export const APIKEY_NEW_BTN_CAPTION = "作成";
export const APIKEY_NEW_GENERATED_KEY_HEADER = "作成したAPIキー";
export const APIKEY_NEW_GENERATED_KEY_DESC =
    "コピーして安全な場所に保管してください。このキーは再表示できません。";
export const APIKEY_NEW_GENERATED_KEY_COPIED = "コピーしました";
export const APIKEY_REMOVE_BTN = "解除";
export const SSO_PROVIDER_REMOVE_BTN = "解除";
export const APIKEY_REMOVE_DIALOG_HEADER = "APIキーを解除";
export const SSO_PROVIDER_REMOVE_DIALOG_HEADER = "SSO認証サービスを解除";
export const SSO_PROVIDER_REMOVE_DIALOG_DESC =
    "この認証サービスを解除しますか？";
export const APIKEY_REMOVE_DIALOG_DESC =
    "このキーを解除すると、使用中のアプリとの連携が停止します。解除したキーは元に戻せません。";
export const USER_TAGS_SUBHEADER = "タグ";
export const BTN_DELETE_USER = "ユーザーを削除";
export const USER_DELETE_DIALOG_TITLE = "ユーザーを削除しますか？";
export const USER_DELETE_DIALOG_DESCRIPTION =
    "この操作は元に戻せません。このユーザーが管理する講座・商品やコミュニティはあなたに移管され、その他のデータは削除されます。";
export const USER_DELETE_DIALOG_MIGRATION_HEADING =
    "あなたのアカウントに移管されるもの";
export const USER_DELETE_DIALOG_MIGRATION_ITEM_PRODUCTS =
    "このユーザーが作成した講座・商品、レッスン、ページをあなたに移管します。";
export const USER_DELETE_DIALOG_MIGRATION_ITEM_EMAIL =
    "このユーザーが作成したメールテンプレート、ステップ配信、配信情報をあなたに移管します。";
export const USER_DELETE_DIALOG_MIGRATION_ITEM_AUDIENCE =
    "セグメント、テーマ、料金プラン、進行中のステップ配信などをあなたに移管します。";
export const USER_DELETE_DIALOG_MIGRATION_ITEM_COMMUNITY =
    "コミュニティの管理者権限と管理していたページをあなたに移管します。";
export const USER_DELETE_DIALOG_DELETION_HEADING = "削除されるもの";
export const USER_DELETE_DIALOG_DELETION_ITEM_COMMUNICATION =
    "通知、メール状態、レッスンの評価、ダウンロードリンク、修了証、操作履歴。";
export const USER_DELETE_DIALOG_DELETION_ITEM_COMMUNITY =
    "コミュニティの投稿、コメント、返信、購読、報告、関連する「いいね」。講座・商品の質問欄の「いいね」、購読、報告（コメントと返信は匿名化されます）。";
export const USER_DELETE_DIALOG_DELETION_ITEM_COMMERCE =
    "メンバーシップ、請求書、受講登録、ステップ配信への登録。";
export const USER_DELETE_DIALOG_DELETION_ITEM_ACCOUNT =
    "ユーザーのプロフィール画像とアカウント。";
export const USER_DELETE_CONFIRMATION_LABEL = "確認のため「delete」と入力してください";
export const USER_DELETE_CONFIRMATION_PLACEHOLDER = "確認のためdeleteと入力";
export const USER_DELETE_CONFIRMATION_TOKEN = "delete";
export const USER_DELETE_ACTION_LOADING = "削除中…";
export const APP_MESSAGE_USER_DELETED = "ユーザーを削除しました";
export const APP_MESSAGE_USER_UPDATED = "ユーザー情報を保存しました";
export const USER_DETAILS_SAVE_BUTTON = "変更を保存";
export const USER_DETAILS_SAVE_BUTTON_LOADING = "保存中…";
export const USER_NAME_PLACEHOLDER = "氏名を入力してください";
export const USER_EMAIL_PLACEHOLDER = "メールアドレスを入力してください";
export const PAGES_TABLE_HEADER_NAME = "名前";
export const PAGES_TABLE_HEADER_ACTIONS = "操作";
export const NEW_PAGE_NAME_PLC = "ページ名";
export const NEW_PAGE_URL_LABEL = "URL";
export const NEW_PAGE_URL_PLC = "my-awesome-page";
export const DELETE_PAGE_POPUP_HEADER = "ページを削除しますか？";
export const DELETE_PAGE_POPUP_TEXT =
    "この操作は元に戻せません。このページに関連するすべてのデータを削除します。";
export const PAGE_TABLE_CONTEXT_MENU_DELETE = "削除";
export const APP_MESSAGE_PAGE_DELETED = "ページを削除しました";
export const APP_MESSAGE_MAIL_DELETED = "メールを削除しました";
export const NEW_PAGE_FORM_WARNING =
    "これらの設定は後から変更できません。内容を確認して進めてください。";
export const DASHBOARD_PAGE_HEADER = "ようこそ";
export const UNNAMED_USER = "ゲスト";
export const MAIL_REQUEST_FORM_REASON_FIELD = "理由";
export const MAIL_REQUEST_FORM_REASON_PLACEHOLDER =
    "申請内容を確認できるよう、できるだけ詳しく入力してください。";
export const DASHBOARD_SELECT_HEADER = "期間";
export const DELETE_EMAIL_MENU = "削除";
export const DELETE_EMAIL_DIALOG_HEADER = "メールを削除";
export const OVERVIEW_HEADER = "概要";
export const HELP_HEADER = "ヘルプ";
export const COMMUNITY_HEADER = "コミュニティ";
export const COMMUNITY_MEMBERSHIP_LIST_HEADER = "メンバーシップ";
export const COMMUNITY_REPORTS_HEADER = "報告された投稿";
export const COMMUNITY_REPORTS_SUBHEADER =
    "コミュニティで報告された投稿を確認・管理します";
export const COMMUNITY_MEMBERSHIP_LIST_SUBHEADER =
    "コミュニティのメンバーシップを確認・管理します";
export const SITE_SETTINGS_SECTION_COMMUNITIES = "コミュニティ";
export const NEW_COMMUNITY_BUTTON = "新しいコミュニティ";
export const COMMUNITY_FIELD_NAME = "コミュニティ名";
export const COMMUNITY_NEW_BTN_CAPTION = "作成";
export const COMMUNITY_SETTINGS = "管理";

// Payment Plan strings
export const NEW_PAYMENT_PLAN_HEADER = "新しい料金プラン";
export const EDIT_PAYMENT_PLAN_HEADER = "料金プランを編集";
export const PAYMENT_PLANS_HEADER = "料金プラン";
export const NEW_PAYMENT_PLAN_DESCRIPTION =
    "新しい料金プランを設定します：";
export const EDIT_PAYMENT_PLAN_DESCRIPTION = "設定を更新します：";
export const TOAST_TITLE_SUCCESS = "成功";
export const TOAST_SEQUENCE_SAVED = "ステップ配信の変更を保存しました";
export const TOAST_QUIZ_PASS_MESSAGE = "合格 🎉";
export const TOAST_QUIZ_FAIL_MESSAGE = "不合格";
export const TOAST_TITLE_ERROR = "エラー";
export const TOAST_DESCRIPTION_CHANGES_SAVED = "変更を保存しました";
export const DELETED_COMMENT_PLACEHOLDER = "削除済み";
export const SETTINGS_RESOURCE_PAYMENT = "決済を設定";
export const SETTINGS_RESOURCE_API = "APIドキュメント";
export const EDIT_CONTENT_MENU_ITEM = "コンテンツを編集";
export const PRODUCT_UNPUBLISHED_WARNING =
    "この講座・商品は非公開です。受講者には表示されません。";
export const SEQUENCE_UNPUBLISHED_WARNING =
    "このステップ配信は停止中です。配信するには開始してください。";
export const PRODUCT_EMPTY_WARNING =
    "コンテンツがまだありません。レッスンやファイルを追加してください。";
export const BLOG_UPDATED_PREFIX = "更新日";
export const HEADER_HELP = "ヘルプ";
export const CHECKOUT_PAGE_ORDER_SUMMARY = "注文内容";
export const TEXT_EDITOR_PLACEHOLDER = "ここに入力…";
export const BTN_VIEW_CERTIFICATE = "修了証を見る";
export const GET_SET_UP = "初期設定";
export const MANAGE_LINK_TEXT = "管理";
export const BLOG_LIST_EMPTY_TITLE = "記事はありません";
export const BLOG_LIST_EMPTY_DESCRIPTION_PUBLIC =
    "まだ公開されている記事はありません。";
export const BLOG_LIST_EMPTY_DESCRIPTION_PRIVATE =
    "まだ記事を公開していません。";
export const PRODUCTS_LIST_EMPTY_TITLE = "講座・商品はありません";
export const PRODUCTS_LIST_EMPTY_DESCRIPTION_PUBLIC =
    "まだ公開されている講座・商品はありません。";
export const PRODUCTS_LIST_EMPTY_DESCRIPTION_PRIVATE =
    "まだ講座・商品を追加していません。";
export const LOGIN_CODE_SENT_MESSAGE =
    "メールに認証コードを送信しました。";
export const LESSON_EMBED_URL_LABEL = "埋め込みコード";
export const LESSON_CONTENT_LABEL = "内容";
export const EMAIL_EDITOR_EMAIL_EDIT_HEADER = "メールを編集中";
export const EMAIL_EDITOR_TEMPLATE_EDIT_HEADER = "テンプレートを編集中";
export const LOGIN_FORM_PERSONAL_INFORMATION_LABEL = "個人情報";
