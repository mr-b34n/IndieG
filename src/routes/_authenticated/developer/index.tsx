import { createFileRoute } from '@tanstack/react-router';

const Developer = () => {
    return <div className="p-8 text-[#C2C7CE]">Developer</div>;
};

export const Route = createFileRoute('/_authenticated/developer/')({
    component: Developer,
});

