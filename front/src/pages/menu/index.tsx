import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import {Divider, ListItemIcon, ListItemText} from "@mui/material";
import {ITEMS} from "./const.tsx";


export const PositionedMenu = () => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Button
                id="demo-positioned-button"
                aria-controls={open ? 'demo-positioned-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                sx={{color: "white"}}
            >
                <MenuIcon/>
            </Button>
            <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                {
                    ITEMS.map(([href, Icon, label], index) => (
                        <React.Fragment key={href}>
                            {index === 1 && <Divider/>}
                            {index === 4 && <Divider/>}
                            <MenuItem component="a" onClick={handleClose} href={href}>
                                <ListItemIcon>
                                    <Icon fontSize="small"/>
                                </ListItemIcon>
                                <ListItemText primary={label}/>
                            </MenuItem>
                        </React.Fragment>
                    ))
                }

            </Menu>
        </>
    );
}
