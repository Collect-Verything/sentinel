import * as React from "react";
import {useEffect, useState} from "react";
import {apiDelete} from "../../common/utils/web";
import {SERVERS_PATH} from "../../common/utils/web/const.ts";
import {
    ColumnsPanelTrigger,
    DataGrid,
    ExportCsv,
    ExportPrint,
    FilterPanelTrigger,
    type GridRowId,
    type GridRowSelectionModel,
    QuickFilter,
    QuickFilterClear,
    QuickFilterControl,
    QuickFilterTrigger,
    Toolbar,
    ToolbarButton
} from '@mui/x-data-grid';
import {SERVER_STATUS} from "../../common/enums/server-status.ts";
import {useServers} from "../../contexts/ServersContext.tsx";
import {ErrorTemplate} from "../../common/components/error";
import {Loader} from "../../common/components/loader";
import {columnsServer} from "../../common/datagrid/servers.tsx";
import Box from "@mui/material/Box";
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import Badge from '@mui/material/Badge';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import {Button, Grid, styled, TextField} from "@mui/material";
import type {ServerInterface} from "../../common/types/backend";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

export const Servers = () => {

    const {fetchServers, getServers, loading, error} = useServers();

    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({type: 'include', ids: new Set()});
    const [serversToDelete, setServersToDelete] = useState<GridRowId[]>([]);

    const handleDeleteServers = () => {
        apiDelete(`${SERVERS_PATH}`, {serversToDelete}).then(() => window.location.reload()).catch(console.error);
    }

    useEffect(() => {
        fetchServers(SERVER_STATUS.CONFIGURED)
    }, []);
    const servers = getServers('CONFIGURED');


    useEffect(() => {
        setServersToDelete(Array.from(rowSelectionModel.ids.values()))
    }, [setRowSelectionModel, rowSelectionModel]);

    if (loading) return <Loader color="warning"/>
    if (error) return <ErrorTemplate errorId={error} details={error} onRetry={() => document.location.reload()} showReload/>

    return (
        <>
            <Box sx={{height: "80vh", width: '95vw', margin: 'auto', mt: 4}}>
                <DataGrid
                    rows={servers}
                    columns={columnsServer}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 10,
                            },
                        },
                    }}
                    slots={{toolbar: CustomToolbar}}
                    slotProps={{
                        toolbar: {
                            serversToDelete,
                            handleDeleteServers,
                        },
                    }} pageSizeOptions={[5]}
                    checkboxSelection
                    disableRowSelectionOnClick
                    showToolbar
                    onRowSelectionModelChange={(newRowSelectionModel) => {
                        setRowSelectionModel(newRowSelectionModel);
                    }}
                    rowSelectionModel={rowSelectionModel}
                />
            </Box>
        </>
    )
}

type OwnerState = {
    expanded: boolean;
};

const StyledQuickFilter = styled(QuickFilter)({
    display: 'grid',
    alignItems: 'center',
});

const StyledToolbarButton = styled(ToolbarButton)<{ ownerState: OwnerState }>(
    ({theme, ownerState}) => ({
        gridArea: '1 / 1',
        width: 'min-content',
        height: 'min-content',
        zIndex: 1,
        opacity: ownerState.expanded ? 0 : 1,
        pointerEvents: ownerState.expanded ? 'none' : 'auto',
        transition: theme.transitions.create(['opacity']),
    }),
);

const StyledTextField = styled(TextField)<{
    ownerState: OwnerState;
}>(({theme, ownerState}) => ({
    gridArea: '1 / 1',
    overflowX: 'clip',
    width: ownerState.expanded ? 260 : 'var(--trigger-width)',
    opacity: ownerState.expanded ? 1 : 0,
    transition: theme.transitions.create(['width', 'opacity']),
}));

interface CustomToolbarProps {
    serversToDelete: ServerInterface[]
    handleDeleteServers: () => void
}

export function CustomToolbar({serversToDelete, handleDeleteServers,}: CustomToolbarProps) {
    const [exportMenuOpen, setExportMenuOpen] = React.useState(false);
    const exportMenuTriggerRef = React.useRef<HTMLButtonElement>(null);

    return (
        <Toolbar>
            {serversToDelete.length > 0 && (
                <Grid sx={{flex: 1, mx: 0.5}}>
                    <Button variant="outlined" onClick={handleDeleteServers}>
                        <DeleteForeverIcon color="error"/>
                    </Button>
                </Grid>
            )}

            <Tooltip title="Columns">
                <ColumnsPanelTrigger render={<ToolbarButton/>}>
                    <ViewColumnIcon fontSize="small"/>
                </ColumnsPanelTrigger>
            </Tooltip>

            <Tooltip title="Filters">
                <FilterPanelTrigger
                    render={(props, state) => (
                        <ToolbarButton {...props} color="default">
                            <Badge badgeContent={state.filterCount} color="primary" variant="dot">
                                <FilterListIcon fontSize="small"/>
                            </Badge>
                        </ToolbarButton>
                    )}
                />
            </Tooltip>

            <Divider orientation="vertical" variant="middle" flexItem sx={{mx: 0.5}}/>

            <Tooltip title="Export">
                <ToolbarButton
                    ref={exportMenuTriggerRef}
                    id="export-menu-trigger"
                    aria-controls="export-menu"
                    aria-haspopup="true"
                    aria-expanded={exportMenuOpen ? 'true' : undefined}
                    onClick={() => setExportMenuOpen(true)}
                >
                    <FileDownloadIcon fontSize="small"/>
                </ToolbarButton>
            </Tooltip>

            <Menu
                id="export-menu"
                anchorEl={exportMenuTriggerRef.current}
                open={exportMenuOpen}
                onClose={() => setExportMenuOpen(false)}
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                transformOrigin={{vertical: 'top', horizontal: 'right'}}
                slotProps={{
                    list: {
                        'aria-labelledby': 'export-menu-trigger',
                    },
                }}
            >
                <ExportPrint render={<MenuItem/>} onClick={() => setExportMenuOpen(false)}>
                    Print
                </ExportPrint>
                <ExportCsv render={<MenuItem/>} onClick={() => setExportMenuOpen(false)}>
                    Download as CSV
                </ExportCsv>
            </Menu>

            <StyledQuickFilter>
                <QuickFilterTrigger
                    render={(triggerProps, state) => (
                        <Tooltip title="Search" enterDelay={0}>
                            <StyledToolbarButton
                                {...triggerProps}
                                ownerState={{expanded: state.expanded}}
                                color="default"
                                aria-disabled={state.expanded}
                            >
                                <SearchIcon fontSize="small"/>
                            </StyledToolbarButton>
                        </Tooltip>
                    )}
                />
                <QuickFilterControl
                    render={({ref, ...controlProps}, state) => (
                        <StyledTextField
                            {...controlProps}
                            ownerState={{expanded: state.expanded}}
                            inputRef={ref}
                            aria-label="Search"
                            placeholder="Search..."
                            size="small"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small"/>
                                        </InputAdornment>
                                    ),
                                    endAdornment: state.value ? (
                                        <InputAdornment position="end">
                                            <QuickFilterClear
                                                edge="end"
                                                size="small"
                                                aria-label="Clear search"
                                                material={{sx: {marginRight: -0.75}}}
                                            >
                                                <CancelIcon fontSize="small"/>
                                            </QuickFilterClear>
                                        </InputAdornment>
                                    ) : null,
                                    ...controlProps.slotProps?.input,
                                },
                                ...controlProps.slotProps,
                            }}
                        />
                    )}
                />
            </StyledQuickFilter>
        </Toolbar>
    );
}