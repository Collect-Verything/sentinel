import DialogActions from "@mui/material/DialogActions";
import {useState} from "react";
import {Dialog, Grid} from "@mui/material";
import Button from "@mui/material/Button";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {Transition} from "../../tasks/components.tsx";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import {CopyToClipboard} from "../../../common/components/clip-board";
import {csvConvention} from "./const.ts";
import {DownloadCsvTemplateButton} from "../template-csv-dl";

export const DialogConventionCsv = () => {

    const [open, setOpen] = useState(false);

    return (
        <Grid>
            <Button>
                <InfoOutlinedIcon color="warning" onClick={()=>() => setOpen(true)}/>
            </Button>
            <Dialog
                open={open}
                slots={{transition: Transition,}}
                keepMounted
                onClose={()=>setOpen(false)}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>{"Convention CSV servers"}</DialogTitle>
                <DialogContent>
                    <CopyToClipboard text={csvConvention} tooltip="Copier la convention" onCopiedText="Convention CSV copiée !">
                        <div id="alert-dialog-slide-description" style={{whiteSpace: "pre-wrap"}}>{csvConvention}</div>
                    </CopyToClipboard>
                </DialogContent>
                <DownloadCsvTemplateButton/>
                <DialogActions>
                    <Button onClick={()=>setOpen(false)} color="error">Fermer</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
}

