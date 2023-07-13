import { EventEmitter } from 'events';

const createTicker = (number, cb) => {
  const eventEmitter = new EventEmitter();
  let tickCount = 0;
  let tickIntervalId = null;
  let tickerTimeoutId = null;

  const tick = () => eventEmitter.emit('tick', tickCount++);
  const isError = () => Date.now() % 5 === 0;
  const throwError = () => {
    clearInterval(tickIntervalId);
    clearTimeout(tickerTimeoutId);

    const err = new Error(`중단된 최종 count : ${tickCount}`);
    eventEmitter.emit('error', err);
    return cb(err);
  };

  const fireTickEvent = () => (isError() ? throwError() : tick());

  process.nextTick(fireTickEvent);
  tickIntervalId = setInterval(fireTickEvent, 50);
  tickerTimeoutId = setTimeout(() => {
    clearInterval(tickIntervalId);
    return cb(null, tickCount);
  }, number);

  return eventEmitter;
};

createTicker(200, (err, tickerCount) => {
  if (err) {
    return console.log(`Callback 에러, ${err.message}`);
  }

  console.log(`총 tick 횟수 : ${tickerCount}`);
})
  .on('tick', (tickCount) => {
    console.log(`${tickCount === 0 ? 'first ' : ''}tick`);
  })
  .on('error', (err) => {
    console.log(`EventEmitter 에러, ${err.message}`);
  });
