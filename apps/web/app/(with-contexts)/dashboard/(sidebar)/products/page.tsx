"use client";
import {
    finalUiText,
    localizeProductType,
    productDisplayText,
} from "@/config/strings";

import DashboardContent from "@components/admin/dashboard-content";
import { SiteInfoContext } from "@components/contexts";
import {
    Constants,
    DashboardCourse,
    DashboardProductProps,
    ProductDisplayMode,
    CourseType,
    UIConstants,
} from "@courselit/common-models";
import {
    BTN_NEW_PRODUCT,
    MANAGE_COURSES_PAGE_HEADING,
} from "@ui-config/strings";
import Link from "next/link";
import { useContext, useCallback, useMemo, useSyncExternalStore } from "react";
import { Button } from "@components/ui/button";
import {
    ContentCard,
    ContentCardContent,
    ContentCardImage,
    ContentCardHeader,
    Badge,
    getSymbolFromCurrency,
} from "@courselit/components-library";
import {
    Download,
    BookOpen,
    Users,
    Eye,
    EyeOff,
    CheckCircle,
    CircleDashed,
    LayoutGrid,
    List,
    ChevronRight,
} from "lucide-react";
import { PaginationControls } from "@components/public/pagination";
import { useProducts } from "@/hooks/use-products";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@components/ui/tooltip";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/app/(with-contexts)/(with-layout)/products/empty-state";
import Resources from "@components/resources";
import { SkeletonCard } from "@components/skeleton-card";
import { Skeleton } from "@components/ui/skeleton";

const ITEMS_PER_PAGE = 9;
const VIEW_STORAGE_KEY = "courselit:admin:products:view";

const { permissions } = UIConstants;

const breadcrumbs = [{ label: MANAGE_COURSES_PAGE_HEADING, href: "#" }];

