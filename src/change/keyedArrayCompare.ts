import { Change } from ".";
import { diff } from "./diff";

// compare keyed array
export function keyedArrayCompare(path: string, left: any[], right: any[], result: Change[]) {
	// first build index for quicker lookup 
	function initIndex(arr: any[]) {
		const map: any = {};
		for(let i=0;i<arr.length;i++) {
			const o = arr[i];
			if (
				// if we hit a duplicate id then can't reliably compare, so just replace the whole array
				// or if there is no id at all
				(!o.id)
				|| (map[o.id] !== undefined)
			) {
				result.push({
					type: "prop-update",
					prop: path,
					value: right,
				});
				return;
			}

			map[o.id] = i;
		}
		return map;
	}
	const iLeft = initIndex(left);
	if (!iLeft) return; // full update

	const iRight = initIndex(right);
	if (!iRight) return; // full update
	
	let hadDeletions = false;
	let hadAdditions = false;
	let needsSorting = false;

	// deleted items will be in left but no longer in right
	for(let i=0;i<left.length;i++) {
		const l = left[i];

		const iRightIndex = iRight[l.id as string];
		if (iRightIndex === undefined) {
			result.push({
				type: "array-delete",
				id: l.id,
			});
			hadDeletions = true;

		} else {
			// need to check for changes within previously existing objects
			const r = right[iRightIndex];
			const changes = diff(l, r);
			if (changes.length > 0) {
				result.push({
					type: "array-update",
					id: r.id,
					value: changes,
				});
			}

		}
	}

	// new items will be in right but not in left
	const order = [];
	for(let i=0;i<right.length;i++) {
		const r = right[i];

		const leftIndex = iLeft[r.id as string];
		const rightIndex = iRight[r.id as string];

		if (!needsSorting && leftIndex !== rightIndex) needsSorting = true;

		order.push(r.id);

		if (leftIndex === undefined) {
			result.push({
				type: "array-add",
				value: r,
				index: rightIndex,
			});
			hadAdditions = true;
		}
	}

	if (needsSorting || hadAdditions || hadDeletions) {
		result.push({
			type: "array-order",
			value: order,
		});	
	}
	

}