import type {AlertColor} from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';

export const ErrorServerPersistenceMessage: Record<AlertColor| "validconv", string> = {
    success: "Les serveurs ont bien été persistés",
    error: "Une erreur est apparue durant la persistance",
    info: "Veillez à respecter la convention",
    warning: "La convention du fichier n'est pas respecté",
    validconv: "Le fichier est valide"
} as const;

export const ErrorServerPersistenceIcon: Record<AlertColor | "validconv", any> = {
    success: <DoneOutlineIcon color="success" />,
    error: <AnnouncementIcon color="error"/>,
    info: <InfoOutlinedIcon color="info"/>,
    warning: <ReportGmailerrorredIcon color="warning"/>,
    validconv: <DoneOutlineIcon color="success"/>
} as const;


