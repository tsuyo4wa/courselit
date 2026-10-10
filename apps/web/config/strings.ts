/**
 * This file provides strings used app wide.
 */
import { UIConstants } from "@courselit/common-models";

export const responses = {
    error: "Error",
    domain_missing: "Domain is missing",
    domain_doesnt_exist: "Domain does not exist",
    domain_super_admin_email_missing:
        "SUPER_ADMIN_EMAIL environment variable is not defined",
    not_valid_subscription: "No valid subscription found",
    sign_in_mail_prefix: "ログイン認証コード：",
    sign_in_mail_body: "Click the following link to sign in.",
    sign_in_link_text: "Sign in",

    // graphql responses
    past_date: "Date cannot be in the past",
    invalid_permission: "Invalid permission",
    user_not_found: "User not found.",
    request_not_authenticated: "Request not authenticated",
    content_cannot_be_null: "Content cannot be empty",
    media_id_cannot_be_null: "Media cannot be empty",
    item_not_found: "Item not found",
    drip_not_released: "This section is not yet released for you",
    not_a_creator: "You do not have rights to perform this action",
    course_not_empty: "Delete all lessons before trying deleting the course",
    invalid_offset: "Invalid offset",
    is_not_admin: "Insufficient privileges",
    is_not_admin_or_creator: "Insufficient privileges",
    blog_description_empty: "Description field is required",
    cannot_convert_to_blog:
        "The course has lessons hence cannot be converted to a post",
    cost_not_provided: "Cost field is required",
    invalid_cost: "Invalid cost",
    cannot_add_to_blogs: "Cannot add lessons to a blog post",
    file_is_required: "A file is required",
    error_in_moving_file: "Error in moving file",
    success: "success",
    user_name_cant_be_null: "Name cannot be null",
    action_not_allowed: "You do not have rights to perform this action",
    invalid_input: "Invalid input",
    payment_invalid_settings: "Payment configuration is invalid",
    payment_info_required: "Add payment method before creating a paid plan",
    unrecognised_currency_code: "Unrecognised currency code",
    only_admins_can_purchase:
        "Only admins can purchase courses on behalf of others",
    course_already_purchased: "You have already purchased this item",
    payment_settings_invalid_suffix: "settings are invalid",
    invalid_course_id: "Invalid course ID",
    invalid_user_id: "Invalid user ID",
    payment_settings_invalid:
        "Payment method is not set up. Please contact site admin.",
    not_enrolled: "You are not enrolled in the course",
    currency_iso_not_set:
        "Currency ISO code is not set. Please contact site admin.",
    payment_method_not_saved:
        "Set a payment method before setting its corresponding secret key",
    invalid_payment_method: "Invalid payment method",
    invalid_theme: "Invalid theme",
    theme_not_installed: "The theme is not installed",
    invalid_layout: "Invalid layout",
    missing_mandatory_blocks: "Missing mandatory blocks",
    destination_dont_exist: "Destination does not exist",
    page_exists: "A page with the URL already exists",
    invalid_format: "Invalid format",
    no_thumbnail: "No thumbnail available",
    file_size_exceeded: "File size exceeded",
    name_is_required: "Name is required",
    mimetype_is_required: "Mimetype is required",
    existing_group: "A group with that name exists",
    group_not_empty: "This section has lessons. Delete them before proceeding",
    group_not_found: "Section not found",
    update_payment_method:
        "You need to set up a payment method to create paid content.",
    currency_iso_code_required:
        "Currency ISO code is required. Examples: usd, inr, gbp etc.",
    currency_unit_required:
        "A currency symbol is required. Examples: $, ₹, £ etc.",
    school_title_not_set:
        "Give your school a title before setting payment info.",
    internal_error: "An internal error occurred. Please try again.",
    presigned_url_failed: "That did not work! Please go back and try again.",
    file_uploaded: "The file is uploaded. Go back to see your media.",
    media_deleted: "The media is deleted. Go back to see your media.",
    invalid_access_type: "The access type can either be public or private.",
    answers_missing: "Answers are missing.",
    cannot_be_evaluated: "This lesson cannot be evaluated.",
    need_to_pass: "You need to pass this test in order to mark it completed.",
    no_correct_answer:
        "Every question needs to have at least one correct answer.",
    no_empty_option: "Options without text are not allowed in questions.",
    medialit_apikey_notfound: "You need to configure MediaLit to upload files.",
    mail_already_sent: "The mail is already sent",
    mail_subject_length_exceeded: `Subject cannot be longer than ${UIConstants.MAIL_SUBJECT_MAX_LENGTH} characters`,
    mail_max_recipients_exceeded: `Total number of recipients cannot exceed ${UIConstants.MAIL_MAX_RECIPIENTS}`,
    invalid_mail: "To, Subject and Body fields are required",
    email_delivery_failed_for_all_recipients:
        "Email delivery failed for all recipients",
    courses_cannot_be_downloaded: "A course cannot be offered as a download.",
    apikey_already_exists: "Apikey with that name already exists",
    email_template_already_exists: "A template with that name already exists",
    sequence_details_missing: "The following settings are missing",
    invalid_emails_order: "Invalid emails order",
    no_published_emails: "No published emails",
    sequence_not_active: "Sequence not active",
    sequence_already_started: "Sequence already started",
    mailing_address_too_short: "Mailing address is too short",
    mandatory_tags_missing: "Mandatory tags are missing",
    cannot_delete_last_email: "Cannot delete the last email in the sequence",
    invalid_drip_email: "Drip email needs a subject and a body",
    cannot_invite_to_unpublished_product:
        "Cannot invite customers to an unpublished product",
    rejection_reason_missing: "Rejection reason is missing",
    joining_reason_missing: "Joining reason required",
    invalid_category: "Invalid category",
    community_exists: "A community with the same name already exists",
    payment_plan_required: "Add a payment plan before performing this action",
    community_requires_payment: "Community requires payment",
    community_has_no_payment_plans: "Community has no payment plans",
    duplicate_payment_plan: "A payment plan with the same type already exists",
    default_payment_plan_cannot_be_archived:
        "Default payment plan cannot be archived",
    default_payment_plan_required:
        "Mark a payment plan as default before enabling the community",
    community_content_already_reported: "Content already reported",
    profile_incomplete: "Complete your profile to perform this action",
    cannot_reject_member_with_active_subscription:
        "Cannot reject a member with an active subscription",
    cannot_leave_community_last_moderator:
        "Last manager cannot leave the community",
    cannot_delete_last_permission_user:
        "Cannot delete the last user with required permissions:",
    cannot_change_role_inactive_member:
        "Cannot change role of a member who is not active",
    cannot_change_role_last_moderator:
        "Cannot change role of the last moderator",
    cannot_delete_last_category: "Cannot delete the last category",
    lead_magnet_invalid_settings:
        "Product must have exactly one free payment plan to enable lead magnet",
    certificate_invalid_settings: "Certificate can only be enabled for courses",
    sso_provider_already_exists:
        "A SSO provider with the same provider ID already exists",
    quiz_cannot_be_previewed: "Quiz cannot be previewed",

    // api responses
    digital_download_no_files:
        "This digital download is empty. Please contact the creator.",
    download_link_expired: "The download link has expired",
    user_already_exists: "The user already exists",
    unsubscribe_success:
        "Sorry to see you go. You have been unsubscribed from our mailing list.",
    download_course_cannot_have_groups: "Digital download cannot have sections",
    download_course_last_group_cannot_be_removed:
        "Last section cannot be removed from a digital download",
    certificate_demo_course_id_required:
        "CourseID is required for demo certificate",
    provider_not_configured: "Configure the provider before enabling",
    provider_invalid_configuration: "Invalid provider configuration",
    page_id_already_exists:
        "This URL slug is already in use. Please choose a different one.",
};

export const internal = {
    error_unrecognised_payment_method: "Unrecognized payment method",
    error_payment_method_not_implemented: "Not yet implemented",
    error_db_connection_failed:
        "Unable to establish a connection to the database.",
    error_env_var_undefined: "A required environment variable is not defined",
    app_running: "CourseLit server is running on",
    invalid_cloud_storage_settings: "Cloud storage settings are invalid",
    domain_not_specified: "Domain is not specified",
    default_group_name: "First section",
    default_email_broadcast_subject: "Untitled broadcast",
    default_email_sequence_subject: "First email",
    default_email_sequence_name: "Untitled Sequence",
    joining_reason_creator: "Joined as creator",
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
    learningReady: "購入・登録したコンテンツは受講一覧から開けます。",
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
