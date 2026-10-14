"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Constants, MembershipEntityType } from "@courselit/common-models";
import { useToast } from "@courselit/components-library";
import { useGraphQLFetch } from "@/hooks/use-graphql-fetch";
import { normalizeThankYouUrl, readThankYouUrl } from "@/lib/thank-you-url";
import { thankYouStrings } from "@/config/strings";
import {
    BUTTON_SAVE,
    BUTTON_SAVING,
    TOAST_TITLE_SUCCESS,
    TOAST_TITLE_ERROR,
} from "@ui-config/strings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { ExternalLink, Loader2, Save } from "lucide-react";

interface ThankYouSettingsProps {
    id: string;
    entityType: MembershipEntityType;
    initialUrl?: string;
}
const schema = z.object({
    url: z.string().superRefine((value, ctx) => {
        try {
            normalizeThankYouUrl(value);
        } catch {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: thankYouStrings.invalid,
            });
        }
    }),
});
type Values = z.infer<typeof schema>;

export default function ThankYouSettings({
    id,
    entityType,
    initialUrl = "",
}: ThankYouSettingsProps) {
    const saved = useRef(initialUrl);
    const current = useRef(initialUrl);
    const [savedUrl, setSavedUrl] = useState(initialUrl);
    const [dirty, setDirty] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const fetch = useGraphQLFetch();
    const form = useForm<Values>({
        resolver: zodResolver(schema),
        defaultValues: { url: initialUrl },
    });
    const configuredUrl = readThankYouUrl(savedUrl);
    async function submit(values: Values) {
        if (loading) return;
        const url = normalizeThankYouUrl(values.url);
        const isCommunity =
            entityType === Constants.MembershipEntityType.COMMUNITY;
        const query = isCommunity
            ? `mutation($id:String!,$url:String!){updateCommunity(id:$id,thankYouUrl:$url){thankYouUrl}}`
            : `mutation($id:String!,$url:String!){updateCourse(courseData:{id:$id,thankYouUrl:$url}){thankYouUrl}}`;
        setLoading(true);
        try {
            const result = await fetch
                .setPayload({ query, variables: { id, url } })
                .build()
                .exec();
            const value = isCommunity
                ? result?.updateCommunity?.thankYouUrl
                : result?.updateCourse?.thankYouUrl;
            if (value !== url) throw new Error(thankYouStrings.invalid);
            saved.current = value;
            current.current = value;
            setSavedUrl(value);
            form.reset({ url: value });
            setDirty(false);
            toast({
                title: TOAST_TITLE_SUCCESS,
                description: thankYouStrings.saved,
            });
        } catch (error) {
            toast({
                title: TOAST_TITLE_ERROR,
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }
    return (
        <section
            className="space-y-4"
            aria-labelledby={`thank-you-title-${id}`}
        >
            <h2 id={`thank-you-title-${id}`} className="text-lg font-semibold">
                {thankYouStrings.title}
            </h2>
            <p className="text-sm text-muted-foreground">
                {thankYouStrings.help}
            </p>
            <p className="text-sm" role="status">
                {configuredUrl
                    ? thankYouStrings.configured
                    : thankYouStrings.empty}
            </p>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(submit)}
                    className="space-y-4"
                >
                    <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{thankYouStrings.label}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="url"
                                        placeholder={
                                            thankYouStrings.placeholder
                                        }
                                        disabled={loading}
                                        onChange={(event) => {
                                            field.onChange(event);
                                            current.current =
                                                event.target.value;
                                            setDirty(
                                                current.current.trim() !==
                                                    saved.current,
                                            );
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex flex-wrap items-center gap-4">
                        <Button type="submit" disabled={loading || !dirty}>
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            {loading ? BUTTON_SAVING : BUTTON_SAVE}
                        </Button>
                        {configuredUrl && (
                            <a
                                href={configuredUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm underline underline-offset-4"
                            >
                                {thankYouStrings.open}
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        )}
                    </div>
                </form>
            </Form>
        </section>
    );
}
