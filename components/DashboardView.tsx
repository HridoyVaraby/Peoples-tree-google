import React, { useMemo } from 'react';
import { Person } from '../types';
import { UserGroupIcon, LinkIcon, TagIcon, LocationMarkerIcon, BloodDropIcon } from './Icons';

interface DashboardViewProps {
    people: Person[];
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; description: string }> = ({ icon, title, value, description }) => (
    <div className="bg-brand-surface p-6 rounded-lg shadow-lg border border-brand-border flex flex-col">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brand-text-primary">{title}</h3>
            <div className="text-brand-accent">{icon}</div>
        </div>
        <p className="text-4xl font-bold text-brand-text-primary">{value}</p>
        <p className="text-sm text-brand-text-secondary mt-1">{description}</p>
    </div>
);

const DashboardView: React.FC<DashboardViewProps> = ({ people }) => {

    const stats = useMemo(() => {
        const totalPeople = people.length;
        
        const totalConnections = people.reduce((acc, p) => acc + p.relationships.length, 0) / 2;

        const allTags = people.flatMap(p => p.tags || []);
        const uniqueTags = new Set(allTags).size;

        const allLocations = people.map(p => p.location).filter(Boolean);
        const uniqueLocations = new Set(allLocations).size;
        
        const bloodGroups = people.reduce((acc, p) => {
            const group = p.bloodGroup || 'Unknown';
            acc[group] = (acc[group] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return { totalPeople, totalConnections, uniqueTags, uniqueLocations, bloodGroups };
    }, [people]);

    return (
        <div className="p-4 md:p-8 h-full overflow-y-auto w-full">
            <h1 className="text-3xl font-bold text-brand-text-primary mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <StatCard 
                    icon={<UserGroupIcon className="w-8 h-8"/>}
                    title="Total People"
                    value={stats.totalPeople}
                    description="Individuals in your tree."
                />
                 <StatCard 
                    icon={<LinkIcon className="w-8 h-8"/>}
                    title="Total Connections"
                    value={stats.totalConnections}
                    description="Unique relationships mapped."
                />
                 <StatCard 
                    icon={<TagIcon className="w-8 h-8"/>}
                    title="Unique Tags"
                    value={stats.uniqueTags}
                    description="Categories used for people."
                />
                 <StatCard 
                    icon={<LocationMarkerIcon className="w-8 h-8"/>}
                    title="Unique Locations"
                    value={stats.uniqueLocations}
                    description="Different places recorded."
                />

                <div className="bg-brand-surface p-6 rounded-lg shadow-lg border border-brand-border sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between mb-4">
                         <h3 className="text-lg font-semibold text-brand-text-primary">Blood Groups</h3>
                         <BloodDropIcon className="w-8 h-8 text-brand-accent"/>
                    </div>
                    <div className="space-y-2">
                        {Object.entries(stats.bloodGroups).length > 0 && Object.values(stats.bloodGroups).some(v => v > 0) ? (
                            Object.entries(stats.bloodGroups).sort(([,a], [,b]) => b - a).map(([group, count]) => (
                                count > 0 && <div key={group} className="flex justify-between items-center text-sm">
                                    <span className="text-brand-text-secondary">{group}</span>
                                    <span className="font-bold text-brand-text-primary bg-brand-bg px-2 py-0.5 rounded-full">{count}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-brand-text-secondary">No blood group data available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
