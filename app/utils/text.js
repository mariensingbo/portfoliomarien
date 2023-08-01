import each from 'lodash/each';

export function split({ element, expression = ' ', append = true }) {
  const words = splitText(element.innerHTML.toString().trim(), expression);

  let innerHTML = '';

  each(words, (line) => {
    if (line.indexOf('<br>') > -1) {
      const lines = line.split('<br>');

      each(lines, (line, index) => {
        innerHTML += index > 0 ? '<br>' + parseLine(line) : parseLine(line);
      });
    } else {
      innerHTML += parseLine(line);
    }
  });

  element.innerHTML = innerHTML;

  const spans = element.querySelectorAll('span');

  return spans;
}

export function calculate(spans) {
  if (!spans.length) {
    return;
  }
  const lines = [];
  let words = [];

  let position = spans[0].offsetTop;

  each(spans, (span, index) => {
    if (span.offsetTop === position) {
      words.push(span);
    }

    if (span.offsetTop !== position) {
      lines.push(words);

      words = [];
      words.push(span);

      position = span.offsetTop;
    }

    if (index + 1 === spans.length) {
      lines.push(words);
    }
  });

  return lines;
}

function splitText(text, expression) {
  const splits = text.split('<br>');

  let words = [];

  each(splits, (item, index) => {
    if (index > 0) {
      words.push('<br>');
    }

    // Split the item into words, preserving spaces
    let splitItem = item.split(expression);
    splitItem = splitItem.reduce((result, word, i) => {
      result.push(word);
      if (i !== splitItem.length - 1) { // do not add a space after the last word
        result.push(' '); // add a space after each word
      }
      return result;
    }, []);

    words = words.concat(splitItem);

    let isLink = false;
    let link = '';

    const innerHTML = [];

    each(words, (word) => {
      if (!isLink && (word.includes('<a') || word.includes('<strong'))) {
        link = '';

        isLink = true;
      }

      if (isLink) {
        link += ` ${word}`;
      }

      if (isLink && (word.includes('/a>') || word.includes('/strong>'))) {
        innerHTML.push(link);

        link = '';
      }

      if (!isLink && link === '') {
        innerHTML.push(word);
      }

      if (isLink && (word.includes('/a>') || word.includes('/strong>'))) {
        isLink = false;
      }
    });

    words = innerHTML;
  });

  return words;
}


function parseLine(line) {
  if (line === '' || line === ' ') {
    return line;
  } else {
    let wrappedLine = '';
    let isHTMLTag = false;
    let htmlTag = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '<') {
        isHTMLTag = true;
        htmlTag = '';
      }

      if (isHTMLTag) {
        htmlTag += char;
      } else {
        if (char === ' ') {
          wrappedLine += '<span class="space-span"> </span>';
      } else {
          wrappedLine += `<span>${char}</span>`;
      }

      }

      if (char === '>') {
        isHTMLTag = false;
        wrappedLine += htmlTag;
      }
    }

    return line === '<br>' ? '<br>' : wrappedLine;
  }
}





