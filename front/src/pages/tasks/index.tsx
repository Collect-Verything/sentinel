import "./index.css"
import {
    AppBar,
    Avatar,
    Button,
    Chip,
    Dialog,
    Divider,
    Fab,
    Grid,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Slide,
    type SlideProps,
    Stack,
    Toolbar,
    Tooltip,
    Typography
} from "@mui/material";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { forwardRef, type ReactElement, type Ref, useMemo } from "react";
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { useTasks } from "../../contexts/TasksContext.tsx";

export const Transition = forwardRef(function Transition(
    props: SlideProps & { children: ReactElement<unknown> },
    ref: Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));
export const formatDateTime = (ts?: number) =>
    ts ? new Intl.DateTimeFormat(undefined, { dateStyle: "short", timeStyle: "medium" }).format(ts) : "—";

const percentFromProgress = (p?: number | { step: number; total: number }) => {
    if (typeof p === "number") return clamp(p);
    if (p && p.total) return clamp(Math.round((p.step / p.total) * 100));
    return 0;
};

export const Tasks = () => {
    const { tasks = [], removeTask, clearCompleted, panel, setPanel } = useTasks();

    const handleOpen = () => setPanel(true);
    const handleClose = () => setPanel(false);

    const displayTasks = useMemo(() => {
        return tasks.map((t: any) => {
            let percent = percentFromProgress(t.progress);
            if (t.state === "completed") percent = 100;
            if (t.state === "failed") percent = 0;
            return { ...t, percent };
        });
    }, [tasks]);

    const hasCompleted = useMemo(() => tasks.some((t) => t.state === "completed"), [tasks]);

    const renderStatusChip = (state: typeof displayTasks[number]["state"], error?: string) => {
        switch (state) {
            case "queued":
                return <Chip size="small" color="default" variant="outlined" icon={<HourglassTopIcon />} label="En file" />;
            case "running":
                return <Chip size="small" color="info" icon={<PlayCircleIcon />} label="En cours" />;
            case "completed":
                return <Chip size="small" color="success" icon={<CheckCircleIcon />} label="Terminé" />;
            case "failed":
                return <Chip size="small" color="error" icon={<ErrorIcon />} label={error ? `Échec: ${error}` : "Échec"} />;
            case "not_found":
                return <Chip size="small" color="warning" variant="outlined" label="Introuvable" />;
            default:
                return <Chip size="small" variant="outlined" label="Inconnu" />;
        }
    };

    const renderAvatar = (state: typeof displayTasks[number]["state"]) => {
        switch (state) {
            case "queued":
                return <Avatar sx={{ bgcolor: "action.hover" }}><HourglassTopIcon /></Avatar>;
            case "running":
                return <Avatar sx={{ bgcolor: "info.light", color: "info.contrastText" }}><PlayCircleIcon /></Avatar>;
            case "completed":
                return <Avatar sx={{ bgcolor: "success.main" }}><CheckCircleIcon /></Avatar>;
            case "failed":
                return <Avatar sx={{ bgcolor: "error.main" }}><ErrorIcon /></Avatar>;
            default:
                return <Avatar />;
        }
    };

    return (
        <>
            <Tooltip title={panel ? "Fermer les tâches" : "Ouvrir les tâches"}>
                <Fab
                    size="small"
                    color="default"
                    onClick={panel ? handleClose : handleOpen}
                    sx={{ position: "fixed", bottom: 16, right: 16, zIndex: (t) => t.zIndex.fab }}
                >
                    {panel ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                </Fab>
            </Tooltip>

            <Dialog fullWidth open={panel} onClose={handleClose} TransitionComponent={Transition}>
                <AppBar sx={{ position: "relative" }} className="top-dial">
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                            <ExpandMoreIcon />
                        </IconButton>
                        <Typography variant="h6" component="div">
                            Vos tâches
                        </Typography>
                    </Toolbar>
                </AppBar>

                <List sx={{ py: 0 }}>
                    {displayTasks.length === 0 && (
                        <>
                            <Divider />
                            <Stack alignItems="center" justifyContent="center" sx={{ py: 6, color: "text.secondary" }} spacing={1}>
                                <HourglassTopIcon />
                                <Typography>Aucune tâche pour l’instant</Typography>
                            </Stack>
                        </>
                    )}

                    {displayTasks.map((t: any) => {
                        const secondary = (
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                {renderStatusChip(t.state, t.error)}
                                <Typography component="span" variant="body2" color="text.secondary">
                                    Créée&nbsp;: {formatDateTime(t.createdAt)}
                                </Typography>
                                {t.updatedAt && (
                                    <Typography component="span" variant="body2" color="text.secondary">
                                        Maj&nbsp;: {formatDateTime(t.updatedAt)}
                                    </Typography>
                                )}
                                {t.progress && typeof t.progress === "object" && t.progress.total && (
                                    <Typography component="span" variant="body2" color="text.secondary">
                                        Étape {t.progress.step}/{t.progress.total}
                                        {t.progress.info ? ` — ${t.progress.info}` : ""}
                                    </Typography>
                                )}
                                {t.error && (
                                    <Typography component="span" variant="body2" color="error">
                                        {t.error}
                                    </Typography>
                                )}
                            </Stack>
                        );

                        return (
                            <Grid key={t.id}>
                                <ListItem
                                    alignItems="flex-start"
                                    secondaryAction={
                                        <Tooltip title="Retirer de la liste">
                                            <IconButton edge="end" onClick={() => removeTask(t.id)}>
                                                <CloseIcon color="error" />
                                            </IconButton>
                                        </Tooltip>
                                    }
                                >
                                    <ListItemAvatar>{renderAvatar(t.state)}</ListItemAvatar>

                                    <ListItemText
                                        primary={
                                            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                                                <Typography variant="body1" fontWeight={600}>
                                                    Tâche&nbsp;#{t.id}
                                                </Typography>
                                            </Stack>
                                        }
                                        secondary={
                                            <Stack spacing={1} sx={{ mt: 0.5 }}>
                                                {secondary}

                                                {(t.state === "queued" || t.state === "running") && (
                                                    <LinearProgress variant="determinate" value={t.percent ?? 0} />
                                                )}

                                                {t.state === "completed" && (
                                                    <Chip
                                                        icon={<CheckCircleIcon />}
                                                        color="success"
                                                        label="Traitement terminé"
                                                        sx={{ alignSelf: "flex-start" }}
                                                    />
                                                )}

                                                {t.state === "failed" && (
                                                    <Chip
                                                        icon={<ErrorIcon />}
                                                        color="error"
                                                        label={t.error ? `Échec — ${t.error}` : "Échec du traitement"}
                                                        sx={{ alignSelf: "flex-start" }}
                                                    />
                                                )}
                                            </Stack>
                                        }
                                    />
                                </ListItem>
                                <Divider component="li" />
                            </Grid>
                        );
                    })}

                    <Grid textAlign="center" my={2}>
                        <Button
                            variant="outlined"
                            onClick={clearCompleted}
                            disabled={!hasCompleted}
                        >
                            Nettoyer les tâches terminées
                        </Button>
                    </Grid>
                </List>
            </Dialog>
        </>
    );
};
