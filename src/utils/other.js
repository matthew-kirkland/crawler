import Fuse from 'fuse.js';

const options = {
  includeScore: true,   // Include the match score in the results
  threshold: 0.4,       // Lower threshold = stricter matching (0.0 to 1.0)
  keys: ["teamName"]    // Which property to search in the objects
};

/**
 * Determines if the event already exists for the given sport
 * @param {String} title title of the event
 * @param {Array} documentEvents array of already existing events
 * @returns event object if it exists, null otherwise
 */
export function eventExists(title, documentEvents) {
  
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
