/**
 * This file provides strings used app wide.
 */
import { UIConstants } from "@courselit/common-models";

export const responses = {
    error: "エラー",
    domain_missing: "スクールの設定が見つかりません",
    domain_doesnt_exist: "スクールが見つかりません",
    domain_super_admin_email_missing: "管理者メールの設定がありません",
    not_valid_subscription: "有効な利用プランがありません",
    sign_in_mail_prefix: "ログイン認証コード：",
    sign_in_mail_body: "次のリンクからログインしてください。",
    sign_in_link_text: "ログイン",

    // graphql responses
    past_date: "過去の日時は指定できません",
    invalid_permission: "権限の設定を確認してください",
    user_not_found: "ユーザーが見つかりません。",
    request_not_authenticated: "ログインしてください",
    content_cannot_be_null: "内容を入力してください",
    media_id_cannot_be_null: "画像・ファイルを選択してください",
    item_not_found: "項目が見つかりません",
    drip_not_released: "この章はまだ公開されていません",
    not_a_creator: "この操作を行う権限がありません",
    course_not_empty: "講座を削除する前に、すべてのレッスンを削除してください",
    invalid_offset: "取得位置の指定を確認してください",
    is_not_admin: "この操作を行う権限がありません",
    is_not_admin_or_creator: "この操作を行う権限がありません",
    blog_description_empty: "説明を入力してください",
    cannot_convert_to_blog: "レッスンがある講座はブログ記事に変更できません",
    cost_not_provided: "金額を入力してください",
    invalid_cost: "金額を確認してください",
    cannot_add_to_blogs: "ブログ記事にはレッスンを追加できません",
    file_is_required: "ファイルを選択してください",
    error_in_moving_file: "ファイルを移動できませんでした",
    success: "success",
    user_name_cant_be_null: "名前を入力してください",
    action_not_allowed: "この操作を行う権限がありません",
    invalid_input: "入力内容を確認してください",
    payment_invalid_settings: "決済の設定を確認してください",
    payment_info_required: "有料プランを作る前に決済サービスを設定してください",
    unrecognised_currency_code: "通貨コードを確認してください",
    only_admins_can_purchase: "代理購入は管理者のみ行えます",
    course_already_purchased: "この講座・商品は購入済みです",
    payment_settings_invalid_suffix: "設定内容を確認してください",
    invalid_course_id: "講座IDを確認してください",
    invalid_user_id: "ユーザーIDを確認してください",
    payment_settings_invalid:
        "決済サービスが未設定です。運営者へお問い合わせください。",
    not_enrolled: "この講座は受講登録されていません",
    currency_iso_not_set: "通貨が未設定です。運営者へお問い合わせください。",
    payment_method_not_saved:
        "シークレットキーを設定する前に決済サービスを選択してください",
    invalid_payment_method: "決済サービスを確認してください",
    invalid_theme: "テーマの設定を確認してください",
    theme_not_installed: "このテーマはインストールされていません",
    invalid_layout: "ページの配置を確認してください",
    missing_mandatory_blocks: "必要なブロックがありません",
    destination_dont_exist: "移動先が見つかりません",
    page_exists: "このURLのページはすでにあります",
    invalid_format: "形式を確認してください",
    no_thumbnail: "サムネイルがありません",
    file_size_exceeded: "ファイルサイズが上限を超えています",
    name_is_required: "名前を入力してください",
    mimetype_is_required: "ファイルの種類を指定してください",
    existing_group: "同じ名前の章があります",
    group_not_empty:
        "この章にはレッスンがあります。先にレッスンを削除してください",
    group_not_found: "章が見つかりません",
    update_payment_method:
        "有料コンテンツを作るには決済サービスを設定してください。",
    currency_iso_code_required:
        "通貨コードを入力してください（例：jpy、usd）。",
    currency_unit_required: "通貨記号を入力してください（例：¥、$）。",
    school_title_not_set: "決済情報の設定前にスクール名を入力してください。",
    internal_error: "エラーが発生しました。もう一度お試しください。",
    presigned_url_failed:
        "処理できませんでした。前の画面に戻ってお試しください。",
    file_uploaded: "アップロードしました。前の画面でファイルを確認できます。",
    media_deleted: "ファイルを削除しました。前の画面で確認できます。",
    invalid_access_type: "公開または非公開を指定してください。",
    answers_missing: "回答を入力してください。",
    cannot_be_evaluated: "このレッスンは採点できません。",
    need_to_pass: "完了にするには、このテストに合格してください。",
    no_correct_answer: "各質問に少なくとも1つの正解を設定してください。",
    no_empty_option: "すべての選択肢に文章を入力してください。",
    medialit_apikey_notfound:
        "ファイルを保存するにはMediaLitを設定してください。",
    mail_already_sent: "このメールは送信済みです",
    mail_subject_length_exceeded: `件名は${UIConstants.MAIL_SUBJECT_MAX_LENGTH}文字以内にしてください`,
    mail_max_recipients_exceeded: `送信先は${UIConstants.MAIL_MAX_RECIPIENTS}件以内にしてください`,
    invalid_mail: "宛先・件名・本文を入力してください",
    email_delivery_failed_for_all_recipients:
        "すべての宛先へのメール送信に失敗しました",
    courses_cannot_be_downloaded:
        "講座はダウンロード商品として提供できません。",
    apikey_already_exists: "同じ名前のAPIキーがあります",
    email_template_already_exists: "同じ名前のテンプレートがあります",
    sequence_details_missing: "次の設定がありません",
    invalid_emails_order: "メールの順序を確認してください",
    no_published_emails: "公開されたメールがありません",
    sequence_not_active: "配信シナリオは停止中です",
    sequence_already_started: "配信シナリオは開始済みです",
    mailing_address_too_short: "住所を確認してください",
    mandatory_tags_missing: "必要なタグがありません",
    cannot_delete_last_email: "シナリオ内の最後のメールは削除できません",
    invalid_drip_email: "ステップメールに件名と本文を入力してください",
    cannot_invite_to_unpublished_product:
        "非公開の講座・商品には招待できません",
    rejection_reason_missing: "却下の理由を入力してください",
    joining_reason_missing: "参加理由を入力してください",
    invalid_category: "カテゴリーを確認してください",
    community_exists: "同じ名前のコミュニティがあります",
    payment_plan_required: "先に料金プランを追加してください",
    community_requires_payment: "このコミュニティにはお支払いが必要です",
    community_has_no_payment_plans: "コミュニティに料金プランがありません",
    duplicate_payment_plan: "同じ種類の料金プランがあります",
    default_payment_plan_cannot_be_archived: "標準プランはアーカイブできません",
    default_payment_plan_required:
        "コミュニティを有効にする前に標準プランを設定してください",
    community_content_already_reported: "この内容は通報済みです",
    profile_incomplete: "操作を続けるにはプロフィールを入力してください",
    cannot_reject_member_with_active_subscription:
        "有効な継続課金があるメンバーは却下できません",
    cannot_leave_community_last_moderator:
        "最後の管理者はコミュニティを退会できません",
    cannot_delete_last_permission_user:
        "必要な権限を持つ最後のユーザーは削除できません：",
    cannot_change_role_inactive_member:
        "利用中でないメンバーの役割は変更できません",
    cannot_change_role_last_moderator: "最後の管理者の役割は変更できません",
    cannot_delete_last_category: "最後のカテゴリーは削除できません",
    lead_magnet_invalid_settings:
        "メール登録で無料提供するには、無料プランを1件だけ設定してください",
    certificate_invalid_settings: "修了証は講座でのみ利用できます",
    sso_provider_already_exists: "同じIDのSSO設定があります",
    quiz_cannot_be_previewed: "クイズは試し読みできません",

    // api responses
    digital_download_no_files:
        "ダウンロードファイルがありません。運営者へお問い合わせください。",
    download_link_expired: "ダウンロードリンクの有効期限が切れています",
    user_already_exists: "このユーザーは登録済みです",
    unsubscribe_success:
        "メール配信を停止しました。これまでご利用いただきありがとうございました。",
    download_course_cannot_have_groups:
        "ダウンロード商品には章を追加できません",
    download_course_last_group_cannot_be_removed:
        "ダウンロード商品の最後の章は削除できません",
    certificate_demo_course_id_required: "修了証の見本には講座IDが必要です",
    provider_not_configured: "有効にする前に認証サービスを設定してください",
    provider_invalid_configuration: "認証サービスの設定を確認してください",
    page_id_already_exists:
        "このURL名は使用中です。別の名前を指定してください。",
};

