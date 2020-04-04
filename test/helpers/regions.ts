// @ts-ignore
import { re } from "re-template-tag";
import balancedMatch from "balanced-match";

export const findByName = (selector: string, text: string) => {
	function findRegions(name: string, text: string) {
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
	}

	function travel(paths: string[], text: string): string[] {
		let [current, ...rest] = paths;

		let found = findRegions(current, text);

		// found regions and there more paths to travel
		if (found.length > 0 && rest.length > 0) {
			let result: string[] = [];
			for (let branch of found) {
				result = [...result, ...travel(rest, branch)]
			}
			return result;
		} else {
			return found;
		}
	}

	return travel(selector.split(" "), text);
};
