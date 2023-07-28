/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{ts,tsx}'],
	theme: {
		extend: {},
	},
	plugins: [require('@websublime/vitamin-theme')()],
}
