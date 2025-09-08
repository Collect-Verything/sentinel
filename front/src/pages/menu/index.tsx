import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import {Divider, ListItemIcon, ListItemText} from "@mui/material";
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import StorefrontIcon from '@mui/icons-material/Storefront';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import {LINKS} from "../../app/links.ts";

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
                <MenuItem component="a" onClick={handleClose} href={LINKS.DASHBOARD}>
                    <ListItemIcon>
                        <DashboardIcon fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText>Dashboard</ListItemText>
                </MenuItem>
                <MenuItem component="a" onClick={handleClose} href={LINKS.ADD_SERVERS}>
                    <ListItemIcon>
                        <AddIcon fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText>Ajouter</ListItemText>
                </MenuItem>
                <MenuItem component="a" onClick={handleClose} href={LINKS.SERVERS}>
                    <ListItemIcon>
                        <ManageHistoryIcon fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText>Gerer</ListItemText>
                </MenuItem>
                <Divider/>
                <MenuItem component="a" onClick={handleClose} href={LINKS.SHOP}>
                    <ListItemIcon>
                        <StorefrontIcon fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText>Boutique</ListItemText>
                </MenuItem>
                <MenuItem component="a" onClick={handleClose} href={LINKS.CONFIGURATOR}>
                    <ListItemIcon>
                        <PermDataSettingIcon fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText>Configurateur</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
}