export const internal = {
    error_unrecognised_payment_method: "決済サービスを確認してください",
    error_payment_method_not_implemented: "現在は利用できません",
    error_db_connection_failed: "データベースへ接続できません。",
    error_env_var_undefined: "必要なサーバー設定がありません",
    app_running: "CourseLit server is running on",
    invalid_cloud_storage_settings: "ファイル保存先の設定を確認してください",
    domain_not_specified: "スクールが指定されていません",
    default_group_name: "最初の章",
    default_email_broadcast_subject: "名前未設定の一斉配信",
    default_email_sequence_subject: "最初のメール",
    default_email_sequence_name: "名前未設定の配信シナリオ",
    joining_reason_creator: "作成者として参加",
};

export const learnerCardStrings = {
    course: "講座",
    download: "ダウンロード教材",
    certificate: "修了証",
    progress: "{total}レッスン中、{completed}レッスンを完了",
};

export const checkoutStrings = {
    title: "購入手続き",
    selectPlan: "プランを選択",
    completePurchase: "購入を完了する",
    freeEnrollment: "無料で受講する",
    freeCheckoutTitle: "無料講座の申込",
    startLearning: "学習を始める",
    resumeLearning: "続きから学ぶ",
    reviewLearning: "もう一度見る",
    nextVisit: "次回は受講一覧から、続きのレッスンを開けます。",
    loginExplanation:
        "初めての方はメール認証で受講用アカウントが作成されます。ログイン済みの方は、そのままお申し込みいただけます。",
    verifyError:
        "購入状況を確認できませんでした。時間をおいて再確認してください。",
    enrollmentMailSubject: "受講のご案内：",
    enrollmentMailHeading: "受講の準備ができました",
    enrollmentMailBody:
        "お申し込みありがとうございます。下のボタンから学習を始められます。",
    enrollmentMailLogin:
        "ログインが必要な場合は、お申し込みに使ったメールアドレスで認証してください。",
    working: "処理中…",
    email: "メールアドレス：",
    name: "名前：",
    total: "合計",
    oneTime: "一括払い",
    recommended: "おすすめ",
    continue: "認証コードを送信",
    enterCode: "認証コードを入力",
    verifyCode: "コードを確認",
    terms: "利用規約",
    invalidEmail: "メールアドレスを確認してください",
    invalidCode: "認証コードは6桁で入力してください",
    invalidOtp:
        "認証コードが正しくないか、有効期限が切れています。新しいコードを取得してください。",
    freePlan: "無料プラン",
    unavailable: "該当なし",
    showSummary: "注文内容を表示",
    hideSummary: "注文内容を閉じる",
    toggleSummary: "注文内容を切り替える",
    alreadyOwned: "購入済み",
    accessDenied: "利用できません",
    alreadyHasAccess: "このコンテンツはすでに利用できます。",
    rejected: "利用が許可されていないため、購入手続きを進められません。",
    openResource: "コンテンツを開く",
    joiningReason: "参加理由",
    joiningReasonPlaceholder: "参加理由を入力してください",
    thanksPurchase: "ご購入ありがとうございます",
    thanksOrder: "ご注文を確認しています",
    orderNumber: "注文番号：",
    paymentVerified: "お支払いを確認しました",
    learningReady: "受講の準備ができました。下のボタンから学習を始められます。",
    dashboard: "受講一覧へ",
    checkAgain: "決済状況を再確認",
    paymentPending: "お支払いを確認中です",
    verifying: "決済を確認しています…",
    wait: "しばらくお待ちください",
    paymentFailed: "お支払いを確認できませんでした",
    notEnrolled: "この講座はまだ購入・受講登録されていません。",
    codeMail: "がログイン用の認証コードです。",
    codeMailImportant: "ご注意：",
    codeMailWarning:
        "このコードを他の人に教えないでください。コードを知っている人は、あなたのアカウントにログインできます。",
    oneTimeDescription: (amount: string) => `一括払い：${amount}`,
    annualDescription: (amount: string) => `年額：${amount}`,
    monthlyDescription: (amount: string) => `月額：${amount}`,
    installmentDescription: (amount: string, months?: number) =>
        `月額${amount} × ${months}回`,
    includedProducts: (count: number) => `${count}件のコンテンツを含む`,
    period: (period: string) =>
        period === "/yr" ? "/年" : period === "/mo" ? "/月" : period,
};

export const colorPresetStrings = {
    title: "Astroの配色（15種類）",
    description:
        "色見本を押すと、公開サイト全体の配色を保存・適用します。文字サイズ・行間・ページ内容は保ちます。",
    applying: "配色を保存・適用しています…",
    applied: "配色を適用しました",
    active: "適用中",
    error: "配色を適用できませんでした。公開画面を確認し、もう一度お試しください。",
    restore: "直前の配色に戻す",
    restored: "直前の配色に戻しました",
    systemThemes: "標準テーマ",
    customThemes: "カスタムテーマ",
    emptyCustomThemes: "カスタムテーマはまだありません",
    names: {
        navy: "ネイビー（紺）",
        rose: "ローズ（薔薇）",
        pink: "ピンク（キュート）",
        forest: "フォレスト（深緑）",
        terracotta: "テラコッタ（橙茶）",
        plum: "プラム（紫）",
        charcoal: "チャコール（墨）",
        sky: "スカイ（シアン）",
        sunny: "サニー（イエロー）",
        greige: "グレージュ（白基調）",
        luxe: "リュクス（深緑×金）",
        champagne: "シャンパン（ボルドー×金）",
        slate: "スレート（墨×金）",
        azure: "アジュール（紺×金）",
        amethyst: "アメジスト（紫×金）",
    },
} as const;

