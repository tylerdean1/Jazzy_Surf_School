'use client';

import React, { createContext, useContext } from 'react';

type AdminEditState = {
    enabled: boolean;
};

const AdminEditContext = createContext<AdminEditState>({ enabled: false });

export function AdminEditProvider({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
    return <AdminEditContext.Provider value={{ enabled }}>{children}</AdminEditContext.Provider>;
}

export function useAdminEdit() {
    return useContext(AdminEditContext);
}
