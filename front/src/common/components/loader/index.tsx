import CircularProgress from "@mui/material/CircularProgress";
import {Grid} from "@mui/material";

interface LoaderProps {
    color: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
    height?: string
}

// TODO : Replace all loader

export const Loader = ({color, height = "90vh"}: LoaderProps) => {
    return (
        <Grid container justifyContent="center" alignItems="center" height={height}>
            <CircularProgress color={color}/>
        </Grid>
    )
}