import { data } from '../datastore.js';

/**
 * Determines if the event already exists for the given sport
 * @param {String} title title of the event
 * @param {Array} documentEvents array of already existing events
 * @returns event object if it exists, null otherwise
 */
export function eventExists(title, documentEvents) {
  for (const event of documentEvents) {
    if (!event.eventTitle) continue;
    if (isSubsequenceOf(title, event.eventTitle) || isSubsequenceOf(event.eventTitle, title)) {
      return event;
    }
  }
  return null;
}

/**
 * Determines if subseqeunce is a subsequence of sequence
 * @param {String} subsequence
 * @param {String} sequence
 * @returns {Boolean}
 */
function isSubsequenceOf(subsequence, sequence) {
  let subsequenceIndex = 0;
  for (let i = 0; i < sequence.length; i++) {
    if (subsequence[subsequenceIndex] === sequence[i]) {
      subsequenceIndex++;
    }
  }
  return subsequenceIndex === subsequence.length;
}