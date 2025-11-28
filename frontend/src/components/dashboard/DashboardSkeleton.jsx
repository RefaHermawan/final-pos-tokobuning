import React from 'react';

const DashboardSkeleton = () => (
    <div className="space-y-6 p-4 sm:p-6 animate-pulse">
        <div className="h-10 bg-light-gray/50 rounded-lg w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="h-32 bg-surface/80 rounded-2xl"></div>
            <div className="h-32 bg-surface/80 rounded-2xl"></div>
            <div className="h-32 bg-surface/80 rounded-2xl"></div>
            <div className="h-32 bg-surface/80 rounded-2xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-surface/80 rounded-2xl"></div>
            <div className="lg:col-span-1 space-y-6">
                <div className="h-48 bg-surface/80 rounded-2xl"></div>
                <div className="h-40 bg-surface/80 rounded-2xl"></div>
            </div>
        </div>
    </div>
);

export default DashboardSkeleton;