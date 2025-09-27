import type { GridRowId } from '@mui/x-data-grid';

declare module '@mui/x-data-grid' {
    interface ToolbarPropsOverrides {
        selectedServerIds?: GridRowId[] | number[];
        handleDeleteServers?: () => void;

        serversToDelete?: GridRowId[] | number[];
    }
}
