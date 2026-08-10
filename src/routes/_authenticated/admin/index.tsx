import { createFileRoute } from '@tanstack/react-router'

const Admin = () => {
	return (
		<div>Admin</div>
	)
}
export const Route = createFileRoute('/_authenticated/admin/')({
	component: Admin,
})
