import {Divider, FormControl, Grid, InputLabel, Select, type SelectChangeEvent, Slide} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import type {TransitionProps} from "@mui/material/transitions";
import {forwardRef, type ReactElement, type Ref, useEffect, useState} from "react";
import PermDataSettingIcon from "@mui/icons-material/PermDataSetting";
import type {GridRowId} from "@mui/x-data-grid";
import {apiGet, apiPost} from "../../common/utils/web";
import {CONFIGS_PATH, SERVERS_PATH} from "../../common/utils/web/const.ts";
import type {ConfigInterface, ServerInterface} from "../../common/types/backend";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import MenuItem from "@mui/material/MenuItem";
import {useTasks} from "../../contexts/TasksContext.tsx";

const Transition = forwardRef(function Transition(
    props: TransitionProps & { children: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface DialogConfigProps {
    selectedServerIds: GridRowId[];
}

export const DialogConfig = ({selectedServerIds}: DialogConfigProps) => {

    const {startTask, setPanel} = useTasks();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [servers, setServers] = useState<ServerInterface[]>([]);
    const [configs, setConfigs] = useState<ConfigInterface[]>([]);
    const [configSelected, setConfigSelected] = useState<number | "">("");
    const gridCols = "20px 100px 200px 1fr 90px";

    type ServerId = ServerInterface["id"];
    const [removedIds, setRemovedIds] = useState<Set<ServerId>>(new Set());

    const toggleRemoved = (id: ServerId) => {
        setRemovedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const visibleServers = (servers ?? []).filter((s) => !removedIds.has(s.id));
    const removedServers = (servers ?? []).filter((s) => removedIds.has(s.id));

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleConfig = (event: SelectChangeEvent<typeof configSelected>) => {
        const value = event.target.value;
        setConfigSelected(value === "" ? "" : Number(value));
    };

    const handleSendConfig = () => {
        const serverIds = visibleServers.map((s) => s.id);
        startTask(Number(configSelected), serverIds).then((res) => {
            if (res) {
                handleClose()
                setPanel(true)
            }
        }).catch(console.error);
    }

    useEffect(() => {
        if (!open) return;

        setLoading(true);
        setServers([]);
        setConfigs([]);
        setRemovedIds(new Set());

        Promise.all([
            apiPost(`${SERVERS_PATH}/list-id`, {selectedServerIds: selectedServerIds as number[]}),
            apiGet(`${CONFIGS_PATH}`),
        ]).then(([serversRes, configsRes]) => {
            setServers(serversRes ?? []);
            setConfigs(configsRes ?? []);
        }).catch((err) => {
            console.error("[DialogConfig] fetch error:", err);
            setServers([]);
            setConfigs([]);
        }).finally(() => setLoading(false));
    }, [open, selectedServerIds]);

    const applyDisabled = visibleServers.length === 0 || configSelected === "";

    return (
        <Grid>
            <Button variant="outlined" onClick={handleClickOpen} sx={{backgroundColor: "white"}}>
                <PermDataSettingIcon color="warning"/>
            </Button>

            <Dialog
                open={open}
                onClose={handleClose}
                slots={{transition: Transition}}
                aria-describedby="dialog-config-servers"
                fullWidth
                maxWidth="md"
            >
                <DialogTitle sx={{textAlign: "center"}}>Configurer les serveurs sélectionnés</DialogTitle>

                {loading ? (
                    <Box sx={{display: "flex", justifyContent: "center", py: 4}}>
                        <CircularProgress/>
                    </Box>
                ) : (
                    <Grid>
                        <DialogContent>
                            <DialogContentText id="dialog-config-servers" sx={{mb: 2, fontWeight: 1, textAlign: "center"}}>
                                Liste des serveurs que vous souhaitez configurer :
                            </DialogContentText>

                            <DialogContentText component="div" sx={{mb: 2}}>
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: gridCols,
                                        alignItems: "center",
                                        columnGap: 2,
                                        px: 2,
                                        py: 1,
                                        borderBottom: "1px solid",
                                        borderColor: "divider",
                                        position: "sticky",
                                        top: 0,
                                        bgcolor: "background.paper",
                                        zIndex: 1,
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        #
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        ID
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        IP
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Provider
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Status
                                    </Typography>
                                </Box>

                                {servers && servers.length > 0 ? (
                                    <Box sx={{maxHeight: 300, overflowY: "auto", bgcolor: "background.paper"}}>
                                        {/* --- Liste visible --- */}
                                        {visibleServers.map((s, idx) => (
                                            <ListItem
                                                key={s.id}
                                                disablePadding
                                                secondaryAction={
                                                    <IconButton edge="end" aria-label="remove" onClick={() => toggleRemoved(s.id)}>
                                                        <CloseIcon color="error"/>
                                                    </IconButton>
                                                }
                                                sx={{pr: 7}}
                                            >
                                                <ListItemButton sx={{py: 1}}>
                                                    <Box
                                                        sx={{
                                                            display: "grid",
                                                            gridTemplateColumns: gridCols,
                                                            alignItems: "center",
                                                            columnGap: 2,
                                                            width: "100%",
                                                            transition: "opacity .2s ease, filter .2s ease",
                                                        }}
                                                    >
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {idx + 1}
                                                        </Typography>
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {s.id}
                                                        </Typography>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                fontFamily:
                                                                    "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace)",
                                                                whiteSpace: "nowrap",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                            }}
                                                            title={s.serverIp}
                                                        >
                                                            {s.serverIp}
                                                        </Typography>
                                                        <Typography variant="body1">{s.provider}</Typography>
                                                        <Box
                                                            sx={{
                                                                justifySelf: "start",
                                                                px: 1,
                                                                py: 0.5,
                                                                borderRadius: 1,
                                                                bgcolor: "warning.light",
                                                                color: "warning.contrastText",
                                                                fontSize: 12,
                                                            }}
                                                        >
                                                            Pending
                                                        </Box>
                                                    </Box>
                                                </ListItemButton>
                                            </ListItem>
                                        ))}

                                        {removedServers.length > 0 && (
                                            <>
                                                <Divider sx={{my: 1}}/>
                                                <Box sx={{px: 2, pb: 0.5}}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Retirés ({removedServers.length})
                                                    </Typography>
                                                </Box>

                                                {removedServers.map((s) => (
                                                    <ListItem
                                                        key={s.id}
                                                        disablePadding
                                                        secondaryAction={
                                                            <IconButton edge="end" aria-label="restore" onClick={() => toggleRemoved(s.id)}>
                                                                <AddIcon color="success"/>
                                                            </IconButton>
                                                        }
                                                        sx={{pr: 7}}
                                                    >
                                                        <ListItemButton sx={{py: 1}}>
                                                            <Box
                                                                sx={{
                                                                    display: "grid",
                                                                    gridTemplateColumns: gridCols,
                                                                    alignItems: "center",
                                                                    columnGap: 2,
                                                                    width: "100%",
                                                                    opacity: 0.5,
                                                                    filter: "grayscale(1)",
                                                                    transition: "opacity .2s ease, filter .2s ease",
                                                                }}
                                                            >
                                                                <Typography variant="subtitle2" fontWeight={600}>–</Typography>
                                                                <Typography variant="subtitle2" fontWeight={600}>{s.id}</Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        fontFamily:
                                                                            "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace)",
                                                                        whiteSpace: "nowrap",
                                                                        overflow: "hidden",
                                                                        textOverflow: "ellipsis",
                                                                    }}
                                                                    title={s.serverIp}
                                                                >
                                                                    {s.serverIp}
                                                                </Typography>
                                                                <Typography variant="body2">{s.provider}</Typography>
                                                                <Box
                                                                    sx={{
                                                                        justifySelf: "start",
                                                                        px: 1,
                                                                        py: 0.5,
                                                                        borderRadius: 1,
                                                                        bgcolor: "action.hover",
                                                                        color: "text.secondary",
                                                                        fontSize: 12,
                                                                    }}
                                                                >
                                                                    Retiré
                                                                </Box>
                                                            </Box>
                                                        </ListItemButton>
                                                    </ListItem>
                                                ))}
                                            </>
                                        )}
                                    </Box>
                                ) : (
                                    <em>Aucun serveur trouvé pour la sélection.</em>
                                )}
                            </DialogContentText>

                            <DialogContentText sx={{mb: 1, fontWeight: 1, textAlign: "center"}}>
                                Sélectionner une configuration à appliquer aux serveurs :
                            </DialogContentText>

                            <DialogContentText component="div" sx={{textAlign: "center"}}>
                                {configs && configs.length > 0 ? (
                                    <FormControl sx={{mt: 2, minWidth: 240}}>
                                        <InputLabel id="config-select-label">Config</InputLabel>
                                        <Select
                                            labelId="config-select-label"
                                            id="config-select"
                                            value={configSelected}
                                            onChange={handleConfig}
                                            label="Config"
                                        >
                                            <MenuItem value="">
                                                <em>Aucune</em>
                                            </MenuItem>
                                            {configs.map((c) => (
                                                <MenuItem key={c.id} value={c.id}>
                                                    {c.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                ) : (
                                    <em>Aucune configuration disponible.</em>
                                )}
                            </DialogContentText>
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={handleClose}>Annuler</Button>
                            <Button onClick={handleSendConfig} variant="contained" disabled={applyDisabled}>
                                Appliquer
                            </Button>
                        </DialogActions>
                    </Grid>
                )}
            </Dialog>
        </Grid>
    );
};
