import { useState } from "react";

const SESSION_KEY = "ilhaFit_rpp";

export function usePersistedRowsPerPage(defaultValue = 10) {
    const [rowsPerPage, setRowsPerPage] = useState(() => {
        const stored = sessionStorage.getItem(SESSION_KEY);
        const parsed = parseInt(stored, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    });

    const persist = (value) => {
        setRowsPerPage(value);
        sessionStorage.setItem(SESSION_KEY, String(value));
    };

    return [rowsPerPage, persist];
}
