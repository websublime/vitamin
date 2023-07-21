/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,ts,tsx}'],
	theme: {
		extend: {},
	},
	plugins: [require('@websublime/vitamin-theme')()],
}
