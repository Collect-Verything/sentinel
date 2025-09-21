import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import StorefrontIcon from '@mui/icons-material/Storefront';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import {LINKS} from "../../app/links.ts";
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import type {OverridableComponent} from "@mui/material/OverridableComponent";
import type {SvgIconTypeMap} from "@mui/material/SvgIcon";

export const ITEMS = [
    [LINKS.DASHBOARD, DashboardIcon, "Dashboard"],
    [LINKS.ADD_SERVERS, AddIcon, "Ajouter"],
    [LINKS.SERVERS_CONFIG, ManageHistoryIcon, "Configurer"],
    [LINKS.SERVERS, CloudDoneIcon, "Consulter"],
    [LINKS.SHOP, StorefrontIcon, "Boutique"],
    [LINKS.CONFIGURATOR, PermDataSettingIcon, "Configurateur"],
] as const satisfies ReadonlyArray<readonly [string, OverridableComponent<SvgIconTypeMap<{}, "svg">>, string]>;