/** Japanese display labels. Identifiers and stored values remain unchanged. */
export const finalUiText = {
    Free: "無料",
    "% from previous period": "%（前期間比）",
    "&apos;s Progress": "さんの学習進捗",
    "&quot; before deleting.": "。",
    "&quot;? This action cannot be undone.": "。この操作は取り消せません。",
    ". CourseLit supports": "。対応する決済サービス：",
    "2X Large": "特大2",
    "2x Extra Large (6xl)": "特大2（6xl）",
    "3X Large": "特大3",
    "4X Large": "特大4",
    "5X Large": "特大5",
    "6X Large": "特大6",
    "7X Large": "特大7",
    "8X Large": "特大8",
    "9X Large": "特大9",
    "A link to unsubscribe from the marketing emails": "配信解除のリンク",
    "API keys": "APIキー",
    "Accent Colors": "アクセントカラー",
    Accepted: "承認済み",
    Actions: "操作",
    Active: "有効",
    "Add Category": "カテゴリを追加",
    "Add GIF": "GIF画像を追加",
    "Add Product": "講座・商品を追加",
    "Add Section": "章を追加",
    "Add Video": "動画を追加",
    "Add a comment...": "コメントを入力…",
    "Add a new section to your course": "講座に新しい章を追加します",
    "Add and manage community categories": "コミュニティのカテゴリを管理します",
    "Add content to a product": "講座・商品にレッスンを追加する",
    "Add reaction": "リアクションを追加",
    "Add team": "チームを追加",
    "Add video": "動画を追加",
    "Add widget below": "下にブロックを追加",
    "Add your own payment gateway and keep 100% of what you make.":
        "自分の決済サービスを接続して販売を始めましょう。",
    Advanced: "詳細設定",
    All: "すべて",
    "All products already added": "すべての講座・商品を追加済みです",
    "Allow students to preview this lesson":
        "このレッスンを受講前に閲覧できるようにする",
    "Allow students to preview this lesson without enrolling":
        "受講登録前でもこのレッスンを試し読みできます",
    "Allow users to join your community":
        "ユーザーがコミュニティに参加できるようにする",
    "Amount cannot be negative": "金額は0以上で入力してください",
    "An unexpected error occurred. Please try again.":
        "エラーが発生しました。もう一度お試しください。",
    "Analytics Not Available": "集計データがありません",
    "Analytics will be available once the": "集計は、",
    Archive: "アーカイブ",
    "Archive plan": "プランをアーカイブ",
    "Are you absolutely sure?": "本当に実行しますか？",
    "Are you sure you want to archive this plan?":
        "このプランをアーカイブしますか？",
    "Are you sure you want to delete the": "次の項目を削除しますか：",
    "Are you sure you want to delete the segment &quot;":
        "次のセグメントを削除します：",
    "Are you sure you want to delete this comment? This action cannot be undone.":
        "コメントを削除します。この操作は取り消せません。",
    "Are you sure you want to delete this lesson?":
        "このレッスンを削除しますか？",
    "Are you sure you want to delete this post?": "この投稿を削除しますか？",
    "Are you sure you want to delete this post? This action cannot be undone.":
        "投稿を削除します。この操作は取り消せません。",
    "Are you sure you want to leave this community?":
        "このコミュニティから退会しますか？",
    "Are you sure you want to schedule this email to":
        "このメールの配信を予約します。対象：",
    "Are you sure you want to send this email to":
        "このメールを送信します。対象：",
    "Ask in Discord": "Discordで質問する",
    "Attach files": "ファイルを添付",
    Audio: "音声",
    "Auto accept members": "参加を自動承認",
    "Automatically accept new members": "新しい参加者を自動で承認します",
    Back: "戻る",
    Base: "基本",
    "Base Colors": "基本色",
    "Basic Information": "基本情報",
    "Before you start!": "配信を始める前に",
    Black: "極太",
    Blog: "ブログ",
    Blogs: "ブログ",
    Bold: "太字",
    Border: "枠線",
    "Border & Input Colors": "枠線・入力欄の配色",
    "Border Radius": "角の丸み",
    "Border Style": "枠線の種類",
    "Border Width": "枠線の太さ",
    Broadcasts: "一斉配信",
    Cancel: "キャンセル",
    Capitalize: "単語の先頭を大文字",
    Caption: "補足文字",
    "Card Colors": "カードの配色",
    "Card Title": "カードのタイトル",
    "Card content goes here": "カードの本文が入ります",
    Categories: "カテゴリ",
    "Category Added": "カテゴリを追加しました",
    "Category Deleted": "カテゴリを削除しました",
    Center: "中央",
    Certificate: "修了証",
    "Certificate Description": "修了証の説明",
    "Certificate Subtitle": "修了証の副題",
    "Certificate Template": "修了証のテンプレート",
    "Certificate Title": "修了証のタイトル",
    "Certificate is required": "修了証を選択してください",
    "Certificate of Completion": "修了証",
    Certificates: "修了証",
    Change: "変更",
    "Change role": "権限を変更",
    "Change status": "状態を変更",
    "Change the school name to make it yours. Optionally, add a logo to make it recognizable.":
        "スクールの名前を変更します。ロゴも追加できます。",
    "Changes are saved": "保存しました",
    "Chart Colors": "グラフの配色",
    "Clear SSO config?": "SSO設定を解除しますか？",
    "Click Rate": "クリック率",
    "Click to update": "クリックして編集",
    "Client ID is required": "クライアントIDを入力してください",
    Close: "閉じる",
    Code: "認証コード",
    Colors: "配色",
    "Come ask your questions directly from the team. We are quite active there.":
        "公式チームへ直接質問できます。",
    "Coming soon": "準備中",
    Communities: "コミュニティ",
    "Community Enabled": "コミュニティを有効にする",
    "Community has been deleted successfully": "コミュニティを削除しました",
    "Community joined": "コミュニティに参加",
    "Community left": "コミュニティから退会",
    "Community name": "コミュニティ名",
    "Complete your": "次の設定を完了してください：",
    Completed: "完了",
    "Completed by": "修了者",
    "Configuration to be entered in your IDP (Okta, Azure AD, OneLogin etc.)":
        "認証サービス（Okta、Azure AD、OneLoginなど）へ入力する設定",
    "Configure the basic details of your payment plan":
        "料金プランの基本情報を設定します",
    Confirm: "確定",
    "Confirm Deletion": "削除を確認",
    "Confirm Rejection": "却下を確定",
    Content: "レッスン内容",
    "Content Release": "公開タイミング",
    "Content has been reported": "この内容は通報されています",
    "Continue setup": "設定を続ける",
    "Control when this section becomes available to students":
        "受講者がこの章を開けるタイミングを設定します",
    "Copy Subscription ID": "購読IDをコピー",
    "Course Instructor": "講師",
    "CourseLit Support": "CourseLitサポート",
    Create: "作成・管理",
    "Create a community": "コミュニティを作成",
    "Create a course": "講座を作成",
    "Create a course and publish it to make it live.":
        "講座を作成して公開します。",
    "Create a digital download": "ダウンロード商品を作成",
    "Create your first product": "最初の講座・商品を作成する",
    Custom: "カスタム",
    "Custom classes": "カスタムCSSクラス",
    Customers: "受講者・購入者",
    "Customize the content and branding for issued certificates":
        "発行する修了証の内容とデザインを設定します",
    "Customize your school": "スクールを設定する",
    Dashed: "破線",
    "Date of Completion": "修了日",
    "Days after previous section": "前の章の公開からの日数",
    Default: "標準",
    Delete: "削除",
    "Delete Category": "カテゴリを削除",
    "Delete Community": "コミュニティを削除",
    "Delete Section": "章を削除",
    "Delete Segment": "セグメントを削除",
    "Delete block": "ブロックを削除",
    "Delete comment": "コメントを削除",
    "Delete post": "投稿を削除",
    "Delete the first rich text block which says, 'This is the default page created for you by CourseLit'.":
        "先頭の初期案内ブロックを編集して、スクールの紹介に変更しましょう。",
    "Deleting...": "削除中…",
    "Demo Input": "入力欄の見本",
    "Demo Link": "リンク見本",
    Description: "説明",
    "Destructive Colors": "削除・警告の配色",
    Documentation: "使い方の資料",
    Done: "完了",
    Dotted: "点線",
    Double: "二重線",
    Download: "ダウンロード",
    Downloaded: "ダウンロード済み",
    Downloads: "ダウンロード",
    Draft: "下書き",
    "Drip content": "順次公開",
    Edit: "編集",
    "Edit Email": "メールを編集",
    "Edit banner": "バナーを編集",
    "Edit page": "ページを編集",
    "Edit your homepage": "トップページを編集する",
    Email: "メールアドレス",
    "Email Notification": "メール通知",
    "Email Performance": "配信結果",
    "Email Preview": "メールのプレビュー",
    "Email address": "メールアドレス",
    Emails: "メール",
    "Emails Sent": "送信済みメール",
    Embed: "埋め込み",
    "Enable certificate for this course.": "この講座の修了証を有効にします。",
    Enabled: "有効",
    Enter: "開始する",
    "Enter Rejection Reason": "却下の理由を入力",
    "Enter Tailwind classes": "Tailwindクラスを入力",
    "Enter amount": "金額を入力",
    "Enter category name": "カテゴリ名を入力",
    "Enter lesson title": "レッスン名を入力",
    "Enter monthly amount": "月額を入力",
    "Enter number": "数値を入力",
    "Enter plan description": "プランの説明を入力",
    "Enter section name": "章の名前を入力",
    "Enter yearly amount": "年額を入力",
    "Enter your email": "メールアドレスを入力",
    "Entry Point is required": "認証先URLを入力してください",
    Error: "エラー",
    "Error in": "エラー：",
    "Error:": "エラー：",
    Exit: "編集を終了",
    "Extra Bold": "非常に太い",
    "Extra Heavy": "最も太い",
    "Extra Large": "特大",
    "Extra Large (5xl)": "特大（5xl）",
    "Extra Light": "非常に細い",
    "Extra Small": "最小",
    "Failed to delete post": "投稿を削除できませんでした",
    "Failed to load sequence:": "ステップ配信を読み込めませんでした：",
    "Failed to load template:": "テンプレートを読み込めませんでした：",
    "Failed to mark all as read": "すべて既読にできませんでした",
    "Failed to open the notification": "通知を開けませんでした",
    "Featured image": "メイン画像",
    File: "ファイル",
    "Filter by status": "状態で絞り込む",
    "Font Family": "フォント",
    "Font Size": "文字サイズ",
    "Font Weight": "文字の太さ",
    "Found a bug?": "不具合を見つけたとき",
    Full: "全幅",
    "Go to first page": "最初のページへ",
    "Go to next page": "次のページへ",
    "Go to previous page": "前のページへ",
    "Go to settings": "設定へ",
    "Graded Quiz": "採点する確認テスト",
    Heavy: "極太",
    Hidden: "非表示",
    "Horizontal Padding": "左右の余白",
    "I&apos;ll do it on my own": "自分で設定する",
    "IDP Metadata is required": "認証サービスのメタデータを入力してください",
    "If you need a helping hand, we are out there for you.":
        "お困りのときは、公式のサポート窓口をご利用ください。",
    "In case you need to get in touch with the team to get help faster, we offer":
        "公式チームによる優先サポートは",
    "Included Products": "含まれる講座・商品",
    "Incomplete Profile": "プロフィールが未設定です",
    "Installments cannot be negative": "支払回数は0以上で入力してください",
    "Instructor Name": "講師名",
    Interactives: "ボタン・リンク",
    "Issue certificates": "修了証を発行する",
    "Item not found": "項目が見つかりません",
    Join: "参加する",
    "Joining Reason": "参加理由",
    "Joining reason text": "参加理由の案内文",
    Justify: "両端揃え",
    Large: "大",
    "Large (4xl)": "大（4xl）",
    "Last Active": "最終利用",
    "Last updated": "最終更新",
    "Lead Magnet": "メール登録で無料提供",
    "Learn more": "詳しく見る",
    "Leave Community": "コミュニティから退会",
    Left: "左",
    Less: "閉じる",
    Lesson: "レッスン",
    "Lesson Type": "レッスンの種類",
    "Lesson updated": "レッスンを更新しました",
    "Let&apos;s finish setting up your school!":
        "スクールの設定を仕上げましょう",
    "Letter Spacing": "文字間隔",
    Light: "細い",
    "Line Height": "行間",
    "Loading GIFs...": "GIF画像を読み込み中…",
    "Loading email editor...": "メール編集画面を読み込み中…",
    "Loading products...": "講座・商品を読み込み中…",
    "Loading template editor...": "テンプレート編集画面を読み込み中…",
    "Loading...": "読み込み中…",
    Logo: "ロゴ",
    Loose: "広い",
    Lowercase: "小文字",
    "Make recommended": "おすすめに設定",
    "Make this course available to students":
        "受講者がこの講座を利用できるようにします",
    Manage: "講座・商品の設定",
    "Manage your community pricing plans":
        "コミュニティの料金プランを設定します",
    "Manage your community settings.": "コミュニティの設定を変更します。",
    "Manage your product settings": "講座・商品の設定を変更します",
    "Manage your product&apos;s pricing plans":
        "講座・商品の料金プランを設定します",
    Media: "画像・動画",
    Medium: "中間",
    "Medium (3xl)": "中（3xl）",
    Members: "メンバー",
    Membership: "参加状況",
    "Membership Pending": "参加申請を確認中",
    "Membership Rejected": "参加申請は却下されました",
    Memberships: "参加者",
    Monthly: "毎月",
    "Monthly Amount": "月額",
    "Monthly Payments (All fields required)": "分割払い（すべての項目が必須）",
    More: "その他",
    "More pages": "他のページ",
    "More...": "続きを見る",
    "Move down": "下へ移動",
    "Move up": "上へ移動",
    "Muted Colors": "控えめな配色",
    Name: "名前",
    "Name is required": "名前を入力してください",
    "New Plan": "プランを追加",
    "New community members": "新しいコミュニティ参加者",
    "New mail": "メールを作成",
    Next: "次へ",
    "No API keys found": "APIキーがありません",
    "No Communities Found": "コミュニティはまだありません",
    "No analytics data available for this sequence.":
        "このステップ配信の集計データはまだありません。",
    "No content to display": "表示する内容はありません",
    "No new notifications": "新しい通知はありません",
    "No pages found": "ページがありません",
    "No posts found.": "投稿はまだありません。",
    "No products available": "選択できる講座・商品がありません",
    "No theme selected": "テーマを選択してください",
    "No transaction fees": "CourseLitの取引手数料はありません",
    Normal: "標準",
    "Not Allowed": "許可されていません",
    "Not Found": "見つかりませんでした",
    Notifications: "通知",
    "Notify students when content becomes available":
        "内容が公開されたら受講者へ通知します",
    "One-time Amount": "一括払いの金額",
    "Only accessible via direct link":
        "URLを知っている人だけがアクセスできます",
    "Open Discord": "Discordを開く",
    "Open Rate": "開封率",
    "Our documentation contains tutorials on how to do everything in CourseLit.":
        "公式の資料で、CourseLitの使い方を確認できます。",
    "Our response:": "確認結果：",
    Padding: "内側の余白",
    "Padding X": "左右の余白",
    "Padding Y": "上下の余白",
    Page: "ページ",
    "Page URL copied to clipboard!": "ページのURLをコピーしました",
    "Page Width": "ページ幅",
    "Page not found": "ページが見つかりません",
    Pages: "ページ",
    Pause: "一時停止",
    "Payment frequency": "支払回数・間隔",
    Pending: "確認待ち",
    "People who completed the course": "講座を修了した人数",
    "Percentage of email openers who clicked a link":
        "開封した人のうちリンクをクリックした割合",
    "Percentage of recipients who clicked a link in the email":
        "受信した人のうちリンクをクリックした割合",
    "Percentage of recipients who opened the email":
        "受信した人のうちメールを開封した割合",
    "Permission Required": "権限が必要です",
    "Pin post": "投稿を固定",
    "Please enter a valid email address":
        "有効なメールアドレスを入力してください",
    "Please fill in all required fields for the selected plan type":
        "選択した支払方法の必須項目をすべて入力してください",
    "Please fill in the form to request access to the mailing feature. We need to review your use case so as to keep our services clean.":
        "メール配信の利用申請に必要な情報を入力してください。サービスの適切な利用のため、用途を確認します。",
    "Please provide a reason for rejecting this membership request.":
        "参加申請を却下する理由を入力してください。",
    "Please provide a reason for rejecting this report. This is optional but recommended.":
        "通報を却下する理由を入力してください（任意）。",
    "Please provide a reason for reporting this comment.":
        "コメントを通報する理由を入力してください。",
    "Please provide a reason for reporting this post.":
        "投稿を通報する理由を入力してください。",
    "Please save the changes first to enable email editing":
        "メールを編集するには、先に変更を保存してください",
    "Please select a ZIP file": "ZIPファイルを選択してください",
    "Please select a category to migrate the posts from &quot;":
        "削除前に投稿の移動先カテゴリを選択してください：",
    "Please select a plan": "プランを選択してください",
    "Popover Colors": "ポップアップの配色",
    "Post Comment": "コメントを投稿",
    "Post an issue": "Issueを作成",
    "Post has been reported": "この投稿は通報されています",
    "Post media": "投稿の画像・動画",
    "Post not found": "記事が見つかりません",
    "Posting...": "投稿中…",
    "Powered by": "Powered by",
    Preview: "プレビュー",
    Previous: "前へ",
    Pricing: "料金プラン",
    "Primary Colors": "メインカラー",
    Print: "印刷",
    "Priority Support": "優先サポート",
    "Processing SCORM package...": "SCORM教材を処理中…",
    "Product URL copied to clipboard!": "講座・商品のURLをコピーしました",
    "Product must have exactly one free payment plan to enable lead magnet":
        "メール登録で無料提供するには、無料プランを1件だけ設定してください",
    "Product purchased": "商品を購入",
    Products: "講座・商品",
    Progress: "進捗",
    Public: "一般公開",
    Published: "公開中",
    "Queue configuration is missing. Realtime notifications will not work.":
        "通知処理が未設定のため、リアルタイム通知は利用できません。",
    Quiz: "クイズ",
    "Read all": "すべて既読にする",
    Reason: "理由",
    "Reason for reporting...": "通報の理由を入力…",
    "Reason to join": "参加理由",
    "Reason:": "理由：",
    "Reject Membership Request": "参加申請を却下",
    Rejected: "却下",
    "Rejection Reason": "却下の理由",
    "Rejection reason": "却下の理由",
    Relaxed: "やや広い",
    "Release Date & Time": "公開日時",
    "Release Type": "公開方法",
    "Release content gradually to your students": "内容を順番に公開します",
    "Release days after previous section": "前の章の公開から指定日数後に公開",
    "Release on specific date": "指定日時に公開",
    Remove: "外す",
    "Replace Package": "教材ファイルを置き換える",
    Reply: "返信",
    Report: "通報",
    "Report Post": "投稿を通報",
    "Report comment": "コメントを通報",
    Reported: "通報済み",
    "Request access": "利用を申請",
    "Required at-least one of these:": "次の権限のいずれかが必要です：",
    "Resetting...": "リセット中…",
    Resources: "参考資料",
    Restricted: "制限中",
    "Review and manage reported discussion content":
        "通報された質問・コメントを確認・管理します",
    Right: "右",
    Role: "権限",
    "SCORM Package": "SCORM教材",
    "SCORM Package:": "SCORM教材：",
    "SCORM package uploaded successfully": "SCORM教材をアップロードしました",
    Sales: "売上",
    Save: "保存",
    "Save Changes": "変更を保存",
    "Save changes": "変更を保存",
    "Save the lesson first, then upload the SCORM package.":
        "先にレッスンを保存してからSCORM教材をアップロードしてください。",
    "Save the lesson to enable SCORM package upload":
        "SCORM教材をアップロードするにはレッスンを保存してください",
    Scheduled: "予約済み",
    "Scheduled Release": "日時指定の公開",
    "Scheduled for": "配信予定：",
    "School Settings": "スクール設定",
    Search: "検索",
    "Search GIFs": "GIF画像を検索",
    "Search by email": "メールアドレスで検索",
    "Search customers...": "受講者・購入者を検索…",
    "Secondary Colors": "サブカラー",
    "Section Name": "章の名前",
    "See documentation": "資料を見る",
    "Select a category": "カテゴリを選択",
    "Select a plan type": "プランの種類を選択",
    "Select a product to add": "追加する講座・商品を選択",
    "Select font family": "フォントを選択",
    "Select line height": "行間を選択",
    "Select padding": "余白を選択",
    "Select page": "ページを選択",
    "Select radius": "丸みを選択",
    "Select release type": "公開方法を選択",
    "Select shadow": "影を選択",
    "Select size": "サイズを選択",
    "Select spacing": "間隔を選択",
    "Select style": "種類を選択",
    "Select subscription type": "支払方法を選択",
    "Select time range": "期間を選択",
    "Select transform": "文字変換を選択",
    "Select weight": "太さを選択",
    "Select width": "幅を選択",
    "Selected Products": "選択中の講座・商品",
    "Semi Bold": "やや太い",
    "Send the product to user for free in exchange of their email address":
        "メールアドレスを登録した方に、この講座・商品を無料で提供します",
    Sent: "送信済み",
    "Set CACHE_DIR env var to enable SCORM":
        "SCORMを利用するにはサーバーのCACHE_DIR設定が必要です",
    "Set the pricing structure for your payment plan":
        "料金と支払方法を設定します",
    "Set the title of the lesson to enable media upload":
        "画像・ファイルをアップロードするには、先にレッスン名を入力してください",
    "Set up Google sign in": "Googleログインを設定",
    "Set up payment": "決済を設定する",
    "Set your mailing address": "送信者の住所を設定",
    Settings: "設定",
    "Setup SSO": "SSOを設定",
    Shadow: "影",
    "Shadow Styles": "影の種類",
    "Share important updates, announcements, or news with your community members here.":
        "コミュニティの参加者へお知らせを投稿します。",
    "Share product": "講座・商品を共有",
    "Sidebar Colors": "サイドバーの配色",
    Signature: "署名",
    "Signature Designation": "署名者の肩書き",
    "Signature Image": "署名画像",
    "Signature Name": "署名者名",
    "Signed Up": "登録日",
    Slug: "URL名",
    Small: "小",
    "Small (2xl)": "小（2xl）",
    Snug: "やや狭い",
    "Specify which products are included with this payment plan":
        "この料金プランで利用できる講座・商品を選択します",
    Start: "開始",
    Status: "状態",
    "Status:": "状態：",
    Structure: "幅・余白",
    Submit: "送信",
    Subscriber: "メール登録者",
    "Subscriber added": "メール登録者を追加",
    Subscribers: "メール登録者",
    "Subscribers (": "メール登録者（",
    Subscription: "継続課金",
    "Subscription ID is copied to clipboard": "購読IDをコピーしました",
    "Subscription Type": "支払方法",
    Success: "完了",
    "Sure?": "削除しますか？",
    "Tag name": "タグ名",
    Tags: "タグ",
    Teams: "チーム",
    "Tech stuff about CourseLit": "CourseLitの技術情報",
    "Template name is required": "テンプレート名を入力してください",
    Templates: "テンプレート",
    Terms: "利用規約",
    Text: "テキスト",
    "Text Shadow": "文字の影",
    "Text Transform": "大文字・小文字",
    "Text to show when users request to join a free community":
        "無料コミュニティへの参加申請時に表示する案内文",
    "The URL of the product": "講座・商品のURL",
    "The URL-friendly identifier for this community page.":
        "このコミュニティのページURLに使う名前です。",
    "The URL-friendly identifier for this product page.":
        "この講座・商品のページURLに使う名前です。",
    "The currency selected will not be applied during checkout. Set your desired currency in your LemonSqueezy dashboard.":
        "この通貨設定は決済に反映されません。LemonSqueezyの管理画面で通貨を設定してください。",
    "The delay in days after which the email will be sent after the last mail.":
        "前のメールを送ってから、次のメールを送るまでの日数です。",
    "The email of the subscriber": "メール登録者のメールアドレス",
    "The hero image for your community": "コミュニティのメイン画像",
    "The hero image for your course": "講座のメイン画像です",
    "The name of the subscriber": "メール登録者の名前",
    "The page does not exist.": "ページが見つかりません。",
    "The quick brown fox jumps over the lazy dog":
        "文字の大きさと行間を、この文章で確認できます。",
    "The team": "運営側では",
    "The title of the product": "講座・商品のタイトル",
    "There a few things you need to do in order to start sending marketing emails.":
        "メール配信を始める前に、いくつかの設定が必要です。",
    "These will be replaced with the actual data while sending emails.":
        "配信時に実際のデータへ置き換わります。",
    Thin: "極細",
    "This action cannot be undone. This will permanently archive the payment plan &quot;":
        "元に戻せません。この料金プランをアーカイブします：「",
    "This action cannot be undone. This will permanently delete the lesson":
        "元に戻せません。このレッスンを削除します：",
    "This action is irreversible. All community data will be permanently deleted.":
        "すべてのコミュニティデータが削除されます。この操作は取り消せません。",
    "This action is irreversible. All product data will be permanently deleted.":
        "元に戻せません。この講座・商品のすべてのデータが削除されます。",
    "This action is irreversible. All provider config will be wiped off.":
        "元に戻せません。認証サービスの設定がすべて削除されます。",
    "This action is irreversible. The current Google app configuration will be removed.":
        "元に戻せません。現在のGoogleアプリ設定が削除されます。",
    "This certificate is awarded to": "この修了証を授与します",
    "This community is not enabled. It is not visible to your audience (including moderators).":
        "このコミュニティは無効です。参加者や管理担当者には表示されません。",
    "This page is empty.": "このページにはまだ内容がありません。",
    "This section has scheduled release": "この章は公開日時が設定されています",
    Tight: "狭い",
    Tighter: "最も狭い",
    Title: "タイトル",
    To: "宛先",
    Toggle: "切り替える",
    "Toggle Sidebar": "メニューを開閉",
    "Total number of emails delivered to subscribers":
        "メール登録者へ届いたメールの総数",
    "Total number of people subscribed to this sequence":
        "このステップ配信に登録した人数",
    "Total:": "合計：",
    Type: "種類",
    "Type &quot;delete&quot; to confirm":
        "確認のため「delete」と入力してください",
    "Type 'delete' to confirm": "確認のため「delete」と入力してください",
    Typography: "文字の設定",
    "URL copied to clipboard": "URLをコピーしました",
    "Understanding product dashboard": "講座・商品の管理画面について",
    Unpublished: "非公開",
    Update: "更新",
    "Update section details": "章の設定を変更します",
    Upgrade: "プランを変更",
    "Upload Failed": "アップロードできませんでした",
    "Upload SCORM Package": "SCORM教材をアップロード",
    "Upload a SCORM 1.2 or 2004 package (ZIP file)":
        "SCORM 1.2または2004の教材（ZIPファイル）をアップロードします",
    "Upload a logo for the certificate (saves automatically)":
        "修了証のロゴをアップロードします（自動保存）",
    "Upload a signature image for the certificate (saves automatically)":
        "修了証の署名画像をアップロードします（自動保存）",
    Uploading: "アップロード中",
    "Uploading...": "アップロード中…",
    Uppercase: "大文字",
    "Use any supported Tailwind class here.":
        "対応するTailwindクラスを指定できます。",
    User: "ユーザー",
    Users: "ユーザー",
    Variables: "差し込み項目",
    Version: "バージョン",
    "Version:": "バージョン：",
    "Vertical Padding": "上下の余白",
    Video: "動画",
    View: "表示",
    "View full screen": "全画面で表示",
    "View notifications": "通知を表示",
    "View page": "ページを表示",
    Visibility: "公開範囲",
    Visit: "ページを見る",
    "We couldn&apos;t find the": "お探しの",
    "We encourage you to raise an issue so that we can make the product better for everyone.":
        "公式のGitHubへ不具合を報告できます。",
    "We need this in order to comply with the CAN-SPAM Act.":
        "配信に必要な送信者情報を設定してください。",
    "Welcome to your new school! 🎉": "スクールへようこそ！ 🎉",
    "What's on your mind?": "投稿する内容を入力してください",
    Wide: "広い",
    Wider: "より広い",
    Widest: "最も広い",
    "Write a reply...": "返信を入力…",
    "Write something...": "内容を入力…",
    Yearly: "毎年",
    "Yearly Amount": "年額",
    "You are almost ready to monetize your knowledge.":
        "講座の公開まで、あと少しです。",
    "You can use the following variables in your content.":
        "次の差し込み項目を本文で使えます。",
    "You don&apos;t have the required permission": "この画面の操作には",
    "You have": "まだ",
    "You have left the community.": "コミュニティから退会しました。",
    "YouTube Video": "YouTube動画",
    "YouTube thumbnail": "YouTube動画のサムネイル",
    "YouTube video player": "YouTube動画プレーヤー",
    "Your browser does not support the video tag.":
        "お使いのブラウザーは動画の再生に対応していません。",
    "Your mailing address": "送信者の住所",
    "Your request to join has been sent.": "参加申請を送信しました。",
    "You’ll lose access to all community content, discussions and included products. Ongoing subscription will also be canceled, if any.":
        "コミュニティの内容・会話・対象商品を利用できなくなります。継続契約がある場合は、その契約も解約されます。",
    and: "・",
    "and remove it from our servers.": "サーバーから削除されます。",
    block: "ブロック",
    breadcrumb: "現在の位置",
    category: "カテゴリ",
    "contacts?": "人です。実行しますか？",
    customers: "人の受講者・購入者",
    day: "日",
    days: "日",
    "e.g. YouTube video URL or iframe code":
        "例：YouTube動画のURL、iframeの埋め込みコード",
    "files -": "個のファイル：",
    "for completing the course": "講座の修了を証明します",
    "is sent to a few subscribers.":
        "メールが登録者へ配信された後に利用できます。",
    logo: "ロゴ",
    members: "人のメンバー",
    "not added any communities yet.": "コミュニティを作成していません。",
    "not found": "が見つかりません",
    of: "／",
    pagination: "ページ切替",
    paid: "有料",
    payments: "回の支払い",
    profile: "プロフィール",
    "profile pic": "プロフィール画像",
    "reCAPTCHA service not available. Please try again later.":
        "認証サービスを利用できません。時間をおいて再度お試しください。",
    "reCAPTCHA validation failed. Please try again.":
        "認証を確認できませんでした。もう一度お試しください。",
    "reCAPTCHA verification failed. Please try again.":
        "認証を確認できませんでした。もう一度お試しください。",
    sales: "売上",
    selected: "選択中",
    steps: "項目",
    "support. Please reach out to us on": "です。詳しくは",
    "to access this area.": "必要な権限がありません。",
    "to join this community or post here":
        "コミュニティへの参加・投稿にはプロフィールの設定が必要です",
    "with your requirements .": "へお問い合わせください。",
    "you&apos;re looking for. It may have been removed or doesn&apos;t exist.":
        "は見つかりませんでした。削除されたか、存在しない可能性があります。",
} as const;

