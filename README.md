# SwiftTranslator Singlish → Sinhala Testing
IT3040 – ITPM Assignment 1

## Project Description
This project automates the testing of the SwiftTranslator web application
(https://www.swifttranslator.com/) to evaluate the accuracy of converting
Singlish input into Sinhala output.

Playwright is used to execute positive and negative functional test cases
and to identify weaknesses in translation accuracy and UI behavior.

## Tools & Technologies
- Playwright
- Node.js
- JavaScript
- Chromium / Firefox / WebKit

## Installation Instructions
1. Clone the repository
   git clone https://github.com/amo2003/ITPM---Assignment---IT23552142/

2. Navigate to the project folder
   cd Assignment_Playwright

3. Install dependencies
   npm install

## Run Tests
To execute all automated test cases:
   npx playwright test

To view the HTML report:
   npx playwright show-report

## Test Coverage
- Positive functional test cases
- Negative test cases
- Accuracy validation of Sinhala output
- Detection of incorrect character mappings

## Notes
Some test cases fail due to known accuracy issues in the SwiftTranslator
system. These failures represent real defects and are documented in the
Excel test case report.
