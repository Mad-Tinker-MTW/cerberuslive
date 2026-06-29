// Shared, non-"use client" constant so both the client ProfileEditor and the server
// edit page can import it. Non-component exports from a "use client" module are undefined
// when imported into a server component, which crashed /account/edit for sparse dossiers.
export const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
