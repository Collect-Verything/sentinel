import {Alert, AlertTitle, Button, Collapse, Divider, Grid, IconButton, Stack, Tooltip,} from "@mui/material";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import {type ReactNode, useCallback, useState} from "react";

type ErrorTemplateProps = {
    title?: string;
    message?: ReactNode;
    details?: ReactNode;
    errorId?: string;
    onRetry?: () => void;
    showReload?: boolean;
    severity?: "error" | "warning" | "info" | "success";
};

export const ErrorTemplate = ({
                                  title = "Error",
                                  message = "This is an error Alert with a scary title. Keep cool and take a coffee",
                                  details,
                                  errorId,
                                  onRetry,
                                  showReload = false,
                                  severity = "error",
                              }: ErrorTemplateProps) => {
    const [openDetails, setOpenDetails] = useState(false);

    const copyId = useCallback(() => {
        if (!errorId) return;
        navigator.clipboard?.writeText(errorId);
    }, [errorId]);
    return (
        <Grid container justifyContent="center" alignItems="center" height="80vh">
            <Alert severity={severity} icon={<ErrorOutlineRoundedIcon/>}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <AlertTitle>{title}</AlertTitle>
                    {errorId && (
                        <Tooltip title="Copier l’ID d’erreur">
                            <span>
                              <IconButton size="small" onClick={copyId}>
                                <ContentCopyRoundedIcon fontSize="small"/>
                              </IconButton>
                            </span>
                        </Tooltip>
                    )}
                </Stack>

                {message}

                {(onRetry || showReload) && (
                    <Stack direction="row" spacing={1} mt={1}>
                        {onRetry && (
                            <Button variant="contained" color="error" size="small" startIcon={<RefreshRoundedIcon/>} onClick={onRetry}>
                                Réessayer
                            </Button>
                        )}
                        {showReload && (
                            <Button variant="outlined" size="small" onClick={() => window.location.reload()}>
                                Recharger la page
                            </Button>
                        )}
                    </Stack>
                )}

                {(details || errorId) && (
                    <>
                        <Divider style={{margin: "8px 0"}}/>
                        <Button variant="text" size="small" onClick={() => setOpenDetails((v) => !v)}>
                            {openDetails ? "Masquer les détails" : "Afficher les détails"}
                        </Button>
                        <Collapse in={openDetails}>
                            <div>
                                {errorId && (
                                    <div>
                                        <strong>ID:</strong> {errorId}
                                    </div>
                                )}
                                {details}
                            </div>
                        </Collapse>
                    </>
                )}
            </Alert>
        </Grid>
    );
};