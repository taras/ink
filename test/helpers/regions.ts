// @ts-ignore
import {re} from 're-template-tag';
import balancedMatch from 'balanced-match';

export const findByName = (selector: string, text: string) => {
	function findRegions(name: string, text: string) {
		const found = [];
		const start = re`/\u001B_${name}\u001B\[/um`;
		const end = re`/\u001B_\/${name}\u001B\[/um`;
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
		const [current, ...rest] = paths;

		const found = findRegions(current, text);

		// Found regions and there more paths to travel
		if (found.length > 0 && rest.length > 0) {
			let result: string[] = [];
			for (const branch of found) {
				result = [...result, ...travel(rest, branch)];
			}

			return result;
		}

		return found;
	}

	return travel(selector.split(' '), text);
};
