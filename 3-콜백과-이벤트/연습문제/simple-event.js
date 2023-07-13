import { EventEmitter } from 'events';
import { readFile } from 'fs';

class FindRegex extends EventEmitter {
  constructor(regex) {
    super();

    this.regex = regex;
    this.files = [];
  }

  addFiles(files) {
    files.forEach((file) => {
      this.files.push(file);
    });

    return this;
  }

  find() {
    process.nextTick(() => this.emit('find'));

    for (const file of this.files) {
      readFile(file, 'utf8', (err, content) => {
        if (err) {
          return this.emit('error', err);
        }

        this.emit('fileread', file);

        const match = content.match(this.regex);
        if (match) {
          match.forEach((elem) => this.emit('found', file, elem));
        }
      });
    }

    return this;
  }
}

const findRegexIntsnace = new FindRegex(/hello \w+/)
  .addFiles(['fileA.txt', 'fileB.json'])
  .find()
  .on('find', () => console.log('Start finding...'))
  .on('fileread', (file) => console.log(`Read ${file}`))
  .on('found', (file, match) =>
    console.log(`Matched "${match}" in file ${file}`)
  )
  .on('error', (err) => console.error(`Error emitted ${err.message}`));
