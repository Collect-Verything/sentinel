import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AddIcon from '@mui/icons-material/Add';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import {LINKS} from "../../app/links.ts";
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import type {OverridableComponent} from "@mui/material/OverridableComponent";
import type {SvgIconTypeMap} from "@mui/material/SvgIcon";
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import HomeIcon from '@mui/icons-material/Home';

export const ITEMS = [
    [LINKS.HOME, HomeIcon, "Dashboard"],
    [LINKS.MONITORING, TroubleshootIcon, "Monitoring"],
    [LINKS.ADD_SERVERS, AddIcon, "Ajouter"],
    [LINKS.SERVERS_CONFIG, ManageHistoryIcon, "Configurer"],
    [LINKS.SERVERS, CloudDoneIcon, "Consulter"],
    [LINKS.SHOP, StorefrontIcon, "Boutique"],
    [LINKS.CONFIGURATOR, PermDataSettingIcon, "Configurateur"],
] as const satisfies ReadonlyArray<readonly [string, OverridableComponent<SvgIconTypeMap<{}, "svg">>, string]>;