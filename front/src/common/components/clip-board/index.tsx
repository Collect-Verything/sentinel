import {Alert, Box, IconButton, Snackbar, Tooltip} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {type ReactNode, useState} from "react";

type CopyToClipboardProps = {
    text: string;
    tooltip?: string;
    onCopiedText?: string;
    children?: ReactNode;
};

export const CopyToClipboard = ({text, tooltip = "Copier", onCopiedText = "Copié dans le presse-papiers", children,}: CopyToClipboardProps) => {
    const [open, setOpen] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setOpen(true);
        } catch {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            setOpen(true);
        }
    };

    return (
        <Box
            sx={{
                position: "relative",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                p: 2,
                pt: 4,
                bgcolor: "background.paper",
                fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                minWidth: 0,
                maxWidth: "100%",
                overflow: "hidden",
            }}
        >
            <Box sx={{position: "absolute", top: 8, right: 8}}>
                <Tooltip title={tooltip}>
                    <IconButton size="small" onClick={handleCopy} aria-label="Copier">
                        <ContentCopyIcon fontSize="small"/>
                    </IconButton>
                </Tooltip>
            </Box>

            {children ?? (
                <Box
                    sx={{
                        mt: 0,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: "background.default",
                        maxHeight: 260,
                        maxWidth: "100%",
                        overflowX: "auto",
                        overflowY: "auto",
                        scrollbarWidth: "thin",
                        "&::-webkit-scrollbar": {height: 8, width: 8},
                        "&::-webkit-scrollbar-thumb": {backgroundColor: "rgba(0,0,0,.3)", borderRadius: 8},
                        "&::-webkit-scrollbar-track": {backgroundColor: "transparent"},
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    <Box
                        component="pre"
                        sx={{
                            m: 0,
                            whiteSpace: "pre",
                            wordBreak: "normal",
                            overflowWrap: "normal",
                            display: "inline-block",
                            lineHeight: 1.4,
                            pr: 6,
                        }}
                    >
                        {text}
                    </Box>
                </Box>
            )}

            <Snackbar
                open={open}
                autoHideDuration={2000}
                onClose={() => setOpen(false)}
                anchorOrigin={{vertical: "bottom", horizontal: "center"}}
            >
                <Alert severity="success" variant="filled" sx={{width: "100%"}}>
                    {onCopiedText}
                </Alert>
            </Snackbar>
        </Box>
    );
}

