import { useApiUrl, useCustom } from '@refinedev/core';


export const CustomPage: React.FC = () => {
    const apiUrl = useApiUrl();
    
    const { query } = useCustom({
        url: `${apiUrl}/api/custom`,
        method: 'get',
    });


    if (query.isPending) return <div>Loading...</div>;
    if (query.error) return <div>Error: {query.error.message}</div>;

    return (
        <div>
            <h1>Custom Page</h1>
            {query.data && (
                <div>
                    <span>ID: {query.data.data.id}</span>
                    <div>Title: {query.data.data.title}</div>
                    <div>Description: {query.data.data.description}</div>
                </div>
            )}
        </div>
    );
};