export const finalUiLabels = {
    course: "講座",
    download: "ダウンロード",
    otherProduct: "商品",
    oneTime: "買い切り",
    yearly: "年払い",
    monthly: "月払い",
    installments: "分割払い",
    unavailable: "未設定",
    planPlaceholder: "金額はプラン設定後に表示されます",
    authenticationError:
        "ログインできませんでした。最新の認証コードを確認し、もう一度お試しください。",
    recaptchaError: "認証を確認できませんでした。もう一度お試しください。",
    previousPeriod: "（前期間比）",
    avatar: "プロフィール画像",
    permanentDeleteSuffix: "を削除します。この操作は取り消せません。",
} as const;
export const finalUiMessages = {
    fileSize: (maxMB: number) =>
        "ファイルのサイズは" + maxMB + "MB未満にしてください",
    quizScore: (score: string, required?: number) =>
        required === undefined
            ? "得点：" + score + "点"
            : "得点：" + score + "点（合格には" + required + "点が必要です）",
};

export const finalUiTimeRanges = {
    day: "1日",
    week: "1週間",
    month: "30日",
    quarter: "90日",
    year: "1年",
    all: "全期間",
} as const;

export const finalUiAccessibility = {
    notifications: "通知",
    notificationsHotkey: "通知（{hotkey}）",
} as const;
export function localizeDefaultPageName(name: string | undefined): string {
    const names: Record<string, string> = {
        "Terms of Use": "利用規約",
        "Privacy Policy": "プライバシーポリシー",
        "Home page": "トップページ",
    };
    return name ? names[name] || name : "";
}

