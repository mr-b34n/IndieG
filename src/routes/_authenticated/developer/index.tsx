import { createFileRoute } from '@tanstack/react-router';
import { StorageApiTester } from '@/features/developer/components/StorageApiTester';

function DeveloperPage() {
    return (
        <div className="min-h-screen bg-[#07090E] py-8">
            <StorageApiTester />
        </div>
    );
}

export const Route = createFileRoute('/_authenticated/developer/')({
    component: DeveloperPage,
});

