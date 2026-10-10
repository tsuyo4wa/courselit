import { finalUiText } from "../../../ui-strings";
import { useState } from "react";
import { Item } from "../settings";
import {
    Button,
    Form,
    FormField,
    Tooltip,
} from "@courselit/components-library";
import { Address } from "@courselit/common-models";
import { Checkbox } from "@courselit/components-library";
import { Editor } from "@courselit/text-editor";

interface ItemProps {
    item: Item;
    index: number;
    onChange: (newItemData: Item) => void;
    onDelete: () => void;
    address: Address;
    pricingSwitcherEnabled?: boolean;
}

export default function ItemEditor({
    item,
    onChange,
    onDelete,
    address,
    pricingSwitcherEnabled = false,
}: ItemProps): JSX.Element {
    const [title, setTitle] = useState(item.title);
    const [description, setDescription] = useState(item.description);
    const [price, setPrice] = useState(item.price);
    const [priceYearly, setPriceYearly] = useState(item.priceYearly);
    const [features, setFeatures] = useState(item.features);
    const [action, setAction] = useState(item.action);
    const [primary, setPrimary] = useState(item.primary);

    const itemChanged = () =>
        onChange({
            title,
            description,
            price,
            priceYearly,
            features,
            action,
            primary,
        });

    return (
        <Form
            className="flex flex-col gap-4 mb-4"
            onSubmit={(e) => e.preventDefault()}
        >
            <FormField
                label={finalUiText["Title"]}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <div>
                <p className="mb-1 font-medium">{finalUiText["Description"]}</p>
                <Editor
                    initialContent={description}
                    onChange={(state: any) => setDescription(state)}
                    showToolbar={false}
                    url={address.backend}
                />
            </div>
            <FormField
                label={finalUiText["Price"]}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
            />
            {pricingSwitcherEnabled && (
                <FormField
                    label={finalUiText["Yearly price"]}
                    value={priceYearly}
                    onChange={(e) => setPriceYearly(e.target.value)}
                />
            )}
            <FormField
                label={finalUiText["Features"]}
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
            />
            <div className="flex justify-between">
                <div className="flex grow items-center gap-1">
                    <p className="font-medium">
                        {finalUiText["Is recommended"]}
                    </p>
                </div>
                <Checkbox
                    checked={primary}
                    onChange={(value: boolean) => setPrimary(value)}
                />
            </div>
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-medium">
                    {finalUiText["Call to action"]}
                </h2>
                <FormField
                    label={finalUiText["Label"]}
                    value={action.label}
                    onChange={(e) =>
                        setAction(
                            Object.assign({}, action, {
                                label: e.target.value,
                            }),
                        )
                    }
                />
                <FormField
                    label={finalUiText["Href"]}
                    value={action.href}
                    onChange={(e) =>
                        setAction(
                            Object.assign({}, action, {
                                href: e.target.value,
                            }),
                        )
                    }
                />
                {pricingSwitcherEnabled && (
                    <FormField
                        label={finalUiText["Href (Yearly)"]}
                        value={action.yearlyHref}
                        onChange={(e) =>
                            setAction(
                                Object.assign({}, action, {
                                    yearlyHref: e.target.value,
                                }),
                            )
                        }
                    />
                )}
            </div>
            <div className="flex justify-between">
                <Tooltip title={finalUiText["Delete"]}>
                    <Button
                        component="button"
                        onClick={onDelete}
                        variant="soft"
                    >
                        {finalUiText["Delete"]}
                    </Button>
                </Tooltip>
                <Tooltip title={finalUiText["Go back"]}>
                    <Button component="button" onClick={itemChanged}>
                        {finalUiText["Done"]}
                    </Button>
                </Tooltip>
            </div>
        </Form>
    );
}