export const finalUiMail = {
    enrolled: "次の講座への登録が完了しました：",
    signup: "へのお申し込みありがとうございます。",
    access: "登録した講座・コンテンツは、",
    login: "ログインして確認できます。",
    download: "ダウンロードする",
    regards: "よろしくお願いいたします。",
} as const;

export const finalUiDynamic = {
    avatar: (p0: unknown) => `${p0}のプロフィール画像`,
    categoryAdded: (p0: unknown) => `カテゴリ「${p0}」を追加しました。`,
    categoryMoved: (p0: unknown, p1: unknown) =>
        `カテゴリ「${p0}」を削除し、投稿を「${p1}」へ移動しました。`,
    deleteAndMove: (p0: unknown) =>
        `削除し、内容を「${p0 === "'None'" ? "なし" : p0}」へ移動`,
    sendConfirmation: (p0: unknown, p1: unknown) =>
        `${p0}：対象${p1}人。実行しますか？`,
    paymentMethod: (p0: unknown) => `決済方法：${p0 === "Free" ? "無料" : p0}`,
    error: (p0: unknown) => `エラー：${p0}`,
    additionalProducts: (p0: unknown) => `ほか${p0}商品`,
    community: (p0: unknown) => `${p0}のコミュニティ`,
    subscription: (p0: unknown) => `継続契約ID：${p0}`,
} as const;

