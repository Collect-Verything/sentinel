import {Grid, Slide} from "@mui/material";
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
import type {Configs, Server} from "../../common/types/backend";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

const Transition = forwardRef(function Transition(
    props: TransitionProps & { children: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface DialogConfigProps {
    selectedServerIds: GridRowId[];
}

// TODO :
// Display la liste des serveur par id avec leurs IP et leurs provider,
// Display dans une liste qui peut etre deroulante pour en mettre plein, pouvoir supprimer de la liste display des serveur de la liste de config
// Selectino une config
// COnfigurer
// Envoyer dans tasks panel

export const DialogConfig = ({selectedServerIds}: DialogConfigProps) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [servers, setServers] = useState<Server[]>([]);
    const [configs, setConfigs] = useState<Configs[]>([]);

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleRemove = (idServer: number) => {
        if (servers) setServers(servers.filter(s => s.id !== idServer))
    }

    useEffect(() => {
        if (!open) return;

        setLoading(true);
        setServers([]);
        setConfigs([]);

        Promise.all([
            apiPost(`${SERVERS_PATH}/list-id`, {selectedServerIds: selectedServerIds as number[]}),
            apiGet(`${CONFIGS_PATH}`),
        ])
            .then(([serversRes, configsRes]) => {
                setServers(serversRes ?? []);
                setConfigs(configsRes ?? []);
            })
            .catch((err) => {
                console.error("[DialogConfig] fetch error:", err);
                setServers([]);
                setConfigs([]);
            })
            .finally(() => setLoading(false));
    }, [open, selectedServerIds]);

    return (
        <Grid>
            <Button
                variant="outlined"
                onClick={handleClickOpen}
                sx={{backgroundColor: "white", mb: 1}}
            >
                <PermDataSettingIcon color="warning"/>
            </Button>

            <Dialog
                open={open}
                onClose={handleClose}
                slots={{
                    transition: Transition,
                }}
                aria-describedby="dialog-config-servers"
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>Configurer les serveurs sélectionnés</DialogTitle>

                {loading ? (
                    <Box sx={{display: "flex", justifyContent: "center", py: 4}}>
                        <CircularProgress/>
                    </Box>
                ) : (
                    <Grid>
                        <DialogContent>
                            <DialogContentText id="dialog-config-servers" sx={{mb: 2}}>
                                Liste des serveurs que vous souhaitez configurer
                            </DialogContentText>

                            <DialogContentText component="div" sx={{mb: 2}}>

                                {servers && servers.length > 0 ? (
                                    <Box sx={{bgcolor: "background.paper", overflow: "auto", maxHeight: 300, overflowY: "auto",}}>
                                        {servers.map((s) => (
                                            <ListItem
                                                disablePadding
                                                secondaryAction={
                                                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemove(s.id)}>
                                                        <CloseIcon color="error"/>
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemButton sx={{py: 1.5}}>
                                                    <Grid container columnSpacing={2} rowSpacing={0.5} alignItems="center">
                                                        {/* Id */}
                                                        <Grid>
                                                            <Typography variant="body2" color="text.secondary">ID</Typography>
                                                            <Typography variant="subtitle2" fontWeight={600}>{s.id}</Typography>
                                                        </Grid>

                                                        {/* IP */}
                                                        <Grid>
                                                            <Typography variant="body2" color="text.secondary">IP</Typography>
                                                            <Typography variant="body1"
                                                                        sx={{fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace)"}}>
                                                                {s.serverIp}
                                                            </Typography>
                                                        </Grid>

                                                        {/* Provider */}
                                                        <Grid>
                                                            <Typography variant="body2" color="text.secondary">Provider</Typography>
                                                            <Typography variant="body1">{s.provider}</Typography>
                                                        </Grid>

                                                        {/* Badget état (facultatif) */}
                                                        <Grid>
                                                            <Box
                                                                sx={{
                                                                    px: 1,
                                                                    py: 0.5,
                                                                    borderRadius: 1,
                                                                    bgcolor: "orange",
                                                                    fontSize: 12,
                                                                }}
                                                            >
                                                                Pending
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </ListItemButton>
                                            </ListItem>

                                        ))}
                                    </Box>
                                ) : (
                                    <em>Aucun serveur trouvé pour la sélection.</em>
                                )}
                            </DialogContentText>

                            <DialogContentText sx={{mb: 1}}>
                                Sélectionner une configuration à appliquer aux serveurs
                            </DialogContentText>

                            <DialogContentText component="div">
                                {configs && configs.length > 0 ? (
                                    <ul style={{margin: 0, paddingLeft: 18}}>
                                        {configs.map((c) => (
                                            <li key={c.id}>Config #{c.id}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <em>Aucune configuration disponible.</em>
                                )}
                            </DialogContentText>
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={handleClose}>Annuler</Button>
                            <Button onClick={handleClose} variant="contained" disabled={servers!.length === 0}>Appliquer</Button>
                        </DialogActions>
                    </Grid>
                )}
            </Dialog>
        </Grid>
    );
};
