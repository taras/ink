// @ts-ignore
import { re } from "re-template-tag";
import balancedMatch from "balanced-match";

export const findByName = (name: string, text: string) => {
	const found = [];
	const start = re`/\x1b_${name}\x1b\[/um`;
	const end = re`/\x1b_\/${name}\x1b\[/um`;
	let item = balancedMatch(start, end, text);
	while (item) {
		found.push(item.body);
		item = balancedMatch(start, end, item.post);
		if (item) {
			text = item.post;
		}
	}
	return found;
};

export const findOne = (name: string, text: string) => {
	let [found] = findByName(name, text);
	return found;
};
