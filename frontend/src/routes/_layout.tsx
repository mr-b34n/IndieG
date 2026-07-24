// src/routes/_layout.tsx
import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { Header } from '@/shared/components/header/Header'
import { LeftBar } from '@/shared/components/sidebars/LeftBar'
import { RightBar } from '@/shared/components/sidebars/RightBar'

export const Route = createFileRoute('/_layout')({
    component: MainLayout,
})

function MainLayout() {
    // 1. Lấy thông tin route hiện tại
    const { pathname } = useLocation()
    
    // 2. Ref trỏ đến container chứa thanh cuộn
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    // 3. Mỗi khi chuyển trang (pathname thay đổi), cuộn container về top
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0
        }
    }, [pathname])

    return (
        <div className="flex flex-col relative w-full h-screen overflow-hidden bg-bg text-text">
            {/* Background chung */}
            <div className="absolute inset-0 pointer-events-none select-none">
                <div className="absolute -top-32 -left-32 w-125 h-125 bg-primary/10 dark:bg-primary/15 rounded-full blur-[100px]" />
                <div className="absolute -bottom-32 -right-32 w-125 h-125 bg-accent-500/8 dark:bg-accent-500/12 rounded-full blur-[100px]" />
            </div>

            <Header />

            {/* GẮN REF VÀO THẺ DIV CÓ OVERFLOW-Y-AUTO NÀY */}
            <div 
                ref={scrollContainerRef} 
                className="relative flex-1 overflow-y-auto overflow-x-hidden w-full z-10"
            >
                <div className="w-full max-w-350 mx-auto flex flex-row items-start gap-4 px-4 py-3 pb-12">
                    
                    {/* Left Sidebar */}
                    <aside className="hidden lg:block shrink-0 w-60 sticky top-3 max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-none">
                        <LeftBar />
                    </aside>

                    {/* CORE CONTENT */}
                    <main className="flex-1 min-w-0">
                        <Outlet />
                    </main>

                    {/* Right Sidebar */}
                    <aside className="hidden xl:block shrink-0 w-72 sticky top-3 max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-none">
                        <RightBar />
                    </aside>

                </div>
            </div>
        </div>
    )
}