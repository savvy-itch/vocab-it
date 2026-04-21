# Vocab-It
This is the client-side only version of Vocab-It. It aims to replicate the same functionality as the full stack version using the browser capabilities, i.e. without introducing database and server logic. [Live version](https://vocab-it-clientside.vercel.app/). The full stack version is located on `fullstack` branch. The desktop version is available [here](https://github.com/savvy-itch/vocab-it-desktop). For now, I prioritize the client side version and the desktop version maintenance over the full stack version.

<p align="center">
<a href="https://ibb.co/bKcj1By"><img src="https://i.ibb.co/DR0P4C6/Screenshot-3.jpg" alt="vocab-it screenshot" border="0"></a>
</p>
 
## Description
Application for learning languages by creating custom vocabularies and completing lessons. Currently, 2 types of lessons are implemented:
- Flash cards;
- "Find a pair".

## Main features
- create/edit/delete vocabularies;
- add/edit/delete words;
- import words from a file (.csv & .txt);
- 2 types of lessons.

## Installation
To run the client side of the app, run:
```
npm install
npm run dev
```

## Update dependencies
```bash
# check for updates
npx npm-check-updates

# update package.json
npx npm-check-updates -u 
```

## Possible features
I plan to gradually add more features in the future.
- data export;
- allow adding multiple translations;
- graph stats;
- achievements;