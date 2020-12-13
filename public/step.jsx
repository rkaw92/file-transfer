import React from 'react';

export function Step({ children }) {
    return <section className="mx-auto bg-gray-50 rounded-xl p-4 m-4">{children}</section>;
};

export function StepTitle({ children }) {
    return <h2 className="text-xl py-2 font-heading font-medium">{children}</h2>;
};
