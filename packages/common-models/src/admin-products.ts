import type { Course } from "./course";

export type ProductDisplayMode = "cards" | "list";
export type DashboardCourse = Course & {
    privacy?: string;
    published?: boolean;
    sales?: number;
    customers?: number;
};
export interface DashboardProductProps {
    product: DashboardCourse;
}
