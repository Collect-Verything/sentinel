// import { TASKS_PATH } from "../../common/utils/web/const";
//
// export const Tasks = () => {
//     async function startTask() {
//         const res = await fetch(`http://localhost:3001/${TASKS_PATH}/enqueue`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ seconds: 20 }),
//         });
//         const { id } = await res.json();
//
//         const interval = setInterval(async () => {
//             const s = await fetch(`http://localhost:3001/${TASKS_PATH}/status/${id}`)
//                 .then(r => r.json());
//
//             console.log('status', s);
//
//             if (s.state === 'completed' || s.state === 'failed' || s.error === 'not_found') {
//                 clearInterval(interval);
//             }
//         }, 1000);
//     }
//
//     return (
//         <>
//             <p>Task page</p>
//             <button onClick={startTask}>Lancer la tâche</button>
//         </>
//     );
// };

import "./index.css"
import {Fab} from "@mui/material";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import * as React from "react";
import {useState} from "react";
import type {TransitionProps} from "@mui/material/transitions";
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Typography from "@mui/material/Typography";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<unknown>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export const Tasks = () => {

    const [windowButton, setWindowButton] = useState(false);
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
        setWindowButton(!windowButton)
    };

    const handleClose = () => {
        setOpen(false);
        setWindowButton(!windowButton)
    };

    return (
        // <Fab size="small" aria-label="add" sx={{
        //     position: 'absolute', bottom: 16,
        //     right: 16,
        // }}>
        //     {windowButton ?
        //         <ExpandMoreIcon onClick={() => setWindowButton(!windowButton)}/>
        //         :
        //         <ExpandLessIcon onClick={() => setWindowButton(!windowButton)}/>
        //     }
        // </Fab>

        <>
            <Fab size="small" aria-label="add" sx={{
                position: 'absolute', bottom: 16,
                right: 16,
            }}>
                <ExpandLessIcon onClick={handleClickOpen}/>
            </Fab>
            <Dialog
                fullWidth
                open={open}
                onClose={handleClose}
                slots={{
                    transition: Transition,
                }}
            >
                <AppBar sx={{position: 'relative'}} className="top-dial">
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleClose}
                            aria-label="close"
                        >
                            <ExpandMoreIcon onClick={handleClose}/>
                        </IconButton>
                        <Typography variant="h6" component="div">Vos tâches en cours</Typography>
                    </Toolbar>
                </AppBar>
                <List>
                    <ListItemButton>
                        <ListItemText primary="Phone ringtone" secondary="Titania"/>
                    </ListItemButton>
                    <Divider/>
                    <ListItemButton>
                        <ListItemText
                            primary="Default notification ringtone"
                            secondary="Tethys"
                        />
                    </ListItemButton>
                </List>
            </Dialog>
        </>
    );
};
