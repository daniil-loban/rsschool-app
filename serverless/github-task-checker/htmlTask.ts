const puppeteer = require('puppeteer');
const tests = require('./htmlTaskTests').tests;

declare const mocha: any;
declare const prepareSpec: any;
declare const document: any;

interface TestError {
  url: string;
  error?: string;
}

interface TestResult {
  url: string;
  passes: number;
  failures: number;
  duration: string;
  details?: string[];
}

const formatResults = (pageUrl: string, results: string): TestResult => {
  enum PatternPart {
    passes = 1,
    failures,
    duration,
  }
  let result: any = null;
  const short_result = results.match(
    /passes: (\d+)\nfailures: (\d+)\nduration: (.+)\n/,
  );
  if (short_result) {
    result = {
      url: pageUrl,
      passes: <number>(<any>short_result[PatternPart.passes]),
      failures: <number>(<any>short_result[PatternPart.failures]),
      duration: short_result[PatternPart.duration],
    };
    if (short_result[PatternPart.failures] !== '0') {
      const assertionErrors = results.match(/(should .*) ‣\nAssertionError/g);
      const details = (assertionErrors || []).map(info =>
        info.replace(' ‣\nAssertionError', ''),
      );
      result = {...(<object>result), details};
    }
  }
  return result;
};

const closeBrowserByException = async (browser, pageUrl, errorNumber):Promise<TestError> => {
  await browser.close();
  let result: TestError = {url: pageUrl};
  switch (errorNumber) {
    case 404:
      result = {...result, error: 'Page Not Found'};
      break;
    case 523:
    default:
      result = {...result, error: 'Origin Is Unreachable'};
      break;
  }
  return result;
};

module.exports.runTests = async (pageUrl:string, spec:string):Promise<TestResult|TestError> => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let openError: boolean = false;
  await page.goto(pageUrl).catch(error => {
    openError = error.message;
  });
  if (openError) return closeBrowserByException(browser, pageUrl, 523);

  let error404: boolean = false;
  await page
    .addScriptTag({url: 'https://unpkg.com/chai@4.1.2/chai.js'})
    .catch(e => (error404 = true));
  await page
    .addScriptTag({url: 'https://unpkg.com/mocha@4.0.1/mocha.js'})
    .catch(e => (error404 = true));
  await page
    .addScriptTag({content: `;var prepareSpec = ${tests[spec]};`})
    .catch(e => (error404 = true));
  if (error404) return closeBrowserByException(browser, pageUrl, 404);

  await page.evaluate(async () => {
    const body = document.querySelector('body');
    const mocha_div = document.createElement('div');
    mocha_div.setAttribute('id', 'mocha');
    body.appendChild(mocha_div);
    mocha.setup('bdd');
    await prepareSpec();
    await mocha.run();
  });
  const report: string = await page.$eval('#mocha', e => e.innerText);
  await browser.close();
  return formatResults(pageUrl, report);
};

module.exports.runTests('https://k0smm0s.github.io/rsschool-2019Q1-cv/cv', "cvTests").then(r =>
  console.log(r),
);
module.exports.runTests('https://slnchn.github.io/rsschool-2019Q1-cv/cv', "cvTests").then(r =>
  console.log(r),
);
