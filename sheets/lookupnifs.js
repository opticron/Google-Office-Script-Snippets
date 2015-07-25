/**
 * Similar to SUMIFS, but returns the first arbitrary text entry.
 *
 * @param {number} nth_match Determines which match will be returned (set to 0 for all matches).
 * @param {string[]} search_range The range from which an entry will be returned upon match.
 * @param {string[]=} criteria_range1 The first range to be tested.
 * @param {string=} criteria1 The criteria to apply to the first range.
 * @return {string} The first field satisfying all conditions.
 * @customfunction
 */
function LOOKUPNIFS(nth_match, search_range, criteria_range1, criteria1) {
  var args = Array.slice(arguments);
  var criteria = Array.slice(arguments, 2);
  if (args.length < 2) {
    throw new Error("At least 2 arguments required: match number and search range.");
  } else if (args.length % 2 == 1) {
    throw new Error("Each criteria range must have a matching criteria.");
  } else if (!search_range.map) {
    throw new Error("Second argument search_range must be an array.");
  } else if (!(typeof nth_match === 'number')) {
    throw new Error("First argument nth_match must be a number.");
  } else {
    // check all criteria ranges to ensure they're the same size and are ranges
    var expected_len = search_range.length;
    for(var arg = 0; arg < criteria.length; arg++) {
      if (arg % 2 == 0) {
        // verify array
        if (!criteria[arg].map) {
          throw new Error("Argument ".concat((arg + 3).toString(), " must be an array"));
        }
        // verify length
        if (criteria[arg].length != expected_len) {
          throw new Error("Range in argument ".concat((arg + 3).toString(), " must be the same length as search_range"));
        }
      } else {
        // verify string
        if (!(typeof criteria[arg] === 'string' || criteria[arg] instanceof String)) {
          throw new Error("Argument ".concat((arg + 3).toString(), " must be a string"));
        }
      }
    }
  }
  // variable for counting the number of matches
  var num_matches = 0;
  // Array for collecting all results
  var all_matches = [];
  // inputs validated, actually do the comparisons for each row
  row_loop:
  for(var row_index = 0; row_index < search_range.length; row_index++) {
    // for each row, test the criteria
    for(var criteria_base = 0; criteria_base < criteria.length/2; criteria_base++) {
      var criteria_range = criteria[criteria_base*2];
      var criteria_comparator = criteria[criteria_base*2+1];
      if (!evaluateCriteria_(criteria_range[row_index], criteria_comparator)) {
        continue row_loop;
      }
    }
    // all criteria have passed, add to the collection array
    all_matches.push(search_range[row_index]);
    // increment the match counter
    num_matches++;
    if (nth_match != 0 && num_matches == nth_match) {
      return search_range[row_index];
    }
  }
  if (nth_match == 0) {
    // a completely empty array makes google sheets angry
    if (!all_matches.length) {
      all_matches.push("");
    }

    return all_matches;
  }
  return "";
}

function evaluateCriteria_(test_data, comparator) {
  var operators = ["<=", ">=", "=", "<>", "<", ">"];
  var convert_to_date = false;

  // unwrap single-element arrays
  if (test_data.map && test_data.length == 1) {
    test_data = test_data[0];
  }

  // set date conversion
  if (test_data instanceof Date) {
    convert_to_date = true;
  }

  // separate comparator and operand
  for(var op_index = 0; op_index < operators.length; op_index++) {
    var operator = operators[op_index];
    if (comparator.length < operator.length || comparator.slice(0, operator.length) != operator) {
      continue;
    }
    var operand = comparator.slice(operator.length);

    // convert to a date if necessary
    if (convert_to_date) {
      operand = new Date(operand);
    }

    // get valueOfs for complex data types
    test_data = test_data.valueOf();
    operand = operand.valueOf();

    // we have a valid operator!
    switch(operator) {
    case "<=":
        return (test_data <= operand);
    case ">=":
        return (test_data >= operand);
    case "<>":
        return (test_data != operand);
    case "=":
        return (test_data == operand);
    case "<":
        return (test_data < operand);
    case ">":
        return (test_data > operand);
    }
  }
  throw new Error("Invalid comparator in '".concat(comparator, "'."));
}
