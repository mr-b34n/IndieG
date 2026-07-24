import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/shared/components/header/Header';
import { LeftBar } from '@/shared/components/sidebars/LeftBar';
import { RightBar } from '@/shared/components/sidebars/RightBar';
import { useTheme } from '@/shared/hooks/useTheme';
import { CommunityList } from '@/features/community';

const Community = () => {
	useTheme("Community");

	return (
		<div className="flex flex-col relative w-full h-screen overflow-hidden bg-bg text-text">

			<div className="absolute inset-0 pointer-events-none select-none">
				<div className="absolute -top-32 -left-32 w-125 h-125
                    bg-primary/10 dark:bg-primary/15
                    rounded-full blur-[100px]"
				/>
				<div className="absolute -bottom-32 -right-32 w-125 h-125
                    bg-accent-500/8 dark:bg-accent-500/12
                    rounded-full blur-[100px]"
				/>
			</div>

			<Header />

			<div className="relative flex-1 overflow-y-auto overflow-x-hidden w-full z-10">
				<div className="w-full max-w-350 mx-auto
                    flex flex-row items-start gap-4
                    px-4 py-3 pb-12">

					<aside className="hidden lg:block shrink-0 w-60 sticky top-3 max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-none">
						<LeftBar />
					</aside>

					<main className="flex-1 min-w-0">
						<CommunityList />
					</main>

					<aside className="hidden xl:block shrink-0 w-72 sticky top-3 max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-none">
						<RightBar />
					</aside>
				</div>
			</div>
		</div>
	);
}

export const Route = createFileRoute('/community/')(
	{ component: Community }
)