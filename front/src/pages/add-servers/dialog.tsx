import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {type Dispatch, type SetStateAction, useEffect, useState} from "react";
import {apiGet} from "../../common/utils/web";
import {CONFIGS_PATH} from "../../common/utils/web/const.ts";
import type {ConfigInterface} from "../../common/types/backend";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import {FormControl, Grid, InputLabel, Select, type SelectChangeEvent} from "@mui/material";
import {useTasks} from "../../contexts/TasksContext.tsx";
import Typography from "@mui/material/Typography";

interface DialogConfigServersProps {
    setOpenDialog: Dispatch<SetStateAction<boolean>>
    openDialog: boolean
    handleOpenDialog: () => void
    idsServerReadyToConfig: number[]
}


export const DialogConfigServers = ({openDialog, setOpenDialog, handleOpenDialog, idsServerReadyToConfig}: DialogConfigServersProps) => {

    const {startTask, setPanel} = useTasks();
    const [configs, setConfigs] = useState<ConfigInterface[]>();
    const [configSelected, setConfigSelected] = useState<ConfigInterface>();
    const [responseConfig, setResponseConfig] = useState(false);
    const [switchTasksPanel, setSwitchTasksPanel] = useState(false);

    const handleClose = (toConsultTaskPane = false) => {
        setOpenDialog(false);
        if (toConsultTaskPane) {
            setPanel(true)
            setConfigSelected(undefined)
            setResponseConfig(false)
            setSwitchTasksPanel(false)
        }
    };


    const handleConfig = (event: SelectChangeEvent<typeof configSelected>) => {
        // @ts-ignore
        setConfigSelected(event.target.value,);
    };

    const handleLunchConfig = () => {
        startTask(configSelected!.id, idsServerReadyToConfig).then((res) => {
            if (res) {
                setSwitchTasksPanel(true)
                setResponseConfig(true)
            }
        }).catch(console.error);
    }


    useEffect(() => {
        apiGet(`${CONFIGS_PATH}`).then(setConfigs)
    }, [])

    return (
        <>
            <Grid container spacing={2}>

            <button onClick={handleOpenDialog}>
                🎛️ Configurer cette range
            </button>
            <button onClick={()=>document.location.reload()}>
                🆕 Ajouter
            </button>
            </Grid>
            <Dialog
                open={openDialog}
                onClose={() => handleClose()}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                {!switchTasksPanel &&
                    <>
                        <DialogTitle id="alert-dialog-title">
                            Configurer cette nouvelle collection de serveur
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                Vous etes sur le point de lancer une configuration sur les {idsServerReadyToConfig.length} serveurs que vous venez d'ajouter.
                            </DialogContentText>
                            <DialogContentText id="alert-dialog-description">
                                Selectionner la configuration necessaire à cette opération:
                            </DialogContentText>
                            <Box
                                noValidate
                                component="form"
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    m: 'auto',
                                    width: 'fit-content',
                                }}
                            >
                                <FormControl sx={{mt: 2, minWidth: 120}}>
                                    <InputLabel htmlFor="max-width">Config</InputLabel>
                                    <Select
                                        autoFocus
                                        value={configSelected}
                                        onChange={handleConfig}
                                        label="maxWidth"
                                        inputProps={{
                                            name: 'max-width',
                                            id: 'max-width',
                                        }}
                                    >
                                        {configs?.map((c) => <MenuItem value={c.id}>{c.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box margin="auto" textAlign="center" mt={2}>
                                {(configSelected && !responseConfig) && (
                                    <Button
                                        onClick={handleLunchConfig}
                                        variant="contained"
                                        sx={{
                                            color: "white",
                                            fontWeight: "bold",
                                            background: `linear-gradient(270deg,#4caf50, #ffeb3b, #f44336, #6a0dad, #0d47a1, #1de9b6, #c0c0c0, #ffd700, #ff69b4, #4caf50)`,
                                            backgroundSize: "1800% 1800%",
                                            animation: "galacticWave 30s ease infinite",
                                            borderRadius: "12px",
                                            boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
                                            "@keyframes galacticWave": {
                                                "0%": {backgroundPosition: "0% 50%"},
                                                "25%": {backgroundPosition: "50% 0%"},
                                                "50%": {backgroundPosition: "100% 50%"},
                                                "75%": {backgroundPosition: "50% 100%"},
                                                "100%": {backgroundPosition: "0% 50%"}
                                            },
                                        }}
                                    >
                                        🚀 Lancement des configurations 🌚
                                    </Button>
                                )}
                            </Box>
                        </DialogContent>
                    </>
                }
                <DialogActions>

                    {responseConfig ?
                        <DialogContent>
                            <Typography m={5} textAlign="center">🍾 Configuration des serveurs effectué avec succés 🍾</Typography>
                            <Grid margin="auto" textAlign="center">
                                <Button onClick={() => handleClose(true)}>Consulter la tache </Button>
                                <Button color="error" onClick={() => {
                                    handleClose(false)
                                }}>Fermer la fenetre</Button>
                            </Grid>
                        </DialogContent>
                        :
                        <Button color="error" onClick={() => handleClose(false)}>Annuler l'operation</Button>
                    }
                </DialogActions>
            </Dialog>
        </>
    );
}
