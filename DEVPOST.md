# Devpost copy · Rate Plain · Code for Change

## Title
Rate Plain

## Tagline
Bank of Canada rates and a plain renewal checklist on one screen.

## Inspiration
Renewal letters arrive dense. The 5-year benchmark bond yield averaged under 1% in both 2020 and 2021, and it was 3.53% on 12 November 2026, so households that locked in five years ago are now renewing in a very different market. The public numbers that explain what is going on already exist at the Bank of Canada, but they sit in data tables most people never open. I wanted those series next to a household's own renewal date and payment, in plain language, without pretending to quote a lender.

## What it does
Rate Plain charts the Bank of Canada policy rate and the 5-year benchmark bond yield, every business day since January 2020, and shows the latest value of each with its date. You enter your balance, your current rate, the rate in your renewal letter, the years left to pay, and your renewal date. The page tells you how many months you have, what your monthly payment would be at the new rate compared with today, and how much that adds up to over a year. It ends with four plain next steps. Nothing you type leaves your browser, and the page is clear that it is general information, not advice or a quote.

## How I built it
Plain HTML, CSS and JavaScript with no build step, hosted on GitHub Pages. A small Python script pulls both series from the Bank of Canada Valet API and saves them as JSON with the source, series code and retrieval date. The payment math lives in its own module and uses semi-annual compounding, the usual convention for Canadian fixed rate mortgages. The chart is drawn on a canvas without any chart library. Node tests check the data, the month counting, and the payment formula against a hand-worked example, and check the public copy for stray long dashes.

## Challenges I ran into
Staying useful without crossing into advice. The first version compared payments at the bond yield itself, which no lender actually offers, so I replaced it with the rate from your own letter and kept the bond yield as context only. Getting the payment formula right for Canada, where fixed rates compound twice a year rather than monthly. Handling holidays when one series has a value and the other does not.

## Accomplishments that I'm proud of
One screen that explains a renewal in plain words, built entirely on dated public data with every source linked. A payment check that matches a hand-worked example to the cent. No accounts, no tracking, and no data leaving the device.

## What I learned
Clarity is the impact here. A dated public number beats a vague claim, and saying what a tool cannot do builds more trust than a polished estimate.

## What's next
A printable checklist, a way to compare two or three offered rates side by side, and an optional live refresh from the Valet API.

## Built with
html, css, javascript, canvas, python, node.js, bank-of-canada-valet-api, github-pages

## Links
Live demo: https://alenzacodes.github.io/rate-plain/
Code: https://github.com/ALENZACODES/rate-plain