/** Display-only translations; persisted currency codes and auth responses stay intact. */
export function localizeCurrencyName(isoCode: string): string {
    const code = isoCode.toUpperCase();
    try {
        return (
            new Intl.DisplayNames(["ja"], { type: "currency" }).of(code) || code
        );
    } catch {
        return code;
    }
}

export const finalUiErrors = {
    expiredOtp:
        "認証コードの有効期限が切れました。新しいコードを取得してください。",
    tooManyAttempts:
        "試行回数が多いため、少し待ってから新しい認証コードを取得してください。",
    tooManyRequests:
        "送信回数が多いため、少し待ってからもう一度お試しください。",
    invalidEmail: "メールアドレスを確認してください。",
} as const;

export function localizeUiError(
    message: string | undefined,
    fallback: string = responses.internal_error,
    code?: string,
): string {
    const errors: Record<string, string> = {
        INVALID_OTP: checkoutStrings.invalidOtp,
        OTP_EXPIRED: finalUiErrors.expiredOtp,
        TOO_MANY_ATTEMPTS: finalUiErrors.tooManyAttempts,
        TOO_MANY_REQUESTS: finalUiErrors.tooManyRequests,
        INVALID_EMAIL: finalUiErrors.invalidEmail,
        "Invalid OTP": checkoutStrings.invalidOtp,
        "OTP expired": finalUiErrors.expiredOtp,
        "Too many attempts": finalUiErrors.tooManyAttempts,
        "Too many requests": finalUiErrors.tooManyRequests,
        "Invalid email": finalUiErrors.invalidEmail,
        Unauthorized: responses.request_not_authenticated,
        Forbidden: responses.action_not_allowed,
        "Domain not found": responses.domain_doesnt_exist,
        "Invalid payment plan": responses.invalid_input,
    };
    if (code && errors[code]) return errors[code];
    if (message && errors[message]) return errors[message];
    // Keep Japanese validation feedback; never expose raw provider errors to learners.
    return message && /[\u3040-\u30ff\u3400-\u9fff]/.test(message)
        ? message
        : fallback;
}

export function localizeProductType(type: string | undefined): string {
    switch (type?.toLowerCase()) {
        case "course":
            return finalUiLabels.course;
        case "download":
            return finalUiLabels.download;
        default:
            return finalUiLabels.otherProduct;
    }
}

// Owner-only prepublication review.
export const POLICY_REVIEW_TITLE = "規約・プライバシーの公開前確認";
export const POLICY_REVIEW_NOTICE =
    "管理者限定の確認ページです。一般向けページはまだ変更していません。";
