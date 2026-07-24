import { createFileRoute, redirect } from '@tanstack/react-router'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faEye,
	faEyeSlash,
	faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { useState } from 'react';

import gameLogo from "../assets/logos/gg.png"
import gameBgIllu from "../assets/bgs/game-illu-bg.webp";
import googleLogo from "../assets/logos/gg.png";
import { STRENGTH_LEVELS, validatePassword, type PasswordValidationResult } from '../features/auth/helpers/passwordValidator';
import { useTheme } from '@/shared/hooks/useTheme';
import { useAuthStore } from '@/features/auth';

const Auth = () => {
	useTheme("Authorization", gameLogo);

	const [isLogin, setIsLogin] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
	const [isPasswordMatched, setIsPasswordMatched] = useState<boolean>(true);
	const [isPasswordRight, setIsPasswordRight] = useState<boolean>(true);

	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const EMPTY_PASSWORD_STATE: PasswordValidationResult = {
		requirements: [],
		score: 0,
		isAllValid: false,
		strengthConfig: STRENGTH_LEVELS[1],
		isEmpty: true,
	};

	const [pwdState, setPwdState] =
		useState<PasswordValidationResult>(EMPTY_PASSWORD_STATE);

	const handleToggleMode = async (nextIsLogin: boolean) => {
		setIsLogin(nextIsLogin);
		setFormData({
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
		});
		setIsShowPassword(false);
		const result = await validatePassword("");
		setPwdState(result);
		setIsPasswordMatched(true);
	};

	const handleInputChange = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const { id, value } = e.target;
		setFormData((prev) => ({ ...prev, [id]: value }));

		if (id === "password") {
			const result = await validatePassword(value);
			setPwdState(result);
			setIsPasswordRight(true);
		}

		if (id === "confirmPassword") {
			setIsPasswordMatched(true);
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!isLogin) {
			const isPasswordValid = pwdState.requirements.every(
				(req) => req.isMet,
			);
			if (!isPasswordValid) return;

			if (formData.password !== formData.confirmPassword) {
				setIsPasswordMatched(false);
				return;
			}
		}

		setIsLoading(true);

		try {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			console.log("Thành công:", formData);
		} catch (e) {
			console.error(e);
		} finally {
			setIsLoading(false);
			if (!isLogin) setIsLogin(true);
		}
	};

	return (
		<div className="flex flex-col md:flex-row w-screen h-screen bg-white dark:bg-bg transition-colors">
			<div className="relative hidden md:flex flex-col items-center justify-center w-full h-full bg-[#E0F2FE] dark:bg-neutral-950 p-8 overflow-hidden">
				<div
					className="absolute inset-0 
                    bg-[linear-gradient(to_right,#93C5FD_1px,transparent_1px),linear-gradient(to_bottom,#93C5FD_1px,transparent_1px)] 
                    dark:bg-[linear-gradient(to_right,#1e1e2a_1px,transparent_1px),linear-gradient(to_bottom,#1e1e2a_1px,transparent_1px)] 
                    bg-size-[1.5rem_1.5rem] 
                    mask-[radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] 
                    opacity-60 dark:opacity-80 
                    pointer-events-none"
				/>

				<div className="z-10 w-fit h-fit self-start text-black dark:text-text text-5xl font-bold translate-x-20">
					<p>IndieG</p>
				</div>
				<img
					src={gameBgIllu}
					className="z-10 w-full max-w-lg h-auto my-4 drop-shadow-xl"
					alt="Game Illustration"
				/>
				<div className="z-10 w-fit h-fit text-black dark:text-text text-3xl font-bold -translate-x-20 pb-4">
					<p>Connect Your Squad</p>
				</div>
				<div className="z-10 w-fit h-fit text-black dark:text-text text-3xl font-bold translate-x-20">
					<p>Elevate your game</p>
				</div>
			</div>

			<div className="flex flex-col items-center justify-center w-full h-full bg-[#F8FAFC] dark:bg-bg p-6 overflow-y-auto">
				<div className="w-full max-w-sm text-center md:text-left mb-2 mt-4 md:mt-0">
					<h1 className="text-4xl md:text-5xl font-bold text-black dark:text-text transition-all">
						{isLogin ? "Welcome!" : "Join Us!"}
					</h1>
				</div>

				<form
					onSubmit={handleSubmit}
					className="flex flex-col gap-3 w-full max-w-sm"
				>
					{!isLogin && (
						<div className="flex flex-col gap-1 group">
							<label
								htmlFor="username"
								className="text-sm font-semibold text-[#475569] dark:text-text-muted"
							>
								Username
							</label>
							<div className="flex flex-row items-center w-full rounded-md h-10 border border-[#374151] dark:border-border bg-white dark:bg-surface-hover px-3 transition-all group-focus-within:border-[#FF4A75] group-focus-within:ring-1 group-focus-within:ring-[#FF4A75]">
								<input
									id="username"
									type="text"
									value={formData.username}
									onChange={handleInputChange}
									className="text-base w-full h-full focus:outline-none bg-transparent text-black dark:text-text"
									required={!isLogin}
								/>
							</div>
						</div>
					)}

					<div className="flex flex-col gap-1 group">
						<label
							htmlFor="email"
							className="text-sm font-semibold text-[#475569] dark:text-text-muted"
						>
							Email
						</label>
						<div className="flex flex-row items-center w-full rounded-md h-10 border border-[#374151] dark:border-border bg-white dark:bg-surface-hover px-3 transition-all group-focus-within:border-[#FF4A75] group-focus-within:ring-1 group-focus-within:ring-[#FF4A75]">
							<input
								id="email"
								type="email"
								value={formData.email}
								onChange={handleInputChange}
								className="text-base w-full h-full focus:outline-none bg-transparent text-black dark:text-text"
								required
							/>
						</div>
					</div>

					<div className="flex flex-col gap-1 group">
						<label
							htmlFor="password"
							className="text-sm font-semibold text-[#475569] dark:text-text-muted"
						>
							Password
						</label>
						<div className="flex flex-row items-center gap-2 w-full rounded-md h-10 border border-[#374151] dark:border-border bg-white dark:bg-surface-hover px-3 transition-all group-focus-within:border-[#FF4A75] group-focus-within:ring-1 group-focus-within:ring-[#FF4A75]">
							<input
								id="password"
								type={isShowPassword ? "text" : "password"}
								value={formData.password}
								onChange={handleInputChange}
								className="text-base w-full h-full focus:outline-none bg-transparent text-black dark:text-text"
								required
							/>
							<FontAwesomeIcon
								onClick={() =>
									setIsShowPassword(!isShowPassword)
								}
								className="w-fit h-full pl-2 border-l border-[#374151] dark:border-border cursor-pointer dark:text-text-muted text-[#475569] hover:text-black dark:hover:text-text transition-colors"
								icon={isShowPassword ? faEye : faEyeSlash}
							/>
						</div>

						{isLogin && !isPasswordRight && (
							<p className="text-red-500 text-xs font-medium mt-0.5">
								The password is not true!
							</p>
						)}
						{!isLogin && (
							<div className="flex flex-col gap-2 mt-1 p-2.5 rounded-md border border-gray-200 dark:border-border bg-white dark:bg-surface/60 text-[11px]">
								<div className="flex items-center justify-between gap-4">
									<span
										className={`${pwdState.isEmpty ? "text-gray-400" : pwdState.strengthConfig.color} font-medium shrink-0`}
									>
										Strength:{" "}
										<span className="font-bold">
											{pwdState.isEmpty
												? "None"
												: pwdState.strengthConfig.label}
										</span>
									</span>
									<div className="grid grid-cols-4 gap-1 h-1 w-full max-w-37.5">
										{[1, 2, 3, 4].map((level) => (
											<div
												key={level}
												className={`h-full rounded-full transition-colors duration-300 ${level <=
														(pwdState.score <= 1
															? 1
															: pwdState.score)
														? pwdState
															.strengthConfig
															.bg
														: "bg-gray-200 dark:bg-neutral-800"
													}`}
											/>
										))}
									</div>
								</div>
								<div className="flex flex-wrap gap-x-3 gap-y-1 text-gray-400 border-t border-gray-100 dark:border-border pt-1.5">
									{pwdState.requirements.map((item) => (
										<div
											key={item.id}
											className="w-fit h-fit flex flex-row gap-1 items-center"
										>
											<FontAwesomeIcon
												icon={faCircleCheck}
												className={`${item.isMet ? "text-green-500 dark:text-green-400" : "text-zinc-400"}`}
											/>
											<span
												className={`${item.isMet ? "text-green-600 dark:text-green-400" : "text-zinc-500"}`}
											>
												{item.label}
											</span>
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					{!isLogin && (
						<div className="flex flex-col gap-1 group">
							<label
								htmlFor="confirmPassword"
								className="text-sm font-semibold text-[#475569] dark:text-text-muted"
							>
								Confirm Password
							</label>
							<div
								className={`flex flex-row items-center w-full rounded-md h-10 border px-3 transition-all group-focus-within:ring-1 ${isPasswordMatched ? "border-[#374151] dark:border-border group-focus-within:border-[#FF4A75] group-focus-within:ring-[#FF4A75] bg-white dark:bg-surface-hover" : "border-red-500 ring-red-500 bg-red-50 dark:bg-red-900/10"}`}
							>
								<input
									id="confirmPassword"
									type="password"
									value={formData.confirmPassword}
									onChange={handleInputChange}
									className="text-base w-full h-full focus:outline-none bg-transparent text-black dark:text-text"
									required={!isLogin}
								/>
							</div>
							{!isPasswordMatched && (
								<p className="text-red-500 text-xs font-medium mt-0.5">
									The password is not matched! Retry!
								</p>
							)}
						</div>
					)}

					{isLogin && (
						<div className="text-xs self-end text-[#475569] dark:text-text-faint cursor-pointer hover:underline hover:underline-offset-2">
							<p>Forgot your password?</p>
						</div>
					)}

					<button
						type="submit"
						disabled={isLoading}
						className="flex items-center justify-center gap-2 w-full rounded-md h-11 text-base font-semibold text-white cursor-pointer bg-[#FF4A75] hover:bg-[#e13b63] disabled:bg-gray-400 dark:disabled:bg-neutral-700 transition-colors shadow-md mt-1"
					>
						{isLoading ? (
							<FontAwesomeIcon
								icon={faSpinner}
								className="animate-spin"
							/>
						) : isLogin ? (
							"Go!"
						) : (
							"Create Account"
						)}
					</button>

					<div className="text-xs text-center md:text-left text-[#475569] dark:text-text-faint mt-1">
						{isLogin ? (
							<p>
								Don't have an account?{" "}
								<span
									onClick={() => handleToggleMode(false)}
									className="text-[#FF4A75] font-semibold cursor-pointer hover:underline underline-offset-2"
								>
									Register now!
								</span>
							</p>
						) : (
							<p>
								Already have an account?{" "}
								<span
									onClick={() => handleToggleMode(true)}
									className="text-[#FF4A75] font-semibold cursor-pointer hover:underline underline-offset-2"
								>
									Sign In
								</span>
							</p>
						)}
					</div>
				</form>

				<div className="relative w-full max-w-sm py-4 flex items-center justify-center">
					<div className="w-full h-px bg-[#CBD5E1] dark:bg-border" />
					<div className="absolute bg-[#F8FAFC] dark:bg-bg text-xs font-medium text-[#475569] dark:text-text-faint px-3">
						or
					</div>
				</div>

				<button
					type="button"
					className="flex flex-row justify-center items-center gap-3 w-full max-w-sm rounded-md h-11 text-sm font-medium text-gray-700 dark:text-text cursor-pointer border border-gray-300 dark:border-neutral-700 bg-white dark:bg-surface-hover hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors shadow-sm mb-4 md:mb-0"
				>
					<img src={googleLogo} className="w-4 h-4" alt="Google" />
					<p>
						{isLogin
							? "Sign in with Google"
							: "Sign up with Google"}
					</p>
				</button>
			</div>
		</div>
	);
}

export const Route = createFileRoute('/auth')({
	beforeLoad: () => {
		const { user } = useAuthStore.getState();

		if (user) {
			throw redirect({
				to: '/',
				replace: true
			})
		}
	},
	component: Auth,
})


