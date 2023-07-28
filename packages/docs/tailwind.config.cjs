/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./stories/**/*.{html,js,jsx,md,mdx,ts,tsx}'],
	theme: {
		extend: {},
	},
	plugins: [require('@websublime/vitamin-theme')()],
}