export const POLICY_REVIEW_TERMS = "利用規約";
export const POLICY_REVIEW_PRIVACY = "プライバシーポリシー";
export const POLICY_REVIEW_CONSULTATIONS = "11. 個別相談の予約について";
export const POLICY_REVIEW_CONTACT = "フォームを確認する";
export const POLICY_REVIEW_RESULT =
    "現在公開中の利用規約・プライバシーポリシーをもとに、個別相談の予約に関する案内を追記した確認版です。";
export const POLICY_REVIEW_PENDING =
    "末尾の「個別相談の予約について」と予約画面をご確認ください。今回の表示では一般向け本文の差し替えや予約受付の開始は行いません。";
export const POLICY_REVIEW_DATE = "確認用原稿：2026年10月15日 / 未公開・未適用";
export const appointmentReleaseText = {
    title: "個別相談の公開前確認",
    notice: "管理者だけが見られる確認版です。公開中のLPと個人情報の案内は差し替えていません。この確認ページから予約受付は開始されません。",
    sample: "下のLPの予約ボタンから、画面見本のカレンダーへ進めます。予約・Google予定・メールは作成されません。表示日時は見本です。",
    lp: "予約入口を変更したLP",
    privacy: "個人情報の案内を確認",
    booking: "予約画面の見本を確認",
    back: "個別相談の一覧へ",
    flow: [
        "LPの予約ボタン",
        "カレンダーで日時を選ぶ",
        "個人情報の案内・入力内容を確認",
    ],
    retention:
        "この確認版は保存から7日間表示できます。確認後、一般向けの案内とLPを反映し、最後に予約受付を開始します。",
};

export const blogFeatureText = {
    label: "ブログ機能",
    description:
        "OFFにするとブログのメニュー・閲覧・編集を停止します。保存済みの記事は残ります。",
    disabled: "ブログ機能はOFFになっています",
    unavailableTitle: "ページが見つかりません",
    unavailableHeading: "このページはご利用いただけません",
    home: "トップページへ",
    invalidSettings: "タイトルを入力し、設定内容を確認してください",
} as const;

export const paymentTestText = {
    title: "決済接続・テスト購入",
    description:
        "管理者専用。実際の請求は発生しません。試験記録は本番の売上・受講者と分離し、30日後に削除します。",
    live: "本番の接続設定",
    test: "テストの接続設定",
    key: "公開キー",
    secret: "シークレットキー",
    webhook: "通知先の署名シークレット",
    save: "接続を保存",
    saved: "保存しました。設定済みのキーは安全のため表示しません。",
    configured: "設定済み",
    unconfigured: "未設定",
    checking: "確認中…",
    configuredPlaceholder: "設定済み（変更するときだけ入力）",
    connectionConfigured: "設定済み",
    connectionIncomplete: "設定が必要です",
    updateConnection: "接続情報を更新する",
    connectionHelp:
        "保存済みのキーは表示しません。変更する場合だけ、3つすべてを入力して保存してください。空欄のままでは保存済み設定は変わりません。",
    ready: "接続済み",
    notReady: "未接続",
    product: "商品",
    plan: "買い切りプラン",
    start: "テスト購入する",
    empty: "買い切りの有料プランを持つ商品がありません。無料講座の申込確認は通常の無料申込で行えます。",
    history: "テスト購入の履歴",
    refresh: "決済結果を確認",
    sent: "送信済み",
    sending: "送信中",
    mailFailed: "未送信（接続を確認）",
    paid: "テスト決済確認済み",
    pending: "決済未確認",
    mail: "テスト案内メール",
    learn: "学習画面を確認",
    preview:
        "管理者プレビューで確認します。本番の受講権限は追加しません。一般受講者の権限・再ログイン試験は別途行います。",
    blocked:
        "本番接続時、既存の有料テスト商品は実請求を防ぐため通常購入を停止します。新しく作成する商品は対象外です。",
    failed: "操作に失敗しました。",
    repeat: "結果を確認してから、次の試験を開始してください。",
    open: "テスト購入・本番接続設定へ",
    keyNote:
        "秘密値は保存後に表示しません。本番はpk_live_/sk_live_、テストはpk_test_/sk_test_の組を使います。本番切替前のテスト接続は学校内で保全します。",
};

export const LAUNCH_PREVIEW_TITLE = "公開前の入口確認";
export const LAUNCH_PREVIEW_NOTICE =
    "公開前の確認用です。申込案内は確認用で、登録や課金は行いません。";
export const LAUNCH_PREVIEW_HOME = "トップの案";
export const LAUNCH_PREVIEW_RECRUITMENT = "募集ページ";
export const LAUNCH_PREVIEW_SIGNUP = "申込案内";
export const LAUNCH_PREVIEW_POLICY = "規約・プライバシー";
export const LAUNCH_PREVIEW_CONTACT = "問い合わせフォーム";

export const learnerMediaText = {
    label: "生徒の写真・ファイルのアップロード",
    description:
        "OFFにすると生徒のプロフィール写真と投稿への添付を停止します。運営者の講座画像・動画の登録、受講と進捗は継続できます。",
    disabled:
        "このスクールでは生徒の写真・ファイルのアップロードを利用していません。",
};

export const thankYouStrings = {
    title: "申込・購入後のページ",
    label: "移動先のLP URL",
    help: "申込・支払い確認後、このURLへ自動で移動します。未設定なら通常の受講案内を表示します。受講案内メールや受講中の講座からも学習できます。",
    placeholder: "https://example.com/consultation",
    invalid: "公開されたHTTPSのLP URLを入力してください。",
    saved: "申込・購入後の移動先を保存しました。",
    empty: "未設定（通常の受講案内）",
    configured: "設定済み",
    open: "設定したLPを確認する",
    moving: "お申し込みが完了しました。ご案内ページへ移動します。",
    continue: "ご案内ページへ進む",
};

