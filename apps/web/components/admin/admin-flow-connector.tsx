interface AdminFlowConnectorProps {
    label: string;
    merge?: boolean;
}
/** Shared process connector: several entrances converge before the next step. */
export default function AdminFlowConnector({
    label,
    merge = false,
}: AdminFlowConnectorProps) {
    return (
        <div
            className="admin-flow-connector"
            data-merge={merge ? "true" : undefined}
            aria-hidden="true"
        >
            {merge && <span className="admin-flow-bridge" />}
            <span className="admin-flow-label">{label}</span>
            <span className="admin-flow-arrow">
                <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
                    <path
                        d="M10 3v17m-6-6 6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>
        </div>
    );
}
