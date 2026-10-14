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
export type AppointmentSettings = {
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
