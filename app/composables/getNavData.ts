interface NavData {
	menu: {
		title: string;
		path: string;
		icon: string;
	}[];
	socials: {
		icon: string;
		url: string;
	}[];
}
export const getNavData = async () => {
	const sanity = useSanity();
	const query = groq`*[_id=="singleton-navigation"][0]{menu[]{icon, path, title}, socials[]{icon,url}}`;
	const data = await sanity.fetch<NavData | null>(query);
	const menu = data?.menu ?? [];

	menu.unshift({
		title: "Trang chủ",
		icon: "bi:house-check",
		path: "",
	});
	return {
		menu,
		socials: data?.socials ?? [],
	};
};
