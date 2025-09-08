import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import {PositionedMenu} from "../menu";


export const MainAppBar = () => {
    return (
        <Box sx={{flexGrow: 1}}
        >
            <AppBar position="static" sx={{backgroundColor: 'black'}}>
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{mr: 2}}
                    >
                        Sentinel
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                    </Typography>
                    <PositionedMenu/>
                </Toolbar>
            </AppBar>
        </Box>
    );
}
