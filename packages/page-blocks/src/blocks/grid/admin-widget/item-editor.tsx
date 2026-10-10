import { finalUiText } from "../../../ui-strings";
import React, { useState } from "react";
import { Item, SvgStyle } from "../settings";
import {
    MediaSelector,
    Button,
    Form,
    FormField,
    Tooltip,
    Select,
} from "@courselit/components-library";
import {
    Address,
    Media,
    Profile,
    VerticalAlignment,
} from "@courselit/common-models";
import SvgEditor from "./svg-editor";
import { Editor } from "@courselit/text-editor";

interface ItemProps {
    item: Item;
    svgStyle: SvgStyle;
    index: number;
    onChange: (newItemData: Item) => void;
    onDelete: () => void;
    address: Address;
    profile: Profile;
}

export default function ItemEditor({
    item,
    svgStyle,
    onChange,
    onDelete,
    address,
    profile,
}: ItemProps): JSX.Element {
    const [title, setTitle] = useState(item.title);
    const [description, setDescription] = useState(item.description);
    const [buttonCaption, setButtonCaption] = useState(item.buttonCaption);
    const [buttonAction, setButtonAction] = useState(item.buttonAction);
    const [media, setMedia] = useState<Partial<Media>>(item.media);
    const [mediaAlignment, setMediaAlignment] = useState<VerticalAlignment>(
        item.mediaAlignment || "bottom",
    );
    const [svgText, setSvgText] = useState(item.svgText);

    const itemChanged = () =>
        onChange({
            title,
            description,
            buttonCaption,
            buttonAction,
            media,
            mediaAlignment,
            svgText,
        });

    return (
        <div className="flex flex-col">
            <Form onSubmit={(e) => e.preventDefault()}>
                <FormField
                    label={finalUiText["Title"]}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <div>
                    <p className="mb-1 font-medium">
                        {finalUiText["Description"]}
                    </p>
                    <Editor
                        initialContent={description}
                        onChange={(state: any) => setDescription(state)}
                        showToolbar={false}
                        url={address.backend}
                    />
                </div>
                <FormField
                    label={finalUiText["Button Text"]}
                    value={buttonCaption}
                    onChange={(e) => setButtonCaption(e.target.value)}
                />
                <FormField
                    label={finalUiText["Button Action"]}
                    value={buttonAction}
                    onChange={(e) => setButtonAction(e.target.value)}
                />
                <p className="mb-1 font-medium">{finalUiText["Icon"]}</p>
                <SvgEditor
                    svgText={svgText}
                    svgStyle={svgStyle}
                    onSvgChange={(svgText: string) => setSvgText(svgText)}
                />
                <MediaSelector
                    title={finalUiText["Media"]}
                    src={media && media.thumbnail}
                    srcTitle={media && media.originalFileName}
                    profile={profile}
                    address={address}
                    onSelection={(media: Media) => {
                        if (media) {
                            setMedia(media);
                        }
                    }}
                    strings={{}}
                    access="public"
                    mediaId={media?.mediaId}
                    onRemove={() => {
                        setMedia({});
                    }}
                    type="page"
                />
                <Select
                    title={finalUiText["Media alignment"]}
                    value={mediaAlignment}
                    options={[
                        { label: finalUiText["Above title"], value: "top" },
                        { label: finalUiText["Below title"], value: "bottom" },
                    ]}
                    onChange={(value: VerticalAlignment) =>
                        setMediaAlignment(value)
                    }
                />
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
        </div>
    );
}
