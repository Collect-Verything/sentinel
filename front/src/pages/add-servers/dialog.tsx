import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import type {Dispatch, SetStateAction} from "react";

interface DialogConfigServersProps {
    setOpenDialog: Dispatch<SetStateAction<boolean>>
    openDialog: boolean
    handleOpenDialog: () => void
    idsServerReadyToConfig: number[]
}

export const DialogConfigServers = ({openDialog, setOpenDialog, handleOpenDialog, idsServerReadyToConfig}: DialogConfigServersProps) => {

    const handleClose = () => {
        setOpenDialog(false);
    };

    return (
        <>
            <button onClick={handleOpenDialog}>
                🎛️ Configurer cette range
            </button>
            <Dialog
                open={openDialog}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
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
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Disagree</Button>
                    <Button onClick={handleClose} autoFocus>
                        Agree
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
