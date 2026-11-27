import { createFileRoute } from "@tanstack/react-router";
import { SquadPage } from "@/features/squad/components/SquadPage";

export const Route = createFileRoute("/_layout/squad")({
    component: SquadPage,
});
