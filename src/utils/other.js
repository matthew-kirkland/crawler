import { data } from '../datastore.js';

export function eventExists(title, sport) {
  const sportArray = data[sport];
  for (const event of sportArray) {
    if (isSubsequenceOf(title, event.eventTitle)) {
      return event;
    }
  }
  return null;
}

function isSubsequenceOf(subsequence, sequence) {
  let subsequenceIndex = 0;
  for (let i = 0; i < sequence.length; i++) {
    if (subsequence[subsequenceIndex] === sequence[i]) {
        subsequenceIndex++;
    }
  }
  return subsequenceIndex === subsequence.length;
}