export const appointmentText = {
    listTitle: "個別相談一覧",
    notConnected: "未接続",
    connectionSettings: "接続を確認・設定",
    accepting: "予約受付中",
    paused: "受付停止中",
    listIntro: "相談ごとに、所要時間・受付時間・予約ページを管理します。",
    createType: "個別相談を作る",
    createTypeForm: "個別相談の作成",
    typeName: "相談名",
    createPaused: "受付停止で作成",
    sharedConnection: "Googleカレンダー連携（共通）",
    sharedConnectionHelp:
        "すべての個別相談で同じ接続とカレンダーを使います。別の相談の予約とも空き時間を照合します。",
    fixedZoom: "固定Zoom",
    noTypeMatch: "一致する個別相談がありません。",
    typeSearch: "個別相談を検索",

    loginExpired:
        "予約画面から、新しい認証コードを発行してログインしてください。",
    online: "オンライン（Zoom）",
    checkedAt: "最終接続確認",
    unchecked: "未確認",
    title: "個別相談",
    adminTitle: "個別相談の予約",
    private: "非公開・確認中",
    public: "受付中",
    adminIntro:
        "受付時間と案内を設定できます。「予約の受付」を切り替えて保存すると、この相談の受付を開始・停止できます。",
    preview: "予約画面を確認する",
    sample: "画面見本を見る",
    sampleNotice: "画面見本です。予約・Google予定・メールは作成しません。",
    previewNotice:
        "管理者限定の確認画面です。確定すると選択したGoogleカレンダーとメールに確認用の予約を作成します。",
    settings: "受付の設定",
    connection: "Googleカレンダーとの接続",
    bookings: "予約一覧",
    saved: "設定を保存しました。",
    save: "設定を保存",
    saving: "処理中…",
    loading: "読み込み中…",
    connected: "接続済み",
    configured: "設定済み（値は再表示しません）",
    missing: "未設定",
    reconnect: "Googleに接続する",
    check: "接続とカレンダーを確認",
    disconnect: "Google接続を解除",
    disconnectConfirm:
        "Google接続を解除しますか？ 新規受付は停止し、予約記録は保持します。",
    disconnectDone: "Google接続を解除しました。",
    checked: "Googleとの接続を確認しました。",
    failedConnection:
        "Googleの接続を完了できませんでした。設定とGoogle側の許可を確認してください。",
    clientId: "Google OAuth クライアントID",
    clientSecret: "クライアントシークレット",
    secretHelp: "変更するときだけ入力してください。保存後は空欄になります。",
    callback: "Googleに登録するリダイレクトURI",
    setupHelp: "Google連携の準備",
    setupDetails:
        "Google CloudでCalendar APIを有効にし、ウェブアプリ用のOAuthクライアントを作成します。表示されたリダイレクトURIを登録してください。OAuth同意画面をテスト中にする場合は、ご自身をテストユーザーに登録します。外部アプリがテスト中の場合、カレンダー連携の許可は通常7日で期限切れになるため、継続運用前にGoogle側の公開状態を整えます。クライアントID・シークレットはこの画面に直接入力し、チャットには送らないでください。",
    targetCalendar: "予約を書き込むカレンダー",
    busyCalendars: "空きを確認するカレンダー",
    calendarHelp:
        "登録先も自動的に空き確認の対象になります。最初は確認用カレンダーを選んでください。",
    choose: "選択してください",
    refreshCalendars: "接続確認ボタンで一覧を取得できます。",
    name: "お名前",
    notes: "相談したいこと（任意）",
    notesHelp:
        "パスワードや個人情報など、相談に不要な情報は入力しないでください。",
    titleField: "相談の名前",
    description: "案内文",
    duration: "所要時間（分）",
    interval: "予約枠の間隔（分）",
    before: "開始前の余裕（分）",
    after: "終了後の余裕（分）",
    notice: "何時間前まで予約できるか",
    horizon: "何日先まで表示するか",
    startDate: "受付開始日（任意）",
    endDate: "受付終了日（任意）",
    excluded: "休止日（1行に1日、YYYY-MM-DD）",
    windows: "受付曜日・時間（日本時間）",
    weekdays: ["日", "月", "火", "水", "木", "金", "土"],
    fromTime: "開始",
    toTime: "終了",
    zoom: "固定Zoom URL",
    enable: "一般向けの予約受付を公開する",
    offHelp:
        "OFFでも既存の予約は消えません。本人はログインして確認・変更・キャンセルできます。",
    flow: ["日時を選ぶ", "お名前・内容を確認", "予約完了"],
    date: "表示する日",
    times: "空いている日時",
    noSlots: "この期間に予約できる枠はありません。別の日付でお試しください。",
    search: "空き日時を確認",
    timezone: "日時はすべて日本時間です。",
    selectTime: "日時を選択してください。",
    confirm: "この内容で予約する",
    confirmPreview: "確認用の予約を作成する",
    consent:
        "個人情報の取り扱いを確認し、お名前・メールアドレス・予約日時・相談内容を、予約管理と相談対応に利用することに同意します。",
    privacyPurpose:
        "お名前・メールアドレス・予約日時・相談内容は、本人確認、日程調整、相談対応、予約・変更・キャンセルの連絡に利用します。講座やメルマガには自動登録されません。",
    privacyStorage:
        "予約情報は当サイトで管理します。Googleカレンダーには日時・相談名・予約番号・Zoom URLを登録し、お名前・メールアドレス・相談内容は登録しません。保管や削除については、個人情報の取り扱いをご確認ください。",
    privacy: "個人情報の取り扱い",
    login: "メール認証でログインして予約する",
    loginHelp:
        "予約の確認や変更のため、メールアドレスを確認します。講座やメルマガには自動登録されません。",
    yours: "ご予約",
    empty: "予約はまだありません。",
    change: "日時を変更",
    cancel: "予約をキャンセル",
    cancelConfirm: "この予約をキャンセルしますか？",
    cancelChange: "日時変更をやめる",
    changeSubmit: "選んだ日時に変更する",
    zoomJoin: "Zoomの参加URL",
    management: "予約を確認する",
    id: "予約番号",
    reconcile: "Googleとの状態を再確認",
    updated: "予約情報を更新しました。",
    uncertainty:
        "Googleとの照合が必要です。予約を繰り返さず、運営者にお問い合わせください。",
    contact: "お問い合わせ",
    mail: "通知メール",
    mailStates: {
        not_sent: "未送信",
        sending: "送信処理中・結果未確認",
        sent: "送信受付済み",
        delivery_unconfirmed: "到達未確認（再送せず受信箱を確認）",
        failed: "未送信",
    },
    statuses: {
        pending: "処理中",
        confirmed: "予約確定",
        changing: "日時変更を確認中",
        cancelling: "取消を確認中",
        cancelled: "キャンセル済み",
        needs_review: "運営者による確認が必要",
    },
    errors: {
        forbidden: "この操作を行う権限がありません。",
        not_found: "予約が見つかりません。",
        not_open: "ただいま予約の受付を停止しています。",
        setup_required:
            "Googleカレンダー・受付時間・Zoom URLの設定が必要です。",
        connection_required: "Googleへの再接続が必要です。",
        calendar_required: "カレンダーの登録先と権限を確認してください。",
        calendar_unavailable:
            "カレンダーを確認できません。時間をおいてお試しください。",
        google_unavailable:
            "Googleに接続できません。予約は繰り返さず、予約一覧をご確認ください。",
        slot_taken:
            "この日時は選べなくなりました。空き日時を再確認してください。",
        processing:
            "ほかの処理が進行中です。少し待ってから再確認してください。",
        stale: "情報が更新されました。画面を読み込み直してください。",
        type_limit: "個別相談は20件まで作成できます。",
        already_booked:
            "すでに予約があります。予約一覧から日時を変更できます。",
        review_required:
            "Googleの予定と照合が必要です。運営者にお問い合わせください。",
        event_mismatch:
            "Google側の予定が変更されています。運営者による確認が必要です。",
        active_bookings:
            "受付中または今後の予約があるため、カレンダーや接続先を変更できません。まず受付を停止し、予約をご確認ください。",
        login_required: "予約時のメールアドレスでログインしてください。",
        rate_limited: "操作が続いています。1分ほど待ってお試しください。",
        invalid: "入力内容をご確認ください。",
        unavailable: "処理を完了できませんでした。時間をおいてお試しください。",
    },
};

export const funnelUiText = {
    flowLabel: "ファネル",
    lpStage: "LP",
    checkoutStage: "販売・申込",
    thanksStage: "サンクスページ",
    checkoutSettings: "講座・販売設定",
    nodeSettings: "設定",
    thanksSettings: "URLを設定",
    thanksPreview: "ページを確認",
    merge: "同じ申込フォームへ",
    afterSignup: "申込完了後",
    normalThanks: "未設定：通常の受講案内へ進みます。",
    commonThanksDescription:
        "申込完了後の案内先です。この講座に申し込むすべてのLPで共通です。",
    menu: "プロモーション",
    listTitle: "プロモーション",
    listDescription:
        "LPから申込完了まで、ページのつながりをまとめて管理します。",
    create: "プロモーションを作る",
    createForm: "プロモーションの作成",
    name: "プロモーション名",
    course: "対象の講座",
    count: "LP数",
    status: "公開状況",
    search: "プロモーションを検索",
    searchPlaceholder: "プロモーション名・講座名で検索",
    archivedToggle: "アーカイブも表示",
    draft: "下書き",
    live: "公開中",
    paused: "公開停止中",
    archived: "アーカイブ",
    free: "無料講座",
    paid: "有料講座",
    mixed: "無料・有料",
    unspecified: "料金未設定",
    emptyTitle: "プロモーションはまだありません",
    emptyDescription:
        "「プロモーションを作る」から名前と講座を選んで始められます。",
    noMatches: "一致するプロモーションがありません",
    noMatchesDescription:
        "検索する言葉やアーカイブの表示設定を変えてください。",
    open: "詳細を開く",
    back: "プロモーションへ戻る",
    unsaved:
        "保存していない変更があります。「設定を保存」するか、変更を破棄してプロモーションへ戻ってください。",
    discard: "変更を破棄して戻る",
    lpTab: "ファネル",
    settingsTab: "基本設定",
    publicationTab: "公開・停止",
    lpDescription:
        "入口になるLPです。どのLPからも、下の同じ申込フォームへ進みます。",
    lpSettings: "LPの設定",
    lpDraft: "下書き",
    include: "次回の公開に含める",
    inclusion: "次回公開の対象",
    excluded: "次回公開から除外",
    addLp: "LPを追加",
    cancelAdd: "LP追加を閉じる",
    settingsDescription:
        "プロモーション名と対象講座を設定します。申込後のURLは講座の設定から変更できます。",
    publicationDescription:
        "LPの内容と移動先を確認してから、このプロモーションを公開できます。",
    clone: "このプロモーションを複製する",
    archive: "停止済みのプロモーションをアーカイブ",
    pause: "このプロモーションを公開停止",
    pauseMessage: "このプロモーションの公開を停止しました。",
    previewBack: "プロモーションの流れへ戻る",
};
