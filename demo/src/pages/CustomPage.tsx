import React from 'react';
import { useApiUrl, useCustom } from '@refinedev/core';


export const CustomPage: React.FC = () => {
    const apiUrl = useApiUrl();
    
    const { data, isLoading, error } = useCustom({
        url: `${apiUrl}/api/custom`,
        method: 'get',
    });


    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <h1>Custom Page</h1>
            {data && (
                <div>
                    <span>ID: {data.data.id}</span>
                    <div>Title: {data.data.title}</div>
                    <div>Description: {data.data.description}</div>
                </div>
            )}
        </div>
    );
};
