import type { GridRowId } from '@mui/x-data-grid';

declare module '@mui/x-data-grid' {
    interface ToolbarPropsOverrides {
        selectedServerIds?: GridRowId[];
        handleDeleteServers?: () => void;

        serversToDelete?: GridRowId[];
    }
}
