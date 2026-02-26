export const mergeRoadPath = (roadPath: string[], _options?: any): string[] => {
  if (!roadPath) return [];
  const newRoadPath: string[] = [];
  for (let i = 0; i < roadPath.length; i++) {
    if (newRoadPath.length === 0) {
      newRoadPath.push(roadPath[i]);
    } else {
      const item = roadPath[i].split(',');
      const last = newRoadPath[newRoadPath.length - 1].split(',');
      if (
        item[0] === last[last.length - 2] &&
        item[1] === last[last.length - 1]
      ) {
        const add = item.slice(2);
        newRoadPath[newRoadPath.length - 1] += ',' + add.join(',');
      } else {
        newRoadPath.push(roadPath[i]);
      }
    }
  }
  return newRoadPath;
};

export default { mergeRoadPath };