function ProductCard({ product }: DashboardProductProps) {
    const siteinfo = useContext(SiteInfoContext);

    return (
        <ContentCard href={`/dashboard/product/${product.courseId}`}>
            <ContentCardImage
                src={
                    product.featuredImage?.file ||
                    "/courselit_backdrop_square.webp"
                }
                alt={product.title}
            />
            <ContentCardContent>
                <ContentCardHeader>{product.title}</ContentCardHeader>
                <div className="flex items-center justify-between gap-2 mb-4">
                    <Badge variant="outline">
                        {product.type.toLowerCase() ===
                        Constants.CourseType.COURSE ? (
                            <BookOpen className="h-4 w-4 mr-1" />
                        ) : (
                            <Download className="h-4 w-4 mr-1" />
                        )}
                        {localizeProductType(product.type)}
                    </Badge>
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    {product.privacy?.toLowerCase() ===
                                    Constants.ProductAccessType.PUBLIC ? (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </TooltipTrigger>
                                <TooltipContent>
                                    {product.privacy?.toLowerCase() ===
                                    Constants.ProductAccessType.PUBLIC
                                        ? finalUiText["Public"]
                                        : finalUiText["Hidden"]}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    {product.published ? (
                                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <CircleDashed className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </TooltipTrigger>
                                <TooltipContent>
                                    {product.published
                                        ? finalUiText["Published"]
                                        : finalUiText["Draft"]}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                        <span>
                            {finalUiText["sales"]}：
                            <span className="text-base">
                                {getSymbolFromCurrency(
                                    siteinfo.currencyISOCode || "USD",
                                )}{" "}
                            </span>
                            {(product.sales ?? 0).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        <span>
                            {(product.customers ?? 0).toLocaleString()}{" "}
                            {finalUiText["customers"]}
                        </span>
                    </div>
                </div>
            </ContentCardContent>
        </ContentCard>
    );
}

function ProductRow({ product }: DashboardProductProps) {
    const siteinfo = useContext(SiteInfoContext);
    const isPublic =
        product.privacy?.toLowerCase() === Constants.ProductAccessType.PUBLIC;
    const AccessIcon = isPublic ? Eye : EyeOff;
    const PublicationIcon = product.published ? CheckCircle : CircleDashed;
    return (
        <li>
            <Link
                href={`/dashboard/product/${product.courseId}`}
                className="grid grid-cols-[5.5rem_minmax(0,1fr)_1rem] items-center gap-3 p-3 transition-colors hover:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2 sm:grid-cols-[7.5rem_minmax(0,1fr)_1rem] sm:gap-4 sm:p-4"
            >
                <ContentCardImage
                    className="overflow-hidden rounded-md bg-muted"
                    src={
                        product.featuredImage?.file ||
                        "/courselit_backdrop_square.webp"
                    }
                    alt=""
                />
                <div className="min-w-0 sm:flex sm:items-center sm:justify-between sm:gap-5">
                    <div className="min-w-0">
                        <h2 className="break-words text-base font-semibold sm:text-lg">
                            {product.title}
                        </h2>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span>{localizeProductType(product.type)}</span>
                            <span className="inline-flex items-center gap-1">
                                <AccessIcon size={14} aria-hidden="true" />
                                {isPublic
                                    ? finalUiText["Public"]
                                    : finalUiText["Hidden"]}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <PublicationIcon size={14} aria-hidden="true" />
                                {product.published
                                    ? finalUiText["Published"]
                                    : finalUiText["Draft"]}
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground sm:mt-0 sm:shrink-0 sm:flex-col sm:items-end">
                        <span className="tabular-nums">
                            {finalUiText["sales"]}：
                            {getSymbolFromCurrency(
                                siteinfo.currencyISOCode || "USD",
                            )}{" "}
                            {(product.sales ?? 0).toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1 tabular-nums">
                            <Users size={14} aria-hidden="true" />
                            {(product.customers ?? 0).toLocaleString()}{" "}
                            {finalUiText["customers"]}
                        </span>
                    </div>
                </div>
                <ChevronRight
                    size={16}
                    className="text-muted-foreground"
                    aria-hidden="true"
                />
            </Link>
        </li>
    );
}

function SkeletonList() {
    return (
        <div data-admin-surface="panel" className="divide-y overflow-hidden">
            {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="flex items-center gap-4 p-4">
                    <Skeleton className="aspect-video w-[5.5rem] shrink-0 sm:w-[7.5rem]" />
                    <div className="flex-1 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function SkeletonGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </div>
    );
}

// The server renders cards; React reads the browser preference after hydration.
// A memory fallback keeps the controls working when local storage is unavailable.
let fallbackView: ProductDisplayMode = "cards";
const viewListeners = new Set<() => void>();
function readView(): ProductDisplayMode {
    try {
        const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
        return saved === "list" ? "list" : "cards";
    } catch {
        return fallbackView;
    }
}
function subscribeView(listener: () => void) {
    viewListeners.add(listener);
    window.addEventListener("storage", listener);
    return () => {
        viewListeners.delete(listener);
        window.removeEventListener("storage", listener);
    };
}
function changeView(next: ProductDisplayMode) {
    fallbackView = next;
    try {
        window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
        // Optional local preference only.
    }
    viewListeners.forEach((listener) => listener());
}
function serverView(): ProductDisplayMode {
    return "cards";
}
export default function Page() {
    const view = useSyncExternalStore(subscribeView, readView, serverView);
    const searchParams = useSearchParams();
    const page = parseInt(searchParams?.get("page") || "1");
    const filter: "all" | CourseType =
        (searchParams?.get("filter") as "all" | CourseType) || "all";
    const router = useRouter();

    const filterArray = useMemo(
        () => (filter === "all" ? undefined : [filter.toUpperCase()]),
        [filter],
    );

    const { products, loading, totalPages } = useProducts(
        page,
        ITEMS_PER_PAGE,
        filterArray,
    );

    const handleFilterChange = useCallback(
        (value: "all" | CourseType) => {
            router.push(
                `/dashboard/products?${value !== "all" ? `filter=${value}` : ""}`,
            );
        },
        [router],
    );

    const handlePageChange = useCallback(
        (value: number) => {
            router.push(
                `/dashboard/products?page=${value}${filter !== "all" ? `&filter=${filter}` : ""}`,
            );
        },
        [filter, router],
    );

    return (
        <DashboardContent
            breadcrumbs={breadcrumbs}
            permissions={[
                permissions.manageAnyCourse,
                permissions.manageCourse,
            ]}
        >
            <div className="flex flex-wrap justify-between items-start gap-4">
                <h1 className="text-4xl font-semibold">
                    {MANAGE_COURSES_PAGE_HEADING}
                </h1>
                <div>
                    <Link href="/dashboard/products/new">
                        <Button>{BTN_NEW_PRODUCT}</Button>
                    </Link>
                </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Select value={filter} onValueChange={handleFilterChange}>
                    <SelectTrigger
                        aria-label={productDisplayText.filter}
                        className="w-[140px] sm:w-[180px]"
                    >
                        <SelectValue placeholder={productDisplayText.filter} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">
                            {finalUiText["All"]}
                        </SelectItem>
                        {[
                            Constants.CourseType.COURSE,
                            Constants.CourseType.DOWNLOAD,
                        ].map((status) => (
                            <SelectItem value={status} key={status}>
                                {localizeProductType(status)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div
                    role="group"
                    aria-label={productDisplayText.label}
                    className="inline-flex items-center gap-1 rounded-lg border bg-card p-1"
                >
                    <Button
                        type="button"
                        size="sm"
                        variant={view === "cards" ? "secondary" : "ghost"}
                        aria-label={productDisplayText.cards}
                        aria-pressed={view === "cards"}
                        onClick={() => changeView("cards")}
                    >
                        <LayoutGrid size={16} aria-hidden="true" />
                        {productDisplayText.cardsShort}
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant={view === "list" ? "secondary" : "ghost"}
                        aria-label={productDisplayText.list}
                        aria-pressed={view === "list"}
                        onClick={() => changeView("list")}
                    >
                        <List size={16} aria-hidden="true" />
                        {productDisplayText.listShort}
                    </Button>
                </div>
            </div>
            {loading ? (
                view === "cards" ? (
                    <SkeletonGrid />
                ) : (
                    <SkeletonList />
                )
            ) : (
                <>
                    {totalPages > 0 &&
                        (view === "cards" ? (
                            <section
                                aria-label={productDisplayText.cards}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {products.map((product: DashboardCourse) => (
                                    <ProductCard
                                        key={product.courseId}
                                        product={product}
                                    />
                                ))}
                            </section>
                        ) : (
                            <ul
                                aria-label={productDisplayText.list}
                                data-admin-surface="panel"
                                className="divide-y overflow-hidden"
                            >
                                {products.map((product: DashboardCourse) => (
                                    <ProductRow
                                        key={product.courseId}
                                        product={product}
                                    />
                                ))}
                            </ul>
                        ))}
                    {totalPages === 0 && <EmptyState publicView={false} />}
                </>
            )}
            {totalPages > 0 && (
                <PaginationControls
                    currentPage={page}
                    totalPages={Math.ceil(totalPages / ITEMS_PER_PAGE)}
                    onPageChange={handlePageChange}
                />
            )}

            <Resources
                links={[
                    {
                        href: "https://docs.courselit.app/en/courses/introduction/",
                        text: finalUiText["Create a course"],
                    },
                    {
                        href: "https://docs.courselit.app/en/downloads/introduction/",
                        text: finalUiText["Create a digital download"],
                    },
                ]}
            />
        </DashboardContent>
    );
}
