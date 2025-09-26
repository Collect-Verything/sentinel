import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import {PositionedMenu} from "../menu";
import "./index.css"

const BRAND = "Sentinel";

export const MainAppBar = () => {
    return (
        <Box sx={{flexGrow: 1}}
        >
            <AppBar position="static" sx={{backgroundColor: "black"}}>
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        aria-label="accueil"
                        component="a"
                        href="/"
                        disableRipple
                        sx={{
                            mr: 2,
                            px: 1,
                            color: "#e5e7eb",
                            fontWeight: 400,
                            letterSpacing: ".3px",
                            textTransform: "none",
                            position: "relative",
                            transition: "transform .25s ease",
                            "&::after": {
                                content: '""',
                                position: "absolute",
                                left: "50%",
                                bottom: 4,
                                height: 2,
                                width: 0,
                                transform: "translateX(-50%)",
                                background:
                                    "linear-gradient(90deg, rgba(71,85,105,0), rgba(71,85,105,.45), rgba(71,85,105,0))", // slate-600 soft
                                borderRadius: 999,
                                transition: "width .35s ease",
                                opacity: 0.9,
                            },
                            "&:hover": {
                                transform: "translateY(-1px)",
                                "&::after": {width: "92%"},
                            },
                            "&:active": {
                                transform: "translateY(0) scale(.995)",
                                "&::after": {width: "78%"},
                            },
                        }}
                    >
                    <span className="brand-sentinel" aria-label={BRAND}>
                    {BRAND.split("").map((ch, i) => (
                        <span
                            key={`${ch}-${i}`}
                            className="brand-ch"
                            style={{["--i" as any]: i} as React.CSSProperties}
                        >
                        {ch}
                      </span>
                    ))}
                    </span>
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}/>
                    <PositionedMenu/>
                </Toolbar>
            </AppBar>

        </Box>
    );
}
