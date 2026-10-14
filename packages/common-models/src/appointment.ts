export type AppointmentWindow = { day: number; start: string; end: string };
export type AppointmentInterval = { start: string; end: string };
export type AppointmentConfig = {
    enabled: boolean;
    title: string;
    description: string;
    duration: number;
    interval: number;
    bufferBefore: number;
    bufferAfter: number;
    noticeHours: number;
    horizonDays: number;
    startDate: string;
    endDate: string;
    excludedDates: string[];
    windows: AppointmentWindow[];
    zoomUrl: string;
    calendarId: string;
    busyCalendarIds: string[];
};
export type AppointmentType = {
    typeId: string;
    config: AppointmentConfig;
    version: number;
    createdAt: string;
};
export type AppointmentTypeSummary = {
    typeId: string;
    title: string;
    duration: number;
    enabled: boolean;
    version: number;
};
export type AppointmentTypeListData = {
    types: AppointmentTypeSummary[];
    connected: boolean;
    account: string;
};
export type AppointmentSettings = {
    types?: AppointmentType[];
    configVersion?: number;
    domainId: string;
    config: AppointmentConfig;
    clientId: string;
    secret: string;
    refresh: string;
    account: string;
    checkedAt?: Date;
    updatedAt: Date;
};
export type AppointmentStatus =
    | "pending"
    | "confirmed"
    | "changing"
    | "cancelling"
    | "cancelled"
    | "needs_review";
export type AppointmentBooking = {
    typeId?: string;
    bookingId: string;
    domainId: string;
    userId: string;
    email: string;
    name: string;
    notes: string;
    preview: boolean;
    start: string;
    end: string;
    holds: AppointmentInterval[];
    status: AppointmentStatus;
    operation: "create" | "reschedule" | "cancel";
    proposedStart?: string;
    proposedEnd?: string;
    calendarId: string;
    eventId: string;
    version: number;
    idempotencyKey: string;
    requestHash: string;
    origin: string;
    mailState: string;
    mailVersion: number;
    createdAt: Date;
    updatedAt: Date;
};
export type AppointmentCalendar = {
    id: string;
    summary: string;
    accessRole: string;
    primary?: boolean;
    timeZone?: string;
};
export type AppointmentView = Pick<
    AppointmentBooking,
    | "bookingId"
    | "name"
    | "start"
    | "end"
    | "status"
    | "preview"
    | "version"
    | "mailState"
> & { zoomUrl?: string; email?: string; notes?: string };
export type AppointmentAdminData = {
    typeId?: string;
    version?: number;
    config: AppointmentConfig;
    clientId: string;
    secretConfigured: boolean;
    connected: boolean;
    account: string;
    checkedAt?: string;
    redirectUri: string;
    calendars: AppointmentCalendar[];
    bookings: AppointmentView[];
};
export type AppointmentUiProps = {
    typeId?: string;
    themeStyles?: string;
    preview: boolean;
    sample?: boolean;
    title: string;
    description: string;
    loggedIn: boolean;
    initialBookings?: AppointmentView[];
};
export type AppointmentGoogleEvent = {
    id: string;
    etag?: string;
    status?: string;
    transparency?: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
    extendedProperties?: {
        private?: { bookingId?: string; domainId?: string; version?: string };
    };
};
export type AppointmentAdminProps = {
    initial: AppointmentAdminData;
    connectionStatus?: string;
    mode?: "detail" | "connection";
};
export type AppointmentConfigForm = {
    config: AppointmentConfig;
    clientId: string;
    clientSecret: string;
};
export type AppointmentRequestError = Error & { code?: string };
export type AppointmentTransient = {
    key: string;
    value: Record<string, any>;
    expiresAt: Date;
};

export interface AppointmentListProps {
    initial: AppointmentTypeListData;
}
